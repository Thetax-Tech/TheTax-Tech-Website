import type { ReactNode } from "react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

/** Eyebrow + H2 + lead paragraph used at the top of most sections. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  as: Tag = "h2",
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
  children?: ReactNode;
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Reveal>
          <p className={cn("eyebrow", align === "center" && "justify-center")}>{eyebrow}</p>
        </Reveal>
      )}
      <Reveal delay={0.05}>
        <Tag className="mt-4 text-3xl font-semibold leading-[1.1] sm:text-4xl lg:text-5xl">{title}</Tag>
      </Reveal>
      {lead && (
        <Reveal delay={0.1}>
          <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">{lead}</p>
        </Reveal>
      )}
      {children}
    </div>
  );
}
