"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2, ShieldCheck } from "lucide-react";
import { loginAction, verify2faAction, type AuthState } from "@/app/admin/actions/auth";
import { Input, Label, btn } from "@/components/admin/ui";

export function LoginForm({ next, notice }: { next?: string; notice?: string }) {
  const [state, login, pending] = useActionState<AuthState, FormData>(loginAction, undefined);
  const [state2, verify, pending2] = useActionState<AuthState, FormData>(verify2faAction, undefined);
  const needs2fa = state?.step === "2fa" || state2?.step === "2fa";

  if (needs2fa) {
    return (
      <form action={verify} className="space-y-5">
        <div>
          <ShieldCheck className="size-8 text-brand-ink" />
          <h1 className="mt-4 font-display text-2xl font-semibold">Two-factor verification</h1>
          <p className="mt-1 text-sm text-muted">Enter the 6-digit code from your authenticator app.</p>
        </div>
        <input type="hidden" name="next" value={next ?? ""} />
        <div>
          <Label htmlFor="code">Authentication code</Label>
          <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus className="text-center text-lg tracking-[0.5em]" />
        </div>
        {state2?.error && <p role="alert" className="text-sm text-red-500">{state2.error}</p>}
        <button className={`${btn.primary} w-full py-2.5`} disabled={pending2}>
          {pending2 && <Loader2 className="animate-spin" />} Verify
        </button>
      </form>
    );
  }

  return (
    <form action={login} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Manage your website content.</p>
      </div>
      {notice && <p className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}
      <input type="hidden" name="next" value={next ?? ""} />
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus />
      </div>
      <div>
        <Label htmlFor="password" hint={<Link href="/admin/forgot-password" className="hover:text-brand-ink">Forgot password?</Link>}>
          Password
        </Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-500">{state.error}</p>}
      <button className={`${btn.primary} w-full py-2.5`} disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Sign in
      </button>
    </form>
  );
}
