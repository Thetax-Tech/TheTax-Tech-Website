import "server-only";
import { cache } from "react";
import { db, hasDatabase } from "@/lib/db";
import { asArray, readingTime } from "@/lib/utils";
import { services as defaultServices, type Item, type Faq } from "@/content/services";
import { projects as defaultProjects, projectImages } from "@/content/projects";
import { posts as defaultPosts, categories as defaultCategories, postCover } from "@/content/posts";
import {
  defaultSettings,
  homeSections,
  aboutSections,
  faqs as defaultFaqs,
  testimonials as defaultTestimonials,
  team as defaultTeam,
  jobs as defaultJobs,
  type Settings,
} from "@/content/site";
import { legalPages, type LegalKey } from "@/content/legal";

/*
 * Public data access. Every function:
 *  - reads from MySQL via Prisma when DATABASE_URL is set,
 *  - falls back to the bundled default content if the DB is missing or unreachable,
 *  - returns plain "view model" objects so pages never depend on Prisma types.
 */

async function safe<T>(label: string, query: () => Promise<T>, fallback: () => T): Promise<T> {
  if (!hasDatabase) return fallback();
  try {
    return await query();
  } catch (error) {
    console.error(`[data] ${label} failed, using fallback content:`, (error as Error).message);
    return fallback();
  }
}

// ─────────────────────────── View models ───────────────────────────

export type ServiceVM = {
  id: string;
  slug: string;
  name: string;
  icon: string;
  tagline: string | null;
  shortDescription: string;
  longDescription: string | null;
  answerQuestion: string | null;
  answer: string | null;
  problem: string | null;
  solution: string | null;
  features: Item[];
  benefits: Item[];
  process: Item[];
  faqs: Faq[];
  image: string | null;
  isFeatured: boolean;
  seoTitle: string | null;
  seoDescription: string | null;
  seoKeywords: string | null;
  ogImage: string | null;
  updatedAt: Date;
};

export type ProjectVM = {
  id: string;
  slug: string;
  title: string;
  client: string | null;
  category: string;
  industry: string | null;
  year: number | null;
  summary: string;
  description: string | null;
  problem: string | null;
  solution: string | null;
  results: { label: string; value: string }[];
  techStack: string[];
  coverImage: string | null;
  gallery: string[];
  liveUrl: string | null;
  isFeatured: boolean;
  isSample: boolean;
  services: { slug: string; name: string }[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
  updatedAt: Date;
};

export type PostVM = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  coverAlt: string | null;
  publishedAt: Date;
  updatedAt: Date;
  readingTime: number;
  isFeatured: boolean;
  author: { name: string; avatar: string | null; bio: string | null } | null;
  category: { slug: string; name: string } | null;
  tags: { slug: string; name: string }[];
  faqs: Faq[];
  seoTitle: string | null;
  seoDescription: string | null;
  ogImage: string | null;
};

export type TestimonialVM = { id: string; name: string; role: string | null; company: string | null; quote: string; rating: number; avatar: string | null };
export type TeamVM = { id: string; name: string; role: string; bio: string | null; photo: string | null; linkedin: string | null };
export type FaqVM = { id: string; question: string; answer: string; group: string };
export type LogoVM = { id: string; name: string; logo: string | null; url: string | null };
export type JobVM = { id: string; slug: string; title: string; department: string | null; location: string; type: string; summary: string; description: string | null; updatedAt: Date };

const EPOCH = new Date("2026-01-01T00:00:00.000Z");

// ─────────────────────────── Settings ───────────────────────────

function deepMerge<T>(base: T, override: unknown): T {
  if (!override || typeof override !== "object" || Array.isArray(override)) return base;
  const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [k, v] of Object.entries(override as Record<string, unknown>)) {
    const b = out[k];
    out[k] = b && typeof b === "object" && !Array.isArray(b) ? deepMerge(b, v) : v;
  }
  return out as T;
}

export const getSettings = cache(async (): Promise<Settings> =>
  safe(
    "settings",
    async () => {
      const rows = await db.siteSetting.findMany();
      let merged = defaultSettings;
      for (const row of rows) {
        if (row.key in defaultSettings) {
          merged = { ...merged, [row.key]: deepMerge(merged[row.key as keyof Settings], row.value) };
        }
      }
      return merged;
    },
    () => defaultSettings,
  ),
);

// ─────────────────────────── Page sections ───────────────────────────

const defaultSections: Record<string, Record<string, unknown>> = { home: homeSections, about: aboutSections };

export const getSections = cache(async <T extends Record<string, unknown>>(page: "home" | "about"): Promise<T> =>
  safe(
    `sections:${page}`,
    async () => {
      const rows = await db.pageSection.findMany({ where: { page } });
      const base = { ...(defaultSections[page] ?? {}) } as Record<string, unknown>;
      for (const row of rows) {
        if (!row.isVisible) base[row.key] = null;
        else base[row.key] = deepMerge(base[row.key] ?? {}, row.data);
      }
      return base as T;
    },
    () => (defaultSections[page] ?? {}) as T,
  ),
);

