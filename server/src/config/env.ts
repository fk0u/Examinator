// ─── Environment Configuration ─────────────────────────
export const env = {
  PORT: parseInt(process.env.PORT || "5000"),
  HOST: process.env.HOST || "0.0.0.0",
  JWT_SECRET: process.env.JWT_SECRET || "change-this-secret",
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL || "",
};

// Validate required env vars
if (!env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is required. Check your .env file.");
  process.exit(1);
}

if (env.JWT_SECRET === "change-this-secret" && env.NODE_ENV === "production") {
  console.error("❌ JWT_SECRET must be changed in production!");
  process.exit(1);
}
