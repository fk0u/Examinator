import { Elysia } from "elysia";

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

const connectedStudents = new Map<string, ConnectedStudent>();
const proctorSockets = new Set<string>();

export const proctorWs = new Elysia({ prefix: "/ws" }).ws("/proctor", {
  // ── Connection opened ─────────────────────────────────
  open(ws) {
    console.log(`🔌 WebSocket connected: ${ws.id}`);
  },

  // ── Message received ──────────────────────────────────
  message(ws, message: any) {
    const data = typeof message === "string" ? JSON.parse(message) : message;

    switch (data.type) {
      // ── Student joins exam ──────────────────────────────
      case "student:join": {
        const student: ConnectedStudent = {
          id: ws.id,
          userId: data.userId,
          fullName: data.fullName,
          attemptId: data.attemptId,
          examId: data.examId,
          cameraEnabled: data.cameraEnabled || false,
          status: "active",
          cheatCount: 0,
          lastActivity: Date.now(),
        };

        connectedStudents.set(ws.id, student);

        // Subscribe to exam room
        ws.subscribe(`exam:${data.examId}`);
        ws.subscribe("proctors");

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
        proctorSockets.add(ws.id);
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
        const cheatStudent = connectedStudents.get(ws.id);
        if (cheatStudent) {
          cheatStudent.cheatCount++;
          cheatStudent.status = "flagged";
          cheatStudent.lastActivity = Date.now();

          // Broadcast to proctors
          ws.publish(
            "proctors",
            JSON.stringify({
              type: "cheat:alert",
              student: cheatStudent,
              cheatType: data.cheatType,
              description: data.description,
              timestamp: new Date().toISOString(),
              capturePath: data.capturePath,
            })
          );
        }
        break;
      }

      // ── Student activity heartbeat ──────────────────────
      case "student:heartbeat": {
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
        // Find student socket by userId
        const targetId = data.targetStudentWsId;
        if (targetId) {
          ws.publish(
            targetId,
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
        const targetSocketId = data.targetStudentWsId;
        if (targetSocketId) {
          ws.publish(
            targetSocketId,
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
