import { Elysia } from "elysia";
import { db } from "../lib/db";
import { createHmac, timingSafeEqual } from "node:crypto";
import { env } from "../config/env";

// ─── WebSocket Proctor Module ───────────────────────────
// Handles realtime communication between students and proctors

// Track connected clients
interface ConnectedStudent {
  id: string;
  userId: string;
  fullName: string;
  attemptId: string;
  examId: string;
  cameraEnabled: boolean;
  status: "active" | "idle" | "flagged" | "submitted";
  cheatCount: number;
  lastActivity: number;
}

type ConnectionRole = "student" | "proctor";

type WsClaims = {
  sub: string;
  role: string;
  exp?: number;
};

const connectedStudents = new Map<string, ConnectedStudent>();
const proctorSockets = new Set<string>();
const connectionRoles = new Map<string, ConnectionRole>();

function decodeBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(normalized + padding, "base64").toString("utf8");
}

function verifyWsToken(token?: string): WsClaims | null {
  if (!token || typeof token !== "string") return null;

  const parts = token.split(".");
  if (parts.length !== 3) return null;

  const [headerB64, payloadB64, signatureB64] = parts;

  try {
    const header = JSON.parse(decodeBase64Url(headerB64));
    if (header.alg !== "HS256") return null;

    const expectedSignature = createHmac("sha256", env.JWT_SECRET)
      .update(`${headerB64}.${payloadB64}`)
      .digest("base64url");

    const signatureBuffer = Buffer.from(signatureB64);
    const expectedBuffer = Buffer.from(expectedSignature);
    if (signatureBuffer.length !== expectedBuffer.length) return null;
    if (!timingSafeEqual(signatureBuffer, expectedBuffer)) return null;

    const payload = JSON.parse(decodeBase64Url(payloadB64)) as WsClaims;
    if (!payload?.sub || !payload?.role) return null;
    if (typeof payload.exp === "number" && Date.now() >= payload.exp * 1000) return null;

    return payload;
  } catch {
    return null;
  }
}

