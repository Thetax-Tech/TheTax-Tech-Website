import Image from "next/image";
import { Check, Eye, Target } from "lucide-react";
import { getAboutSections, getHomeSections, getTeam } from "@/lib/data";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { SectionHeading } from "@/components/ui/section-heading";
import { Icon } from "@/components/ui/icon";
import { LinkedInIcon } from "@/components/ui/brand-icons";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";
import { LOGO_PATHS } from "@/components/brand/logo-mark";

export const revalidate = 300;

export function generateMetadata() {
  return buildMetadata({
    path: "/about",
    title: "About Us — Technology & Outsourcing Company in Karachi",
    description:
      "Meet Theta X Tech (ThetaX Tech SMC Private Limited), a Karachi-based technology company delivering AI automation, BPO, web development, design and digital marketing worldwide.",
  });
}

export default async function AboutPage() {
  const [about, home, team] = await Promise.all([getAboutSections(), getHomeSections(), getTeam()]);

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "AboutPage", url: absoluteUrl("/about"), name: "About Theta X Tech", about: { "@id": `${absoluteUrl("/")}#organization` } }} />
      <PageHero crumbs={[{ name: "About", path: "/about" }]} eyebrow={about.hero?.eyebrow} title={about.hero?.title ?? "About us"} lead={about.hero?.text} />

      {/* Story + AEO answer */}
      {about.story && (
        <section className="pb-24">
          <div className="container-x grid items-center gap-14 lg:grid-cols-2">
            <div>
              <Reveal>
                <h2 className="text-3xl font-semibold sm:text-4xl">{about.story.question}</h2>
              </Reveal>
              <Reveal delay={0.05}>
                <p className="mt-5 text-lg leading-relaxed text-fg/90">{about.story.answer}</p>
              </Reveal>
              <Reveal delay={0.1}>
                <h3 className="mt-10 text-sm font-semibold uppercase tracking-widest text-brand-ink">{about.story.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{about.story.body}</p>
              </Reveal>
            </div>
            <Reveal y={40}>
              <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-line bg-surface">
                <div aria-hidden className="absolute inset-0 bg-grid opacity-60" />
                <div aria-hidden className="absolute left-1/2 top-1/2 size-80 -translate-x-1/2 -translate-y-1/2 rounded-full blob [--blob-a:55%]" />
                <svg viewBox="0 0 1430 1317" aria-hidden className="absolute left-1/2 top-1/2 w-1/2 -translate-x-1/2 -translate-y-1/2">
                  <path d={LOGO_PATHS.ring} fill="var(--brand)" />
                  <path d={LOGO_PATHS.wingTop} fill="var(--brand)" />
                  <path d={LOGO_PATHS.wingMid} className="fill-fg" />
                </svg>
                {home.stats && (
                  <div className="absolute inset-x-4 bottom-4 grid grid-cols-2 gap-2 sm:inset-x-6 sm:bottom-6 sm:grid-cols-4">
                    {home.stats.items.map((s) => (
                      <div key={s.label} className="rounded-2xl border border-line p-3 text-center glass">
                        <p className="font-display text-xl font-semibold text-brand-ink sm:text-2xl">
                          <Counter value={Number(s.value)} suffix={s.suffix} />
                        </p>
                        <p className="mt-0.5 text-[11px] leading-tight text-subtle">{s.label}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {/* Mission & vision */}
      <section className="section bg-bg-elevated">
        <div className="container-x grid gap-6 md:grid-cols-2">
          {[
            { data: about.mission, icon: <Target className="size-6" /> },
            { data: about.vision, icon: <Eye className="size-6" /> },
          ].map(
            ({ data, icon }, i) =>
              data && (
                <Reveal key={data.title} delay={i * 0.1}>
                  <TiltCard className="card h-full p-10" max={4}>
                    <span className="grid size-14 place-items-center rounded-2xl bg-brand text-on-brand">{icon}</span>
                    <h2 className="mt-8 text-2xl font-semibold sm:text-3xl">{data.title}</h2>
                    <p className="mt-4 text-lg leading-relaxed text-muted">{data.text}</p>
                  </TiltCard>
                </Reveal>
              ),
          )}
        </div>
      </section>

      {/* Values */}
      {about.values && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="What drives us" title={about.values.title} align="center" />
            <Stagger className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {about.values.items.map((v) => (
                <StaggerItem key={v.title} className="group card p-7 text-center">
                  <span className="mx-auto grid size-14 place-items-center rounded-full border border-line-strong text-brand-ink transition-all duration-500 group-hover:scale-110 group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
                    <Icon name={v.icon} className="size-6" />
                  </span>
                  <h3 className="mt-6 text-lg font-semibold">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{v.description}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Why us */}
      {about.whyUs && (
        <section className="section bg-bg-elevated">
          <div className="container-x grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start">
            <SectionHeading eyebrow="Why Theta X Tech" title={about.whyUs.title} className="lg:sticky lg:top-28" />
            <Stagger as="ul" className="grid gap-4 sm:grid-cols-2">
              {about.whyUs.items.map((w) => (
                <StaggerItem as="li" key={w.title} className="card p-6">
                  <span className="grid size-8 place-items-center rounded-full bg-brand/15 text-brand-ink">
                    <Check className="size-4" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-semibold">{w.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{w.description}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      {/* Timeline */}
      {about.timeline && (
        <section className="section">
          <div className="container-x">
            <SectionHeading eyebrow="Milestones" title={about.timeline.title} align="center" />
            <ol className="relative mx-auto mt-16 max-w-3xl">
              <span aria-hidden className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-brand via-line-strong to-transparent sm:left-1/2" />
              {about.timeline.items.map((t, i) => (
                <Reveal as="li" key={t.title} x={i % 2 ? 30 : -30} y={0} className={`relative mb-12 pl-14 sm:w-1/2 sm:pl-0 ${i % 2 ? "sm:ml-auto sm:pl-12" : "sm:pr-12 sm:text-right"}`}>
                  <span aria-hidden className={`absolute top-1 left-[9px] size-3 rounded-full bg-brand shadow-[0_0_0_6px_var(--bg),0_0_20px_var(--brand)] ${i % 2 ? "sm:-left-1.5" : "sm:left-auto sm:-right-1.5"}`} />
                  <p className="font-display text-sm font-semibold uppercase tracking-widest text-brand-ink">{t.year}</p>
                  <h3 className="mt-2 text-xl font-semibold">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t.description}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </section>
      )}

      {/* Team */}
      {team.length > 0 && (
        <section className="section bg-bg-elevated">
          <div className="container-x">
            <SectionHeading eyebrow="Our people" title="Meet the team" align="center" />
            <Stagger className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {team.map((m) => (
                <StaggerItem key={m.id} className="group">
                  <div className="relative aspect-[4/5] overflow-hidden rounded-3xl border border-line bg-surface-2">
                    {m.photo ? (
                      <Image src={m.photo} alt={`${m.name}, ${m.role}`} fill sizes="(min-width: 1024px) 25vw, 50vw" className="object-cover grayscale transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                    ) : (
                      <span className="grid size-full place-items-center font-display text-6xl font-semibold text-brand-ink">{m.name.charAt(0)}</span>
                    )}
                    {m.linkedin && (
                      <a href={m.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${m.name} on LinkedIn`} className="absolute bottom-4 right-4 grid size-10 place-items-center rounded-full bg-brand text-on-brand opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                        <LinkedInIcon className="size-4" />
                      </a>
                    )}
                  </div>
                  <h3 className="mt-5 text-lg font-semibold">{m.name}</h3>
                  <p className="text-sm text-brand-ink">{m.role}</p>
                  {m.bio && <p className="mt-2 text-sm leading-relaxed text-muted">{m.bio}</p>}
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <CtaBand />
    </>
  );
}
