import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Check, X as XIcon } from "lucide-react";
import { getProjectsForService, getService, getServices, getSettings } from "@/lib/data";
import { buildMetadata, faqSchema, serviceSchema } from "@/lib/seo";
import { prepareHtml } from "@/lib/html";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/page-hero";
import { ProjectCard, ServiceCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Magnetic } from "@/components/motion/magnetic";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  return (await getServices()).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return {};
  return buildMetadata({
    path: `/services/${s.slug}`,
    title: s.seoTitle || s.name,
    description: s.seoDescription || s.shortDescription,
    image: s.ogImage || s.image,
    keywords: s.seoKeywords,
  });
}

export default async function ServicePage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, settings, all] = await Promise.all([getService(slug), getSettings(), getServices()]);
  if (!service) notFound();
  const projects = (await getProjectsForService(service.slug)).slice(0, 3);
  const others = all.filter((s) => s.slug !== service.slug).slice(0, 3);
  const { html } = prepareHtml(service.longDescription);

  return (
    <>
      <JsonLd data={[serviceSchema(service, settings), faqSchema(service.faqs)]} />

      <PageHero
        crumbs={[
          { name: "Services", path: "/services" },
          { name: service.name, path: `/services/${service.slug}` },
        ]}
        eyebrow={service.tagline ?? "Service"}
        title={service.name}
        lead={service.shortDescription}
        aside={
          <div className="anim-fade-up hidden justify-end lg:flex" style={{ "--d": "0.3s" } as React.CSSProperties}>
            <div className="relative grid size-56 place-items-center">
              <span className="absolute inset-0 animate-spin-slow rounded-full border border-dashed border-line-strong" />
              <span className="absolute inset-6 rounded-full blob [--blob-a:44%]" />
              <span className="relative grid size-28 place-items-center rounded-[2rem] bg-brand text-on-brand shadow-[0_0_80px_-10px_var(--glow)]">
                <Icon name={service.icon} className="size-12" />
              </span>
            </div>
          </div>
        }
      >
        <div className="anim-fade-up mt-8 flex flex-wrap gap-3" style={{ "--d": "0.45s" } as React.CSSProperties}>
          <Magnetic>
            <ButtonLink href={`/get-a-quote?service=${service.slug}`} size="lg">
              Get a free quote <ArrowRight />
            </ButtonLink>
          </Magnetic>
          <ButtonLink href="#how-it-works" size="lg" variant="secondary">
            How it works
          </ButtonLink>
        </div>
      </PageHero>

      {/* AEO: direct answer */}
      {service.answer && (
        <section className="pb-20" aria-labelledby="answer-heading">
          <div className="container-x">
            <Reveal className="card relative overflow-hidden p-8 sm:p-12">
              <div aria-hidden className="absolute -right-20 -top-20 size-64 rounded-full blob [--blob-a:22%]" />
              <h2 id="answer-heading" className="relative text-2xl font-semibold sm:text-3xl">
                {service.answerQuestion}
              </h2>
              <p className="relative mt-5 max-w-4xl text-lg leading-relaxed text-muted">{service.answer}</p>
            </Reveal>
          </div>
        </section>
      )}

      {/* Problem / solution */}
      {(service.problem || service.solution) && (
        <section className="section pt-0">
          <div className="container-x grid gap-6 lg:grid-cols-2">
            {service.problem && (
              <Reveal className="card h-full p-8 sm:p-10">
                <span className="grid size-12 place-items-center rounded-2xl bg-red-500/10 text-red-400">
                  <XIcon className="size-5" aria-hidden />
                </span>
                <h2 className="mt-6 text-2xl font-semibold">The challenge</h2>
                <p className="mt-4 leading-relaxed text-muted">{service.problem}</p>
              </Reveal>
            )}
            {service.solution && (
              <Reveal delay={0.1} className="relative h-full overflow-hidden rounded-[1.25rem] border border-brand/40 bg-gradient-to-br from-brand/15 to-transparent p-8 sm:p-10">
                <span className="grid size-12 place-items-center rounded-2xl bg-brand text-on-brand">
                  <Check className="size-5" aria-hidden />
                </span>
                <h2 className="mt-6 text-2xl font-semibold">Our solution</h2>
                <p className="mt-4 leading-relaxed text-muted">{service.solution}</p>
              </Reveal>
            )}
          </div>
        </section>
      )}

      {/* What's included */}
      {service.features.length > 0 && (
        <section className="section bg-bg-elevated">
          <div className="container-x">
            <SectionHeading eyebrow="What's included" title={`${service.name} services we offer`} />
            <Stagger className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {service.features.map((f, i) => (
                <StaggerItem key={f.title}>
                  <TiltCard className="card h-full p-7" max={4}>
                    <span className="font-display text-sm text-brand-ink">{String(i + 1).padStart(2, "0")}</span>
                    <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{f.description}</p>
                  </TiltCard>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Process */}
      {service.process.length > 0 && (
        <section id="how-it-works" className="section scroll-mt-24">
          <div className="container-x">
            <SectionHeading eyebrow="Process" title={`How our ${service.name} process works`} align="center" />
            <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {service.process.map((p, i) => (
                <Reveal as="li" key={p.title} delay={i * 0.08} className="relative">
                  <div className="card h-full p-7">
                    <span className="grid size-12 place-items-center rounded-full border border-brand font-display font-semibold text-brand-ink">{i + 1}</span>
                    <h3 className="mt-6 text-lg font-semibold">{p.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{p.description}</p>
                  </div>
                  {i < service.process.length - 1 && (
                    <ArrowRight aria-hidden className="absolute -right-4 top-1/2 z-10 hidden size-5 -translate-y-1/2 text-brand lg:block" />
                  )}
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Benefits */}
      {service.benefits.length > 0 && (
        <section className="section pt-0">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.4fr] lg:items-start">
            <SectionHeading eyebrow="Benefits" title={`Why choose Theta X Tech for ${service.name}?`} className="lg:sticky lg:top-28" />
            <Stagger className="grid gap-4 sm:grid-cols-2">
              {service.benefits.map((b) => (
                <StaggerItem key={b.title} className="card p-6">
                  <Check className="size-5 text-brand-ink" aria-hidden />
                  <h3 className="mt-4 font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{b.description}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Long description (rich text) */}
      {html && (
        <section className="section pt-0">
          <div className="container-x">
            <Reveal className="prose-x mx-auto max-w-3xl" >
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Related case studies */}
      {projects.length > 0 && (
        <section className="section bg-bg-elevated">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Case studies" title={`${service.name} projects`} />
              <Link href="/portfolio" className="inline-flex items-center gap-2 font-semibold text-brand-ink hover:underline">
                View all work <ArrowRight className="size-4" />
              </Link>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <Reveal key={p.slug}>
                  <ProjectCard project={p} sampleBadge={settings.modules.sampleBadge} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      {service.faqs.length > 0 && (
        <section className="section" aria-labelledby="service-faq">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeading eyebrow="FAQ" title={<span id="service-faq">{service.name} — frequently asked questions</span>} />
            <Reveal>
              <FaqAccordion items={service.faqs} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Other services (internal linking) */}
      <section className="section pt-0">
        <div className="container-x">
          <SectionHeading eyebrow="Explore more" title="Related services" />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {others.map((s) => (
              <ServiceCard key={s.slug} service={s} />
            ))}
          </div>
        </div>
      </section>

      <CtaBand title={`Ready to start with ${service.name}?`} />
    </>
  );
}
