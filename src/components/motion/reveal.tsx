import type { CSSProperties, ReactNode } from "react";

/*
 * Scroll reveals driven purely by CSS scroll timelines (see globals.css). No client JS:
 * these are server components and never delay first paint or hydration.
 */

type Tag = "div" | "section" | "li" | "article" | "span" | "ul" | "ol";

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  x?: number;
  as?: Tag;
  /** kept for API compatibility; reveals always run once */
  once?: boolean;
};

export function Reveal({ children, className, delay = 0, y = 28, x = 0, as: Tag = "div" }: RevealProps) {
  const style = { "--rd-pct": `${Math.round(delay * 25)}%`, "--ry": `${y}px`, "--rx": `${x}px` } as CSSProperties;
  return (
    <Tag data-reveal="" className={className} style={style}>
      {children}
    </Tag>
  );
}

/** Children marked with <StaggerItem> reveal one after another (delays via nth-child in CSS). */
export function Stagger({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: Tag }) {
  return (
    <Tag data-stagger="" className={className}>
      {children}
    </Tag>
  );
}

export function StaggerItem({ children, className, as: Tag = "div" }: { children: ReactNode; className?: string; as?: Tag }) {
  return (
    <Tag data-reveal="" className={className}>
      {children}
    </Tag>
  );
}

