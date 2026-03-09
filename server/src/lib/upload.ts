import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { env } from "../config/env";

// ─── File Upload Helper ──────────────────────────────────
// Uses Bun's native file API for fast writes

/**
 * Ensure upload directories exist
 */
export async function ensureUploadDirs() {
  const dirs = [
    env.UPLOAD_DIR,
    join(env.UPLOAD_DIR, "photos"),
    join(env.UPLOAD_DIR, "videos"),
  ];

  for (const dir of dirs) {
    await mkdir(dir, { recursive: true });
  }
}

/**
 * Save a cheat capture file (photo or video)
 * @returns relative path to the saved file
 */
export async function saveCapture(
  file: File | Blob,
  type: "photo" | "video",
  userId: string,
  attemptId: string
): Promise<string> {
  const timestamp = Date.now();
  const ext = type === "photo" ? "jpg" : "webm";
  const filename = `${userId}_${attemptId}_${timestamp}.${ext}`;
  const subDir = type === "photo" ? "photos" : "videos";
  const relativePath = `${subDir}/${filename}`;
  const fullPath = join(env.UPLOAD_DIR, relativePath);

  // Ensure directory exists
  await mkdir(join(env.UPLOAD_DIR, subDir), { recursive: true });

  // Use Bun's fast file writer
  const arrayBuffer = await file.arrayBuffer();
  await Bun.write(fullPath, arrayBuffer);

  return relativePath;
}

/**
 * Get the full path for a capture file
 */
export function getCapturePath(relativePath: string): string {
  return join(env.UPLOAD_DIR, relativePath);
}
