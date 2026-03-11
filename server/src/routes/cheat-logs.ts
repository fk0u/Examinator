import { Elysia, t } from "elysia";
import { authPlugin, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/db";
import { saveCapture } from "../lib/upload";

// ─── Cheat Log Routes ───────────────────────────────────

export const cheatLogRoutes = new Elysia({ prefix: "/api/cheat-logs",
  detail: {
    tags: ["Cheat Logs"],
    description: "Endpoints for logging and viewing cheating incidents during exams",
  }
 })
  .use(authPlugin)

  // ── POST /api/cheat-logs ──────────────────────────────
  // Log a cheat event (called from client on detection)
  .post(
    "/",
    async (context) => {
      const { body, userId, set } = context as any;
      const id = requireAuth(userId);

      // Verify attempt belongs to user
      const attempt = await db.attempt.findUnique({
        where: { id: body.attemptId },
      });

      if (!attempt || attempt.userId !== id) {
        set.status = 403;
        return { error: "Invalid attempt" };
      }

      const log = await db.cheatLog.create({
        data: {
          userId: id,
          attemptId: body.attemptId,
          cheatType: body.cheatType,
          description: body.description,
        },
      });

      set.status = 201;
      return { log };
    },
    {
      body: t.Object({
        attemptId: t.String(),
        cheatType: t.Union([
          t.Literal("TAB_SWITCH"),
          t.Literal("FULLSCREEN_EXIT"),
          t.Literal("WINDOW_BLUR"),
          t.Literal("COPY_PASTE"),
          t.Literal("RIGHT_CLICK"),
          t.Literal("DEVTOOLS"),
          t.Literal("CAMERA_OFF"),
          t.Literal("MULTIPLE_FACE"),
          t.Literal("NO_FACE"),
        ]),
        description: t.Optional(t.String()),
      }),
    }
  )

  // ── POST /api/cheat-logs/capture ──────────────────────
  // Upload a cheat capture (photo/video)
  .post(
    "/capture",
    async (context) => {
      const { body, userId, set } = context as any;
      const id = requireAuth(userId);

      const { attemptId, cheatType, captureType, file, description } = body;

      const attempt = await db.attempt.findUnique({
        where: { id: attemptId },
      });

      if (!attempt || attempt.userId !== id) {
        set.status = 403;
        return { error: "Invalid attempt" };
      }

      // Save file
      let capturePath: string | undefined;
      if (file) {
        capturePath = await saveCapture(
          file,
          captureType as "photo" | "video",
          id,
          attemptId
        );
      }

      const log = await db.cheatLog.create({
        data: {
          userId: id,
          attemptId,
          cheatType: cheatType as any,
          description,
          capturePath,
          captureType,
        },
      });

      set.status = 201;
      return { log };
    },
    {
      body: t.Object({
        attemptId: t.String(),
        cheatType: t.String(),
        captureType: t.String(),
        description: t.Optional(t.String()),
        file: t.File(),
      }),
    }
  )

  // ── GET /api/cheat-logs/attempt/:attemptId ────────────
  // Get all cheat logs for a specific attempt
  .get("/attempt/:attemptId", async (context) => {
    const { params, userId, userRole } = context as any;
    const id = requireAuth(userId);

    const attempt = await db.attempt.findUnique({
      where: { id: params.attemptId },
      select: { id: true, userId: true },
    });

    if (!attempt) {
      return { logs: [] };
    }

    const canViewAllLogs = ["ADMIN", "OPERATOR"].includes(userRole ?? "");
    if (!canViewAllLogs && attempt.userId !== id) {
      context.set.status = 403;
      return { error: "Forbidden" };
    }

    const logs = await db.cheatLog.findMany({
      where: { attemptId: params.attemptId },
      include: {
        user: {
          select: { fullName: true, username: true },
        },
      },
      orderBy: { timestamp: "desc" },
    });

    return { logs };
  })

  // ── GET /api/cheat-logs/stats ─────────────────────────
  // Dashboard stats for proctor/admin
  .get("/stats", async (context) => {
    const { userId, userRole, query } = context as any;
    requireAuth(userId);
    requireRole(userRole, ["ADMIN", "OPERATOR"]);

    const { examId } = query;
    const where: any = {};
    if (examId) where.attempt = { examId };

    const [totalLogs, byType, recentLogs] = await Promise.all([
      db.cheatLog.count({ where }),
      db.cheatLog.groupBy({
        by: ["cheatType"],
        where,
        _count: true,
      }),
      db.cheatLog.findMany({
        where,
        include: {
          user: { select: { fullName: true, username: true, kelas: true } },
          attempt: {
            select: { exam: { select: { title: true } } },
          },
        },
        orderBy: { timestamp: "desc" },
        take: 50,
      }),
    ]);

    return {
      stats: {
        totalLogs,
        byType: byType.map((t) => ({
          type: t.cheatType,
          count: t._count,
        })),
      },
      recentLogs,
    };
  });
