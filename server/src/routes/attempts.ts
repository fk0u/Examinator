import { Elysia, t } from "elysia";
import { authPlugin, requireAuth } from "../middleware/auth";
import { db } from "../lib/db";

// ─── Attempt Routes ─────────────────────────────────────

export const attemptRoutes = new Elysia({ prefix: "/api/attempts",
  detail: {
    tags: ["Attempts"],
    description: "Endpoints for managing exam attempts, saving answers, and submitting exams",
  }
 })
  .use(authPlugin)

  // ── POST /api/attempts/start ──────────────────────────
  // Student starts an exam attempt
  .post(
    "/start",
    async ({ body, userId, request, set }) => {
      const id = requireAuth(userId);

      // Check if exam exists and is active
      const exam = await db.exam.findUnique({
        where: { id: body.examId },
      });

      if (!exam || !exam.active) {
        set.status = 404;
        return { error: "Exam not found or not active" };
      }

      // Check time window
      const now = new Date();
      if (exam.startTime && now < exam.startTime) {
        set.status = 403;
        return { error: "Exam has not started yet" };
      }
      if (exam.endTime && now > exam.endTime) {
        set.status = 403;
        return { error: "Exam has ended" };
      }

      // Check if already attempted
      const existing = await db.attempt.findUnique({
        where: { userId_examId: { userId: id, examId: body.examId } },
      });

      if (existing) {
        if (existing.status === "IN_PROGRESS") {
          // Return existing attempt
          return { attempt: existing, resumed: true };
        }
        set.status = 409;
        return { error: "Exam already submitted" };
      }

      // Create new attempt
      const attempt = await db.attempt.create({
        data: {
          userId: id,
          examId: body.examId,
          cameraEnabled: body.cameraEnabled || false,
          ipAddress: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
        },
        include: {
          exam: {
            include: {
              questions: {
                include: { options: { select: { id: true, text: true, order: true } } },
                orderBy: { order: "asc" },
              },
            },
          },
        },
      });

      // Shuffle questions if enabled
      if (exam.shuffle && attempt.exam.questions) {
        attempt.exam.questions.sort(() => Math.random() - 0.5);
      }

      set.status = 201;
      return { attempt };
    },
    {
      body: t.Object({
        examId: t.String(),
        cameraEnabled: t.Optional(t.Boolean()),
      }),
    }
  )

  // ── POST /api/attempts/:id/answer ─────────────────────
  // Save answer for a question
  .post(
    "/:id/answer",
    async ({ params, body, userId, set }) => {
      const id = requireAuth(userId);

      const attempt = await db.attempt.findUnique({
        where: { id: params.id },
      });

      if (!attempt || attempt.userId !== id) {
        set.status = 404;
        return { error: "Attempt not found" };
      }

      if (attempt.status !== "IN_PROGRESS") {
        set.status = 403;
        return { error: "Attempt already submitted" };
      }

      // Upsert answer
      const answer = await db.answer.upsert({
        where: {
          attemptId_questionId: {
            attemptId: params.id,
            questionId: body.questionId,
          },
        },
        update: {
          optionId: body.optionId,
          textAnswer: body.textAnswer,
        },
        create: {
          attemptId: params.id,
          questionId: body.questionId,
          optionId: body.optionId,
          textAnswer: body.textAnswer,
        },
      });

      return { answer };
    },
    {
      body: t.Object({
        questionId: t.String(),
        optionId: t.Optional(t.String()),
        textAnswer: t.Optional(t.String()),
      }),
    }
  )

  // ── POST /api/attempts/:id/submit ─────────────────────
  // Submit exam and calculate score
  .post("/:id/submit", async ({ params, userId, set }) => {
    const id = requireAuth(userId);

    const attempt = await db.attempt.findUnique({
      where: { id: params.id },
      include: {
        answers: true,
        exam: {
          include: {
            questions: {
              include: { options: true },
            },
          },
        },
      },
    });

    if (!attempt || attempt.userId !== id) {
      set.status = 404;
      return { error: "Attempt not found" };
    }

    if (attempt.status !== "IN_PROGRESS") {
      set.status = 403;
      return { error: "Attempt already submitted" };
    }

    // Calculate score
    let totalPoints = 0;
    let earnedPoints = 0;

    for (const question of attempt.exam.questions) {
      totalPoints += question.points;

      const answer = attempt.answers.find(
        (a) => a.questionId === question.id
      );

      if (!answer) continue;

      if (question.type === "MULTIPLE_CHOICE" || question.type === "TRUE_FALSE") {
        const correctOption = question.options.find((o) => o.isCorrect);
        if (correctOption && answer.optionId === correctOption.id) {
          earnedPoints += question.points;

          // Update answer as correct
          await db.answer.update({
            where: { id: answer.id },
            data: { isCorrect: true, points: question.points },
          });
        }
      }
      // Essay questions need manual grading — skip auto-score
    }

    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Update attempt status
    const updated = await db.attempt.update({
      where: { id: params.id },
      data: {
        status: "SUBMITTED",
        score,
        totalPoints,
        submittedAt: new Date(),
      },
    });

    return {
      attempt: updated,
      result: {
        score: Math.round(score * 100) / 100,
        earnedPoints,
        totalPoints,
        passed: score >= attempt.exam.passingScore,
      },
    };
  })

  // ── GET /api/attempts/my ──────────────────────────────
  // Student's own attempts
  .get("/my", async ({ userId }) => {
    const id = requireAuth(userId);

    const attempts = await db.attempt.findMany({
      where: { userId: id },
      include: {
        exam: {
          select: { title: true, subject: true, duration: true, passingScore: true },
        },
        _count: { select: { cheatLogs: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return { attempts };
  })

  // ── GET /api/attempts/exam/:examId ────────────────────
  // All attempts for an exam (proctor/admin view)
  .get("/exam/:examId", async ({ params, userId, userRole }) => {
    requireAuth(userId);

    const attempts = await db.attempt.findMany({
      where: { examId: params.examId },
      include: {
        user: {
          select: { id: true, fullName: true, username: true, nisn: true, kelas: true },
        },
        _count: { select: { cheatLogs: true, answers: true } },
      },
      orderBy: { startedAt: "desc" },
    });

    return { attempts };
  });
