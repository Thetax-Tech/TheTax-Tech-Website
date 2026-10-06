import Link from "next/link";
import { ArrowUpRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { SOCIAL_ICONS } from "@/components/ui/brand-icons";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import type { Settings } from "@/content/site";

export function Footer({ settings, services }: { settings: Settings; services: { slug: string; name: string }[] }) {
  const c = settings.contact;
  const year = new Date().getFullYear();
  // Fixed display order; only networks with a URL in Admin → Settings → Social links are shown
  const SOCIAL_ORDER = ["facebook", "instagram", "linkedin", "x", "youtube", "tiktok"] as const;
  const SOCIAL_NAMES: Record<(typeof SOCIAL_ORDER)[number], string> = { facebook: "Facebook", instagram: "Instagram", linkedin: "LinkedIn", x: "X (Twitter)", youtube: "YouTube", tiktok: "TikTok" };
  const social = settings.social as Partial<Record<(typeof SOCIAL_ORDER)[number], string>>;
  const socials = SOCIAL_ORDER.filter((k) => social[k]).map((k) => [k, social[k]!] as const);

  const company = [
    { href: "/about", label: "About us" },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/blog", label: "Insights & Blog" },
    ...(settings.modules.careers ? [{ href: "/careers", label: "Careers" }] : []),
    { href: "/contact", label: "Contact" },
    { href: "/get-a-quote", label: "Get a quote" },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line bg-bg-elevated">
      <div aria-hidden className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[60rem] -translate-x-1/2 rounded-full blob [--blob-a:22%]" />
      <div className="container-x relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          <Logo logo={settings.site.logo} logoDark={settings.site.logoDark} name={settings.site.name} />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">{settings.site.slogan}</p>
          <p className="mt-4 text-xs text-subtle">{settings.site.legalName}</p>
          {socials.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-3" aria-label="Follow us on social media">
              {socials.map(([key, url]) => {
                const Ico = SOCIAL_ICONS[key];
                return (
                  <li key={key}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`${settings.site.name} on ${SOCIAL_NAMES[key]} (opens in a new tab)`}
                      className="grid size-11 place-items-center rounded-full border border-line-strong text-muted transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-on-brand focus-visible:border-brand focus-visible:text-brand-ink"
                    >
                      {Ico && <Ico className="size-4" />}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-fg">Services</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/services/${s.slug}`} className="text-muted transition-colors hover:text-brand-ink">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-fg">Company</h2>
          <ul className="mt-5 space-y-3 text-sm">
            {company.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-muted transition-colors hover:text-brand-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-fg">Get in touch</h2>
          <address className="mt-5 space-y-4 text-sm not-italic text-muted">
            <p className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
              <span>
                {c.street}, {c.city}, {c.country}
              </span>
            </p>
            <p className="flex gap-3">
              <Phone className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
              <a href={`tel:${c.phone.replace(/\s/g, "")}`} className="hover:text-brand-ink">{c.phone}</a>
            </p>
            <p className="flex gap-3">
              <Mail className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
              <a href={`mailto:${c.email}`} className="hover:text-brand-ink">{c.email}</a>
            </p>
            <p className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-brand-ink" aria-hidden />
              <span>{c.hours}</span>
            </p>
          </address>
          {settings.modules.newsletter && (
            <div className="mt-8">
              <p className="text-sm font-semibold">Get monthly insights on AI & growth</p>
              <NewsletterForm />
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-x flex flex-col items-center justify-between gap-4 pb-32 pt-6 text-xs text-subtle sm:flex-row sm:pr-24 lg:pb-6 xl:pr-8">
          <p>
            © {year} {settings.site.legalName}. All rights reserved.
          </p>
          <ul className="flex gap-6">
            <li><Link href="/privacy-policy" className="hover:text-brand-ink">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-brand-ink">Terms</Link></li>
            <li>
              <a href="/sitemap.xml" className="inline-flex items-center gap-1 hover:text-brand-ink">
                Sitemap <ArrowUpRight className="size-3" aria-hidden />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
