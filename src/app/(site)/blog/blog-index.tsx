import Link from "next/link";
import { Search } from "lucide-react";
import { getBlogCategories, getPosts, type PostVM } from "@/lib/data";
import { PostCard } from "@/components/cards";
import { CoverArt } from "@/components/ui/cover-art";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { cn, formatDate, stripHtml } from "@/lib/utils";

const PER_PAGE = 9;

/** Shared listing used by /blog, /blog/category/[slug] and /blog/tag/[slug]. */
export async function BlogIndex({
  basePath,
  category,
  tag,
  q,
  page = 1,
}: {
  basePath: string;
  category?: string;
  tag?: string;
  q?: string;
  page?: number;
}) {
  const [all, categories] = await Promise.all([getPosts(), getBlogCategories()]);
  const query = q?.trim().toLowerCase();
  let posts: PostVM[] = all;
  if (category) posts = posts.filter((p) => p.category?.slug === category);
  if (tag) posts = posts.filter((p) => p.tags.some((t) => t.slug === tag));
  if (query) posts = posts.filter((p) => `${p.title} ${p.excerpt} ${stripHtml(p.content)}`.toLowerCase().includes(query));

  const showFeatured = !category && !tag && !query && page === 1;
  const featured = showFeatured ? posts.find((p) => p.isFeatured) ?? posts[0] : undefined;
  const rest = featured ? posts.filter((p) => p.slug !== featured.slug) : posts;
  const pages = Math.max(1, Math.ceil(rest.length / PER_PAGE));
  const current = Math.min(Math.max(1, page), pages);
  const pageItems = rest.slice((current - 1) * PER_PAGE, current * PER_PAGE);

  const pageHref = (n: number) => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (n > 1) sp.set("page", String(n));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <section className="pb-28">
      <div className="container-x">
        {/* Filters */}
        <div className="flex flex-col gap-6 border-b border-line pb-8 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Blog categories">
            <ul className="flex flex-wrap gap-2">
              <li>
                <Link href="/blog" className={cn("inline-block rounded-full border px-4 py-2 text-sm font-medium transition-colors", !category && !tag ? "border-brand bg-brand text-on-brand" : "border-line-strong text-muted hover:text-fg")}>
                  All
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/blog/category/${c.slug}`}
                    className={cn("inline-block rounded-full border px-4 py-2 text-sm font-medium transition-colors", category === c.slug ? "border-brand bg-brand text-on-brand" : "border-line-strong text-muted hover:text-fg")}
                  >
                    {c.name} <span className="opacity-60">({c.count})</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <form action={basePath} role="search" className="flex w-full max-w-sm items-center gap-2 rounded-full border border-line-strong bg-surface px-4 focus-within:border-brand">
            <Search className="size-4 text-subtle" aria-hidden />
            <label htmlFor="blog-q" className="sr-only">Search articles</label>
            <input id="blog-q" name="q" defaultValue={q} placeholder="Search articles…" className="h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle" />
          </form>
        </div>

        {query && (
          <p className="mt-8 text-muted" role="status">
            {posts.length} result{posts.length === 1 ? "" : "s"} for “<span className="text-fg">{q}</span>”
          </p>
        )}

        {/* Featured */}
        {featured && (
          <Reveal className="mt-12">
            <Link href={`/blog/${featured.slug}`} className="group card grid overflow-hidden lg:grid-cols-2">
              <CoverArt src={featured.coverImage} alt={featured.coverAlt || featured.title} seed={featured.slug} label="Featured" className="aspect-[1200/630] self-center" priority sizes="(min-width: 1024px) 50vw, 100vw" />
              <div className="flex flex-col justify-center p-8 sm:p-12">
                <p className="text-xs font-medium uppercase tracking-widest text-brand-ink">{featured.category?.name}</p>
                <h2 className="mt-4 text-2xl font-semibold leading-tight transition-colors group-hover:text-brand-ink sm:text-4xl">{featured.title}</h2>
                <p className="mt-4 leading-relaxed text-muted">{featured.excerpt}</p>
                <p className="mt-6 text-sm text-subtle">
                  {formatDate(featured.publishedAt)} · {featured.readingTime} min read
                </p>
              </div>
            </Link>
          </Reveal>
        )}

        {/* Grid */}
        {pageItems.length > 0 ? (
          <Stagger className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((p) => (
              <StaggerItem key={p.slug}>
                <PostCard post={p} />
              </StaggerItem>
            ))}
          </Stagger>
        ) : (
          !featured && <p className="mt-16 text-center text-muted">No articles found. Try a different search or category.</p>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <nav aria-label="Pagination" className="mt-16 flex justify-center gap-2">
            {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={pageHref(n)}
                aria-current={n === current ? "page" : undefined}
                className={cn("grid size-11 place-items-center rounded-full border text-sm font-medium", n === current ? "border-brand bg-brand text-on-brand" : "border-line-strong hover:border-brand")}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </section>
  );
}
