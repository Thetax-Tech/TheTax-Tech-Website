"use client";

import { useEffect, useRef } from "react";

/**
 * Branded cursor: a precise dot + a trailing ring that grows over links/buttons and shows a label
 * over elements with data-cursor="View". Desktop with a fine pointer only; disabled for touch and
 * reduced motion. Form fields keep the native caret. rAF + transforms only while moving (no React re-renders, idle when still).
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    root.classList.add("cursor-custom");

    const pos = { x: -100, y: -100 };
    const trail = { x: -100, y: -100 };
    let scale = 1;
    let target = 1;
    let raf = 0;
    let shown = false;

    const onMove = (e: PointerEvent) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      if (!shown) {
        shown = true;
        trail.x = pos.x;
        trail.y = pos.y;
        root.classList.add("cursor-visible");
      }
      const el = (e.target as Element | null)?.closest?.("a, button, [role='button'], [data-cursor], summary, label, select");
      const text = el?.getAttribute("data-cursor") ?? "";
      target = el ? (text ? 3.2 : 2) : 1;
      if (label.current) label.current.textContent = text;
      ring.current?.classList.toggle("has-label", Boolean(text));
      kick();
    };
    const onLeave = () => root.classList.remove("cursor-visible");
    const onEnter = () => shown && root.classList.add("cursor-visible");
    const onDown = () => {
      target *= 0.8;
      kick();
    };
    const onUp = () => {
      target /= 0.8;
      kick();
    };

    // The rAF loop only runs while the ring is still catching up — it stops once the cursor is at rest.
    const loop = () => {
      trail.x += (pos.x - trail.x) * 0.18;
      trail.y += (pos.y - trail.y) * 0.18;
      scale += (target - scale) * 0.18;
      if (dot.current) dot.current.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -50%)`;
      if (ring.current) ring.current.style.transform = `translate3d(${trail.x}px, ${trail.y}px, 0) translate(-50%, -50%) scale(${scale})`;
      const settled = Math.abs(pos.x - trail.x) < 0.1 && Math.abs(pos.y - trail.y) < 0.1 && Math.abs(target - scale) < 0.001;
      raf = settled ? 0 : requestAnimationFrame(loop);
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("cursor-custom", "cursor-visible");
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="tx-cursor-ring" aria-hidden>
        <span ref={label} className="tx-cursor-label" />
      </div>
      <div ref={dot} className="tx-cursor-dot" aria-hidden />
    </>
  );
}
