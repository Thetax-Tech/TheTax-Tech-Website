import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getPostForPreview } from "@/lib/data";
import { Article } from "@/components/blog/article";

export const metadata = { title: "Preview", robots: { index: false } };

/** Renders a draft exactly as it will appear on the site (admin-only). */
export default async function PreviewPage({ params }: PageProps<"/admin/posts/[id]/preview">) {
  await requireUser("posts");
  const { id } = await params;
  const post = await getPostForPreview(id);
  if (!post) notFound();
  return (
    <div className="-mx-4 -my-8 sm:-mx-6">
      <Article post={post} preview />
    </div>
  );
}
