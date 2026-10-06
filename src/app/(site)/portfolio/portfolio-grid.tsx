"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CoverArt } from "@/components/ui/cover-art";
import { cn } from "@/lib/utils";

type Item = {
  slug: string;
  title: string;
  category: string;
  industry: string | null;
  year: number | null;
  summary: string;
  coverImage: string | null;
  gallery: string[];
  isSample: boolean;
  headline: { label: string; value: string } | null;
};

/**
 * Filterable bento/masonry grid. All projects are in the server HTML (SEO);
 * filtering re-animates the cards with CSS. Hover cross-fades to a gallery image.
 */
export function PortfolioGrid({ items, categories, sampleBadge }: { items: Item[]; categories: string[]; sampleBadge: boolean }) {
  const tabs = useMemo(() => ["All", ...categories.filter((c) => items.some((i) => i.category === c))], [items, categories]);
  const [active, setActive] = useState("All");
  const [filtered, setFiltered] = useState(false);
  const shown = active === "All" ? items : items.filter((i) => i.category === active);

  return (
    <>
      <div role="tablist" aria-label="Filter projects by category" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0">
        {tabs.map((c) => {
          const count = c === "All" ? items.length : items.filter((i) => i.category === c).length;
          return (
            <button
              key={c}
              role="tab"
              aria-selected={active === c}
              onClick={() => {
                setActive(c);
                setFiltered(true);
              }}
              className={cn(
                "relative shrink-0 rounded-full border px-5 py-2.5 text-sm font-medium transition-colors",
                active === c ? "border-brand text-on-brand" : "border-line-strong text-muted hover:text-fg",
              )}
            >
              {active === c && <span className="absolute inset-0 -z-10 rounded-full bg-brand" />}
              <span className="relative">
                {c} <span className={active === c ? "opacity-70" : "text-subtle"}>{count}</span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Cards are visible on first paint; after a filter change the new set rises in (CSS, transform + opacity). */}
      <ul key={active} className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 [grid-auto-flow:dense]">
          {shown.map((p, i) => {
            const wide = i % 7 === 0; // rhythm: a wide feature tile every 7 items
            return (
              <li
                key={p.slug}
                className={cn("group", wide && "sm:col-span-2", filtered && "ui-in [--iy:24px] [animation-duration:0.55s]")}
                style={filtered ? ({ "--d": `${Math.min(i, 8) * 0.04}s` } as React.CSSProperties) : undefined}
              >
                <Link href={`/portfolio/${p.slug}`} className="block" data-cursor="View">
                  <div className="relative overflow-hidden rounded-3xl border border-line">
                    <CoverArt
                      src={p.coverImage}
                      hoverSrc={p.gallery[0]}
                      alt={`${p.title} — ${p.category} case study`}
                      seed={p.slug}
                      className={wide ? "aspect-[16/9]" : "aspect-[4/3]"}
                      priority={i < 2}
                      sizes={wide ? "(min-width: 1024px) 66vw, 100vw" : "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"}
                    />
                    <span className="absolute left-4 top-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white backdrop-blur">{p.category}</span>
                      {sampleBadge && p.isSample && (
                        <span className="rounded-full border border-white/20 bg-black/55 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur">Sample project</span>
                      )}
                    </span>
                    {/* Hover preview panel */}
                    <div className="absolute inset-x-3 bottom-3 translate-y-4 rounded-2xl border border-white/10 bg-black/65 p-4 text-white opacity-0 backdrop-blur-md transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
                      <div className="flex items-center justify-between gap-4">
                        {p.headline ? (
                          <span>
                            <span className="block font-display text-2xl font-semibold text-brand">{p.headline.value}</span>
                            <span className="block text-xs text-white/70">{p.headline.label}</span>
                          </span>
                        ) : (
                          <span className="text-sm text-white/80">View case study</span>
                        )}
                        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-brand text-on-brand">
                          <ArrowUpRight className="size-5" aria-hidden />
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-5 text-xs font-medium uppercase tracking-widest text-subtle">{[p.industry, p.year].filter(Boolean).join(" · ")}</p>
                  <h2 className={cn("mt-2 font-semibold leading-snug transition-colors group-hover:text-brand-ink", wide ? "text-2xl sm:text-3xl" : "text-xl")}>{p.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted line-clamp-2">{p.summary}</p>
                </Link>
              </li>
            );
          })}
      </ul>
    </>
  );
}
