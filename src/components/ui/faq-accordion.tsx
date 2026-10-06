"use client";

import { useId, useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Accessible accordion. Answers are always present in the server HTML (for SEO / AI crawlers)
 * via a visually-collapsed region; the animation only affects the open item.
 */
export function FaqAccordion({ items, className }: { items: { question: string; answer: string }[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();
  return (
    <div className={cn("divide-y divide-line border-y border-line", className)}>
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={i}>
            <h3>
              <button
                type="button"
                id={`${id}-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-a-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full items-start justify-between gap-6 py-6 text-left text-base font-medium sm:text-lg"
              >
                <span className={cn("transition-colors", isOpen ? "text-brand-ink" : "group-hover:text-brand-ink")}>{item.question}</span>
                <span
                  className={cn(
                    "mt-0.5 grid size-8 shrink-0 place-items-center rounded-full border border-line-strong transition-all duration-300",
                    isOpen && "rotate-45 border-brand bg-brand text-on-brand",
                  )}
                >
                  <Plus className="size-4" aria-hidden />
                </span>
              </button>
            </h3>
            <div id={`${id}-a-${i}`} role="region" aria-labelledby={`${id}-q-${i}`}>
              {isOpen ? (
                <p className="ui-in max-w-3xl pb-6 pr-12 leading-relaxed text-muted [--iy:-6px]">{item.answer}</p>
              ) : (
                <p className="sr-only">{item.answer}</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
