import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getClientLogos, getFaqs, getHomeSections, getPosts, getProjects, getServices, getSettings, getTestimonials } from "@/lib/data";
import { buildMetadata, faqSchema, reviewsSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Hero } from "@/components/home/hero";
import { SceneLoader } from "@/components/three/scene-loader";
import { Spotlight } from "@/components/home/spotlight";
import { ProcessTimeline } from "@/components/home/process-timeline";
import { TestimonialsSlider } from "@/components/home/testimonials-slider";
import { PortfolioCarousel } from "@/components/home/portfolio-carousel";
import { ServiceCard, ProjectCard, PostCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { SectionHeading } from "@/components/ui/section-heading";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Counter } from "@/components/motion/counter";
import { Marquee } from "@/components/motion/marquee";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import Image from "next/image";

export const revalidate = 300;

export async function generateMetadata() {
  const s = await getSettings();
  return buildMetadata({ path: "/", title: s.seo.defaultTitle, description: s.seo.defaultDescription, keywords: s.seo.keywords });
}

export default async function HomePage() {
  const [home, services, projects, posts, testimonials, faqs, logos, settings] = await Promise.all([
    getHomeSections(),
    getServices(),
    getProjects(),
    getPosts(),
    getTestimonials(),
    getFaqs("home"),
    getClientLogos(),
    getSettings(),
  ]);
  const featuredProjects = projects.filter((p) => p.isFeatured).concat(projects.filter((p) => !p.isFeatured)).slice(0, 6);
  const latestPosts = posts.slice(0, 3);

  return (
    <>
      <JsonLd data={[faqSchema(faqs), reviewsSchema(settings, testimonials)]} />

      {/* 3D AI-core scene (client-only, lazy) + marker so the intro loader waits for it */}
      <div data-scene hidden />
      <SceneLoader />
      {home.hero && <Hero data={home.hero} />}

      {/* Who we are (AEO direct answer) + stats */}
      <section className="section pt-8" aria-labelledby="intro-heading">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-end">
          <div>
            <Reveal>
              <p className="eyebrow">Who we are</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 id="intro-heading" className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
                {home.intro?.question}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-5 text-lg leading-relaxed text-muted">{home.intro?.answer}</p>
            </Reveal>
          </div>
          {home.stats && (
            <Stagger className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line">
              {home.stats.items.map((s) => (
                <StaggerItem key={s.label} className="bg-bg p-6 sm:p-8">
                  <p className="font-display text-4xl font-semibold text-brand-ink sm:text-5xl">
                    <Counter value={Number(s.value)} suffix={s.suffix} />
                  </p>
                  <p className="mt-2 text-sm text-muted">{s.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          )}
        </div>
      </section>

      {/* Services */}
      <section data-stage="services" className="section relative" aria-labelledby="services-heading">
        <div className="container-x">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <SectionHeading
              eyebrow="What we do"
              title={<span id="services-heading">Services built for growth</span>}
              lead="From intelligent automation to world-class design — one partner for strategy, technology and operations."
            />
            <Reveal>
              <ButtonLink href="/services" variant="secondary">
                All services <ArrowRight />
              </ButtonLink>
            </Reveal>
          </div>
          <Stagger className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {services.map((s, i) => (
              <StaggerItem key={s.slug} className={i === 0 ? "lg:col-span-2" : undefined}>
                <ServiceCard service={s} index={i} large={i === 0} />
              </StaggerItem>
            ))}
            {(services.length + 1) % 3 !== 0 && (
              <StaggerItem className={(services.length + 1) % 3 === 1 ? "md:col-span-2" : undefined}>
                <Link href="/get-a-quote" className="group relative flex h-full min-h-[280px] flex-col justify-between overflow-hidden rounded-[1.25rem] bg-brand p-8 text-on-brand">
                  <span aria-hidden className="absolute -right-10 -top-10 size-48 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.35),transparent)] transition-transform duration-700 group-hover:scale-150" />
                  <span className="relative font-display text-sm font-semibold uppercase tracking-widest">Custom project?</span>
                  <span className="relative">
                    <span className="block font-display text-3xl font-semibold leading-tight">Let&apos;s design a solution around your goals.</span>
                    <span className="mt-6 inline-flex items-center gap-2 font-semibold">
                      Get a free consultation <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </span>
                </Link>
              </StaggerItem>
            )}
          </Stagger>
        </div>
      </section>

      {/* Spotlights */}
      {home.spotlightAi && (
        <section data-stage="ai" className="section overflow-hidden" aria-label="AI automation spotlight">
          <div className="container-x">
            <Spotlight data={home.spotlightAi} visual="ai" />
          </div>
        </section>
      )}
      {home.spotlightBpo && (
        <section data-stage="bpo" className="section overflow-hidden bg-bg-elevated/60" aria-label="BPO services spotlight">
          <div className="container-x">
            <Spotlight data={home.spotlightBpo} visual="bpo" reverse />
          </div>
        </section>
      )}

      {/* Process */}
      {home.process && (
        <section className="section" aria-labelledby="process-heading">
          <div className="container-x">
            <SectionHeading eyebrow="How we work" title={<span id="process-heading">{home.process.title}</span>} align="center" />
            <ProcessTimeline steps={home.process.steps} />
          </div>
        </section>
      )}

      {/* Industries */}
      {home.industries && (
        <section className="section pt-0" aria-labelledby="industries-heading">
          <div className="container-x">
            <SectionHeading eyebrow="Industries" title={<span id="industries-heading">{home.industries.title}</span>} />
            <Stagger as="ul" className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
              {home.industries.items.map((ind) => (
                <StaggerItem as="li" key={ind.name} className="group card flex items-center gap-4 p-5 transition-colors hover:border-brand/50">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-surface-2 text-brand-ink transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110">
                    <Icon name={ind.icon} className="size-5" />
                  </span>
                  <span className="text-sm font-medium sm:text-base">{ind.name}</span>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Tech stack marquee */}
      {home.techStack && (
        <section className="border-y border-line py-14" aria-labelledby="tech-heading">
          <h2 id="tech-heading" className="container-x mb-8 text-center text-sm font-semibold uppercase tracking-[0.25em] text-subtle">
            {home.techStack.title}
          </h2>
          <Marquee duration={45}>
            {home.techStack.items.map((t) => (
              <span key={t} className="mx-3 inline-flex items-center gap-3 rounded-full border border-line px-6 py-3 font-display text-lg font-medium text-muted transition-colors hover:border-brand hover:text-fg">
                <span className="size-1.5 rounded-full bg-brand" />
                {t}
              </span>
            ))}
          </Marquee>
          <Marquee duration={55} reverse className="mt-4">
            {[...home.techStack.items].reverse().map((t) => (
              <span key={t} className="mx-3 font-display text-4xl font-semibold text-transparent [-webkit-text-stroke:1px_var(--border-strong)] sm:text-6xl">
                {t}
              </span>
            ))}
          </Marquee>
        </section>
      )}

      {/* Featured work */}
      {featuredProjects.length > 0 && (
        <section data-stage="portfolio" className="section overflow-hidden" aria-labelledby="work-heading">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Featured work" title={<span id="work-heading">Results we&apos;re proud of</span>} lead="A selection of AI, automation, BPO and digital projects for clients in Pakistan and abroad." />
              <Reveal>
                <Link href="/portfolio" className="inline-flex items-center gap-2 font-semibold text-brand-ink hover:underline">
                  View all work <ArrowRight className="size-4" />
                </Link>
              </Reveal>
            </div>
            <div className="mt-6">
              <PortfolioCarousel label="Featured projects">
                {featuredProjects.map((p, i) => (
                  <div key={p.slug} data-slide className="w-[85%] shrink-0 snap-start sm:w-[60%] lg:w-[42%]">
                    <ProjectCard project={p} priority={i === 0} sampleBadge={settings.modules.sampleBadge} />
                  </div>
                ))}
              </PortfolioCarousel>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="section pt-0" aria-labelledby="testimonials-heading">
          <div className="container-x">
            <SectionHeading eyebrow="Testimonials" title={<span id="testimonials-heading">What our clients say</span>} className="mb-12" />
            <Reveal>
              <TestimonialsSlider items={testimonials} />
            </Reveal>
          </div>
        </section>
      )}

      {/* Client logos */}
      {logos.length > 0 && (
        <section className="pb-16" aria-label="Clients and partners">
          <p className="container-x mb-8 text-center text-sm text-subtle">Trusted by forward-thinking companies</p>
          <Marquee duration={35}>
            {logos.map((l) => (
              <span key={l.id} className="mx-8 flex h-12 items-center opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                {l.logo ? <Image src={l.logo} alt={l.name} width={140} height={48} className="h-10 w-auto object-contain" /> : <span className="font-display text-xl font-semibold">{l.name}</span>}
              </span>
            ))}
          </Marquee>
        </section>
      )}

      {/* Latest posts */}
      {latestPosts.length > 0 && (
        <section className="section bg-bg-elevated" aria-labelledby="blog-heading">
          <div className="container-x">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <SectionHeading eyebrow="Insights" title={<span id="blog-heading">Latest from our blog</span>} />
              <Reveal>
                <Link href="/blog" className="inline-flex items-center gap-2 font-semibold text-brand-ink hover:underline">
                  All articles <ArrowRight className="size-4" />
                </Link>
              </Reveal>
            </div>
            <Stagger className="mt-12 grid gap-6 md:grid-cols-3">
              {latestPosts.map((p) => (
                <StaggerItem key={p.slug}>
                  <PostCard post={p} />
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="section" aria-labelledby="faq-heading">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.6fr]">
            <SectionHeading
              eyebrow="FAQ"
              title={<span id="faq-heading">Frequently asked questions</span>}
              lead={
                <>
                  Can&apos;t find what you&apos;re looking for?{" "}
                  <Link href="/contact" className="text-brand-ink underline underline-offset-4">
                    Talk to our team
                  </Link>
                  .
                </>
              }
            />
            <Reveal>
              <FaqAccordion items={faqs} />
            </Reveal>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
