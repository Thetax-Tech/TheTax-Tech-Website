"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Magnetic } from "@/components/motion/magnetic";
import { cn } from "@/lib/utils";

export type NavService = { slug: string; name: string; icon: string; tagline: string | null };

const LINKS = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services", mega: true },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/blog", label: "Insights" },
  { href: "/careers", label: "Careers", module: "careers" },
  { href: "/contact", label: "Contact" },
] as const;

export function Navbar({
  services,
  logo,
  logoDark,
  name,
  careersEnabled,
}: {
  services: NavService[];
  logo?: string;
  logoDark?: string;
  name: string;
  careersEnabled: boolean;
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [deep, setDeep] = useState(false);
  const [down, setDown] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const top = useRef<HTMLDivElement>(null);
  const hidden = deep && down && !mega && !mobile;

  // Glass background after 24px and auto-hide past 400px, detected with IntersectionObserver
  // sentinels instead of a per-frame scroll handler.
  useEffect(() => {
    const [a, b] = top.current ? Array.from(top.current.children) : [];
    if (!a || !b) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const past = !e.isIntersecting && e.boundingClientRect.top < 0;
        if (e.target === a) setScrolled(past);
        else setDeep(past);
      }
    });
    io.observe(a);
    io.observe(b);
    return () => io.disconnect();
  }, []);

  // Scroll direction is only tracked while deep in the page, at most once per frame.
  useEffect(() => {
    if (!deep) return;
    let last = window.scrollY;
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (Math.abs(y - last) > 6) setDown(y > last);
        last = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [deep]);

  // Close menus when the route changes (state adjustment during render, no effect needed)
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setMega(false);
    setMobile(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobile]);

  const links = LINKS.filter((l) => !("module" in l) || careersEnabled);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <a href="#main" className="sr-only z-[80] rounded-full bg-brand px-4 py-2 text-on-brand focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Skip to content
      </a>
      <div ref={top} aria-hidden className="pointer-events-none absolute inset-x-0 top-0">
        <div className="absolute top-0 h-6 w-px" />
        <div className="absolute top-0 h-[400px] w-px" />
      </div>
      <header
        className={cn("fixed inset-x-0 top-0 z-50 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]", hidden && "-translate-y-full")}
        onMouseLeave={() => setMega(false)}
      >
        <div className={cn("transition-all duration-500", scrolled || mega ? "glass border-b border-line" : "border-b border-transparent")}>
          <nav aria-label="Main" className="container-x flex h-[72px] items-center justify-between gap-6">
            <Logo logo={logo} logoDark={logoDark} name={name} priority />

            <ul className="hidden items-center gap-1 lg:flex">
              {links.map((l) => (
                <li key={l.href} onMouseEnter={() => setMega("mega" in l)}>
                  <Link
                    href={l.href}
                    aria-current={isActive(l.href) ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-1 rounded-full px-4 py-2 text-sm font-medium transition-colors",
                      isActive(l.href) ? "text-fg" : "text-muted hover:text-fg",
                    )}
                    onFocus={() => setMega("mega" in l)}
                  >
                    {l.label}
                    {"mega" in l && <ChevronDown className={cn("size-3.5 transition-transform", mega && "rotate-180")} aria-hidden />}
                    {isActive(l.href) && (
                      <span className="absolute inset-0 -z-10 rounded-full bg-surface-2" />
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Magnetic className="hidden sm:inline-block">
                <ButtonLink href="/get-a-quote" size="sm">
                  Get a Quote <ArrowRight />
                </ButtonLink>
              </Magnetic>
              <button
                type="button"
                className="grid size-10 place-items-center rounded-full border border-line lg:hidden"
                aria-label={mobile ? "Close menu" : "Open menu"}
                aria-expanded={mobile}
                aria-controls="mobile-menu"
                onClick={() => setMobile((v) => !v)}
              >
                {mobile ? <X className="size-5" /> : <Menu className="size-5" />}
              </button>
            </div>
          </nav>

          {/* Mega menu */}
          {mega && (
              <div className="ui-in hidden border-t border-line [--iy:-8px] lg:block">
                <div className="container-x grid grid-cols-[1fr_300px] gap-8 py-8">
                  <ul className="grid grid-cols-2 gap-2 xl:grid-cols-3">
                    {services.map((s, i) => (
                      <li key={s.slug} className="ui-in [--iy:10px]" style={{ "--d": `${i * 0.03}s` } as React.CSSProperties}>
                        <Link href={`/services/${s.slug}`} className="group flex gap-4 rounded-2xl p-4 transition-colors hover:bg-surface-2">
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-surface text-brand-ink transition-all group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
                            <Icon name={s.icon} className="size-5" />
                          </span>
                          <span>
                            <span className="block font-semibold">{s.name}</span>
                            <span className="mt-1 block text-sm leading-snug text-subtle line-clamp-2">{s.tagline}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="relative overflow-hidden rounded-2xl border border-line bg-surface p-6">
                    <div aria-hidden className="absolute -right-16 -top-16 size-48 rounded-full blob [--blob-a:55%]" />
                    <p className="eyebrow">Free consultation</p>
                    <p className="mt-3 font-display text-xl font-semibold leading-tight">Not sure where to start?</p>
                    <p className="mt-2 text-sm text-muted">Tell us your goals — we&apos;ll recommend the right mix of AI, automation and digital services.</p>
                    <ButtonLink href="/get-a-quote" size="sm" className="mt-5">
                      Book a call <ArrowRight />
                    </ButtonLink>
                    <Link href="/services" className="mt-4 block text-sm font-medium text-brand-ink hover:underline">
                      View all services →
                    </Link>
                  </div>
                </div>
              </div>
          )}
        </div>
      </header>

      {/* Mobile menu */}
      {mobile && (
          <div
            id="mobile-menu"
            className="menu-open fixed inset-0 z-40 overflow-y-auto bg-bg pt-[88px] lg:hidden"
          >
            <nav aria-label="Mobile" className="container-x pb-10">
              <ul className="space-y-1">
                {links.map((l, i) => (
                  <li key={l.href} className="ui-in [--ix:-20px] [--iy:0px]" style={{ "--d": `${0.15 + i * 0.05}s` } as React.CSSProperties}>
                    <Link href={l.href} className="flex items-center justify-between border-b border-line py-4 font-display text-3xl font-semibold">
                      {l.label}
                      <ArrowRight className="size-5 text-brand-ink" aria-hidden />
                    </Link>
                    {"mega" in l && (
                      <ul className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-2">
                        {services.map((s) => (
                          <li key={s.slug}>
                            <Link href={`/services/${s.slug}`} className="flex items-center gap-3 rounded-xl px-2 py-2 text-muted hover:text-fg">
                              <Icon name={s.icon} className="size-4 text-brand-ink" />
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <ButtonLink href="/get-a-quote" size="lg" className="mt-8 w-full">
                Get a Free Consultation <ArrowRight />
              </ButtonLink>
            </nav>
          </div>
      )}
    </>
  );
}
