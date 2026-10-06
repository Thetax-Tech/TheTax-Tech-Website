"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import * as OTPAuth from "otpauth";
import QRCode from "qrcode";
import { db, hasDatabase } from "@/lib/db";
import {
  PENDING_2FA_COOKIE,
  assertUser,
  createPending2fa,
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  logActivity,
  newResetToken,
  passwordProblem,
  readPending2fa,
  sha256,
  verifyPassword,
} from "@/lib/auth";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { emailLayout, sendMail } from "@/lib/mail";
import { SITE_URL } from "@/lib/seo";

export type AuthState = { error?: string; ok?: boolean; message?: string; step?: "2fa" } | undefined;

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

function safeNext(next: unknown) {
  return typeof next === "string" && next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin";
}

function totpFor(secret: string, email: string) {
  return new OTPAuth.TOTP({ issuer: "Theta X Tech Admin", label: email, algorithm: "SHA1", digits: 6, period: 30, secret: OTPAuth.Secret.fromBase32(secret) });
}

export async function loginAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  if (!hasDatabase) return { error: "Database is not connected. Set DATABASE_URL and run the migrations first." };
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 10, 15 * 60_000).ok) return { error: "Too many login attempts. Please wait 15 minutes." };

  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };

  const user = await db.user.findUnique({ where: { email } });
  const generic = { error: "Invalid email or password." };
  if (!user || !user.isActive) {
    await verifyPassword(password, "$2b$12$1quPCb9Hmizf6Y18S2KnVu0YJlahim4KY/1e8KYiWLaK0E.Wl.jZ."); // equalise timing
    return generic;
  }
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    return { error: `Account temporarily locked after too many failed attempts. Try again after ${user.lockedUntil.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}.` };
  }
  if (!(await verifyPassword(password, user.passwordHash))) {
    const failed = user.failedLogins + 1;
    await db.user.update({
      where: { id: user.id },
      data: { failedLogins: failed >= MAX_FAILED ? 0 : failed, lockedUntil: failed >= MAX_FAILED ? new Date(Date.now() + LOCK_MINUTES * 60_000) : null },
    });
    return generic;
  }

  await db.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });

  if (user.twoFactorEnabled && user.twoFactorSecret) {
    await createPending2fa(user.id);
    return { step: "2fa" };
  }

  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user);
  await logActivity(user.id, "login", "User", user.id, user.name);
  redirect(user.mustChangePassword ? "/admin/account?force=1" : safeNext(form.get("next")));
}

export async function verify2faAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const ip = await clientIp();
  if (!rateLimit(`2fa:${ip}`, 10, 15 * 60_000).ok) return { step: "2fa", error: "Too many attempts. Please wait." };
  const userId = await readPending2fa();
  if (!userId) return { error: "Your sign-in timed out. Please enter your password again." };
  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user?.twoFactorSecret) return { error: "Two-factor authentication is not set up." };
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  const delta = totpFor(user.twoFactorSecret, user.email).validate({ token: code, window: 1 });
  if (delta === null) return { step: "2fa", error: "That code is incorrect or expired." };

  (await cookies()).delete(PENDING_2FA_COOKIE);
  await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user);
  await logActivity(user.id, "login", "User", user.id, user.name);
  redirect(user.mustChangePassword ? "/admin/account?force=1" : safeNext(form.get("next")));
}

export async function logoutAction() {
  const user = await getCurrentUser();
  if (user) await logActivity(user.id, "logout", "User", user.id, user.name);
  await destroySession();
  redirect("/admin/login");
}

export async function forgotPasswordAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const ok: AuthState = { ok: true, message: "If an account exists for that email, a reset link has been sent. It expires in 1 hour." };
  if (!hasDatabase) return { error: "Database is not connected." };
  if (!rateLimit(`forgot:${await clientIp()}`, 5, 60 * 60_000).ok) return ok;
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const user = email ? await db.user.findUnique({ where: { email } }) : null;
  if (user?.isActive) {
    const { token, hash } = newResetToken();
    await db.user.update({ where: { id: user.id }, data: { resetTokenHash: hash, resetTokenExpires: new Date(Date.now() + 60 * 60_000) } });
    const link = `${SITE_URL}/admin/reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    const sent = await sendMail({
      to: user.email,
      subject: "Reset your Theta X Tech admin password",
      html: emailLayout("Reset your password", `<p>Hi ${user.name},</p><p>Click the button below to choose a new password. This link expires in 1 hour.</p><p><a href="${link}" style="display:inline-block;background:#F7941D;color:#000;padding:12px 22px;border-radius:999px;text-decoration:none;font-weight:bold">Reset password</a></p><p style="color:#666;font-size:13px">If you didn't request this, you can ignore this email.</p>`),
    }).catch(() => false);
    if (!sent) console.warn(`[auth] SMTP not configured. Password reset link for ${email}: ${link}`);
  }
  return ok;
}

