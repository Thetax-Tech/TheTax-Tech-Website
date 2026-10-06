import "server-only";
import path from "node:path";

/** Absolute path of the uploads directory (outside .next so deployments don't wipe media). */
export function uploadRoot() {
  return path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.UPLOAD_DIR || "./uploads");
}

/** Resolve a user-supplied relative path safely inside the uploads dir (no traversal). */
export function safeUploadPath(rel: string) {
  const root = uploadRoot();
  const full = path.resolve(root, rel);
  if (!full.startsWith(root + path.sep)) return null;
  return full;
}

export const MIME: Record<string, string> = {
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".mp4": "video/mp4",
};
