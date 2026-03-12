import { Elysia, t } from "elysia";
import { authPlugin, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/db";
import { hash } from "bcryptjs";

// ─── Exam Routes ────────────────────────────────────────

export const examRoutes = new Elysia({ prefix: "/api/exams", detail: {
  tags: ["Exams"],
  description: "Endpoints for managing exams (Admin/Operator) and viewing active exams (Student)",
} })
  .use(authPlugin)

  // ── GET /api/exams ────────────────────────────────────
  // Students: see active exams | Admin/Operator: see all
  .get("/", async (context) => {
    const { userId, userRole } = context as any;
    const id = requireAuth(userId);

    const where = userRole === "STUDENT" ? { active: true } : {};

    const examsRaw = await db.exam.findMany({
      where,
      include: {
        _count: { select: { questions: true, attempts: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const exams = examsRaw.map((exam) => sanitizeExam(exam));

    return { exams };
  })

  // ── GET /api/exams/:examId ────────────────────────────────
  .get("/:examId", async (context) => {
    const { params, userId, userRole, set } = context as any;
    requireAuth(userId);

    const examRaw = await db.exam.findUnique({
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

    if (!examRaw) {
      set.status = 404;
      return { error: "Exam not found" };
    }

    const exam = sanitizeExam(examRaw);

    return { exam };
  })

  // ── POST /api/exams ───────────────────────────────────
  .post(
    "/",
    async (context) => {
      const { body, userId, userRole, set } = context as any;
      requireAuth(userId);
      requireRole(userRole, ["ADMIN", "OPERATOR"]);

      const { accessToken, ...rest } = body;

      if (typeof accessToken === "string" && accessToken.trim().length === 0) {
        set.status = 400;
        return { error: "Exam access token cannot be blank" };
      }

      const normalizedToken = normalizeAccessToken(accessToken);

      if (normalizedToken !== null && normalizedToken.length < 4) {
        set.status = 400;
        return { error: "Access token must be at least 4 characters" };
      }

      const examRaw = await db.exam.create({
        data: {
          ...rest,
          accessTokenHash: normalizedToken ? await hash(normalizedToken, 10) : null,
        },
      });

      const exam = sanitizeExam(examRaw);
      set.status = 201;
      return { exam };
    },
    {
      body: t.Object({
        title: t.String({ minLength: 1 }),
        description: t.Optional(t.String()),
        subject: t.String({ minLength: 1 }),
        duration: t.Number({ minimum: 1 }),
        maxCheatViolations: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
        shuffle: t.Optional(t.Boolean()),
        active: t.Optional(t.Boolean()),
        passingScore: t.Optional(t.Number({ minimum: 0, maximum: 100 })),
        accessToken: t.Optional(t.String({ minLength: 4, maxLength: 64 })),
      }),
    }
  )

  // ── PUT /api/exams/:examId ────────────────────────────────
  .put(
    "/:examId",
    async (context) => {
      const { params, body, userId, userRole, set } = context as any;
      requireAuth(userId);
      requireRole(userRole, ["ADMIN", "OPERATOR"]);

      const { accessToken, clearAccessToken, ...rest } = body;

      if (typeof accessToken === "string" && accessToken.trim().length === 0 && !clearAccessToken) {
        set.status = 400;
        return { error: "Exam access token cannot be blank. Use clearAccessToken to remove it." };
      }

      const data: Record<string, unknown> = {
        ...rest,
      };

      if (clearAccessToken) {
        data.accessTokenHash = null;
      } else if (typeof accessToken !== "undefined") {
        const normalizedToken = normalizeAccessToken(accessToken);
        data.accessTokenHash = normalizedToken ? await hash(normalizedToken, 10) : null;
      }

      const examRaw = await db.exam.update({
        where: { id: params.examId },
        data,
      });

      const exam = sanitizeExam(examRaw);

      return { exam };
    },
    {
      body: t.Object({
        title: t.Optional(t.String()),
        description: t.Optional(t.String()),
        subject: t.Optional(t.String()),
        duration: t.Optional(t.Number()),
        maxCheatViolations: t.Optional(t.Number({ minimum: 1, maximum: 50 })),
        startTime: t.Optional(t.String()),
        endTime: t.Optional(t.String()),
        shuffle: t.Optional(t.Boolean()),
        active: t.Optional(t.Boolean()),
        passingScore: t.Optional(t.Number()),
        accessToken: t.Optional(t.String({ minLength: 4, maxLength: 64 })),
        clearAccessToken: t.Optional(t.Boolean()),
      }),
    }
  )

  // ── DELETE /api/exams/:examId ─────────────────────────────
  .delete("/:examId", async (context) => {
    const { params, userId, userRole } = context as any;
    requireAuth(userId);
    requireRole(userRole, ["ADMIN"]);

    await db.exam.delete({ where: { id: params.examId } });
    return { success: true };
  });

function normalizeAccessToken(token?: string) {
  if (typeof token !== "string") return null;
  const normalized = token.trim();
  return normalized.length ? normalized : null;
}

function sanitizeExam<T extends { accessTokenHash?: string | null }>(exam: T) {
  const { accessTokenHash, ...rest } = exam;
  return {
    ...rest,
    requiresToken: Boolean(accessTokenHash),
  };
}
