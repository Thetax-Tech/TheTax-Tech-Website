import Link from "next/link";
import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full font-semibold transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 overflow-hidden isolate [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary:
          "bg-brand text-on-brand shadow-[0_10px_40px_-10px_var(--glow)] hover:shadow-[0_14px_50px_-8px_var(--glow)] before:absolute before:inset-0 before:-z-10 before:translate-y-full before:bg-brand-soft before:transition-transform before:duration-500 hover:before:translate-y-0",
        secondary:
          "border border-line-strong bg-surface/60 text-fg backdrop-blur hover:border-brand hover:text-brand-ink",
        ghost: "text-fg hover:text-brand-ink",
        dark: "bg-fg text-bg hover:bg-brand hover:text-on-brand",
      },
      size: {
        sm: "h-9 px-4 text-sm",
        md: "h-11 px-6 text-sm",
        lg: "h-14 px-8 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type Variants = VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ComponentProps<"button"> & Variants) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}

export function ButtonLink({
  href,
  className,
  variant,
  size,
  children,
  external,
  ...props
}: { href: string; children: ReactNode; external?: boolean; className?: string } & Variants & Omit<ComponentProps<"a">, "href">) {
  const cls = cn(buttonVariants({ variant, size }), className);
  if (external || /^(https?:|mailto:|tel:)/.test(href)) {
    return (
      <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" {...props}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...props}>
      {children}
    </Link>
  );
}
