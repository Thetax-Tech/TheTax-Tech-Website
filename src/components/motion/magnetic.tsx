"use client";

import { useRef, type ReactNode } from "react";

/** Subtly pulls its child toward the cursor (mouse only). Plain transforms + a CSS transition, no animation library. */
export function Magnetic({ children, strength = 0.35, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    const el = ref.current;
    if (e.pointerType !== "mouse" || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate3d(${(e.clientX - (r.left + r.width / 2)) * strength}px, ${(e.clientY - (r.top + r.height / 2)) * strength}px, 0)`;
  }
  function reset() {
    if (ref.current) ref.current.style.transform = "";
  }

  return (
    <div ref={ref} className={`magnetic ${className ?? "inline-block"}`} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </div>
  );
}
