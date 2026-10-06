import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/page-hero";
import { LeadForm } from "@/components/forms/lead-form";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { ButtonLink } from "@/components/ui/button";
import { Reveal } from "@/components/motion/reveal";

export const revalidate = 300;

export function generateMetadata() {
  return buildMetadata({
    path: "/contact",
    title: "Contact Us — Karachi Office, Phone & WhatsApp",
    description:
      "Contact Theta X Tech in Karachi: R-402, 2nd Floor, Inchauli Cooperative Housing Society. Call or WhatsApp +92 312 2535770 or email info@thetaxtech.com.pk. Mon–Fri 09:00–18:00.",
  });
}

export default async function ContactPage() {
  const s = await getSettings();
  const c = s.contact;
  const address = `${c.street}, ${c.city}, ${c.country}`;
  const wa = `https://wa.me/${c.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(c.whatsappMessage)}`;

  const items = [
    { icon: MapPin, label: "Visit us", value: address, href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(c.mapQuery || address)}` },
    { icon: Phone, label: "Call us", value: c.phone, href: `tel:${c.phone.replace(/\s/g, "")}` },
    { icon: Mail, label: "Email us", value: c.email, href: `mailto:${c.email}` },
    { icon: Clock, label: "Office hours", value: c.hours },
  ];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "ContactPage", url: absoluteUrl("/contact"), name: "Contact Theta X Tech", about: { "@id": `${absoluteUrl("/")}#organization` } }} />
      <PageHero
        crumbs={[{ name: "Contact", path: "/contact" }]}
        eyebrow="Contact"
        title="Let's talk about your next move"
        lead={
          <p>
            <strong className="text-fg">How do I contact Theta X Tech?</strong> Call or WhatsApp {c.phone}, email {c.email}, or visit our office at {address}. We&apos;re
            open {c.hours} and reply to every enquiry within one business day.
          </p>
        }
      />

      <section className="pb-24">
        <div className="container-x grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="space-y-4">
            {items.map(({ icon: Ico, label, value, href }, i) => (
              <Reveal key={label} delay={i * 0.06}>
                <div className="group card flex items-start gap-5 p-6">
                  <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand/15 text-brand-ink transition-all group-hover:bg-brand group-hover:text-on-brand">
                    <Ico className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-sm text-subtle">{label}</p>
                    {href ? (
                      <a href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer" className="mt-1 block font-medium hover:text-brand-ink">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-1 font-medium">{value}</p>
                    )}
                  </div>
                </div>
              </Reveal>
            ))}
            <Reveal delay={0.3}>
              <ButtonLink href={wa} size="lg" className="w-full bg-[#25D366] text-white before:bg-[#1ebe5b]">
                <WhatsAppIcon /> Chat on WhatsApp
              </ButtonLink>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="card p-6 sm:p-10">
            <h2 className="text-2xl font-semibold">Send us a message</h2>
            <p className="mt-2 text-sm text-muted">Fields marked * are required.</p>
            <div className="mt-8">
              <LeadForm mode="CONTACT" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="pb-24" aria-label="Map">
        <div className="container-x">
          <div className="overflow-hidden rounded-[2rem] border border-line">
            <iframe
              title={`Map showing ${s.site.name} office in ${c.city}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(c.mapQuery || address)}&output=embed`}
              className="h-[420px] w-full dark:[filter:invert(90%)_hue-rotate(180deg)_grayscale(40%)]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>
    </>
  );
}
