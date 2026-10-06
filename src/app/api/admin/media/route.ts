import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomBytes } from "node:crypto";
import sharp from "sharp";
import { db } from "@/lib/db";
import { getCurrentUser, logActivity } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { uploadRoot } from "@/lib/uploads";
import { slugify } from "@/lib/utils";

const MAX_BYTES = 15 * 1024 * 1024;
const RASTER = new Set(["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif"]);
const OTHER = new Set(["application/pdf"]);

async function authorize() {
  const user = await getCurrentUser();
  return user && can(user.role, "media") ? user : null;
}

/** List media (newest first) with optional search. */
export async function GET(req: Request) {
  if (!(await authorize())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const page = Math.max(1, Number(url.searchParams.get("page") || 1));
  const take = 40;
  const where = q ? { OR: [{ name: { contains: q } }, { alt: { contains: q } }] } : {};
  const [items, total] = await Promise.all([
    db.media.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * take, take }),
    db.media.count({ where }),
  ]);
  return NextResponse.json({ items, total, pages: Math.ceil(total / take) });
}

/**
 * Upload one or more files. Raster images are auto-rotated, resized (max 2400px) and converted
 * to WebP for fast delivery; next/image then serves AVIF/WebP at the right size per device.
 */
export async function POST(req: Request) {
  const user = await authorize();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const files = (form?.getAll("files") ?? []).filter((f): f is File => f instanceof File);
  if (!files.length) return NextResponse.json({ error: "No files received" }, { status: 400 });

  const now = new Date();
  const sub = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, "0")}`;
  const dir = path.join(uploadRoot(), sub);
  await mkdir(dir, { recursive: true });

  const created = [];
  const errors: string[] = [];
  for (const file of files) {
    if (file.size > MAX_BYTES) {
      errors.push(`${file.name}: larger than 15 MB`);
      continue;
    }
    if (!RASTER.has(file.type) && !OTHER.has(file.type)) {
      errors.push(`${file.name}: unsupported type (${file.type || "unknown"})`);
      continue;
    }
    const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "file";
    const id = randomBytes(4).toString("hex");
    const buf = Buffer.from(await file.arrayBuffer());
    try {
      let out = buf;
      let ext = path.extname(file.name).toLowerCase() || ".bin";
      let mime = file.type;
      let width: number | null = null;
      let height: number | null = null;
      if (RASTER.has(file.type)) {
        const animated = file.type === "image/gif";
        const img = sharp(buf, { animated }).rotate();
        const meta = await img.metadata();
        const pipeline = img.resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
        if (!animated) {
          out = await pipeline.webp({ quality: 82 }).toBuffer();
          ext = ".webp";
          mime = "image/webp";
        } else out = await pipeline.gif().toBuffer();
        const outMeta = await sharp(out).metadata();
        width = outMeta.width ?? meta.width ?? null;
        height = (animated ? meta.pageHeight : outMeta.height) ?? null;
      }
      const filename = `${sub}/${base}-${id}${ext}`;
      await writeFile(path.join(uploadRoot(), filename), out);
      const media = await db.media.create({
        data: { filename, name: file.name.replace(/\.[^.]+$/, ""), url: `/uploads/${filename}`, mimeType: mime, size: out.length, width, height, alt: base.replace(/-/g, " ") },
      });
      created.push(media);
    } catch (e) {
      errors.push(`${file.name}: ${(e as Error).message}`);
    }
  }
  if (created.length) await logActivity(user.id, "uploaded", "Media", null, `${created.length} file(s)`);
  return NextResponse.json({ items: created, errors }, { status: created.length ? 200 : 400 });
}
