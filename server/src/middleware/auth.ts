import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../config/env";
import { db } from "../lib/db";

// ─── JWT Auth Plugin ────────────────────────────────────
// Creates a reusable auth plugin for Elysia routes

import { bearer } from "@elysiajs/bearer";

export type AuthContext = {
  userId: string | null;
  userRole: string | null;
};

export const authPlugin = (app: Elysia) => app
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  )
  .use(bearer())
  .derive(async ({ jwt, bearer }) => {
    if (!bearer) {
      return { userId: null, userRole: null };
    }

    try {
      const payload = await jwt.verify(bearer);
      if (!payload) {
         return { userId: null, userRole: null };
      }

      return {
        userId: payload.sub as string,
        userRole: payload.role as string,
      };
    } catch (e) {
      return { userId: null, userRole: null };
    }
  });

// ─── Guard Helpers ──────────────────────────────────────

/** Require authenticated user */
export function requireAuth(userId: string | null | undefined) {
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

/** Require specific role(s) */
export function requireRole(
  userRole: string | null,
  allowedRoles: string[]
) {
  if (!userRole || !allowedRoles.includes(userRole)) {
    throw new Error("FORBIDDEN");
  }
  return userRole;
}
