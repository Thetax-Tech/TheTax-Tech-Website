import { getProjects, getSettings } from "@/lib/data";
import { PORTFOLIO_CATEGORIES } from "@/content/projects";
import { absoluteUrl, buildMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { PortfolioGrid } from "./portfolio-grid";

export const revalidate = 300;

export function generateMetadata() {
  return buildMetadata({
    path: "/portfolio",
    title: "Portfolio & Case Studies",
    description:
      "Case studies from Theta X Tech: AI agents, automation, BPO teams, websites, branding and digital marketing campaigns delivered for clients in Pakistan and worldwide.",
  });
}

export default async function PortfolioPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  const items = projects.map(({ slug, title, category, industry, year, summary, coverImage, gallery, isSample, results }) => ({
    slug, title, category, industry, year, summary, coverImage, gallery, isSample, headline: results[0] ?? null,
  }));
  const categories = [...PORTFOLIO_CATEGORIES, ...new Set(projects.map((p) => p.category))].filter((c, i, a) => a.indexOf(c) === i);

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: "Theta X Tech portfolio",
          url: absoluteUrl("/portfolio"),
          hasPart: projects.map((p) => ({ "@type": "CreativeWork", name: p.title, url: absoluteUrl(`/portfolio/${p.slug}`) })),
        }}
      />
      <PageHero
        crumbs={[{ name: "Portfolio", path: "/portfolio" }]}
        eyebrow="Our work"
        title="Selected work and case studies"
        lead="How we approach AI automation, digital marketing, UI/UX, web development, branding and BPO — explore projects by category."
      />
      <section className="pb-32">
        <div className="container-x">
          <PortfolioGrid items={items} categories={categories} sampleBadge={settings.modules.sampleBadge} />
        </div>
      </section>
      <CtaBand title="Want results like these?" />
    </>
  );
}
