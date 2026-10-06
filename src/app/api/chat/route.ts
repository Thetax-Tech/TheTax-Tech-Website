import { NextResponse } from "next/server";
import { cookies, headers } from "next/headers";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { getSettings } from "@/lib/data";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { runAgent, type AgentEvent } from "@/lib/agent/agent";
import { createConversation, getConversation, getMessages } from "@/lib/agent/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const VID = "tx_vid";
const body = z.object({
  conversationId: z.string().max(64).optional().nullable(),
  message: z.string().trim().min(1).max(1500),
  page: z.string().max(300).optional(),
  website: z.string().max(0).optional(), // honeypot
});

async function visitorId() {
  const jar = await cookies();
  let id = jar.get(VID)?.value;
  if (!id || !/^[a-f0-9-]{36}$/.test(id)) {
    id = randomUUID();
    jar.set(VID, id, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 90 });
  }
  return id;
}

/** Restore a conversation for the widget (only the visitor who owns it). */
export async function GET(req: Request) {
  const id = new URL(req.url).searchParams.get("conversationId");
  const vid = (await cookies()).get(VID)?.value;
  if (!id || !vid) return NextResponse.json({ messages: [] });
  const conv = await getConversation(id);
  if (!conv || conv.visitorId !== vid) return NextResponse.json({ messages: [] });
  const msgs = (await getMessages(id)).filter((m) => m.role !== "tool" || m.cards?.length);
  return NextResponse.json({
    status: conv.status,
    messages: msgs.map((m) => ({ role: m.role === "user" ? "user" : "assistant", text: m.text, cards: m.cards ?? null })),
  });
}

/** Send a message; streams the reply as server-sent events. */
export async function POST(req: Request) {
  const settings = await getSettings();
  if (!settings.agent.enabled) return NextResponse.json({ error: "Chat is currently unavailable." }, { status: 503 });

  const ip = await clientIp();
  if (!rateLimit(`chat:${ip}`, 20, 5 * 60_000).ok) {
    return NextResponse.json({ error: "You're sending messages quickly — please wait a minute and try again." }, { status: 429 });
  }
  const parsed = body.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Please type a message (max 1,500 characters)." }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ error: "Rejected" }, { status: 400 });

  const vid = await visitorId();
  let conv = parsed.data.conversationId ? await getConversation(parsed.data.conversationId) : null;
  if (!conv || conv.visitorId !== vid) {
    const ua = (await headers()).get("user-agent");
    conv = await createConversation({ channel: "web", visitorId: vid, pageUrl: parsed.data.page ?? null, ip, userAgent: ua });
  }
  if (!rateLimit(`chat-conv:${conv.id}`, 60, 24 * 60 * 60_000).ok) {
    return NextResponse.json({ error: "This conversation has reached its limit. Please contact us directly." }, { status: 429 });
  }

  const conversationId = conv.id;
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: AgentEvent) => controller.enqueue(encoder.encode(`data: ${JSON.stringify(e)}\n\n`));
      try {
        await runAgent({ conversationId, userText: parsed.data.message, emit: send, signal: req.signal });
        send({ type: "done", conversationId });
      } catch (e) {
        console.error("[chat]", e);
        send({ type: "error", message: `Sorry, I'm having trouble right now. You can reach us on WhatsApp at ${settings.contact.phone} or email ${settings.contact.email}.` });
        send({ type: "done", conversationId });
      } finally {
        controller.close();
      }
    },
  });
  return new Response(stream, { headers: { "content-type": "text/event-stream; charset=utf-8", "cache-control": "no-cache, no-transform", "x-accel-buffering": "no", connection: "keep-alive" } });
}