export const getHomeSections = () => getSections<typeof homeSections>("home");
export const getAboutSections = () => getSections<typeof aboutSections>("about");

export const getPageSeo = cache(async (path: string) =>
  safe("pageSeo", () => db.pageSeo.findUnique({ where: { path } }), () => null),
);

// ─────────────────────────── Services ───────────────────────────

function fallbackServices(): ServiceVM[] {
  return defaultServices.map((s) => ({
    ...s,
    id: s.slug,
    image: null,
    ogImage: null,
    updatedAt: EPOCH,
  }));
}

type ServiceRow = Awaited<ReturnType<typeof db.service.findFirstOrThrow>>;
function toServiceVM(s: ServiceRow): ServiceVM {
  return {
    ...s,
    features: asArray<Item>(s.features),
    benefits: asArray<Item>(s.benefits),
    process: asArray<Item>(s.process),
    faqs: asArray<Faq>(s.faqs),
  };
}

export const getServices = cache(async (): Promise<ServiceVM[]> =>
  safe(
    "services",
    async () => (await db.service.findMany({ where: { isVisible: true }, orderBy: [{ order: "asc" }, { name: "asc" }] })).map(toServiceVM),
    fallbackServices,
  ),
);

export const getService = cache(async (slug: string): Promise<ServiceVM | null> =>
  safe(
    "service",
    async () => {
      const s = await db.service.findFirst({ where: { slug, isVisible: true } });
      return s ? toServiceVM(s) : null;
    },
    () => fallbackServices().find((s) => s.slug === slug) ?? null,
  ),
);

// ─────────────────────────── Projects ───────────────────────────

function fallbackProjects(): ProjectVM[] {
  const svc = new Map(defaultServices.map((s) => [s.slug, s.name]));
  return defaultProjects.map(({ art: _art, ...p }) => ({
    ...p,
    id: p.slug,
    isSample: true,
    coverImage: projectImages(p.slug).cover,
    gallery: projectImages(p.slug).gallery,
    liveUrl: null,
    services: p.services.map((slug) => ({ slug, name: svc.get(slug) ?? slug })),
    seoTitle: null,
    seoDescription: null,
    ogImage: null,
    updatedAt: EPOCH,
  }));
}

const projectInclude = { services: { select: { slug: true, name: true } } } as const;
type ProjectRow = Awaited<ReturnType<typeof db.project.findFirstOrThrow<{ include: typeof projectInclude }>>>;
function toProjectVM(p: ProjectRow): ProjectVM {
  return {
    ...p,
    results: asArray(p.results),
    techStack: asArray<string>(p.techStack),
    gallery: asArray<string>(p.gallery),
  };
}

export const getProjects = cache(async (): Promise<ProjectVM[]> =>
  safe(
    "projects",
    async () =>
      (await db.project.findMany({ where: { isPublished: true }, include: projectInclude, orderBy: [{ order: "asc" }, { createdAt: "desc" }] })).map(toProjectVM),
    fallbackProjects,
  ),
);

export const getProject = cache(async (slug: string): Promise<ProjectVM | null> =>
  safe(
    "project",
    async () => {
      const p = await db.project.findFirst({ where: { slug, isPublished: true }, include: projectInclude });
      return p ? toProjectVM(p) : null;
    },
    () => fallbackProjects().find((p) => p.slug === slug) ?? null,
  ),
);

export async function getProjectsForService(slug: string) {
  return (await getProjects()).filter((p) => p.services.some((s) => s.slug === slug));
}

// ─────────────────────────── Blog ───────────────────────────

function fallbackPosts(): PostVM[] {
  const cats = new Map(defaultCategories.map((c) => [c.slug, c]));
  return defaultPosts
    .map((p) => ({
      id: p.slug,
      slug: p.slug,
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: postCover(p.slug),
      coverAlt: p.coverAlt,
      publishedAt: new Date(p.publishedAt),
      updatedAt: new Date(p.publishedAt),
      readingTime: readingTime(p.content),
      isFeatured: p.isFeatured,
      author: { name: "Theta X Tech Team", avatar: null, bio: null },
      category: cats.has(p.category) ? { slug: p.category, name: cats.get(p.category)!.name } : null,
      tags: p.tags.map((t) => ({ name: t, slug: t.toLowerCase().replace(/[^a-z0-9]+/g, "-") })),
      faqs: p.faqs ?? [],
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      ogImage: null,
    }))
    .sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
}

