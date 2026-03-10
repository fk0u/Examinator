import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";

const app = new Elysia()
  .use(
    jwt({
        name: "jwt",
        secret: process.env.JWT_SECRET || "change-this-to-a-random-secret-key-2024",
    })
  )
  .derive(async ({ jwt, headers }) => {
    const authHeader = headers.authorization;
    console.log("Header:", authHeader?.substring(0, 20) + "...");
    if (!authHeader) return { payload: null };
    const token = authHeader.split(" ")[1];
    
    try {
      const payload = await jwt.verify(token);
      console.log("Verified Payload:", payload);
      return { payload };
    } catch (e) {
      console.error("JWT Error:", e);
      return { payload: null };
    }
  })
  .get("/test", ({ payload }) => {
    if (!payload) return new Response("Fail", { status: 401 });
    return { ok: true, payload };
  })
  .listen(5001);

console.log("Test server on 5001");
