"use client";

import { useEffect, useRef } from "react";

/**
 * Counts up from 0 when scrolled into view. The final value is server-rendered (SEO, no-JS);
 * the animation writes straight to the DOM from rAF — no React re-renders per frame.
 */
export function Counter({ value, suffix = "", prefix = "", duration = 2 }: { value: number; suffix?: string; prefix?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min(1, (now - t0) / (duration * 1000));
          const eased = 1 - Math.pow(1 - p, 4);
          el.textContent = `${prefix}${Math.round(value * eased).toLocaleString("en-US")}${suffix}`;
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, suffix, prefix, duration]);

  return (
    <span ref={ref} className="tabular-nums" suppressHydrationWarning>
      {prefix}
      {value.toLocaleString("en-US")}
      {suffix}
    </span>
  );
}
