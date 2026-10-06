"use client";

import { useRef, useState, useEffect, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/** Native scroll-snap carousel with prev/next buttons (touch/trackpad friendly, accessible). */
export function PortfolioCarousel({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  function update() {
    const el = ref.current;
    if (!el) return;
    setEdges({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth > el.scrollWidth - 8 });
  }

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  function scroll(dir: number) {
    const el = ref.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-slide]");
    el.scrollBy({ left: dir * ((card?.offsetWidth ?? 400) + 24), behavior: "smooth" });
  }

  return (
    <div>
      <div className="mb-8 flex justify-end gap-2">
        <button type="button" onClick={() => scroll(-1)} disabled={edges.start} aria-label="Previous projects" className="grid size-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-brand hover:bg-brand hover:text-on-brand disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg">
          <ChevronLeft className="size-5" />
        </button>
        <button type="button" onClick={() => scroll(1)} disabled={edges.end} aria-label="Next projects" className="grid size-12 place-items-center rounded-full border border-line-strong transition-colors hover:border-brand hover:bg-brand hover:text-on-brand disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-fg">
          <ChevronRight className="size-5" />
        </button>
      </div>
      <div
        ref={ref}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="-mx-4 flex snap-x snap-mandatory gap-6 overflow-x-auto scroll-px-4 px-4 pb-4 [scrollbar-width:none] sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </div>
    </div>
  );
}
