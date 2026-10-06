import { NextResponse } from "next/server";
import { z } from "zod";
import { db, hasDatabase } from "@/lib/db";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getSettings } from "@/lib/data";

const schema = z.object({ email: z.email().max(160), website: z.string().max(0).optional().or(z.literal("")) });

export async function POST(req: Request) {
  if (!(await getSettings()).modules.newsletter) return NextResponse.json({ error: "Not available" }, { status: 404 });
  const limit = rateLimit(`nl:${await clientIp()}`, 5, 10 * 60_000);
  if (!limit.ok) return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });

  if (hasDatabase) {
    try {
      await db.subscriber.upsert({ where: { email: parsed.data.email.toLowerCase() }, update: { isActive: true }, create: { email: parsed.data.email.toLowerCase() } });
    } catch (e) {
      console.error("[newsletter]", (e as Error).message);
      return NextResponse.json({ error: "Subscription failed. Please try again later." }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true });
}