export async function resetPasswordAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get("email") ?? "").toLowerCase();
  const token = String(form.get("token") ?? "");
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("confirm") ?? "")) return { error: "Passwords don't match." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.resetTokenHash || !user.resetTokenExpires || user.resetTokenExpires < new Date() || user.resetTokenHash !== sha256(token)) {
    return { error: "This reset link is invalid or has expired. Please request a new one." };
  }
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(password), resetTokenHash: null, resetTokenExpires: null, mustChangePassword: false, failedLogins: 0, lockedUntil: null, sessionVersion: { increment: 1 } },
  });
  await logActivity(user.id, "password-reset", "User", user.id, user.name);
  redirect("/admin/login?reset=1");
}

export async function changePasswordAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const me = await assertUser();
  const current = String(form.get("current") ?? "");
  const password = String(form.get("password") ?? "");
  if (password !== String(form.get("confirm") ?? "")) return { error: "New passwords don't match." };
  const problem = passwordProblem(password);
  if (problem) return { error: problem };
  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(current, user.passwordHash))) return { error: "Current password is incorrect." };
  if (await verifyPassword(password, user.passwordHash)) return { error: "Choose a password different from the current one." };
  const updated = await db.user.update({ where: { id: me.id }, data: { passwordHash: await hashPassword(password), mustChangePassword: false, sessionVersion: { increment: 1 } } });
  await createSession(updated); // other devices are signed out, this one stays signed in
  await logActivity(me.id, "password-changed", "User", me.id, me.name);
  return { ok: true, message: "Password updated. Other sessions have been signed out." };
}

const profileSchema = z.object({ name: z.string().trim().min(2).max(80), bio: z.string().max(600).optional() });
export async function updateProfileAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const me = await assertUser();
  const parsed = profileSchema.safeParse({ name: form.get("name"), bio: form.get("bio") || undefined });
  if (!parsed.success) return { error: "Please enter a valid name." };
  await db.user.update({ where: { id: me.id }, data: { name: parsed.data.name, bio: parsed.data.bio ?? null } });
  return { ok: true, message: "Profile saved." };
}

// ─────────────────────────── Two-factor authentication ───────────────────────────

export async function start2faSetupAction() {
  const me = await assertUser();
  const secret = new OTPAuth.Secret({ size: 20 }).base32;
  await db.user.update({ where: { id: me.id }, data: { twoFactorSecret: secret, twoFactorEnabled: false } });
  const uri = totpFor(secret, me.email).toString();
  return { secret, qr: await QRCode.toDataURL(uri, { margin: 1, width: 220 }) };
}

export async function confirm2faAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const me = await assertUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!user.twoFactorSecret) return { error: "Start the setup first." };
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  if (totpFor(user.twoFactorSecret, user.email).validate({ token: code, window: 1 }) === null) return { error: "Code is incorrect. Check your authenticator app and try again." };
  await db.user.update({ where: { id: me.id }, data: { twoFactorEnabled: true } });
  await logActivity(me.id, "2fa-enabled", "User", me.id, me.name);
  return { ok: true, message: "Two-factor authentication is now on." };
}

export async function disable2faAction(_prev: AuthState, form: FormData): Promise<AuthState> {
  const me = await assertUser();
  const user = await db.user.findUniqueOrThrow({ where: { id: me.id } });
  if (!(await verifyPassword(String(form.get("password") ?? ""), user.passwordHash))) return { error: "Password is incorrect." };
  await db.user.update({ where: { id: me.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
  await logActivity(me.id, "2fa-disabled", "User", me.id, me.name);
  return { ok: true, message: "Two-factor authentication has been turned off." };
}
