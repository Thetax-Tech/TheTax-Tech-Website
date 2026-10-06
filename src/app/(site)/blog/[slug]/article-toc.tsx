"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Item = { id: string; text: string; level: 2 | 3 };

/** Sticky table of contents with scroll-spy. */
export function ArticleToc({ items }: { items: Item[] }) {
  const [active, setActive] = useState(items[0]?.id);

  useEffect(() => {
    const els = items.map((i) => document.getElementById(i.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Table of contents" className="card p-6">
      <p className="text-sm font-semibold uppercase tracking-widest text-subtle">On this page</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {items.map((i) => (
          <li key={i.id}>
            <a
              href={`#${i.id}`}
              onClick={(e) => {
                const target = document.getElementById(i.id);
                if (!target) return;
                e.preventDefault();
                const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
                history.replaceState(null, "", `#${i.id}`);
              }}
              className={cn(
                "-ml-px block border-l py-1.5 text-sm leading-snug transition-colors",
                i.level === 3 ? "pl-7" : "pl-4",
                active === i.id ? "border-brand text-brand-ink" : "border-transparent text-muted hover:text-fg",
              )}
            >
              {i.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
