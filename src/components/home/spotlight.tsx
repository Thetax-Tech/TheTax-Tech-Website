import { ArrowRight, Bot, Check, FileText, Headset, Mail, MessageCircle, Database, BarChart3 } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { Parallax } from "@/components/motion/parallax";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SpotlightData = { eyebrow: string; title: string; text: string; bullets: string[]; cta: { label: string; href: string } };

export function Spotlight({ data, visual, reverse }: { data: SpotlightData; visual: "ai" | "bpo"; reverse?: boolean }) {
  return (
    <div className={cn("grid items-center gap-12 lg:grid-cols-2 lg:gap-20", reverse && "lg:[&>*:first-child]:order-2")}>
      <div>
        <Reveal>
          <p className="eyebrow">{data.eyebrow}</p>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-4 text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">{data.title}</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-lg leading-relaxed text-muted">{data.text}</p>
        </Reveal>
        <ul className="mt-8 grid gap-3 sm:grid-cols-2">
          {data.bullets.map((b, i) => (
            <Reveal as="li" key={b} delay={0.12 + i * 0.05} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-brand/15 text-brand-ink">
                <Check className="size-3" aria-hidden />
              </span>
              {b}
            </Reveal>
          ))}
        </ul>
        <Reveal delay={0.3}>
          <ButtonLink href={data.cta.href} className="mt-10">
            {data.cta.label} <ArrowRight />
          </ButtonLink>
        </Reveal>
      </div>
      <Parallax offset={50}>
        <Reveal y={50}>{visual === "ai" ? <AiVisual /> : <BpoVisual />}</Reveal>
      </Parallax>
    </div>
  );
}

function Node({ icon, label, className }: { icon: React.ReactNode; label: string; className?: string }) {
  return (
    <div className={cn("absolute flex items-center gap-2 rounded-xl border border-line-strong bg-surface px-3 py-2 text-xs font-medium shadow-lg", className)}>
      <span className="grid size-7 place-items-center rounded-lg bg-surface-2 text-brand-ink">{icon}</span>
      {label}
    </div>
  );
}

/** Animated automation workflow diagram (SVG + CSS, decorative). */
function AiVisual() {
  return (
    <div aria-hidden className="card relative aspect-[5/4] overflow-hidden bg-grid">
      <div className="absolute left-1/2 top-1/2 size-64 -translate-x-1/2 -translate-y-1/2 rounded-full blob [--blob-a:44%]" />
      <svg viewBox="0 0 500 400" className="absolute inset-0 size-full" fill="none">
        <defs>
          <linearGradient id="flow" x1="0" x2="1">
            <stop offset="0" stopColor="var(--brand)" stopOpacity="0.1" />
            <stop offset="1" stopColor="var(--brand)" />
          </linearGradient>
        </defs>
        {["M105 80 C 180 80, 180 200, 250 200", "M105 200 L 250 200", "M105 320 C 180 320, 180 200, 250 200", "M250 200 C 320 200, 320 110, 395 110", "M250 200 C 320 200, 320 290, 395 290"].map((d, i) => (
          <g key={i}>
            <path d={d} stroke="var(--border-strong)" strokeWidth="1.5" />
            <path d={d} stroke="url(#flow)" strokeWidth="2" strokeDasharray="6 10" />
          </g>
        ))}
      </svg>
      <Node icon={<Mail className="size-3.5" />} label="Email" className="left-[4%] top-[16%]" />
      <Node icon={<MessageCircle className="size-3.5" />} label="WhatsApp" className="left-[4%] top-[46%]" />
      <Node icon={<FileText className="size-3.5" />} label="Invoices" className="left-[4%] top-[76%]" />
      <div className="absolute left-1/2 top-1/2 grid size-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-3xl bg-brand text-on-brand shadow-[0_0_60px_-5px_var(--glow)]">
        <span className="absolute inset-0 animate-pulse-ring rounded-3xl bg-brand [animation-iteration-count:3]" />
        <Bot className="relative size-10" />
      </div>
      <Node icon={<Database className="size-3.5" />} label="CRM updated" className="right-[4%] top-[23%]" />
      <Node icon={<BarChart3 className="size-3.5" />} label="Report sent" className="right-[4%] top-[68%]" />
    </div>
  );
}

/** BPO operations dashboard mock (decorative). */
function BpoVisual() {
  const bars = [42, 58, 50, 72, 64, 86, 78, 94];
  return (
    <div aria-hidden className="card relative overflow-hidden p-6 sm:p-8">
      <div className="absolute -left-20 -top-20 size-60 rounded-full blob [--blob-a:33%]" />
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="grid size-10 place-items-center rounded-xl bg-brand text-on-brand">
            <Headset className="size-5" />
          </span>
          <div>
            <p className="text-sm font-semibold">Support operations</p>
            <p className="text-xs text-subtle">Example dashboard · illustrative data</p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-500">SLA 99.2%</span>
      </div>
      <div className="relative mt-8 grid grid-cols-3 gap-3">
        {[
          ["1,842", "Tickets / week"],
          ["38s", "First response"],
          ["94%", "CSAT"],
        ].map(([v, l]) => (
          <div key={l} className="rounded-2xl border border-line bg-surface-2 p-4">
            <p className="font-display text-2xl font-semibold">{v}</p>
            <p className="mt-1 text-xs text-subtle">{l}</p>
          </div>
        ))}
      </div>
      <div className="relative mt-6 flex h-40 items-end gap-2 rounded-2xl border border-line bg-surface-2 p-4">
        {bars.map((h, i) => (
          <span key={i} className="flex-1 origin-bottom rounded-t-md bg-gradient-to-t from-brand/40 to-brand animate-[grow_1.2s_cubic-bezier(.22,1,.36,1)_both]" style={{ height: `${h}%`, animationDelay: `${i * 0.08}s` }} />
        ))}
      </div>
    </div>
  );
}
