import { notFound } from "next/navigation";
import { getPosts } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { BlogIndex } from "../../blog-index";

export const revalidate = 300;

async function findTag(slug: string) {
  for (const p of await getPosts()) {
    const t = p.tags.find((t) => t.slug === slug);
    if (t) return t;
  }
  return null;
}

export async function generateMetadata({ params }: PageProps<"/blog/tag/[slug]">) {
  const { slug } = await params;
  const tag = await findTag(slug);
  if (!tag) return {};
  return buildMetadata({ path: `/blog/tag/${slug}`, title: `Articles tagged “${tag.name}”`, description: `Theta X Tech articles about ${tag.name}.`, noIndex: true });
}

export default async function TagPage({ params }: PageProps<"/blog/tag/[slug]">) {
  const { slug } = await params;
  const tag = await findTag(slug);
  if (!tag) notFound();
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Blog", path: "/blog" },
          { name: `#${tag.name}`, path: `/blog/tag/${slug}` },
        ]}
        eyebrow="Tag"
        title={tag.name}
      />
      <BlogIndex basePath={`/blog/tag/${slug}`} tag={slug} />
    </>
  );
}
