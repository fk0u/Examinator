import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "../lib/db";
import { env } from "../config/env";
import { hash, compare } from "bcryptjs";

// ─── Auth Routes ────────────────────────────────────────

export const authRoutes = new Elysia({ prefix: "/api/auth", 
  detail: {
    tags: ["Authentication"],
    description: "Endpoints for user registration, login, and profile retrieval",
  }
 })
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  )

  // ── POST /api/auth/register ───────────────────────────
  .post(
    "/register",
    async ({ body, jwt, set }) => {
      const { username, password, fullName, role, email, nisn, kelas } = body;

      // Check existing user
      const existing = await db.user.findUnique({ where: { username } });
      if (existing) {
        set.status = 409;
        return { error: "Username already exists" };
      }

      // Hash password
      const hashedPassword = await hash(password, 12);

      // Create user
      const user = await db.user.create({
        data: {
          username,
          password: hashedPassword,
          fullName,
          role: role || "STUDENT",
          email,
          nisn,
          kelas,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          email: true,
        },
      });

      // Generate token
      const token = await jwt.sign({
        sub: user.id,
        role: user.role,
        username: user.username,
      });

      set.status = 201;
      return { user, token };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3, maxLength: 50 }),
        password: t.String({ minLength: 6 }),
        fullName: t.String({ minLength: 1 }),
        role: t.Optional(
          t.Union([
            t.Literal("ADMIN"),
            t.Literal("OPERATOR"),
            t.Literal("STUDENT"),
          ])
        ),
        email: t.Optional(t.String()),
        nisn: t.Optional(t.String()),
        kelas: t.Optional(t.String()),
      }),
    }
  )

  // ── POST /api/auth/login ──────────────────────────────
  .post(
    "/login",
    async ({ body, jwt, set }) => {
      const { username, password } = body;

      // Find user
      const user = await db.user.findUnique({
        where: { username },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          email: true,
          password: true,
          active: true,
        },
      });

      if (!user) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      if (!user.active) {
        set.status = 403;
        return { error: "Account is deactivated" };
      }

      // Verify password
      const valid = await compare(password, user.password);
      if (!valid) {
        set.status = 401;
        return { error: "Invalid credentials" };
      }

      // Generate token
      const token = await jwt.sign({
        sub: user.id,
        role: user.role,
        username: user.username,
      });

      const { password: _, ...safeUser } = user;
      return { user: safeUser, token };
    },
    {
      body: t.Object({
        username: t.String(),
        password: t.String(),
      }),
    }
  )

  // ── GET /api/auth/me ──────────────────────────────────
  .get("/me", async ({ request, jwt, set }) => {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      set.status = 401;
      return { error: "No token provided" };
    }

    const token = authHeader.split(" ")[1];
    const payload = await jwt.verify(token);

    if (!payload) {
      set.status = 401;
      return { error: "Invalid token" };
    }

    const user = await db.user.findUnique({
      where: { id: payload.sub as string },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        email: true,
        nisn: true,
        kelas: true,
        active: true,
        createdAt: true,
      },
    });

    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }

    return { user };
  });
