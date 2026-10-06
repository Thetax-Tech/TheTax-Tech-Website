"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, ShieldCheck } from "lucide-react";
import {
  changePasswordAction,
  confirm2faAction,
  disable2faAction,
  start2faSetupAction,
  updateProfileAction,
  type AuthState,
} from "@/app/admin/actions/auth";
import { Input, Label, Panel, Textarea, btn } from "@/components/admin/ui";

function useToast(state: AuthState) {
  useEffect(() => {
    if (state?.error) toast.error(state.error);
    if (state?.message) toast.success(state.message);
  }, [state]);
}

export function AccountForms({ name, bio, twoFactorEnabled, mustChange }: { name: string; bio: string; twoFactorEnabled: boolean; mustChange: boolean }) {
  const router = useRouter();
  const [pw, pwAction, pwPending] = useActionState<AuthState, FormData>(changePasswordAction, undefined);
  const [prof, profAction, profPending] = useActionState<AuthState, FormData>(updateProfileAction, undefined);
  const wasForced = useRef(mustChange);
  useToast(pw);
  useToast(prof);
  useEffect(() => {
    if (pw?.ok && wasForced.current) router.push("/admin");
  }, [pw, router]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel title="Change password">
        <form action={pwAction} className="space-y-4">
          <div>
            <Label htmlFor="current">Current password</Label>
            <Input id="current" name="current" type="password" autoComplete="current-password" required />
          </div>
          <div>
            <Label htmlFor="password" hint="10+ chars, Aa1">New password</Label>
            <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm new password</Label>
            <Input id="confirm" name="confirm" type="password" autoComplete="new-password" required minLength={10} />
          </div>
          <button className={btn.primary} disabled={pwPending}>
            {pwPending && <Loader2 className="animate-spin" />} Update password
          </button>
        </form>
      </Panel>

      <div className="space-y-6">
        {!mustChange && (
          <Panel title="Profile" description="Your name and bio appear on blog posts you write.">
            <form action={profAction} className="space-y-4">
              <div>
                <Label htmlFor="name">Display name</Label>
                <Input id="name" name="name" defaultValue={name} required />
              </div>
              <div>
                <Label htmlFor="bio">Author bio</Label>
                <Textarea id="bio" name="bio" defaultValue={bio} rows={3} />
              </div>
              <button className={btn.secondary} disabled={profPending}>
                Save profile
              </button>
            </form>
          </Panel>
        )}
        {!mustChange && <TwoFactor enabled={twoFactorEnabled} />}
      </div>
    </div>
  );
}

function TwoFactor({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [setup, setSetup] = useState<{ qr: string; secret: string } | null>(null);
  const [pending, start] = useTransition();
  const [confirmState, confirmAction, confirming] = useActionState<AuthState, FormData>(confirm2faAction, undefined);
  const [disableState, disableAction, disabling] = useActionState<AuthState, FormData>(disable2faAction, undefined);
  useToast(confirmState);
  useToast(disableState);
  useEffect(() => {
    if (confirmState?.ok || disableState?.ok) router.refresh();
  }, [confirmState, disableState, router]);
  const showSetup = setup && !confirmState?.ok;

  return (
    <Panel title="Two-factor authentication" description="Protect your account with a code from Google Authenticator, Microsoft Authenticator or 1Password.">
      {enabled ? (
        <form action={disableAction} className="space-y-4">
          <p className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="size-5" /> Two-factor authentication is on.
          </p>
          <div>
            <Label htmlFor="d-pw">Confirm your password to turn it off</Label>
            <Input id="d-pw" name="password" type="password" required />
          </div>
          <button className={btn.danger} disabled={disabling}>
            Turn off 2FA
          </button>
        </form>
      ) : showSetup ? (
        <form action={confirmAction} className="space-y-4">
          <p className="text-sm text-muted">1. Scan this QR code with your authenticator app.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={setup!.qr} alt="Two-factor QR code" width={180} height={180} className="rounded-lg bg-white p-2" />
          <p className="text-xs text-subtle">
            Can&apos;t scan? Enter this key: <code className="break-all">{setup!.secret}</code>
          </p>
          <div>
            <Label htmlFor="code">2. Enter the 6-digit code</Label>
            <Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={7} required className="max-w-40 tracking-[0.4em]" />
          </div>
          <button className={btn.primary} disabled={confirming}>
            Verify & enable
          </button>
        </form>
      ) : (
        <button type="button" className={btn.primary} disabled={pending} onClick={() => start(async () => setSetup(await start2faSetupAction()))}>
          {pending && <Loader2 className="animate-spin" />} Set up 2FA
        </button>
      )}
    </Panel>
  );
}
