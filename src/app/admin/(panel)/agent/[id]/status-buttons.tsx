"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { setConversationStatus } from "@/app/admin/actions/agent";
import { Panel } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const STATUSES = ["open", "lead", "handoff", "closed"] as const;

export function StatusButtons({ id, status }: { id: string; status: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <Panel title="Status" description="Mark handoffs as closed once a team member has followed up.">
      <div className="grid grid-cols-2 gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            type="button"
            disabled={pending}
            onClick={() =>
              start(async () => {
                const r = await setConversationStatus(id, s);
                if (!r.ok) toast.error(r.error);
                else toast.success(`Marked as ${s}`);
                router.refresh();
              })
            }
            className={cn("rounded-lg border px-3 py-2 text-sm font-medium capitalize", status === s ? "border-brand bg-brand text-on-brand" : "border-line-strong hover:border-brand")}
          >
            {s}
          </button>
        ))}
      </div>
    </Panel>
  );
}
