"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Mail, RefreshCw } from "lucide-react";
import { revalidateAll, sendTestEmail } from "@/app/admin/actions/content";
import { btn } from "@/components/admin/ui";

export function SettingsTools() {
  const [pending, start] = useTransition();
  return (
    <>
      <button
        type="button"
        className={btn.secondary}
        disabled={pending}
        onClick={() =>
          start(async () => {
            const r = await sendTestEmail();
            if (r.ok) toast.success(r.message);
            else toast.error(r.error);
          })
        }
      >
        <Mail /> Send test email
      </button>
      <button
        type="button"
        className={btn.secondary}
        disabled={pending}
        title="Rebuild cached pages"
        onClick={() =>
          start(async () => {
            await revalidateAll();
            toast.success("Website cache cleared");
          })
        }
      >
        <RefreshCw /> Clear cache
      </button>
    </>
  );
}
