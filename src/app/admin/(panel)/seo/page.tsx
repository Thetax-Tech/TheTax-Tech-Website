import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { STATIC_SEO_PAGES } from "@/lib/seo-pages";
import { PageHeader, Panel } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import type { FormLayout } from "@/components/admin/form/types";
import { savePageSeo } from "@/app/admin/actions/content";

export const metadata = { title: "SEO" };

export default async function SeoPage() {
  await requireUser("seo");
  const [rows, posts, services, projects] = await Promise.all([
    db.pageSeo.findMany(),
    db.post.findMany({ where: { status: "PUBLISHED" }, select: { id: true, title: true, seoTitle: true, seoDescription: true, coverAlt: true, coverImage: true } }),
    db.service.findMany({ select: { id: true, name: true, seoTitle: true, seoDescription: true, answer: true } }),
    db.project.findMany({ select: { id: true, title: true, seoDescription: true } }),
  ]);

  const layout: FormLayout = {
    main: STATIC_SEO_PAGES.map((p) => ({
      title: `${p.label} — ${p.path}`,
      fields: [
        { type: "text", name: `${p.key}.title`, label: "SEO title", placeholder: "Leave blank to use the default", maxLength: 70, full: true },
        { type: "textarea", name: `${p.key}.description`, label: "Meta description", rows: 2, counter: [120, 160] },
        { type: "image", name: `${p.key}.ogImage`, label: "Social share image (1200×630)" },
        { type: "switch", name: `${p.key}.noIndex`, label: "Hide from search engines (noindex)" },
      ],
    })),
  };
  const initial = Object.fromEntries(
    STATIC_SEO_PAGES.map((p) => {
      const r = rows.find((x) => x.path === p.path);
      return [p.key, { title: r?.title ?? "", description: r?.description ?? "", ogImage: r?.ogImage ?? "", noIndex: r?.noIndex ?? false }];
    }),
  );

  // Simple SEO health checks across dynamic content
  const issues = [
    ...posts.filter((p) => !p.seoDescription).map((p) => ({ href: `/admin/posts/${p.id}`, text: `Post “${p.title}” has no meta description` })),
    ...posts.filter((p) => p.coverImage && !p.coverAlt).map((p) => ({ href: `/admin/posts/${p.id}`, text: `Post “${p.title}” cover image has no alt text` })),
    ...services.filter((s) => !s.seoDescription).map((s) => ({ href: `/admin/services/${s.id}`, text: `Service “${s.name}” has no meta description` })),
    ...services.filter((s) => !s.answer).map((s) => ({ href: `/admin/services/${s.id}`, text: `Service “${s.name}” is missing its AEO direct answer` })),
    ...projects.filter((p) => !p.seoDescription).map((p) => ({ href: `/admin/projects/${p.id}`, text: `Project “${p.title}” uses its summary as meta description` })),
  ];

  return (
    <>
      <PageHeader title="SEO" description="Override titles and descriptions for fixed pages. Posts, services and projects have SEO fields in their own editors." />
      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <Panel title="Generated files">
          <ul className="space-y-2 text-sm">
            {[
              ["/sitemap.xml", "Sitemap — submit to Google Search Console & Bing"],
              ["/robots.txt", "Robots rules (admin & API blocked; AI crawlers allowed)"],
              ["/llms.txt", "Company summary for AI answer engines"],
            ].map(([href, label]) => (
              <li key={href}>
                <a href={href} target="_blank" className="inline-flex items-center gap-1 font-medium text-brand-ink hover:underline">
                  {href} <ExternalLink className="size-3.5" />
                </a>
                <span className="text-muted"> — {label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted">
            Search Console verification & Google Analytics IDs live in <Link href="/admin/settings" className="text-brand-ink underline">Settings</Link>.
          </p>
        </Panel>
        <Panel title={`Content health (${issues.length})`}>
          {issues.length === 0 ? (
            <p className="text-sm text-emerald-600 dark:text-emerald-400">All published content has SEO descriptions and alt text. 🎉</p>
          ) : (
            <ul className="max-h-48 space-y-1.5 overflow-y-auto text-sm">
              {issues.map((i, n) => (
                <li key={n}>
                  <Link href={i.href} className="text-muted hover:text-brand-ink">
                    • {i.text}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <EntityForm layout={layout} initial={initial} action={savePageSeo} submitLabel="Save SEO" />
    </>
  );
}
