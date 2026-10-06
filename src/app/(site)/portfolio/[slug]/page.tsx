import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { getProject, getProjects, getSettings } from "@/lib/data";
import { buildMetadata, projectSchema } from "@/lib/seo";
import { prepareHtml } from "@/lib/html";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/page-hero";
import { CoverArt, isSvg } from "@/components/ui/cover-art";
import { ProjectCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { ButtonLink } from "@/components/ui/button";
import { Counter } from "@/components/motion/counter";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getProjects()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const p = await getProject(slug);
  if (!p) return {};
  return buildMetadata({
    path: `/portfolio/${p.slug}`,
    title: p.seoTitle || `${p.title} — Case Study`,
    description: p.seoDescription || p.summary,
    image: p.ogImage || p.coverImage,
  });
}

/** Animate a result like "72%" or "3.4×" when it starts with a plain integer. */
function ResultValue({ value }: { value: string }) {
  const m = value.match(/^([+−-]?)(\d{1,6})(\D.*)?$/);
  if (!m) return <>{value}</>;
  return <Counter value={Number(m[2])} prefix={m[1]} suffix={m[3] ?? ""} />;
}

export default async function ProjectPage({ params }: PageProps<"/portfolio/[slug]">) {
  const { slug } = await params;
  const [project, settings, all] = await Promise.all([getProject(slug), getSettings(), getProjects()]);
  if (!project) notFound();
  const { html } = prepareHtml(project.description);
  const idx = all.findIndex((p) => p.slug === project.slug);
  const next = all[(idx + 1) % all.length];
  const related = all.filter((p) => p.slug !== project.slug && p.category === project.category).slice(0, 2);

  const facts = [
    ["Client", project.client],
    ["Industry", project.industry],
    ["Category", project.category],
    ["Year", project.year ? String(project.year) : null],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <>
      <JsonLd data={projectSchema(project, settings)} />
      <PageHero
        crumbs={[
          { name: "Portfolio", path: "/portfolio" },
          { name: project.title, path: `/portfolio/${project.slug}` },
        ]}
        eyebrow={project.category}
        title={project.title}
        lead={project.summary}
      />

      <section className="pb-16">
        <div className="container-x">
          {project.isSample && (
            <p className="mb-6 flex items-start gap-3 rounded-2xl border border-brand/40 bg-brand/10 px-5 py-4 text-sm leading-relaxed">
              <span className="mt-0.5 shrink-0 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-on-brand">Sample</span>
              <span>
                This is a <strong>concept case study</strong> that shows how Theta X Tech approaches this kind of project. Client details are generic and the figures below are
                illustrative targets, not reported client results.
              </span>
            </p>
          )}
          <Reveal y={40}>
            <CoverArt src={project.coverImage} alt={`${project.title} — ${project.category} project cover`} seed={project.slug} className="mx-auto aspect-[4/3] max-w-5xl rounded-[2rem] border border-line" priority sizes="(min-width: 1280px) 1216px, 100vw" />
          </Reveal>

          <dl className="mt-10 grid grid-cols-2 gap-6 border-b border-line pb-10 md:grid-cols-4">
            {facts.map(([k, v]) => (
              <div key={k}>
                <dt className="text-xs uppercase tracking-widest text-subtle">{k}</dt>
                <dd className="mt-2 font-medium">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {project.results.length > 0 && (
        <section className="pb-20" aria-labelledby="results-heading">
          <div className="container-x">
            <h2 id="results-heading" className="mb-5 text-sm font-semibold uppercase tracking-widest text-subtle">{project.isSample ? "Illustrative targets" : "Results"}</h2>
            <Stagger className="grid gap-px overflow-hidden rounded-3xl border border-line bg-line sm:grid-cols-3">
              {project.results.map((r) => (
                <StaggerItem key={r.label} className="bg-bg p-8">
                  <p className="font-display text-4xl font-semibold text-brand-ink sm:text-5xl">
                    <ResultValue value={r.value} />
                  </p>
                  <p className="mt-2 text-sm text-muted">{r.label}</p>
                </StaggerItem>
              ))}
            </Stagger>
          </div>
        </section>
      )}

      <section className="pb-24">
        <div className="container-x grid gap-16 lg:grid-cols-[1fr_320px]">
          <div className="space-y-14">
            {project.problem && (
              <Reveal>
                <p className="eyebrow">The problem</p>
                <h2 className="mt-3 text-3xl font-semibold">What the client was facing</h2>
                <p className="mt-5 text-lg leading-relaxed text-muted">{project.problem}</p>
              </Reveal>
            )}
            {project.solution && (
              <Reveal>
                <p className="eyebrow">The solution</p>
                <h2 className="mt-3 text-3xl font-semibold">How we solved it</h2>
                <p className="mt-5 text-lg leading-relaxed text-muted">{project.solution}</p>
              </Reveal>
            )}
            {html && (
              <Reveal>
                <div className="prose-x" dangerouslySetInnerHTML={{ __html: html }} />
              </Reveal>
            )}
          </div>
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            {project.techStack.length > 0 && (
              <div className="card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-subtle">Technology</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {project.techStack.map((t) => (
                    <li key={t} className="rounded-full border border-line-strong px-3 py-1 text-sm">{t}</li>
                  ))}
                </ul>
              </div>
            )}
            {project.services.length > 0 && (
              <div className="card p-6">
                <h2 className="text-sm font-semibold uppercase tracking-widest text-subtle">Services</h2>
                <ul className="mt-4 space-y-2">
                  {project.services.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/services/${s.slug}`} className="inline-flex items-center gap-2 text-brand-ink hover:underline">
                        {s.name} <ArrowRight className="size-3.5" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {project.liveUrl && (
              <ButtonLink href={project.liveUrl} variant="secondary" className="w-full">
                Visit live project <ExternalLink />
              </ButtonLink>
            )}
          </aside>
        </div>
      </section>

      {project.gallery.length > 0 && (
        <section className="pb-24" aria-label="Project gallery">
          <div className="container-x grid gap-6 sm:grid-cols-2">
            {project.gallery.map((src, i) => (
              <Reveal key={src} delay={(i % 2) * 0.1} className={i % 3 === 0 ? "sm:col-span-2" : undefined}>
                <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-line">
                  <Image src={src} alt={`${project.title} — screen ${i + 1}`} fill sizes="(min-width: 640px) 50vw, 100vw" unoptimized={isSvg(src)} className="object-cover" />
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section bg-bg-elevated">
          <div className="container-x">
            <h2 className="text-3xl font-semibold">Related projects</h2>
            <div className="mt-10 grid gap-8 md:grid-cols-2">
              {related.map((p) => (
                <ProjectCard key={p.slug} project={p} sampleBadge={settings.modules.sampleBadge} />
              ))}
            </div>
          </div>
        </section>
      )}

      {next && next.slug !== project.slug && (
        <section className="border-y border-line">
          <Link href={`/portfolio/${next.slug}`} className="group container-x flex items-center justify-between gap-6 py-14">
            <span className="grid size-14 shrink-0 place-items-center rounded-full border border-line-strong transition-all group-hover:border-brand group-hover:bg-brand group-hover:text-on-brand">
              <ArrowRight className="size-5" aria-hidden />
            </span>
            <span className="text-right">
              <span className="block text-xs uppercase tracking-widest text-subtle">Next project</span>
              <span className="mt-2 block font-display text-2xl font-semibold transition-colors group-hover:text-brand-ink sm:text-4xl">{next.title}</span>
            </span>
          </Link>
        </section>
      )}

      <CtaBand />
    </>
  );
}
