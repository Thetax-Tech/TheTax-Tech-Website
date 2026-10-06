import { NextResponse, after } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { runAgent } from "@/lib/agent/agent";
import { createConversation, findConversationByVisitor, updateConversation } from "@/lib/agent/store";
import { absoluteUrl } from "@/lib/seo";
import { getSettings } from "@/lib/data";

/*
 * WhatsApp Business Cloud API webhook (phase 2 — optional).
 * The same AI agent answers WhatsApp messages. Configure in Meta for Developers:
 *   Callback URL: https://<your-domain>/api/whatsapp/webhook   Verify token: WHATSAPP_VERIFY_TOKEN
 *   Subscribe to the "messages" field.
 * Env: WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID
 */

const GRAPH = "https://graph.facebook.com/v21.0";
const enabled = () => Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID && process.env.WHATSAPP_APP_SECRET);

/** Meta's subscription verification handshake. */
export function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  if (u.get("hub.mode") === "subscribe" && process.env.WHATSAPP_VERIFY_TOKEN && u.get("hub.verify_token") === process.env.WHATSAPP_VERIFY_TOKEN) {
    return new Response(u.get("hub.challenge") ?? "", { status: 200 });
  }
  return new Response("Forbidden", { status: 403 });
}

function validSignature(raw: string, header: string | null) {
  if (!header?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", process.env.WHATSAPP_APP_SECRET!).update(raw).digest("hex");
  const a = Buffer.from(header.slice(7), "hex");
  const b = Buffer.from(expected, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

async function sendWhatsApp(to: string, body: string) {
  const res = await fetch(`${GRAPH}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`, "content-type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, type: "text", text: { body: body.slice(0, 4000), preview_url: true } }),
  });
  if (!res.ok) console.error("[whatsapp] send failed", res.status, await res.text().catch(() => ""));
}

type WaMessage = { from: string; id: string; type: string; text?: { body: string } };
type WaPayload = { entry?: { changes?: { value?: { messages?: WaMessage[]; contacts?: { profile?: { name?: string } }[] } }[] }[] };

export async function POST(req: Request) {
  if (!enabled()) return NextResponse.json({ ok: false, error: "WhatsApp not configured" }, { status: 503 });
  const raw = await req.text();
  if (!validSignature(raw, req.headers.get("x-hub-signature-256"))) return new Response("Invalid signature", { status: 401 });

  const payload = JSON.parse(raw) as WaPayload;
  const items = (payload.entry ?? []).flatMap((e) => e.changes ?? []).map((c) => c.value).filter(Boolean);

  // Acknowledge immediately (Meta retries slow webhooks); answer in the background.
  after(async () => {
    const settings = await getSettings();
    if (!settings.agent.enabled) return;
    for (const v of items) {
      const profileName = v?.contacts?.[0]?.profile?.name;
      for (const m of v?.messages ?? []) {
        try {
          if (m.type !== "text" || !m.text?.body) {
            await sendWhatsApp(m.from, "Thanks! I can read text messages — please type your question and I'll help right away.");
            continue;
          }
          let conv = await findConversationByVisitor("whatsapp", m.from);
          if (!conv || conv.status === "closed") {
            conv = await createConversation({ channel: "whatsapp", visitorId: m.from });
            await updateConversation(conv.id, { phone: `+${m.from}`, name: profileName ?? null });
          }
          const { text, cards } = await runAgent({ conversationId: conv.id, userText: m.text.body.slice(0, 1500), emit: () => {} });
          const links = cards.map((c) => `• ${c.title}${c.isSample ? " (sample)" : ""}: ${absoluteUrl(c.url)}`).join("\n");
          await sendWhatsApp(m.from, [text, links].filter(Boolean).join("\n\n") || "Thanks for your message — our team will reply shortly.");
        } catch (e) {
          console.error("[whatsapp] reply failed:", (e as Error).message);
        }
      }
    }
  });
  return NextResponse.json({ ok: true });
}
