import Image from "next/image";
import { LOGO_PATHS } from "@/components/brand/logo-mark";
import { HoverImage } from "@/components/ui/hover-image";
import { cn } from "@/lib/utils";

/** SVG mockups are served as-is (already tiny and resolution-independent). */
export const isSvg = (src: string) => /\.svg(\?|$)/i.test(src);

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Shows the uploaded image when present; otherwise renders a deterministic, on-brand
 * generative artwork (unique per slug) so cards never look empty.
 */
export function CoverArt({
  src,
  alt,
  seed,
  label,
  className,
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
  hoverSrc,
}: {
  src?: string | null;
  alt: string;
  seed: string;
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  /** optional second image cross-faded in on hover (portfolio preview) */
  hoverSrc?: string | null;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden bg-surface-2", className)}>
        <Image src={src} alt={alt} fill sizes={sizes} priority={priority} unoptimized={isSvg(src)} className="object-cover transition-transform duration-700 group-hover:scale-105" />
        {hoverSrc && <HoverImage src={hoverSrc} sizes={sizes} unoptimized={isSvg(hoverSrc)} />}
      </div>
    );
  }
  const h = hash(seed);
  const a = (h % 360) / 360;
  const x1 = 15 + (h % 50);
  const y1 = 10 + ((h >> 8) % 60);
  const x2 = 40 + ((h >> 4) % 55);
  const y2 = 30 + ((h >> 12) % 60);
  const rot = (h >> 3) % 60 - 30;
  const variant = h % 3;

  return (
    <div role="img" aria-label={alt} className={cn("relative overflow-hidden bg-[#0b0c10]", className)}>
      <div
        className="absolute inset-0 transition-transform duration-700 group-hover:scale-110"
        style={{
          background: `radial-gradient(60% 70% at ${x1}% ${y1}%, rgba(247,148,29,${0.55 + a * 0.3}), transparent 60%),
             radial-gradient(50% 60% at ${x2}% ${y2}%, rgba(255,122,26,0.35), transparent 65%),
             radial-gradient(80% 80% at 100% 100%, rgba(255,181,71,0.18), transparent 60%),
             #0b0c10`,
        }}
      />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.07)_1px,transparent_1px)] [background-size:32px_32px]" />
      <svg viewBox="0 0 1430 1317" aria-hidden className="absolute -bottom-[18%] -right-[10%] w-[70%] opacity-[0.13] transition-transform duration-700 group-hover:rotate-6" style={{ transform: `rotate(${rot}deg)` }}>
        <path d={LOGO_PATHS.ring} fill="#fff" />
        <path d={LOGO_PATHS.wingTop} fill="#fff" />
        {variant !== 0 && <path d={LOGO_PATHS.wingMid} fill="#fff" />}
      </svg>
      {label && (
        <span className="absolute left-5 top-5 rounded-full border border-white/15 bg-black/30 px-3 py-1 text-[11px] font-medium uppercase tracking-widest text-white/80 backdrop-blur">
          {label}
        </span>
      )}
    </div>
  );
}
