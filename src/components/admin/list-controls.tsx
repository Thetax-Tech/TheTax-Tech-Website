"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Loader2, Trash2 } from "lucide-react";
import { btn } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Result = { ok: boolean; error?: string };

/** Inline on/off switch for list rows. */
export function ToggleCell({ value, action, label }: { value: boolean; action: (v: boolean) => Promise<Result>; label: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await action(!value);
          if (!r.ok) toast.error(r.error ?? "Failed");
          router.refresh();
        })
      }
      className={cn("relative h-5 w-9 rounded-full transition-colors disabled:opacity-50", value ? "bg-brand" : "bg-line-strong")}
    >
      <span className={cn("absolute top-0.5 size-4 rounded-full bg-white shadow transition-all", value ? "left-[18px]" : "left-0.5")} />
    </button>
  );
}

export function DeleteButton({ action, label = "Delete", confirmText = "Delete permanently? This cannot be undone.", iconOnly }: { action: () => Promise<Result & { redirect?: string }>; label?: string; confirmText?: string; iconOnly?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={pending}
      className={iconOnly ? cn(btn.ghost, "text-red-500") : btn.danger}
      onClick={() => {
        if (!confirm(confirmText)) return;
        start(async () => {
          const r = await action();
          if (!r.ok) return void toast.error(r.error ?? "Delete failed");
          toast.success("Deleted");
          if (r.redirect && !window.location.pathname.endsWith(r.redirect)) router.push(r.redirect);
          router.refresh();
        });
      }}
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />} {!iconOnly && label}
    </button>
  );
}

/** Up/down ordering for sortable lists; persists the full order. */
export function OrderButtons({ ids, index, action }: { ids: string[]; index: number; action: (ids: string[]) => Promise<Result> }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const move = (d: number) =>
    start(async () => {
      const next = [...ids];
      const [x] = next.splice(index, 1);
      next.splice(index + d, 0, x);
      const r = await action(next);
      if (!r.ok) toast.error(r.error ?? "Failed");
      router.refresh();
    });
  return (
    <span className="inline-flex">
      <button type="button" className={btn.ghost} disabled={pending || index === 0} onClick={() => move(-1)} aria-label="Move up">
        <ArrowUp />
      </button>
      <button type="button" className={btn.ghost} disabled={pending || index === ids.length - 1} onClick={() => move(1)} aria-label="Move down">
        <ArrowDown />
      </button>
    </span>
  );
}
