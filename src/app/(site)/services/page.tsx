import { getFaqs, getServices } from "@/lib/data";
import { absoluteUrl, buildMetadata, faqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/page-hero";
import { ServiceCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { Stagger, StaggerItem, Reveal } from "@/components/motion/reveal";

export const revalidate = 300;

export function generateMetadata() {
  return buildMetadata({
    path: "/services",
    title: "Services — AI Automation, BPO, Web Development & Marketing",
    description:
      "Explore Theta X Tech services: AI automation, AI agents, BPO from Pakistan, web development, UI/UX design, digital marketing and graphic design for SMEs, startups and enterprises.",
  });
}

export default async function ServicesPage() {
  const [services, faqs] = await Promise.all([getServices(), getFaqs("general")]);

  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Theta X Tech services",
    itemListElement: services.map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.name, url: absoluteUrl(`/services/${s.slug}`) })),
  };

  return (
    <>
      <JsonLd data={[itemList, faqSchema(faqs)]} />
      <PageHero
        crumbs={[{ name: "Services", path: "/services" }]}
        eyebrow="Our services"
        title="Technology, automation and talent — under one roof"
        lead="Theta X Tech helps businesses in Karachi, across Pakistan and worldwide grow with AI automation, custom AI agents, BPO teams, high-performance websites, user-centred design and data-driven marketing."
      />

      <section className="pb-24">
        <div className="container-x">
          <Stagger className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <StaggerItem key={s.slug}>
                <ServiceCard service={s} index={i} />
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>

      <section className="section bg-bg-elevated">
        <div className="container-x grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Choosing a partner" title="Which service is right for my business?" />
            <Reveal delay={0.1}>
              <p className="mt-6 text-lg leading-relaxed text-muted">
                If your team loses hours to repetitive tasks, start with <strong className="text-fg">AI automation</strong>. If you need more hands for
                support or back-office work, choose <strong className="text-fg">BPO services</strong>. If customers can&apos;t find or trust you online,
                begin with <strong className="text-fg">web development, UI/UX and digital marketing</strong>. Not sure? Our free consultation maps the fastest
                route to results.
              </p>
            </Reveal>
          </div>
          {faqs.length > 0 && (
            <Reveal>
              <FaqAccordion items={faqs} />
            </Reveal>
          )}
        </div>
      </section>

      <CtaBand />
    </>
  );
}
