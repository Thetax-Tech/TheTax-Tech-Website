"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Floating "Back to top" button. Appears after ~300px of scrolling (IntersectionObserver on a
 * sentinel — no scroll listener), sits above the AI assistant bubble with safe-area insets, and
 * hides while the chat panel is open. Rendered in the site layout (outside the animated page
 * wrapper, whose transform would otherwise trap `position: fixed`).
 */
export function BackToTop() {
  const sentinel = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    // move keyboard focus back to the top of the page
    document.getElementById("main")?.focus({ preventScroll: true });
  }

  return (
    <>
      {/* 300px sentinel: when it scrolls out of view above the viewport, the button appears */}
      <div ref={sentinel} aria-hidden className="pointer-events-none absolute left-0 top-0 h-[300px] w-px" />
      <button
        type="button"
        onClick={toTop}
        aria-label="Back to top"
        title="Back to top"
        tabIndex={show ? 0 : -1}
        aria-hidden={!show}
        className={cn(
          "tx-top fixed z-[44] grid size-11 place-items-center rounded-full border border-line-strong bg-surface/90 text-fg shadow-lg backdrop-blur transition-[opacity,transform] duration-300 hover:border-brand hover:text-brand-ink focus-visible:opacity-100",
          show ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0",
        )}
      >
        <ArrowUp className="size-5" aria-hidden />
      </button>
    </>
  );
}
