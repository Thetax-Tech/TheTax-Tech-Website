import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { SplitText } from "@/components/motion/split-text";
import { ShaderBackdrop } from "@/components/three/shader-backdrop";

/** Inner-page hero: breadcrumbs, eyebrow, single H1 and lead. */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  children,
  aside,
}: {
  crumbs: Crumb[];
  eyebrow?: string;
  title: string;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden pt-32 pb-16 sm:pt-40 sm:pb-20">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-radial opacity-70" />
        <div className="absolute -top-40 left-1/2 h-[30rem] w-[60rem] -translate-x-1/2 rounded-full blob [--blob-a:33%]" />
        {/* Animated WebGL backdrop (fades in over the CSS layers above, which remain the fallback) */}
        <ShaderBackdrop horizon={-0.2} className="[mask-image:linear-gradient(to_bottom,black_70%,transparent)]" />
      </div>
      <div className="container-x">
        <Breadcrumbs items={crumbs} className="anim-fade-up" />
        <div className={aside ? "mt-10 grid items-end gap-10 lg:grid-cols-[1.4fr_1fr]" : "mt-10"}>
          <div className="max-w-4xl">
            {eyebrow && (
              <p className="eyebrow anim-fade-up" style={{ "--d": "0.05s" } as React.CSSProperties}>
                {eyebrow}
              </p>
            )}
            <h1 className="mt-4 text-4xl font-semibold leading-[1.05] sm:text-5xl lg:text-6xl">
              <SplitText text={title} delay={0.1} stagger={0.045} />
            </h1>
            {lead && (
              <div className="anim-fade-up mt-6 max-w-2xl text-lg leading-relaxed text-muted" style={{ "--d": "0.35s" } as React.CSSProperties}>
                {lead}
              </div>
            )}
            {children}
          </div>
          {aside}
        </div>
      </div>
    </section>
  );
}
