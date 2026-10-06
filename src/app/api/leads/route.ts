import { NextResponse, after } from "next/server";
import { headers } from "next/headers";
import { db, hasDatabase } from "@/lib/db";
import { leadSchema, fieldErrors } from "@/lib/validation";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { emailLayout, escapeHtml, sendMail } from "@/lib/mail";
import { getSettings } from "@/lib/data";
import { composeAcknowledgement } from "@/lib/agent/agent";
import { addMessage, createConversation, updateConversation } from "@/lib/agent/store";

/** Public endpoint for contact / quote / career forms: validates, stores the lead, emails the team. */
export async function POST(req: Request) {
  const ip = await clientIp();
  const limit = rateLimit(`lead:${ip}`, 5, 10 * 60_000);
  if (!limit.ok) {
    return NextResponse.json({ error: "Too many submissions. Please try again in a few minutes." }, { status: 429, headers: { "Retry-After": String(limit.retryAfter) } });
  }

  const body = await req.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    // Honeypot filled → pretend success so bots learn nothing.
    if (body && typeof body === "object" && "website" in body && body.website) return NextResponse.json({ ok: true });
    return NextResponse.json({ error: "Please check the highlighted fields.", fields: fieldErrors(parsed.error) }, { status: 400 });
  }

  const d = parsed.data;
  const ua = (await headers()).get("user-agent") ?? undefined;
  const data = {
    type: d.type,
    name: d.name,
    email: d.email,
    phone: d.phone || null,
    company: d.company || null,
    subject: d.subject || null,
    message: d.message,
    service: "service" in d ? d.service : null,
    budget: "budget" in d ? d.budget || null : null,
    timeline: "timeline" in d ? d.timeline || null : null,
    sourceUrl: d.sourceUrl ?? null,
    ip,
    userAgent: ua?.slice(0, 500) ?? null,
  };

  let saved = false;
  if (hasDatabase) {
    try {
      await db.lead.create({ data });
      saved = true;
    } catch (e) {
      console.error("[leads] DB save failed:", (e as Error).message);
    }
  }

  const rows = [
    ["Type", data.type],
    ["Name", data.name],
    ["Email", data.email],
    ["Phone", data.phone],
    ["Company", data.company],
    ["Subject", data.subject],
    ["Service", data.service],
    ["Budget", data.budget],
    ["Timeline", data.timeline],
    ["Page", data.sourceUrl],
  ]
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;color:#666;vertical-align:top">${k}</td><td style="padding:6px 0"><strong>${escapeHtml(String(v))}</strong></td></tr>`)
    .join("");

  let mailed = false;
  try {
    mailed = await sendMail({
      subject: `New ${data.type.toLowerCase()} enquiry from ${data.name}`,
      replyTo: data.email,
      html: emailLayout(
        `New ${data.type.toLowerCase()} enquiry`,
        `<table cellpadding="0" cellspacing="0">${rows}</table><p style="margin-top:20px;white-space:pre-wrap;line-height:1.6">${escapeHtml(data.message)}</p>`,
      ),
      text: `${data.name} <${data.email}>\n\n${data.message}`,
    });
  } catch (e) {
    console.error("[leads] email failed:", (e as Error).message);
  }

  if (!saved && !mailed) {
    console.warn("[leads] Lead not stored or emailed (DB/SMTP not configured):", data.email);
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "We couldn't send your message right now. Please email or call us directly." }, { status: 503 });
    }
  }

  // Instant personalised acknowledgement from the AI agent (after the response is sent).
  after(async () => {
    try {
      const settings = await getSettings();
      const { html, cards } = settings.agent.autoReplyForms
        ? await composeAcknowledgement({ name: data.name, message: data.message, service: data.service, type: data.type })
        : { html: emailLayout(`Thanks, ${data.name.split(" ")[0]}!`, "<p>We've received your message and a member of our team will get back to you within one business day.</p><p>— Team Theta X Tech</p>"), cards: [] };
      await sendMail({ to: data.email, subject: "Thanks for contacting Theta X Tech", html });
      // Log the exchange so it appears under AI Agent → Conversations
      const conv = await createConversation({ channel: "form", visitorId: data.email, pageUrl: data.sourceUrl, ip });
      await updateConversation(conv.id, { name: data.name, email: data.email, phone: data.phone, company: data.company, service: data.service, budget: data.budget, status: "lead" });
      await addMessage(conv.id, { role: "user", content: [{ type: "text", text: data.message }], text: data.message });
      const ackText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 4000);
      await addMessage(conv.id, { role: "assistant", content: [{ type: "text", text: ackText }], text: ackText, cards: cards.length ? cards : null });
    } catch (e) {
      console.error("[leads] acknowledgement failed:", (e as Error).message);
    }
  });

  return NextResponse.json({ ok: true });
}
