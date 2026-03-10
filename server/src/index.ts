import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { cors } from "@elysiajs/cors";
import { staticPlugin } from "@elysiajs/static";
import { env } from "./config/env";
import { ensureUploadDirs } from "./lib/upload";

// ── Routes ──────────────────────────────────────────────
import { authRoutes } from "./routes/auth";
import { examRoutes } from "./routes/exams";
import { questionRoutes } from "./routes/questions";
import { userRoutes } from "./routes/users";
import { attemptRoutes } from "./routes/attempts";
import { cheatLogRoutes } from "./routes/cheat-logs";

// ── WebSocket ───────────────────────────────────────────
import { proctorWs, getActiveStudentCount } from "./ws/proctor";

// ─── Banner ─────────────────────────────────────────────
const banner = `
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   ███████╗██╗  ██╗ █████╗ ███╗   ███╗             ║
║   ██╔════╝╚██╗██╔╝██╔══██╗████╗ ████║             ║
║   █████╗   ╚███╔╝ ███████║██╔████╔██║             ║
║   ██╔══╝   ██╔██╗ ██╔══██║██║╚██╔╝██║             ║
║   ███████╗██╔╝ ██╗██║  ██║██║ ╚═╝ ██║             ║
║   ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝             ║
║                                                   ║
║   E X A M I N A T O R   S E R V E R               ║
║   CBT Proctoring SaaS                             ║
║                                                   ║
╚═══════════════════════════════════════════════════╝`;

// ─── Initialize ─────────────────────────────────────────
await ensureUploadDirs();

// ─── Create App ─────────────────────────────────────────
const app = new Elysia()
  // ── Global plugins ──────────────────────────────────
  .use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    })
  )
  .use(
    staticPlugin({
      assets: env.UPLOAD_DIR,
      prefix: "/uploads",
    })
  )
  .use(swagger())

  // ── Error handler ───────────────────────────────────
  .onError(({ code, error, set }) => {
    const errorMessage = (error as any)?.message || "Unknown error";

    if (errorMessage === "UNAUTHORIZED") {
      set.status = 401;
      return { error: "Authentication required" };
    }
    if (errorMessage === "FORBIDDEN") {
      set.status = 403;
      return { error: "Insufficient permissions" };
    }

    console.error(`❌ Error [${code}]:`, errorMessage);

    if (code === "NOT_FOUND") {
      set.status = 404;
      return { error: "Route not found" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { error: "Validation failed", details: errorMessage };
    }

    set.status = 500;
    return { error: "Internal server error" };
  })

  // ── Health check ────────────────────────────────────
  .get("/api/health", () => ({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    activeStudents: getActiveStudentCount(),
  }))

  // ── Mount routes ────────────────────────────────────
  .use(authRoutes)
  .use(examRoutes)
  .use(questionRoutes)
  .use(userRoutes)
  .use(attemptRoutes)
  .use(cheatLogRoutes)

  // ── Mount WebSocket ─────────────────────────────────
  .use(proctorWs)

  // ── Start server ────────────────────────────────────
  .listen(env.PORT);

console.log(banner);
console.log(`\n  🚀 Server running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`  📡 WebSocket at ws://${app.server?.hostname}:${app.server?.port}/ws/proctor`);
console.log(`  📚 API docs at http://${app.server?.hostname}:${app.server?.port}/swagger`);
console.log(`  🏥 Health check at http://${app.server?.hostname}:${app.server?.port}/api/health`);
console.log(`  📁 Uploads served from ${env.UPLOAD_DIR}`);
console.log(`  🌍 CORS origin: ${env.CLIENT_URL}`);
console.log(`  ⚙️  Environment: ${env.NODE_ENV}\n`);

export type App = typeof app;
