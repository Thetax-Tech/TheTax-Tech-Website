"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { updateLead } from "@/app/admin/actions/content";
import { Panel, Textarea, btn } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const STATUSES = [
  { value: "NEW", label: "New" },
  { value: "CONTACTED", label: "Contacted" },
  { value: "CLOSED", label: "Closed" },
] as const;

export function LeadControls({ id, status, notes: initialNotes }: { id: string; status: "NEW" | "CONTACTED" | "CLOSED"; notes: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [pending, start] = useTransition();

  const run = (data: Parameters<typeof updateLead>[1], msg: string) =>
    start(async () => {
      await updateLead(id, data);
      toast.success(msg);
      router.refresh();
    });

  return (
    <Panel title="Status & notes">
      <div className="grid grid-cols-3 gap-2">
        {STATUSES.map((s) => (
          <button
            key={s.value}
            type="button"
            disabled={pending}
            onClick={() => run({ status: s.value }, `Marked as ${s.label.toLowerCase()}`)}
            className={cn("rounded-lg border px-3 py-2 text-sm font-medium transition-colors", status === s.value ? "border-brand bg-brand text-on-brand" : "border-line-strong hover:border-brand")}
          >
            {s.label}
          </button>
        ))}
      </div>
      <label htmlFor="notes" className="mt-5 block text-sm font-medium">
        Internal notes
      </label>
      <Textarea id="notes" rows={6} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Call summary, next steps, quote sent…" className="mt-1.5" />
      <button type="button" className={cn(btn.secondary, "mt-3")} disabled={pending || notes === initialNotes} onClick={() => run({ notes }, "Notes saved")}>
        Save notes
      </button>
    </Panel>
  );
}
