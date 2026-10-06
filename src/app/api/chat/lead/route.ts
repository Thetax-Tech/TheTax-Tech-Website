import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { saveLeadFromChat, handoff } from "@/lib/agent/agent";
import { addMessage, getConversation } from "@/lib/agent/store";

const body = z
  .object({
    conversationId: z.string().max(64),
    name: z.string().trim().min(2).max(100),
    email: z.email().max(160).optional().or(z.literal("")),
    phone: z.string().trim().max(30).optional(),
    service: z.string().max(120).optional(),
    notes: z.string().max(1000).optional(),
    handoff: z.boolean().optional(),
  })
  .refine((d) => d.email || d.phone, { message: "Please add an email or phone number." });

/** The structured "leave your details" form inside the chat widget. */
export async function POST(req: Request) {
  if (!rateLimit(`chat-lead:${await clientIp()}`, 5, 10 * 60_000).ok) return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
  const d = parsed.data;
  const conv = await getConversation(d.conversationId);
  const vid = (await cookies()).get("tx_vid")?.value;
  if (!conv || conv.visitorId !== vid) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });

  const email = d.email || undefined;
  await saveLeadFromChat(conv, { name: d.name, email, phone: d.phone, service: d.service, notes: d.notes });
  if (d.handoff) await handoff(conv, { reason: "Visitor asked to speak with a person", name: d.name, email, phone: d.phone });
  const text = `Thanks ${d.name.split(" ")[0]}! I've passed your details to our team — they'll get back to you within one business day.`;
  await addMessage(conv.id, { role: "assistant", content: [{ type: "text", text }], text });
  return NextResponse.json({ ok: true, message: text });
}
