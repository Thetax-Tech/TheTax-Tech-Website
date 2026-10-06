import type { MetadataRoute } from "next";
import { getBlogCategories, getJobs, getPosts, getProjects, getServices, getSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

/** Auto-generated sitemap: static pages + every published service, project, post, category and job. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, projects, posts, categories, jobs, settings] = await Promise.all([getServices(), getProjects(), getPosts(), getBlogCategories(), getJobs(), getSettings()]);
  const now = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/services"), lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: absoluteUrl("/about"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/portfolio"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/contact"), lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: absoluteUrl("/get-a-quote"), lastModified: now, changeFrequency: "yearly", priority: 0.8 },
    { url: absoluteUrl("/privacy-policy"), changeFrequency: "yearly", priority: 0.2 },
    { url: absoluteUrl("/terms"), changeFrequency: "yearly", priority: 0.2 },
  ];
  if (settings.modules.careers) staticPages.push({ url: absoluteUrl("/careers"), lastModified: now, changeFrequency: "weekly", priority: 0.5 });

  return [
    ...staticPages,
    ...services.map((s) => ({ url: absoluteUrl(`/services/${s.slug}`), lastModified: s.updatedAt, changeFrequency: "monthly" as const, priority: 0.9 })),
    ...projects.map((p) => ({ url: absoluteUrl(`/portfolio/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: p.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...categories.filter((c) => c.count > 0).map((c) => ({ url: absoluteUrl(`/blog/category/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.4 })),
    ...(settings.modules.careers ? jobs.map((j) => ({ url: absoluteUrl(`/careers/${j.slug}`), lastModified: j.updatedAt, changeFrequency: "weekly" as const, priority: 0.4 })) : []),
  ];
}
