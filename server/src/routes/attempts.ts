import { Elysia, t } from "elysia";
import { authPlugin, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/db";
import { compare } from "bcryptjs";

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
    async (context) => {
      const { body, userId, request, set } = context as any;
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
          const fullAttempt = await getAttemptWithRelations(existing.id);

          if (!fullAttempt) {
            set.status = 404;
            return { error: "Attempt not found" };
          }

          const remainingSeconds = calculateRemainingSeconds(
            fullAttempt.startedAt,
            fullAttempt.exam.duration
          );
          if (remainingSeconds <= 0) {
            await db.attempt.update({
              where: { id: existing.id },
              data: {
                status: "TIMED_OUT",
                submittedAt: new Date(),
              },
            });
            set.status = 403;
            return { error: "Exam time is up" };
          }

          return buildAttemptPayload(fullAttempt, true);
        }
        set.status = 409;
        return { error: "Exam already submitted" };
      }

      if (exam.accessTokenHash) {
        const providedToken = typeof body.accessToken === "string" ? body.accessToken.trim() : "";
        if (!providedToken) {
          set.status = 403;
          return { error: "Exam token is required" };
        }

        const isTokenValid = await compare(providedToken, exam.accessTokenHash);
        if (!isTokenValid) {
          set.status = 403;
          return { error: "Exam token is invalid" };
        }
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
      });

      const fullAttempt = await getAttemptWithRelations(attempt.id);

      if (!fullAttempt) {
        set.status = 500;
        return { error: "Failed to load attempt" };
      }

      if (exam.shuffle && fullAttempt.exam.questions) {
        fullAttempt.exam.questions.sort(() => Math.random() - 0.5);
      }

      set.status = 201;
      return buildAttemptPayload(fullAttempt, false);
    },
    {
      body: t.Object({
        examId: t.String(),
        cameraEnabled: t.Optional(t.Boolean()),
        accessToken: t.Optional(t.String()),
      }),
    }
  )

  // ── POST /api/attempts/:id/answer ─────────────────────
  // Save answer for a question
  .post(
    "/:id/answer",
    async (context) => {
      const { params, body, userId, set } = context as any;
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
  .post("/:id/submit", async (context) => {
    const { params, userId, set } = context as any;
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
  .get("/my", async (context) => {
    const { userId } = context as any;
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

  // ── GET /api/attempts/forced ─────────────────────────
  // Recent force-submitted attempts for audit dashboard (admin/proctor)
  .get("/forced", async (context) => {
    const { userId, userRole, query } = context as any;
    requireAuth(userId);
    requireRole(userRole, ["ADMIN", "OPERATOR"]);

    const parsedLimit = Number.parseInt(String(query?.limit ?? "20"), 10);
    const safeLimit = Number.isFinite(parsedLimit) ? parsedLimit : 20;
    const take = Math.min(Math.max(safeLimit, 1), 100);
    const where: Record<string, unknown> = { status: "FORCE_SUBMITTED" };

    if (query?.examId) {
      where.examId = String(query.examId);
    }

    const fromDate = query?.from ? new Date(String(query.from)) : null;
    const toDate = query?.to ? new Date(String(query.to)) : null;
    const hasValidFrom = fromDate && !Number.isNaN(fromDate.getTime());
    const hasValidTo = toDate && !Number.isNaN(toDate.getTime());

    if (hasValidFrom || hasValidTo) {
      where.submittedAt = {
        ...(hasValidFrom ? { gte: fromDate } : {}),
        ...(hasValidTo ? { lte: toDate } : {}),
      };
    }

    const attempts = await db.attempt.findMany({
      where,
      include: {
        user: {
          select: { id: true, fullName: true, username: true, kelas: true, nisn: true },
        },
        exam: {
          select: { id: true, title: true, subject: true, maxCheatViolations: true },
        },
        _count: { select: { cheatLogs: true, answers: true } },
      },
      orderBy: { submittedAt: "desc" },
      take,
    });

    const totalFiltered = await db.attempt.count({ where });

    return {
      attempts,
      summary: {
        totalReturned: attempts.length,
        totalFiltered,
      },
    };
  })

  // ── GET /api/attempts/exam/:examId ────────────────────
  // All attempts for an exam (proctor/admin view)
  .get("/exam/:examId", async (context) => {
    const { params, userId, userRole } = context as any;
    requireAuth(userId);
    requireRole(userRole, ["ADMIN", "OPERATOR"]);

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

  function calculateRemainingSeconds(startedAt: Date, durationMinutes: number) {
    const durationSeconds = durationMinutes * 60;
    const elapsedSeconds = Math.floor((Date.now() - startedAt.getTime()) / 1000);
    return Math.max(durationSeconds - elapsedSeconds, 0);
  }

async function getAttemptWithRelations(attemptId: string) {
  return db.attempt.findUnique({
    where: { id: attemptId },
    include: {
      answers: {
        select: {
          questionId: true,
          optionId: true,
          textAnswer: true,
          isCorrect: true,
          points: true,
        },
      },
      exam: {
        include: {
          questions: {
            include: {
              options: {
                select: {
                  id: true,
                  text: true,
                  order: true,
                },
              },
            },
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });
}

function buildAttemptPayload(attempt: any, resumed: boolean) {
  const remainingSeconds = calculateRemainingSeconds(
    attempt.startedAt,
    attempt.exam.duration
  );

  const answers = attempt.answers ?? [];
  const answeredCount = answers.length;
  const totalQuestions = attempt.exam.questions.length;

  return {
    attempt: {
      id: attempt.id,
      status: attempt.status,
      startedAt: attempt.startedAt,
      submittedAt: attempt.submittedAt,
      cameraEnabled: attempt.cameraEnabled,
    },
    exam: {
      id: attempt.exam.id,
      title: attempt.exam.title,
      subject: attempt.exam.subject,
      duration: attempt.exam.duration,
      maxCheatViolations: attempt.exam.maxCheatViolations,
      questions: attempt.exam.questions,
    },
    answers,
    progress: {
      answeredCount,
      totalQuestions,
    },
    remainingSeconds,
    resumed,
  };
} 

