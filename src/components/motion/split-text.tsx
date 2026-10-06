import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Word-by-word rise. Pure CSS (no client JS, no hydration risk):
 * - default (above the fold): a time-based animation that starts on first paint,
 * - `inView`: driven by a CSS scroll timeline so it plays as the heading scrolls in.
 * Screen readers get the full sentence via aria-label. Reduced motion → static text (globals.css).
 */
export function SplitText({
  text,
  className,
  wordClassName,
  delay = 0,
  stagger = 0.06,
  inView = false,
}: {
  text: string;
  className?: string;
  wordClassName?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  const words = text.split(" ");
  return (
    <span className={className} aria-label={text} role="text">
      {words.map((w, i) => (
        <span key={i} aria-hidden="true" className="inline-block overflow-hidden pb-[0.14em] -mb-[0.14em] align-bottom">
          <span
            className={cn("inline-block", inView ? "scroll-rise" : "anim-rise", wordClassName)}
            style={(inView ? { "--rd-pct": `${Math.min(i * 3, 24)}%` } : { "--d": `${delay + i * stagger}s` }) as unknown as CSSProperties}
          >
            {w}
            {i < words.length - 1 ? " " : ""}
          </span>
        </span>
      ))}
    </span>
  );
}
