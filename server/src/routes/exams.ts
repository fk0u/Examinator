import { Elysia, t } from "elysia";
import { authPlugin, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/db";

// ─── Exam Routes ────────────────────────────────────────

export const examRoutes = new Elysia({ prefix: "/api/exams" })
  .use(authPlugin)

  // ── GET /api/exams ────────────────────────────────────
  // Students: see active exams | Admin/Operator: see all
  .get("/", async ({ userId, userRole }) => {
    const id = requireAuth(userId);

    const where = userRole === "STUDENT" ? { active: true } : {};

    const exams = await db.exam.findMany({
      where,
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return { exams };
  })

  // ── GET /api/exams/:examId ────────────────────────────────
  .get("/:examId", async ({ params, userId, userRole, set }) => {
    requireAuth(userId);

    const exam = await db.exam.findUnique({
      where: { id: params.examId },
      include: {
        questions: {
          include: {
            options: {
              select: {
                id: true,
                text: true,
                order: true,
                // Only show isCorrect to admin/operator
                ...(userRole !== "STUDENT" ? { isCorrect: true } : {}),
              },
            },
          },
          orderBy: { order: "asc" },
        },
        _count: { select: { attempts: true } },
      },
    });

    if (!exam) {
      set.status = 404;
      return { error: "Exam not found" };
    }

    return { exam };
  })

  // ── POST /api/exams ───────────────────────────────────
  .post(
    "/",
    async ({ body, userId, userRole, set }) => {
      requireAuth(userId);
      requireRole(userRole, ["ADMIN", "OPERATOR"]);

      const exam = await db.exam.create({ data: body });
      set.status = 201;
      return { exam };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        subject: t.String({ minLength: 1 }),
        duration: t.Number({ minimum: 1 }),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
        shuffle: t.Optional(t.Boolean()),
        active: t.Optional(t.Boolean()),
        passingScore: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
      }),
    }
  )

  // ── PUT /api/exams/:examId ────────────────────────────────
  .put(
    "/:examId",
    async ({ params, body, userId, userRole, set }) => {
      requireAuth(userId);
      requireRole(userRole, ["ADMIN", "OPERATOR"]);

      const exam = await db.exam.update({
        where: { id: params.examId },
        data: body,
      });

      return { exam };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        subject: t.Optional(t.String()),
        duration: t.Optional(t.Number()),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
        shuffle: t.Optional(t.Boolean()),
        active: t.Optional(t.Boolean()),
        passingScore: t.Optional(t.Number()),
      }),
    }
  )

  // ── DELETE /api/exams/:examId ─────────────────────────────
  .delete("/:examId", async ({ params, userId, userRole }) => {
    requireAuth(userId);
    requireRole(userRole, ["ADMIN"]);

    await db.exam.delete({ where: { id: params.examId } });
    return { success: true };
  });
