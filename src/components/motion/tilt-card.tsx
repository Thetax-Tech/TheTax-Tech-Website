"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/** 3D tilt + cursor spotlight card (mouse only). Writes transforms and CSS variables directly, no animation library. */
export function TiltCard({ children, className, max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (e.pointerType !== "mouse" || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.transform = `perspective(900px) rotateX(${(0.5 - py) * 2 * max}deg) rotateY(${(px - 0.5) * 2 * max}deg)`;
    el.style.setProperty("--mx", `${px * 100}%`);
    el.style.setProperty("--my", `${py * 100}%`);
  }
  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={cn("group relative tilt-3d", className)}>
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{ background: "radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), var(--glow), transparent 60%)" }}
      />
      <div className="tilt-content relative z-10 h-full">{children}</div>
    </div>
  );
}
