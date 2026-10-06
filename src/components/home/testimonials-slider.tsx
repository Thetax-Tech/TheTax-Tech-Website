"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { TestimonialVM } from "@/lib/data";

export function TestimonialsSlider({ items }: { items: TestimonialVM[] }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);

  const go = useCallback((d: number) => setState(([i]) => [(i + d + items.length) % items.length, d]), [items.length]);

  useEffect(() => {
    if (paused || items.length < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setInterval(() => go(1), 7000);
    return () => window.clearInterval(id);
  }, [paused, go, items.length]);

  if (!items.length) return null;
  const t = items[index];

  return (
    <div
      className="card relative overflow-hidden p-8 sm:p-12 lg:p-16"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Client testimonials"
    >
      <div aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full blob [--blob-a:33%]" />
      <Quote className="size-12 text-brand opacity-80" aria-hidden />

      <div className="relative mt-6 min-h-[220px] sm:min-h-[180px]">
        <figure
            key={index}
            className={index || dir < 0 ? "ui-in [--iy:0px] [animation-duration:0.45s]" : undefined}
            style={{ "--ix": `${dir * 40}px` } as React.CSSProperties}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${items.length}`}
          >
            <blockquote className="font-display text-xl font-medium leading-relaxed sm:text-2xl lg:text-3xl">“{t.quote}”</blockquote>
            <figcaption className="mt-8 flex items-center gap-4">
              <span className="grid size-12 place-items-center rounded-full bg-brand font-display text-lg font-semibold text-on-brand">
                {t.name.charAt(0)}
              </span>
              <span>
                <span className="block font-semibold">{t.name}</span>
                <span className="block text-sm text-subtle">{[t.role, t.company].filter(Boolean).join(", ")}</span>
              </span>
              <span className="ml-auto hidden gap-0.5 sm:flex" role="img" aria-label={`Rated ${t.rating} out of 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={i < t.rating ? "size-4 fill-brand text-brand" : "size-4 text-line-strong"} aria-hidden />
                ))}
              </span>
            </figcaption>
          </figure>
      </div>

      <div className="relative mt-10 flex items-center justify-between">
        <div className="flex gap-2">
          {items.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setState([i, i > index ? 1 : -1])}
              aria-label={`Show testimonial ${i + 1}`}
              aria-current={i === index}
              className="group/dot relative h-1.5 overflow-hidden rounded-full bg-line-strong transition-all duration-500"
              style={{ width: i === index ? 40 : 12 }}
            >
              {i === index && (
                <span
                  key={index}
                  className="tx-slide-progress absolute inset-0 origin-left bg-brand"
                  style={{ animationPlayState: paused ? "paused" : "running" }}
                />
              )}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => go(-1)} aria-label="Previous testimonial" className="grid size-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-brand hover:bg-brand hover:text-on-brand">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" onClick={() => go(1)} aria-label="Next testimonial" className="grid size-11 place-items-center rounded-full border border-line-strong transition-colors hover:border-brand hover:bg-brand hover:text-on-brand">
            <ChevronRight className="size-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
