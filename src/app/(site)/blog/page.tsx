import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { CtaBand } from "@/components/cta-band";
import { BlogIndex } from "./blog-index";

export async function generateMetadata({ searchParams }: PageProps<"/blog">) {
  const { q, page } = await searchParams;
  return buildMetadata({
    path: "/blog",
    title: "Insights & Blog — AI, Automation, BPO and Digital Growth",
    description:
      "Practical articles from Theta X Tech on AI agents, business automation, outsourcing to Pakistan, web development, SEO and digital marketing.",
    noIndex: Boolean(q) || (page !== undefined && page !== "1"),
  });
}

export default async function BlogPage({ searchParams }: PageProps<"/blog">) {
  const { q, page } = await searchParams;
  return (
    <>
      <PageHero
        crumbs={[{ name: "Blog", path: "/blog" }]}
        eyebrow="Insights"
        title="Ideas on AI, automation and growth"
        lead="Practical guides and perspectives from our engineers, designers and operations team."
      />
      <BlogIndex basePath="/blog" q={typeof q === "string" ? q : undefined} page={Number(page) || 1} />
      <CtaBand />
    </>
  );
}
