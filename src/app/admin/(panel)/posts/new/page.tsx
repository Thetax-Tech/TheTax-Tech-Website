import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { savePost } from "@/app/admin/actions/posts";
import { postLayout } from "../form-layout";

export const metadata = { title: "New post" };

export default async function NewPostPage() {
  await requireUser("posts");
  const [categories, tags] = await Promise.all([db.category.findMany({ orderBy: { name: "asc" } }), db.tag.findMany({ orderBy: { name: "asc" } })]);
  return (
    <>
      <PageHeader title="New post" back={{ href: "/admin/posts", label: "All posts" }} />
      <EntityForm
        layout={postLayout(categories, tags.map((t) => t.name))}
        initial={{ title: "", slug: "", excerpt: "", content: "", status: "DRAFT", publishedAt: "", isFeatured: false, categoryId: categories[0]?.id ?? "", tags: [], faqs: [], seoTitle: "", seoDescription: "", ogImage: "", coverImage: "", coverAlt: "" }}
        action={savePost}
        submitLabel="Save draft"
        submitVariants={[{ label: "Publish now", set: { status: "PUBLISHED" }, primary: true }]}
      />
    </>
  );
}
