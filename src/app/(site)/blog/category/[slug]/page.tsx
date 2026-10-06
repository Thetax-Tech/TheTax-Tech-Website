import { notFound } from "next/navigation";
import { getBlogCategories } from "@/lib/data";
import { buildMetadata } from "@/lib/seo";
import { PageHero } from "@/components/page-hero";
import { BlogIndex } from "../../blog-index";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getBlogCategories()).map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/category/[slug]">) {
  const { slug } = await params;
  const cat = (await getBlogCategories()).find((c) => c.slug === slug);
  if (!cat) return {};
  return buildMetadata({
    path: `/blog/category/${slug}`,
    title: `${cat.name} Articles`,
    description: cat.description || `Articles about ${cat.name} from the Theta X Tech blog.`,
  });
}

export default async function CategoryPage({ params }: PageProps<"/blog/category/[slug]">) {
  const { slug } = await params;
  const cat = (await getBlogCategories()).find((c) => c.slug === slug);
  if (!cat) notFound();
  return (
    <>
      <PageHero
        crumbs={[
          { name: "Blog", path: "/blog" },
          { name: cat.name, path: `/blog/category/${slug}` },
        ]}
        eyebrow="Category"
        title={cat.name}
        lead={cat.description}
      />
      <BlogIndex basePath={`/blog/category/${slug}`} category={slug} />
    </>
  );
}
