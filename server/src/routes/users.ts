import { Elysia, t } from "elysia";
import { authPlugin, requireAuth, requireRole } from "../middleware/auth";
import { db } from "../lib/db";
import { hash } from "bcryptjs";

// ─── User Management Routes ────────────────────────────

export const userRoutes = new Elysia({ prefix: "/api/users", detail: {
  tags: ["Users"],
  description: "Endpoints for managing users (Admin/Operator only)",
  }})
  .use(authPlugin)


  // ── GET /api/users ────────────────────────────────────
  .get("/", async (context) => {
    const { userId, userRole, query } = context as any;
    requireAuth(userId);
    requireRole(userRole, ["ADMIN", "OPERATOR"]);

    const { role, search, page = "1", limit = "20" } = query;

    const where: any = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search } },
        { username: { contains: search } },
        { nisn: { contains: search } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
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
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      db.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    };
  })

  // ── GET /api/users/:id ────────────────────────────────
  .get("/:id", async (context) => {
    const { params, userId, userRole, set } = context as any;
    requireAuth(userId);
    requireRole(userRole, ["ADMIN", "OPERATOR"]);

    const user = await db.user.findUnique({
      where: { id: params.id },
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
        _count: { select: { attempts: true, cheatLogs: true } },
      },
    });

    if (!user) {
      set.status = 404;
      return { error: "User not found" };
    }

    return { user };
  })

  // ── POST /api/users (batch create) ────────────────────
  .post(
    "/",
    async (context) => {
      const { body, userId, userRole, set } = context as any;
      requireAuth(userId);
      requireRole(userRole, ["ADMIN"]);

      const hashedPassword = await hash(body.password, 12);

      const user = await db.user.create({
        data: {
          ...body,
          password: hashedPassword,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          email: true,
        },
      });

      set.status = 201;
      return { user };
    },
    {
      body: t.Object({
        username: t.String({ minLength: 3 }),
        password: t.String({ minLength: 6 }),
        fullName: t.String({ minLength: 1 }),
        role: t.Union([
          t.Literal("ADMIN"),
          t.Literal("OPERATOR"),
          t.Literal("STUDENT"),
        ]),
        email: t.Optional(t.String()),
        nisn: t.Optional(t.String()),
        kelas: t.Optional(t.String()),
      }),
    }
  )

  // ── PUT /api/users/:id ────────────────────────────────
  .put(
    "/:id",
    async (context) => {
      const { params, body, userId, userRole } = context as any;
      requireAuth(userId);
      requireRole(userRole, ["ADMIN"]);

      const updateData: any = { ...body };

      // If password provided, hash it
      if (body.password) {
        updateData.password = await hash(body.password, 12);
      }

      const user = await db.user.update({
        where: { id: params.id },
        data: updateData,
        select: {
          id: true,
          username: true,
          fullName: true,
          role: true,
          email: true,
          nisn: true,
          kelas: true,
          active: true,
        },
      });

      return { user };
    },
    {
      body: t.Object({
        username: t.Optional(t.String()),
        password: t.Optional(t.String()),
        fullName: t.Optional(t.String()),
        role: t.Optional(t.String()),
        email: t.Optional(t.String()),
        nisn: t.Optional(t.String()),
        kelas: t.Optional(t.String()),
        active: t.Optional(t.Boolean()),
      }),
    }
  )

  // ── DELETE /api/users/:id ─────────────────────────────
  .delete("/:id", async (context) => {
    const { params, userId, userRole } = context as any;
    requireAuth(userId);
    requireRole(userRole, ["ADMIN"]);

    await db.user.delete({ where: { id: params.id } });
    return { success: true };
  });
