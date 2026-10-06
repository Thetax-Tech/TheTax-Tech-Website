import { cn } from "@/lib/utils";

/**
 * Vector trace of the ThetaX "theta wing" mark (viewBox matches the 1430x1317 source PNG).
 * Paths are exported so the preloader and hero can animate each wing independently.
 */
export const LOGO_PATHS = {
  ring: "M738 222A561 561 0 1 0 1100 910L673 913L235 1070L673 1016L910 1080A473 473 0 1 1 673 296Z",
  wingTop: "M207 996L428 513L1285 0L1040 364L505 601Z",
  wingMid: "M232 1028L585 655L1428 342L1184 766L668 841Z",
};

export function LogoMark({ className, title = "Theta X Tech" }: { className?: string; title?: string }) {
  return (
    <svg viewBox="0 0 1430 1317" className={cn("h-8 w-auto", className)} role="img" aria-label={title}>
      <path d={LOGO_PATHS.ring} fill="var(--brand)" />
      <path d={LOGO_PATHS.wingTop} fill="var(--brand)" />
      <path d={LOGO_PATHS.wingMid} className="fill-[#0b0b0d] dark:fill-white" />
    </svg>
  );
}
