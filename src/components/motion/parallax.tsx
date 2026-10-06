import type { CSSProperties, ReactNode } from "react";

/**
 * Parallax drift tied to scroll position via a CSS view timeline (no JS, compositor-only).
 * Unsupported browsers / reduced motion simply render the content in place.
 */
export function Parallax({ children, offset = 80, className }: { children: ReactNode; offset?: number; className?: string }) {
  return (
    <div className={className ? `parallax ${className}` : "parallax"} style={{ "--px": `${offset}px` } as CSSProperties}>
      {children}
    </div>
  );
}
