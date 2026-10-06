import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, EmptyState, PageHeader, Table, btn, inputClass } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/list-controls";
import { deletePost } from "@/app/admin/actions/posts";
import { CategoryManager } from "./category-manager";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Blog posts" };

const STATUSES = ["ALL", "PUBLISHED", "SCHEDULED", "DRAFT"] as const;

export default async function PostsPage({ searchParams }: PageProps<"/admin/posts">) {
  await requireUser("posts");
  const sp = await searchParams;
  const status = STATUSES.includes(sp.status as (typeof STATUSES)[number]) ? (sp.status as (typeof STATUSES)[number]) : "ALL";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const [posts, counts, categories] = await Promise.all([
    db.post.findMany({
      where: { ...(status !== "ALL" ? { status } : {}), ...(q ? { OR: [{ title: { contains: q } }, { slug: { contains: q } }] } : {}) },
      orderBy: [{ updatedAt: "desc" }],
      include: { category: { select: { name: true } }, author: { select: { name: true } } },
      take: 200,
    }),
    db.post.groupBy({ by: ["status"], _count: true }),
    db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: true } } } }),
  ]);
  const countOf = (s: string) => (s === "ALL" ? counts.reduce((a, c) => a + c._count, 0) : counts.find((c) => c.status === s)?._count ?? 0);
  const tone = { PUBLISHED: "green", SCHEDULED: "blue", DRAFT: "neutral" } as const;

  return (
    <>
      <PageHeader
        title="Blog posts"
        description="Write, schedule and publish SEO-optimised articles."
        actions={
          <Link href="/admin/posts/new" className={btn.primary}>
            <Plus /> New post
          </Link>
        }
      />
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-1" aria-label="Filter by status">
          {STATUSES.map((s) => (
            <Link key={s} href={`/admin/posts${s === "ALL" ? "" : `?status=${s}`}`} className={cn("rounded-lg px-3 py-1.5 text-sm", status === s ? "bg-brand/15 font-medium text-brand-ink" : "text-muted hover:bg-surface-2")}>
              {s.charAt(0) + s.slice(1).toLowerCase()} <span className="text-subtle">({countOf(s)})</span>
            </Link>
          ))}
        </nav>
        <form className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          {status !== "ALL" && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search posts…" className={cn(inputClass, "pl-9")} />
        </form>
      </div>

      {posts.length === 0 ? (
        <EmptyState title="No posts found" text="Create your first article to start ranking on Google." action={<Link href="/admin/posts/new" className={btn.primary}><Plus /> New post</Link>} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Category</th>
              <th>Date</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link href={`/admin/posts/${p.id}`} className="font-medium hover:text-brand-ink">
                    {p.title}
                  </Link>
                  <p className="text-xs text-subtle">/blog/{p.slug} · {p.author?.name ?? "—"}</p>
                </td>
                <td>
                  <Badge tone={tone[p.status]}>{p.status.toLowerCase()}</Badge>
                  {p.isFeatured && <Badge tone="brand">featured</Badge>}
                </td>
                <td className="text-muted">{p.category?.name ?? "—"}</td>
                <td className="whitespace-nowrap text-muted">{formatDate(p.publishedAt ?? p.updatedAt)}</td>
                <td className="text-right">
                  <div className="inline-flex items-center gap-1">
                    <Link href={`/admin/posts/${p.id}`} className={btn.ghost}>Edit</Link>
                    {p.status === "PUBLISHED" ? (
                      <a href={`/blog/${p.slug}`} target="_blank" className={btn.ghost}>View</a>
                    ) : (
                      <a href={`/admin/posts/${p.id}/preview`} target="_blank" className={btn.ghost}>Preview</a>
                    )}
                    <DeleteButton iconOnly action={deletePost.bind(null, p.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <div className="mt-8">
        <CategoryManager categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug, description: c.description, count: c._count.posts }))} />
      </div>
    </>
  );
}