const postInclude = {
  author: { select: { name: true, avatar: true, bio: true } },
  category: { select: { slug: true, name: true } },
  tags: { select: { slug: true, name: true } },
} as const;
type PostRow = Awaited<ReturnType<typeof db.post.findFirstOrThrow<{ include: typeof postInclude }>>>;
function toPostVM(p: PostRow): PostVM {
  return { ...p, publishedAt: p.publishedAt ?? p.createdAt, faqs: asArray<Faq>(p.faqs) };
}

/** Published = status PUBLISHED, or SCHEDULED whose publish date has passed. */
function publishedWhere() {
  return {
    OR: [
      { status: "PUBLISHED" as const },
      { status: "SCHEDULED" as const, publishedAt: { lte: new Date() } },
    ],
  };
}

export const getPosts = cache(async (): Promise<PostVM[]> =>
  safe(
    "posts",
    async () => (await db.post.findMany({ where: publishedWhere(), include: postInclude, orderBy: { publishedAt: "desc" } })).map(toPostVM),
    fallbackPosts,
  ),
);

export const getPost = cache(async (slug: string): Promise<PostVM | null> =>
  safe(
    "post",
    async () => {
      const p = await db.post.findFirst({ where: { slug, ...publishedWhere() }, include: postInclude });
      return p ? toPostVM(p) : null;
    },
    () => fallbackPosts().find((p) => p.slug === slug) ?? null,
  ),
);

/** Admin preview: any status. Only call after an auth check. */
export async function getPostForPreview(id: string): Promise<PostVM | null> {
  const p = await db.post.findUnique({ where: { id }, include: postInclude });
  return p ? toPostVM(p) : null;
}

export const getBlogCategories = cache(async () =>
  safe(
    "categories",
    async () => {
      const rows = await db.category.findMany({ orderBy: { name: "asc" }, include: { _count: { select: { posts: { where: publishedWhere() } } } } });
      return rows.map((c) => ({ slug: c.slug, name: c.name, description: c.description, count: c._count.posts }));
    },
    () => {
      const posts = fallbackPosts();
      return defaultCategories.map((c) => ({ ...c, count: posts.filter((p) => p.category?.slug === c.slug).length }));
    },
  ),
);

export async function getRelatedPosts(post: PostVM, limit = 3) {
  const all = (await getPosts()).filter((p) => p.slug !== post.slug);
  const tagSet = new Set(post.tags.map((t) => t.slug));
  return all
    .map((p) => ({
      p,
      score: (p.category?.slug === post.category?.slug ? 2 : 0) + p.tags.filter((t) => tagSet.has(t.slug)).length,
    }))
    .sort((a, b) => b.score - a.score || b.p.publishedAt.getTime() - a.p.publishedAt.getTime())
    .slice(0, limit)
    .map((x) => x.p);
}

// ─────────────────────────── Content blocks ───────────────────────────

export const getFaqs = cache(async (group?: string): Promise<FaqVM[]> =>
  safe<FaqVM[]>(
    "faqs",
    async () => db.faq.findMany({ where: { isVisible: true, ...(group ? { group } : {}) }, orderBy: { order: "asc" } }),
    () => defaultFaqs.filter((f) => !group || f.group === group).map((f, i) => ({ ...f, id: String(i) })),
  ),
);

export const getTestimonials = cache(async (): Promise<TestimonialVM[]> =>
  safe<TestimonialVM[]>(
    "testimonials",
    () => db.testimonial.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }),
    () => defaultTestimonials.map((t, i) => ({ ...t, id: String(i), avatar: null })),
  ),
);

export const getTeam = cache(async (): Promise<TeamVM[]> =>
  safe<TeamVM[]>(
    "team",
    () => db.teamMember.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }),
    () => defaultTeam.filter((t) => t.isVisible).map((t, i) => ({ ...t, id: String(i), photo: null, linkedin: null })),
  ),
);

export const getClientLogos = cache(async (): Promise<LogoVM[]> =>
  safe<LogoVM[]>("logos", () => db.clientLogo.findMany({ where: { isVisible: true }, orderBy: { order: "asc" } }), () => []),
);

export const getJobs = cache(async (): Promise<JobVM[]> =>
  safe<JobVM[]>(
    "jobs",
    () => db.job.findMany({ where: { isOpen: true }, orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    () => defaultJobs.map((j) => ({ ...j, id: j.slug, updatedAt: EPOCH })),
  ),
);

export async function getJob(slug: string) {
  return (await getJobs()).find((j) => j.slug === slug) ?? null;
}

// ─────────────────────────── Legal pages ───────────────────────────

export const getLegalPage = cache(async (key: LegalKey) =>
  safe(
    `legal:${key}`,
    async () => {
      const row = await db.pageSection.findUnique({ where: { page_key: { page: "legal", key } } });
      const data = (row?.data ?? {}) as Partial<(typeof legalPages)[LegalKey]>;
      return { ...legalPages[key], ...data, updated: row?.updatedAt.toISOString().slice(0, 10) ?? legalPages[key].updated };
    },
    () => legalPages[key],
  ),
);
