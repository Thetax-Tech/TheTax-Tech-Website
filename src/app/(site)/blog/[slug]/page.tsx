import { notFound } from "next/navigation";
import { getPost, getPosts, getRelatedPosts, getSettings } from "@/lib/data";
import { blogPostingSchema, buildMetadata, faqSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Article } from "@/components/blog/article";
import { PostCard } from "@/components/cards";
import { CtaBand } from "@/components/cta-band";
import { Stagger, StaggerItem } from "@/components/motion/reveal";

export const revalidate = 300;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    path: `/blog/${post.slug}`,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    image: post.ogImage || post.coverImage || `/og/blog/${post.slug}`,
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post.updatedAt,
    keywords: post.tags.map((t) => t.name).join(", "),
  });
}

export default async function PostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getPost(slug), getSettings()]);
  if (!post) notFound();
  const related = await getRelatedPosts(post);

  return (
    <>
      <JsonLd data={[blogPostingSchema(post, settings), faqSchema(post.faqs)]} />
      <Article post={post} />
      {related.length > 0 && (
        <section className="section bg-bg-elevated" aria-labelledby="related-heading">
          <div className="container-x">
            <h2 id="related-heading" className="text-3xl font-semibold sm:text-4xl">
              Related articles
            </h2>
            <Stagger className="mt-10 grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <StaggerItem key={p.slug}>
                  <PostCard post={p} />
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
