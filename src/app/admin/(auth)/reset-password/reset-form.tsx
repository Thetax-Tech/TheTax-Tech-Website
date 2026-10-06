"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { resetPasswordAction, type AuthState } from "@/app/admin/actions/auth";
import { Input, Label, btn } from "@/components/admin/ui";

export function ResetForm({ token, email }: { token: string; email: string }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPasswordAction, undefined);
  return (
    <form action={action} className="space-y-5">
      <div>
        <h1 className="font-display text-2xl font-semibold">Choose a new password</h1>
        <p className="mt-1 text-sm text-muted">At least 10 characters with upper- and lower-case letters and a number.</p>
      </div>
      <input type="hidden" name="token" value={token} />
      <input type="hidden" name="email" value={email} />
      <div>
        <Label htmlFor="password">New password</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </div>
      <div>
        <Label htmlFor="confirm">Confirm password</Label>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={10} />
      </div>
      {state?.error && <p role="alert" className="text-sm text-red-500">{state.error}</p>}
      <button className={`${btn.primary} w-full py-2.5`} disabled={pending}>
        {pending && <Loader2 className="animate-spin" />} Update password
      </button>
    </form>
  );
}
