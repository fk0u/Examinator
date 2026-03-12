import { Elysia } from "elysia";
import { authPlugin, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/db";

export const analyticsRoutes = new Elysia({
  prefix: "/api/analytics",
  detail: {
    tags: ["Analytics"],
    description:
      "Endpoints for retrieving analytics data on exam performance and cheating incidents",
  },
})
  .use(authPlugin)

    // ── GET /api/analytics/dashboard ─────────────────────
        .get("/dashboard", async (context) => {
                const { userId, userRole } = context as any;
                requireAuth(userId);
                requireRole(userRole, ["ADMIN", "OPERATOR"]);

        const [
            totalExams,
            totalStudents,
            totalAttempts,
            submittedAttempts,
            averageScoreAgg,
            totalCheatLogs,
            attemptsWithCheating,
            cheatByType,
            recentAttempts,
            recentCheatLogs,
            exams,
            submittedForPassRate,
        ] = await Promise.all([
            db.exam.count(),
            db.user.count({ where: { role: "STUDENT"}}),
            db.attempt.count(),
            db.attempt.count({ where: { status: "SUBMITTED" } }),
            db.attempt.aggregate({
                where: { score: { not: null } },
                _avg: { score: true },
            }),
            db.cheatLog.count(),
            db.attempt.findMany({
                where: { status: "SUBMITTED", cheatLogs: { some: {} } },
                select: { id: true },
                distinct: ["id"],
            }),
            db.cheatLog.groupBy({ 
                by: ["cheatType"],
                 _count: true }),
            db.attempt.findMany({
                where: { status: "SUBMITTED" },
                select: {
                    id: true,
                    score: true,
                    submittedAt: true,
                    user: { select: { fullName: true, username: true, kelas: true } },
                    exam: { select: { title: true, subject: true } },
                },
                orderBy: { submittedAt: "desc" },
                take: 20,
            }),
            db.cheatLog.findMany({
                select: {
                    id: true,
                    cheatType: true,
                    description: true,
                    timestamp: true,
                    user: { select: { id: true, fullName: true, username: true } },
                    attempt: { select: { id: true, exam: { select: { id: true, title: true } } } },
                },
                orderBy: { timestamp: "desc" },
                take: 20,
            }),
            db.exam.findMany({
                select: {
                    id: true,
                    title: true,    
                    passingScore: true,
                },

            }),
            db.attempt.findMany({
                where: { status: "SUBMITTED", score: { not: null} },
                select: { examId: true, score: true },
            }),
        ]);

        const completionRate = totalAttempts > 0 ? (submittedAttempts / totalAttempts) * 100 : 0;
        
        const averageScore = averageScoreAgg._avg.score || 0;

        const attemptsWithCheatingCount = attemptsWithCheating.length;
        const integrityRate =
            submittedAttempts > 0
                ? ((submittedAttempts - attemptsWithCheatingCount) / submittedAttempts) * 100
                : 0;

        const passingScoreMap = new Map(exams.map((e) => [e.id, e.passingScore]));

        const passedCount = submittedForPassRate.filter((attempt) => {
            const threshold = passingScoreMap.get(attempt.examId) ?? 70;
            return (attempt.score ?? 0) >= threshold;
        }).length;

        const passRate = submittedForPassRate.length > 0 ? (passedCount / submittedForPassRate.length) * 100 : 0;

        return {
            overview: {
                totalExams,
                totalStudents,
                totalAttempts,
                submittedAttempts,
                completionRate: Math.round(completionRate * 100) / 100,
            },
            performance: {
                averageScore: Number (averageScore.toFixed(2)),
                passRate: Number (passRate.toFixed(2)),
                passedCount,
                gradedAttempts: submittedForPassRate.length,
            },
            proctoring: {
            totalCheatLogs,
            attemptsWithCheating: attemptsWithCheatingCount,
            integrityRate: Number(integrityRate.toFixed(2)),
            byType: cheatByType.map((item) => ({
            type: item.cheatType,
            count: item._count,
                })),
            },
            recent: {
                attempts: recentAttempts,
                cheatLogs: recentCheatLogs,
            },
                        generatedAt: new Date().toISOString(),
                        };
        })

    // ── GET /api/analytics/my-summary ────────────────────
    .get("/my-summary", async (context) => {
        const { userId, userRole } = context as any;
        const id = requireAuth(userId);
        requireRole(userRole, ["STUDENT"]);

        const [
            totalAttempts,
            submittedAttempts,
            inProgressAttempts,
            averageScoreAgg,
            totalCheatLogs,
            cheatByType,
            submittedAttemptDetails,
            recentAttempts,
        ] = await Promise.all([
            db.attempt.count({ where: { userId: id } }),
            db.attempt.count({ where: { userId: id, status: "SUBMITTED" } }),
            db.attempt.count({ where: { userId: id, status: "IN_PROGRESS" } }),
            db.attempt.aggregate({
                where: { userId: id, score: { not: null } },
                _avg: { score: true },
            }),
            db.cheatLog.count({ where: { userId: id } }),
            db.cheatLog.groupBy({
                by: ["cheatType"],
                where: { userId: id },
                _count: true,
            }),
            db.attempt.findMany({
                where: { userId: id, status: "SUBMITTED", score: { not: null } },
                select: {
                    score: true,
                    exam: {
                        select: {
                            id: true,
                            title: true,
                            subject: true,
                            passingScore: true,
                        },
                    },
                },
            }),
            db.attempt.findMany({
                where: { userId: id },
                select: {
                    id: true,
                    status: true,
                    score: true,
                    startedAt: true,
                    submittedAt: true,
                    _count: { select: { cheatLogs: true } },
                    exam: {
                        select: {
                            id: true,
                            title: true,
                            subject: true,
                            passingScore: true,
                        },
                    },
                },
                orderBy: { startedAt: "desc" },
                take: 10,
            }),
        ]);

        const averageScore = averageScoreAgg._avg.score ?? 0;
        const completionRate =
            totalAttempts > 0 ? (submittedAttempts / totalAttempts) * 100 : 0;

        const passedCount = submittedAttemptDetails.filter((attempt) => {
            const threshold = attempt.exam.passingScore ?? 70;
            return (attempt.score ?? 0) >= threshold;
        }).length;

        const passRate =
            submittedAttemptDetails.length > 0
                ? (passedCount / submittedAttemptDetails.length) * 100
                : 0;

        const averageCheatPerAttempt =
            totalAttempts > 0 ? totalCheatLogs / totalAttempts : 0;

        return {
            overview: {
                totalAttempts,
                submittedAttempts,
                inProgressAttempts,
                completionRate: Number(completionRate.toFixed(2)),
            },
            performance: {
                averageScore: Number(averageScore.toFixed(2)),
                passRate: Number(passRate.toFixed(2)),
                passedCount,
                gradedAttempts: submittedAttemptDetails.length,
            },
            proctoring: {
                totalCheatLogs,
                averageCheatPerAttempt: Number(averageCheatPerAttempt.toFixed(2)),
                byType: cheatByType.map((item) => ({
                    type: item.cheatType,
                    count: item._count,
                })),
            },
            recentAttempts,
            generatedAt: new Date().toISOString(),
        };
    });