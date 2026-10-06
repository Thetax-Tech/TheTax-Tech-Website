import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

/** Infinite CSS marquee (pauses on hover; reduced-motion users get a static row via global CSS). */
export function Marquee({ children, reverse, duration = 40, className }: { children: ReactNode; reverse?: boolean; duration?: number; className?: string }) {
  return (
    <div className={cn("group relative flex overflow-hidden mask-fade-x", className)} style={{ "--marquee-duration": `${duration}s` } as CSSProperties}>
      <div className={cn("flex w-max shrink-0 group-hover:[animation-play-state:paused]", reverse ? "animate-marquee-reverse" : "animate-marquee")}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div className="flex shrink-0 items-center" aria-hidden="true">
          {children}
        </div>
      </div>
    </div>
  );
}
