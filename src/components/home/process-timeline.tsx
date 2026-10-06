"use client";

import { useEffect, useRef } from "react";

/** Process steps with a scroll-scrubbed progress line (GSAP ScrollTrigger, lazy-loaded). */
export function ProcessTimeline({ steps }: { steps: { title: string; description: string }[] }) {
  const root = useRef<HTMLOListElement>(null);

  useEffect(() => {
    if (!root.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    // Only fetch GSAP when the timeline is about to enter the viewport
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io.disconnect();
      load();
    }, { rootMargin: "300px 0px" });
    io.observe(root.current);
    const load = () => Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(([{ gsap }, { ScrollTrigger }]) => {
      if (cancelled || !root.current) return;
      gsap.registerPlugin(ScrollTrigger);
      ctx = gsap.context(() => {
      gsap.fromTo(
        "[data-line]",
        { scaleX: 0, scaleY: 0 },
        {
          scaleX: 1,
          scaleY: 1,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top 75%", end: "bottom 55%", scrub: 0.6 },
        },
      );
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el, i) => {
        gsap.fromTo(
          el,
          { y: 30 },
          {
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 85%" },
            delay: i * 0.04,
          },
        );
      });
      }, root);
    });
    return () => {
      cancelled = true;
      io.disconnect();
      ctx?.revert();
    };
  }, []);

  return (
    <ol ref={root} className="relative mt-16 grid gap-10 lg:grid-cols-5 lg:gap-6">
      {/* Track + animated progress (horizontal on desktop, vertical on mobile) */}
      <span aria-hidden className="absolute left-[27px] top-0 h-full w-px bg-line-strong lg:left-0 lg:top-[27px] lg:h-px lg:w-full" />
      <span
        aria-hidden
        data-line
        className="absolute left-[27px] top-0 h-full w-px origin-top bg-gradient-to-b from-brand to-brand-strong lg:left-0 lg:top-[27px] lg:h-px lg:w-full lg:origin-left lg:bg-gradient-to-r"
      />
      {steps.map((s, i) => (
        <li key={s.title} data-step className="relative flex gap-6 lg:block">
          <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-brand bg-bg font-display text-lg font-semibold text-brand-ink shadow-[0_0_40px_-10px_var(--glow)]">
            {String(i + 1).padStart(2, "0")}
          </span>
          <div className="lg:mt-8">
            <h3 className="text-xl font-semibold">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
