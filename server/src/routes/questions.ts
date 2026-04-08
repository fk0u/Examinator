import { Elysia, t } from "elysia";
import { authPlugin, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/db";

// ─── Question Routes ────────────────────────────────────

export const questionRoutes = new Elysia({ prefix: "/api/exams/:examId/questions", detail: {
  tags: ["Questions"],
  description: "Endpoints for managing questions of an exam (Admin/Operator only)",
  }})

  .use(authPlugin)

  // ── GET all questions for an exam ─────────────────────
  .get("/", async ({ params, userId }: any) => {
    requireAuth(userId);

    const questions = await db.question.findMany({
      where: { examId: params.examId },
      include: {
        options: { orderBy: { order: "asc" } },
      },
      orderBy: { order: "asc" },
    });

    return { questions };
  })

  // ── POST create question ──────────────────────────────
  .post(
    "/",
    async ({ params, body, userId, userRole, set }: any) => {
      requireAuth(userId);
      requireRole(userRole, ["ADMIN", "OPERATOR"]);

      const { options, ...questionData } = body;

      const question = await db.question.create({
        data: {
          ...questionData,
          examId: params.examId,
          options: options
            ? {
                create: options.map((opt: any, idx: number) => ({
                  text: opt.text,
                  isCorrect: opt.isCorrect || false,
                  order: idx,
                })),
              }
            : undefined,
        },
        include: { options: true },
      });

      set.status = 201;
      return { question };
    },
    {
      body: t.Object({
        text: t.String({ minLength: 1 }),
        type: t.Optional(
          t.Union([
            t.Literal("MULTIPLE_CHOICE"),
            t.Literal("TRUE_FALSE"),
            t.Literal("ESSAY"),
          ])
        ),
        points: t.Optional(t.Number({ minimum: 1 })),
        imageUrl: t.Optional(t.String()),
        order: t.Optional(t.Number()),
        options: t.Optional(
          t.Array(
            t.Object({
              text: t.String(),
              isCorrect: t.Optional(t.Boolean()),
            })
          )
        ),
      }),
    }
  )

  // ── PUT update question ───────────────────────────────
  .put(
    "/:questionId",
    async ({ params, body, userId, userRole }: any) => {
      requireAuth(userId);
      requireRole(userRole, ["ADMIN", "OPERATOR"]);

      const { options, ...questionData } = body;

      // Update question
      const question = await db.question.update({
        where: { id: params.questionId },
        data: questionData,
      });

      // If options provided, replace all options
      if (options) {
        await db.option.deleteMany({ where: { questionId: params.questionId } });
        await db.option.createMany({
          data: options.map((opt: any, idx: number) => ({
            questionId: params.questionId,
            text: opt.text,
            isCorrect: opt.isCorrect || false,
            order: idx,
          })),
        });
      }

      const updated = await db.question.findUnique({
        where: { id: params.questionId },
        include: { options: true },
      });

      return { question: updated };
    },
    {
      body: t.Object({
        text: t.Optional(t.String()),
        type: t.Optional(t.String()),
        points: t.Optional(t.Number()),
        imageUrl: t.Optional(t.String()),
        order: t.Optional(t.Number()),
        options: t.Optional(
          t.Array(
            t.Object({
              text: t.String(),
              isCorrect: t.Optional(t.Boolean()),
            })
          )
        ),
      }),
    }
  )

  // ── DELETE question ───────────────────────────────────
  .delete("/:questionId", async ({ params, userId, userRole }: any) => {
    requireAuth(userId);
    requireRole(userRole, ["ADMIN", "OPERATOR"]);

    await db.question.delete({ where: { id: params.questionId } });
    return { success: true };
  });
