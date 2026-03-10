import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { env } from "../config/env";
import { db } from "../lib/db";

// ─── JWT Auth Plugin ────────────────────────────────────
// Creates a reusable auth plugin for Elysia routes

export type AuthContext = {
  userId: string | null;
  userRole: string | null;
};

export const authPlugin = new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: env.JWT_SECRET,
      exp: "7d",
    })
  )
  .derive(async ({ jwt, headers }): Promise<AuthContext> => {
    const authHeader = headers.authorization || (headers as any).Authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth header missing or invalid:", authHeader);
      return { userId: null, userRole: null };
    }

    const token = authHeader.split(" ")[1];

    try {
      const payload = await jwt.verify(token);
      if (!payload) {
         console.log("JWT Payload empty");
         return { userId: null, userRole: null };
      }

      return {
        userId: payload.sub as string,
        userRole: payload.role as string,
      };
    } catch (e) {
      console.error("JWT verify failed:", e);
      return { userId: null, userRole: null };
    }
  });

// ─── Guard Helpers ──────────────────────────────────────

/** Require authenticated user */
export function requireAuth(userId: string | null | undefined) {
  console.log("requireAuth checking userId:", userId);
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
