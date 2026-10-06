import { ArrowRight, Bot, CheckCircle2, PlayCircle, Workflow, Zap } from "lucide-react";
import { Magnetic } from "@/components/motion/magnetic";
import { Parallax } from "@/components/motion/parallax";
import { ButtonLink } from "@/components/ui/button";
import { ShaderBackdrop } from "@/components/three/shader-backdrop";
import { LOGO_PATHS } from "@/components/brand/logo-mark";
import type { homeSections } from "@/content/site";

type HeroData = (typeof homeSections)["hero"];

function d(s: number) {
  return { "--d": `${s}s` } as React.CSSProperties;
}

export function Hero({ data }: { data: HeroData }) {
  return (
    <section data-stage="hero" className="relative isolate flex min-h-[100svh] items-center overflow-hidden pt-28 pb-16 lg:pt-32">
      {/* Background layers */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-radial opacity-60" />
        <div className="absolute -left-40 top-10 size-[38rem] rounded-full blob [--blob-a:44%]" />
        <div className="absolute -right-40 bottom-0 size-[32rem] rounded-full blob-strong [--blob-a:33%]" />
        {/* Animated WebGL aurora + wave grid — visible from the first moments, on every device */}
        <div className="absolute inset-0 transition-opacity duration-1000 [.has-3d_&]:opacity-50">
          <ShaderBackdrop horizon={-0.18} />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
      </div>

      <div className="container-x grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
        <div>
          <p className="anim-fade-up inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur" style={d(0)}>
            <span className="relative flex size-2">
              <span className="relative inline-flex size-2 rounded-full bg-brand" />
            </span>
            {data.eyebrow}
          </p>

          {/* Plain text, fully opaque from the first paint (it is the LCP element); a single
              transform-only slide plays once, so there is no layout shift and no JS. */}
          <h1 className="hero-title mt-6 text-[2.6rem] font-semibold leading-[1.02] tracking-tight sm:text-6xl lg:text-[4.6rem]">
            {data.headline}{" "}
            <span className="text-gradient">{data.rotatingWords.at(-1) ?? ""}</span>
          </h1>

          <p className="anim-fade-up mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg" style={d(0.5)}>
            {data.subheadline}
          </p>

          <div className="anim-fade-up mt-9 flex flex-wrap items-center gap-3" style={d(0.65)}>
            <Magnetic>
              <ButtonLink href={data.primaryCta.href} size="lg">
                {data.primaryCta.label} <ArrowRight />
              </ButtonLink>
            </Magnetic>
            <Magnetic>
              <ButtonLink href={data.secondaryCta.href} size="lg" variant="secondary">
                <PlayCircle /> {data.secondaryCta.label}
              </ButtonLink>
            </Magnetic>
          </div>

          <p className="anim-fade-up mt-8 flex items-center gap-2 text-sm text-subtle" style={d(0.8)}>
            <CheckCircle2 className="size-4 text-brand-ink" aria-hidden /> {data.trustLine}
          </p>
        </div>

        {/* Visual */}
        <Parallax offset={40} className="relative hidden lg:block">
          <div className="anim-fade-up relative mx-auto aspect-square w-full max-w-[520px]" style={d(0.4)} aria-hidden>
            <div className="hero-orb absolute inset-0 transition-opacity duration-1000">
            <div className="absolute inset-0 rounded-full border border-line animate-spin-slow" style={{ borderStyle: "dashed" }} />
            <div className="absolute inset-[12%] rounded-full border border-line-strong" />
            <div className="absolute inset-[24%] rounded-full blob [--blob-a:45%]" />
            <div className="absolute inset-[26%] grid place-items-center rounded-full border border-line bg-surface/40 shadow-[0_0_120px_-20px_var(--glow)] backdrop-blur-xl">
              <svg viewBox="0 0 1430 1317" className="w-[58%] drop-shadow-[0_10px_40px_var(--glow)]">
                <path d={LOGO_PATHS.ring} fill="var(--brand)" />
                <path d={LOGO_PATHS.wingTop} fill="var(--brand)" />
                <path d={LOGO_PATHS.wingMid} className="fill-fg" />
              </svg>
            </div>
            {/* Orbiting dot */}
            <div className="absolute inset-[12%] animate-spin-slow [animation-duration:12s]">
              <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-brand shadow-[0_0_20px_var(--brand)]" />
            </div>
            </div>

            <FloatCard className="left-0 top-[14%]" icon={<Bot className="size-4" />} title="AI agents" text="Answering 24/7 · EN / اردو" />
            <FloatCard className="-right-6 top-[58%]" icon={<Workflow className="size-4" />} title="Workflow automation" text="Email · WhatsApp · CRM" />
            <FloatCard className="bottom-[4%] left-[2%]" icon={<Zap className="size-4" />} title="BPO teams" text="Karachi · round-the-clock" />
          </div>
        </Parallax>
      </div>

      {/* Scroll cue */}
      <div aria-hidden className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-subtle sm:flex">
        Scroll
        <span className="relative h-10 w-px overflow-hidden bg-line-strong">
          <span className="absolute inset-x-0 top-0 h-1/2 bg-brand" />
        </span>
      </div>
    </section>
  );
}

function FloatCard({ className, icon, title, text }: { className: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className={`absolute rounded-2xl border border-line-strong p-3.5 pr-5 shadow-xl glass ${className}`}>
      <div className="flex items-center gap-3">
        <span className="grid size-9 place-items-center rounded-xl bg-brand text-on-brand">{icon}</span>
        <span>
          <span className="block text-sm font-semibold">{title}</span>
          <span className="block text-xs text-subtle">{text}</span>
        </span>
      </div>
    </div>
  );
}
