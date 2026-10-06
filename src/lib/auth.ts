import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { db, hasDatabase } from "@/lib/db";
import type { Role } from "@/generated/prisma/enums";
import { can, type Permission } from "@/lib/permissions";

export const SESSION_COOKIE = "tx_session";
export const PENDING_2FA_COOKIE = "tx_2fa";

const timeoutMinutes = () => Number(process.env.SESSION_TIMEOUT_MINUTES || 120);

function secret() {
  const s = process.env.AUTH_SECRET;
  if (!s || s.length < 32) throw new Error("AUTH_SECRET must be set to at least 32 characters");
  return new TextEncoder().encode(s);
}

export type SessionPayload = { sub: string; role: Role; sv: number };

export async function signSession(p: SessionPayload, minutes = timeoutMinutes()) {
  return new SignJWT({ role: p.role, sv: p.sv })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(p.sub)
    .setIssuedAt()
    .setExpirationTime(`${minutes}m`)
    .sign(secret());
}

export async function verifyToken(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret(), { algorithms: ["HS256"] });
    return payload as unknown as SessionPayload & { iat: number; exp: number; purpose?: string };
  } catch {
    return null;
  }
}

const cookieOpts = (maxAgeSec: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: maxAgeSec,
});

export async function createSession(user: { id: string; role: Role; sessionVersion: number }) {
  const token = await signSession({ sub: user.id, role: user.role, sv: user.sessionVersion });
  (await cookies()).set(SESSION_COOKIE, token, cookieOpts(timeoutMinutes() * 60));
}

export async function destroySession() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  jar.delete(PENDING_2FA_COOKIE);
}

/** Short-lived token proving the password step passed; second factor still required. */
export async function createPending2fa(userId: string) {
  const token = await new SignJWT({ purpose: "2fa" }).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setIssuedAt().setExpirationTime("5m").sign(secret());
  (await cookies()).set(PENDING_2FA_COOKIE, token, cookieOpts(300));
}

export async function readPending2fa() {
  const p = await verifyToken((await cookies()).get(PENDING_2FA_COOKIE)?.value);
  return p && p.purpose === "2fa" ? p.sub : null;
}

/** Current admin user (validated against the DB on every request). */
export const getCurrentUser = cache(async () => {
  if (!hasDatabase) return null;
  const payload = await verifyToken((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await db.user.findUnique({
    where: { id: payload.sub },
    select: { id: true, name: true, email: true, role: true, avatar: true, isActive: true, sessionVersion: true, mustChangePassword: true, twoFactorEnabled: true },
  });
  if (!user || !user.isActive || user.sessionVersion !== payload.sv) return null;
  return user;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;

/** Use in admin pages/actions. Redirects to login if signed out, to dashboard if not permitted. */
export async function requireUser(permission?: Permission, opts: { allowPasswordChange?: boolean } = {}) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (user.mustChangePassword && !opts.allowPasswordChange) redirect("/admin/account?force=1");
  if (permission && !can(user.role, permission)) redirect("/admin?denied=1");
  return user;
}

/** For server actions: returns the user or throws (no redirect inside try/catch flows). */
export async function assertUser(permission?: Permission) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");
  if (permission && !can(user.role, permission)) throw new Error("You don't have permission to do that.");
  return user;
}

// ─────────────────────────── Passwords ───────────────────────────

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export function passwordProblem(pw: string): string | null {
  if (pw.length < 10) return "Use at least 10 characters.";
  if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/\d/.test(pw)) return "Include upper- and lower-case letters and a number.";
  return null;
}

export function newResetToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: sha256(token) };
}

export const sha256 = (s: string) => createHash("sha256").update(s).digest("hex");

// ─────────────────────────── Activity log ───────────────────────────

export async function logActivity(userId: string | null, action: string, entity: string, entityId?: string | null, label?: string | null) {
  try {
    await db.activityLog.create({ data: { userId, action, entity, entityId: entityId ?? null, label: label?.slice(0, 180) ?? null } });
  } catch (e) {
    console.error("[activity]", (e as Error).message);
  }
}
