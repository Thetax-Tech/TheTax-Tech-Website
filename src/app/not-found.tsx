import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ButtonLink } from "@/components/ui/button";
import { LOGO_PATHS } from "@/components/brand/logo-mark";

export const metadata = { title: "Page not found", robots: { index: false } };

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid mask-radial" />
        <div className="absolute left-1/2 top-1/3 size-[36rem] -translate-x-1/2 rounded-full blob [--blob-a:44%]" />
      </div>
      <header className="container-x flex h-20 items-center">
        <Logo />
      </header>
      <main className="container-x flex flex-1 flex-col items-center justify-center py-16 text-center">
        <div className="relative flex items-center font-display text-[9rem] font-semibold leading-none sm:text-[14rem]" aria-hidden>
          <span className="anim-rise">4</span>
          <svg viewBox="0 0 1430 1317" className="mx-2 h-[0.75em] w-auto animate-spin-slow">
            <path d={LOGO_PATHS.ring} fill="var(--brand)" />
            <path d={LOGO_PATHS.wingTop} fill="var(--brand)" />
            <path d={LOGO_PATHS.wingMid} className="fill-fg" />
          </svg>
          <span className="anim-rise" style={{ "--d": "0.1s" } as React.CSSProperties}>4</span>
        </div>
        <h1 className="mt-6 text-3xl font-semibold sm:text-4xl">This page took a wrong turn</h1>
        <p className="mt-4 max-w-md text-muted">The page you&apos;re looking for doesn&apos;t exist or has moved. Let&apos;s get you back on track.</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/" size="lg">
            <ArrowLeft /> Back to home
          </ButtonLink>
          <ButtonLink href="/contact" size="lg" variant="secondary">
            Contact us <ArrowRight />
          </ButtonLink>
        </div>
        <nav aria-label="Popular pages" className="mt-12">
          <ul className="flex flex-wrap justify-center gap-6 text-sm text-muted">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="hover:text-brand-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}