export const proctorWs = new Elysia({ prefix: "/ws" }).ws("/proctor", {
  // ── Connection opened ─────────────────────────────────
  open(ws) {
    console.log(`🔌 WebSocket connected: ${ws.id}`);
  },

  // ── Message received ──────────────────────────────────
  async message(ws, message: any) {
    let data: any;

    try {
      data = typeof message === "string" ? JSON.parse(message) : message;
    } catch {
      ws.send(
        JSON.stringify({
          type: "error",
          message: "Invalid message payload",
        })
      );
      return;
    }

    switch (data.type) {
      // ── Student joins exam ──────────────────────────────
      case "student:join": {
        const attempt = await db.attempt.findUnique({
          where: { id: data.attemptId },
          select: {
            id: true,
            userId: true,
            examId: true,
            status: true,
            cameraEnabled: true,
            user: {
              select: {
                fullName: true,
              },
            },
          },
        });

        if (
          !attempt ||
          attempt.status !== "IN_PROGRESS" ||
          attempt.userId !== data.userId ||
          attempt.examId !== data.examId
        ) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Invalid exam session",
            })
          );
          ws.close();
          break;
        }

        const student: ConnectedStudent = {
          id: ws.id,
          userId: attempt.userId,
          fullName: attempt.user.fullName,
          attemptId: attempt.id,
          examId: attempt.examId,
          cameraEnabled: Boolean(data.cameraEnabled ?? attempt.cameraEnabled),
          status: "active",
          cheatCount: 0,
          lastActivity: Date.now(),
        };

        connectedStudents.set(ws.id, student);
        connectionRoles.set(ws.id, "student");

        // Subscribe to exam room
        ws.subscribe(`exam:${attempt.examId}`);
        ws.subscribe(`student:${ws.id}`);

        // Notify proctors
        ws.publish(
          "proctors",
          JSON.stringify({
            type: "student:joined",
            student,
            totalStudents: connectedStudents.size,
          })
        );

        // Send back confirmation
        ws.send(
          JSON.stringify({
            type: "joined",
            message: "Connected to exam session",
          })
        );
        break;
      }

      // ── Proctor joins monitoring ────────────────────────
      case "proctor:join": {
        if (connectionRoles.get(ws.id) === "student") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Student session cannot escalate to proctor",
            })
          );
          ws.close();
          break;
        }

        const claims = verifyWsToken(data.token);
        if (!claims) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Unauthorized proctor session",
            })
          );
          ws.close();
          break;
        }

        const proctorUser = await db.user.findUnique({
          where: { id: claims.sub },
          select: { id: true, role: true, active: true },
        });

        if (!proctorUser || !proctorUser.active || !["ADMIN", "OPERATOR"].includes(proctorUser.role)) {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Forbidden proctor role",
            })
          );
          ws.close();
          break;
        }

        proctorSockets.add(ws.id);
        connectionRoles.set(ws.id, "proctor");
        ws.subscribe("proctors");

        // Send current state
        ws.send(
          JSON.stringify({
            type: "proctor:state",
            students: Array.from(connectedStudents.values()),
            totalStudents: connectedStudents.size,
          })
        );
        break;
      }

      // ── Cheat event detected ────────────────────────────
      case "cheat:detected": {
        if (connectionRoles.get(ws.id) !== "student") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Only active student sessions can report cheat events",
            })
          );
          break;
        }

        const cheatStudent = connectedStudents.get(ws.id);
        if (cheatStudent) {
          cheatStudent.cheatCount++;
          cheatStudent.status = data.forceSubmitted ? "submitted" : "flagged";
          cheatStudent.lastActivity = Date.now();

          // Broadcast to proctors
          ws.publish(
            "proctors",
            JSON.stringify({
              type: "cheat:alert",
              student: cheatStudent,
              cheatType: data.cheatType,
              description: data.description,
              forceSubmitted: Boolean(data.forceSubmitted),
              forceReason: data.forceReason || null,
              timestamp: new Date().toISOString(),
              capturePath: data.capturePath,
            })
          );

          if (data.forceSubmitted) {
            ws.publish(
              "proctors",
              JSON.stringify({
                type: "student:submitted",
                student: cheatStudent,
                timestamp: new Date().toISOString(),
                forced: true,
                reason: data.forceReason || "Ambang pelanggaran tercapai",
              })
            );
          }
        }
        break;
      }

      // ── Student activity heartbeat ──────────────────────
      case "student:heartbeat": {
        if (connectionRoles.get(ws.id) !== "student") {
          break;
        }

        const heartbeatStudent = connectedStudents.get(ws.id);
        if (heartbeatStudent) {
          heartbeatStudent.lastActivity = Date.now();
          heartbeatStudent.status = data.status || "active";
          heartbeatStudent.cameraEnabled = data.cameraEnabled ?? heartbeatStudent.cameraEnabled;
        }
        break;
      }

      // ── Student submits exam ────────────────────────────
      case "student:submit": {
        if (connectionRoles.get(ws.id) !== "student") {
          break;
        }

        const submitStudent = connectedStudents.get(ws.id);
        if (submitStudent) {
          submitStudent.status = "submitted";

          ws.publish(
            "proctors",
            JSON.stringify({
              type: "student:submitted",
              student: submitStudent,
              timestamp: new Date().toISOString(),
            })
          );
        }
        break;
      }

      // ── Proctor sends message to student ────────────────
      case "proctor:message": {
        if (connectionRoles.get(ws.id) !== "proctor") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Only proctor sessions can send warnings",
            })
          );
          break;
        }

        // Find student socket by userId
        const targetId = data.targetStudentWsId;
        if (targetId && connectedStudents.has(targetId)) {
          ws.publish(
            `student:${targetId}`,
            JSON.stringify({
              type: "proctor:warning",
              message: data.message,
            })
          );
        }
        break;
      }

      // ── Proctor force-submits student exam ──────────────
      case "proctor:force-submit": {
        if (connectionRoles.get(ws.id) !== "proctor") {
          ws.send(
            JSON.stringify({
              type: "error",
              message: "Only proctor sessions can force-submit",
            })
          );
          break;
        }

        const targetSocketId = data.targetStudentWsId;
        if (targetSocketId && connectedStudents.has(targetSocketId)) {
          ws.publish(
            `student:${targetSocketId}`,
            JSON.stringify({
              type: "force:submit",
              reason: data.reason || "Force submitted by proctor",
            })
          );

          const forceStudent = connectedStudents.get(targetSocketId);
          if (forceStudent) {
            forceStudent.status = "submitted";
          }
        }
        break;
      }
    }
  },

  // ── Connection closed ─────────────────────────────────
  close(ws) {
    const student = connectedStudents.get(ws.id);

    if (student) {
      // Notify proctors that student disconnected
      ws.publish(
        "proctors",
        JSON.stringify({
          type: "student:disconnected",
          student,
          totalStudents: connectedStudents.size - 1,
        })
      );

      connectedStudents.delete(ws.id);
    }

    proctorSockets.delete(ws.id);
    connectionRoles.delete(ws.id);

    console.log(`🔌 WebSocket disconnected: ${ws.id}`);
  },
});

// ─── Export helpers for REST routes ─────────────────────
export function getActiveStudents(examId?: string) {
  const students = Array.from(connectedStudents.values());
  if (examId) return students.filter((s) => s.examId === examId);
  return students;
}

export function getActiveStudentCount() {
  return connectedStudents.size;
}
