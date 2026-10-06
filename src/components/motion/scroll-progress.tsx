/** Thin reading-progress bar at the top of the page — pure CSS scroll-driven animation (see .tx-progress). */
export function ScrollProgress() {
  return <div aria-hidden className="tx-progress fixed inset-x-0 top-0 z-[70] h-[2px] bg-gradient-to-r from-brand-soft via-brand to-brand-strong" />;
}
