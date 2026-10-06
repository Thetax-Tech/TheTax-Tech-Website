"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { forgotPasswordAction, type AuthState } from "@/app/admin/actions/auth";
import { Input, Label, btn } from "@/components/admin/ui";

export default function ForgotPasswordPage() {
  const [state, action, pending] = useActionState<AuthState, FormData>(forgotPasswordAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Reset password</h1>
        <p className="mt-1 text-sm text-muted">We&apos;ll email you a secure link to choose a new password.</p>
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" required autoFocus />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-500">{state.error}</p>}
      {state?.message && <p role="status" className="rounded-lg bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400">{state.message}</p>}
      <button className={`${btn.primary} w-full py-2.5`} disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Send reset link
      </button>
      <Link href="/admin/login" className="block text-center text-sm text-subtle hover:text-brand-ink">← Back to sign in</Link>
    </form>
  );
}
