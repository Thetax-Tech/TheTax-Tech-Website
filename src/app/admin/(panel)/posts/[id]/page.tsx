import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { asArray } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { deletePost, savePost } from "@/app/admin/actions/posts";
import { postLayout } from "../form-layout";

export const metadata = { title: "Edit post" };

export default async function EditPostPage({ params }: PageProps<"/admin/posts/[id]">) {
  await requireUser("posts");
  const { id } = await params;
  const [post, categories, tags] = await Promise.all([
    db.post.findUnique({ where: { id }, include: { tags: true } }),
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();
  const live = post.status === "PUBLISHED" || (post.status === "SCHEDULED" && post.publishedAt && post.publishedAt <= new Date());

  return (
    <>
      <PageHeader title="Edit post" description={post.title} back={{ href: "/admin/posts", label: "All posts" }} />
      <EntityForm
        key={post.updatedAt.toISOString()}
        layout={postLayout(categories, tags.map((t) => t.name))}
        initial={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          status: post.status,
          publishedAt: post.publishedAt?.toISOString() ?? "",
          isFeatured: post.isFeatured,
          categoryId: post.categoryId ?? "",
          tags: post.tags.map((t) => t.name),
          faqs: asArray(post.faqs),
          seoTitle: post.seoTitle ?? "",
          seoDescription: post.seoDescription ?? "",
          ogImage: post.ogImage ?? "",
          coverImage: post.coverImage ?? "",
          coverAlt: post.coverAlt ?? "",
        }}
        action={savePost}
        deleteAction={deletePost.bind(null, post.id)}
        previewHref={`/admin/posts/${post.id}/preview`}
        viewHref={live ? `/blog/${post.slug}` : undefined}
        submitVariants={post.status !== "PUBLISHED" ? [{ label: "Publish now", set: { status: "PUBLISHED" }, primary: true }] : undefined}
      />
    </>
  );
}
