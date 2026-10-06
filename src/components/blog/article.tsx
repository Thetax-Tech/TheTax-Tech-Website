import Link from "next/link";
import { CalendarDays, Clock } from "lucide-react";
import type { PostVM } from "@/lib/data";
import { prepareHtml } from "@/lib/html";
import { absoluteUrl } from "@/lib/seo";
import { formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CoverArt } from "@/components/ui/cover-art";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { SplitText } from "@/components/motion/split-text";
import { ArticleToc } from "@/app/(site)/blog/[slug]/article-toc";
import { ShareButtons } from "@/app/(site)/blog/[slug]/share-buttons";

/** Full article layout — shared by the public post page and the admin preview. */
export function Article({ post, preview }: { post: PostVM; preview?: boolean }) {
  const { html, toc } = prepareHtml(post.content);
  const url = absoluteUrl(`/blog/${post.slug}`);

  return (
    <article>
      <header className="relative isolate overflow-hidden pt-32 pb-12 sm:pt-40">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid mask-radial opacity-60" />
          <div className="absolute -top-40 left-1/2 h-[28rem] w-[56rem] -translate-x-1/2 rounded-full blob [--blob-a:33%]" />
        </div>
        <div className="container-x max-w-4xl">
          {preview ? (
            <p className="mb-6 inline-block rounded-full bg-brand px-4 py-1 text-sm font-semibold text-on-brand">Preview — not published</p>
          ) : (
            <Breadcrumbs
              items={[
                { name: "Blog", path: "/blog" },
                ...(post.category ? [{ name: post.category.name, path: `/blog/category/${post.category.slug}` }] : []),
                { name: post.title, path: `/blog/${post.slug}` },
              ]}
            />
          )}
          {post.category && (
            <Link href={`/blog/category/${post.category.slug}`} className="eyebrow mt-8 anim-fade-up">
              {post.category.name}
            </Link>
          )}
          <h1 className="mt-4 text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
            <SplitText text={post.title} delay={0.05} stagger={0.035} />
          </h1>
          <p className="anim-fade-up mt-6 text-lg leading-relaxed text-muted sm:text-xl" style={{ "--d": "0.3s" } as React.CSSProperties}>
            {post.excerpt}
          </p>
          <div className="anim-fade-up mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-subtle" style={{ "--d": "0.4s" } as React.CSSProperties}>
            {post.author && (
              <span className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-full bg-brand font-semibold text-on-brand">{post.author.name.charAt(0)}</span>
                <span>
                  <span className="block text-fg">{post.author.name}</span>
                  <span className="block text-xs">Theta X Tech</span>
                </span>
              </span>
            )}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="size-4" aria-hidden />
              <time dateTime={post.publishedAt.toISOString()}>{formatDate(post.publishedAt)}</time>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-4" aria-hidden /> {post.readingTime} min read
            </span>
          </div>
        </div>
      </header>

      <div className="container-x max-w-6xl">
        <CoverArt src={post.coverImage} alt={post.coverAlt || post.title} seed={post.slug} className="aspect-[1200/630] rounded-[2rem] border border-line" priority sizes="(min-width: 1152px) 1152px, 100vw" />
      </div>

      <div className="container-x mt-14 grid max-w-6xl gap-12 pb-20 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0">
          <div className="prose-x" dangerouslySetInnerHTML={{ __html: html }} />

          {post.faqs.length > 0 && (
            <section className="mt-16" aria-labelledby="post-faq">
              <h2 id="post-faq" className="text-2xl font-semibold">
                Frequently asked questions
              </h2>
              <FaqAccordion items={post.faqs} className="mt-6" />
            </section>
          )}

          {post.tags.length > 0 && (
            <ul className="mt-12 flex flex-wrap gap-2" aria-label="Tags">
              {post.tags.map((t) => (
                <li key={t.slug}>
                  <Link href={`/blog/tag/${t.slug}`} className="inline-block rounded-full border border-line-strong px-3 py-1 text-sm text-muted hover:border-brand hover:text-brand-ink">
                    #{t.name}
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 border-t border-line pt-8">
            <ShareButtons url={url} title={post.title} />
          </div>

          {post.author?.bio && (
            <div className="card mt-10 flex gap-5 p-6">
              <span className="grid size-14 shrink-0 place-items-center rounded-full bg-brand text-lg font-semibold text-on-brand">{post.author.name.charAt(0)}</span>
              <div>
                <p className="font-semibold">{post.author.name}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted">{post.author.bio}</p>
              </div>
            </div>
          )}
        </div>
        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <ArticleToc items={toc} />
            <div className="rounded-[1.25rem] border border-brand/40 bg-gradient-to-br from-brand/15 to-transparent p-6">
              <p className="font-display text-lg font-semibold">Need help putting this into practice?</p>
              <p className="mt-2 text-sm text-muted">Book a free consultation with our team.</p>
              <Link href="/get-a-quote" className="mt-4 inline-block rounded-full bg-brand px-5 py-2 text-sm font-semibold text-on-brand hover:bg-brand-soft">
                Get a free quote
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
