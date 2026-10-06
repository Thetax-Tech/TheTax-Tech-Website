import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* Small, consistent building blocks for the admin dashboard. */

export const inputClass =
  "w-full rounded-lg border border-line-strong bg-bg px-3 py-2 text-sm outline-none transition-colors placeholder:text-subtle focus:border-brand focus:ring-2 focus:ring-brand/20 disabled:opacity-60";

export function Input(props: ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}
export function Textarea(props: ComponentProps<"textarea">) {
  return <textarea {...props} className={cn(inputClass, "min-h-24 resize-y", props.className)} />;
}
export function Select(props: ComponentProps<"select">) {
  return <select {...props} className={cn(inputClass, "pr-8", props.className)} />;
}

export function Label({ children, htmlFor, hint }: { children: ReactNode; htmlFor?: string; hint?: ReactNode }) {
  return (
    <div className="mb-1.5 flex items-baseline justify-between gap-4">
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {children}
      </label>
      {hint && <span className="text-xs text-subtle">{hint}</span>}
    </div>
  );
}

export function Panel({ title, description, children, className, actions }: { title?: ReactNode; description?: ReactNode; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-2xl border border-line bg-surface", className)}>
      {(title || actions) && (
        <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div>
            {title && <h2 className="font-semibold">{title}</h2>}
            {description && <p className="mt-0.5 text-sm text-subtle">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions, back }: { title: string; description?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {back && (
          <Link href={back.href} className="mb-2 inline-block text-sm text-subtle hover:text-brand-ink">
            ← {back.label}
          </Link>
        )}
        <h1 className="font-display text-2xl font-semibold sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

const badgeTones = {
  neutral: "bg-surface-2 text-muted",
  brand: "bg-brand/15 text-brand-ink",
  green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  blue: "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  red: "bg-red-500/15 text-red-600 dark:text-red-400",
  amber: "bg-amber-500/15 text-amber-700 dark:text-amber-400",
};
export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: keyof typeof badgeTones }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", badgeTones[tone])}>{children}</span>;
}

export const btn = {
  primary: "inline-flex items-center justify-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-on-brand transition-colors hover:bg-brand-soft disabled:opacity-60 [&_svg]:size-4",
  secondary: "inline-flex items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-4 py-2 text-sm font-medium transition-colors hover:border-brand disabled:opacity-60 [&_svg]:size-4",
  ghost: "inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-muted transition-colors hover:bg-surface-2 hover:text-fg [&_svg]:size-4",
  danger: "inline-flex items-center justify-center gap-2 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-500/10 dark:text-red-400 disabled:opacity-60 [&_svg]:size-4",
};

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong px-6 py-16 text-center">
      <p className="font-semibold">{title}</p>
      {text && <p className="mt-1 text-sm text-muted">{text}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-surface">
      <table className="w-full min-w-[640px] text-left text-sm [&_td]:px-4 [&_td]:py-3 [&_th]:px-4 [&_th]:py-3 [&_th]:text-xs [&_th]:font-semibold [&_th]:uppercase [&_th]:tracking-wider [&_th]:text-subtle [&_thead]:border-b [&_thead]:border-line [&_tbody_tr]:border-b [&_tbody_tr]:border-line [&_tbody_tr:last-child]:border-0 [&_tbody_tr:hover]:bg-surface-2/60">
        {children}
      </table>
    </div>
  );
}
