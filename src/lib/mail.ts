import "server-only";
import nodemailer from "nodemailer";
import { getSettings } from "@/lib/data";

/** SMTP settings: Admin → Settings → SMTP takes priority, then environment variables. */
async function smtpConfig() {
  const s = (await getSettings()).smtp;
  const host = s.host || process.env.SMTP_HOST;
  const user = s.user || process.env.SMTP_USER;
  const pass = s.password || process.env.SMTP_PASSWORD;
  if (!host || !user || !pass) return null;
  const port = Number(s.port || process.env.SMTP_PORT || 465);
  return {
    transport: { host, port, secure: s.host ? Boolean(s.secure) : process.env.SMTP_SECURE !== "false", auth: { user, pass } },
    from: s.from || process.env.SMTP_FROM || user,
    notify: s.notifyEmail || process.env.LEADS_NOTIFY_EMAIL || user,
  };
}

export async function isMailConfigured() {
  return Boolean(await smtpConfig());
}

export async function sendMail(opts: { to?: string; subject: string; html: string; text?: string; replyTo?: string }) {
  const cfg = await smtpConfig();
  if (!cfg) {
    console.warn("[mail] SMTP not configured — email skipped:", opts.subject);
    return false;
  }
  const transporter = nodemailer.createTransport(cfg.transport);
  await transporter.sendMail({ from: cfg.from, to: opts.to ?? cfg.notify, subject: opts.subject, html: opts.html, text: opts.text, replyTo: opts.replyTo });
  return true;
}

export function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}

/** Simple branded email wrapper. */
export function emailLayout(title: string, body: string) {
  return `<!doctype html><html><body style="margin:0;background:#f4f4f2;font-family:Arial,Helvetica,sans-serif;color:#111">
<table width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0"><tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px">
<tr><td style="background:#0b0b0d;padding:20px 28px;color:#fff;font-size:18px;font-weight:bold;letter-spacing:2px">THETA <span style="color:#F7941D">X</span> TECH</td></tr>
<tr><td style="padding:28px"><h1 style="font-size:20px;margin:0 0 16px">${escapeHtml(title)}</h1>${body}</td></tr>
<tr><td style="padding:16px 28px;background:#fafaf9;color:#666;font-size:12px">ThetaX Tech SMC Private Limited · Karachi, Pakistan</td></tr>
</table></td></tr></table></body></html>`;
}
