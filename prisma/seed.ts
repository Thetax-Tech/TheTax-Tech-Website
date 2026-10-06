/**
 * Seeds the database with the site's starting content:
 *  - default admin (forced password change on first login)
 *  - 7 services (incl. BPO, AI Services, AI Automation), sample portfolio, blog posts
 *  - settings, page sections, FAQs, testimonials, team placeholders, jobs, legal pages
 *
 * Safe to re-run: existing records (matched by slug/key/email) are left untouched unless
 * you pass --force, which overwrites content records with the defaults.
 *
 *   npm run db:seed            # first-time seed
 *   npm run db:seed -- --force # reset content to defaults (keeps users, leads, media)
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { services } from "../src/content/services";
import { projects, projectImages } from "../src/content/projects";
import { posts, categories, postCover } from "../src/content/posts";
import { defaultSettings, homeSections, aboutSections, faqs, testimonials, team, jobs } from "../src/content/site";
import { legalPages } from "../src/content/legal";

const url = new URL(process.env.DATABASE_URL!);
const db = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: url.hostname,
    port: Number(url.port || 3306),
    user: decodeURIComponent(url.username),
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1),
    allowPublicKeyRetrieval: true,
    connectTimeout: 20_000,
    ssl: url.searchParams.get("ssl") === "true" ? { rejectUnauthorized: true } : undefined,
  }),
});
const force = process.argv.includes("--force");
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const words = (html: string) => html.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;

async function main() {
  // ── Admin user
  const email = (process.env.SEED_ADMIN_EMAIL || "admin@thetaxtech.com.pk").toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || "ChangeMe!2026";
  const existingAdmin = await db.user.findUnique({ where: { email } });
  const admin =
    existingAdmin ??
    (await db.user.create({
      data: { name: "Theta X Tech Admin", email, role: "SUPER_ADMIN", passwordHash: await bcrypt.hash(password, 12), mustChangePassword: true, bio: "The Theta X Tech team writes about AI, automation, outsourcing and digital growth." },
    }));
  console.log(existingAdmin ? `✓ Admin exists: ${email}` : `✓ Admin created: ${email} (password: ${password} — change at first login)`);

  // ── Settings
  for (const [key, value] of Object.entries(defaultSettings)) {
    const exists = await db.siteSetting.findUnique({ where: { key } });
    if (!exists || force) await db.siteSetting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  console.log("✓ Settings");

  // ── Page sections
  const sectionSets: [string, Record<string, unknown>][] = [
    ["home", homeSections],
    ["about", aboutSections],
    ["legal", legalPages],
  ];
  for (const [page, sections] of sectionSets) {
    let order = 0;
    for (const [key, data] of Object.entries(sections)) {
      const exists = await db.pageSection.findUnique({ where: { page_key: { page, key } } });
      if (!exists || force) await db.pageSection.upsert({ where: { page_key: { page, key } }, update: { data: data as object }, create: { page, key, data: data as object, order: order++ } });
    }
  }
  console.log("✓ Page sections");

  // ── Services
  const serviceIds = new Map<string, string>();
  for (const s of services) {
    const { slug, ...data } = s;
    const row = await db.service.upsert({ where: { slug }, update: force ? data : {}, create: { slug, ...data, isVisible: true } });
    serviceIds.set(slug, row.id);
  }
  console.log(`✓ ${services.length} services`);

  // ── Projects (concept/sample case studies with generated mockups)
  // Remove the placeholder projects shipped by the first version of the seed.
  const legacy = ["ai-whatsapp-sales-agent-retail", "invoice-processing-automation-logistics", "corporate-website-real-estate-developer", "customer-support-bpo-saas", "brand-identity-fintech-startup", "lead-generation-campaign-education"];
  const removed = await db.project.deleteMany({ where: { slug: { in: legacy } } });
  if (removed.count) console.log(`• removed ${removed.count} legacy placeholder projects`);
  for (const p of projects) {
    const { slug, services: svc, art: _art, ...rest } = p;
    const imgs = projectImages(slug);
    const data = { ...rest, isSample: true, coverImage: imgs.cover, gallery: imgs.gallery };
    const connect = svc.map((s) => ({ id: serviceIds.get(s)! })).filter((x) => x.id);
    await db.project.upsert({ where: { slug }, update: force ? { ...data, services: { set: connect } } : {}, create: { slug, ...data, services: { connect } } });
  }
  console.log(`✓ ${projects.length} portfolio projects (concept samples)`);

  // ── Blog
  const catIds = new Map<string, string>();
  for (const c of categories) {
    const row = await db.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
    catIds.set(c.slug, row.id);
  }
  for (const p of posts) {
    const tagConnect = [];
    for (const name of p.tags) {
      const t = await db.tag.upsert({ where: { slug: slugify(name) }, update: {}, create: { slug: slugify(name), name } });
      tagConnect.push({ id: t.id });
    }
    const data = {
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverAlt: p.coverAlt,
      coverImage: postCover(p.slug),
      status: "PUBLISHED" as const,
      publishedAt: new Date(p.publishedAt),
      isFeatured: p.isFeatured,
      readingTime: Math.max(1, Math.round(words(p.content) / 220)),
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      faqs: p.faqs ?? [],
      categoryId: catIds.get(p.category),
      authorId: admin.id,
    };
    await db.post.upsert({ where: { slug: p.slug }, update: force ? { ...data, tags: { set: tagConnect } } : {}, create: { slug: p.slug, ...data, tags: { connect: tagConnect } } });
  }
  console.log(`✓ ${posts.length} blog posts, ${categories.length} categories`);

  // Backfill images on existing databases (Round 2): add covers where missing and insert the
  // in-article figures only where the original paragraph is still intact (edited posts untouched).
  let backfilled = 0;
  for (const p of posts) {
    const row = await db.post.findUnique({ where: { slug: p.slug } });
    if (!row) continue;
    const update: { coverImage?: string; coverAlt?: string; content?: string } = {};
    if (!row.coverImage) update.coverImage = postCover(p.slug);
    if (!row.coverImage || !row.coverAlt) update.coverAlt = p.coverAlt;
    let content = row.content;
    for (const m of p.content.matchAll(/([^\n]{60})\n(<figure>[\s\S]*?<\/figure>)/g)) {
      const [, marker, figure] = m;
      const src = /src="([^"]+)"/.exec(figure)?.[1];
      if (src && !content.includes(src) && content.includes(marker)) content = content.replace(marker, `${marker}\n${figure}`);
    }
    if (content !== row.content) update.content = content;
    if (Object.keys(update).length) {
      await db.post.update({ where: { id: row.id }, data: update });
      backfilled++;
    }
  }
  if (backfilled) console.log(`✓ added images to ${backfilled} existing blog posts`);

  // ── Simple lists (only seeded when empty, or with --force)
  async function seedList<T>(label: string, count: () => Promise<number>, clear: () => Promise<unknown>, create: () => Promise<T>) {
    if (force) await clear();
    if (force || (await count()) === 0) {
      await create();
      console.log(`✓ ${label}`);
    } else console.log(`• ${label} already present — skipped`);
  }
  await seedList("FAQs", () => db.faq.count(), () => db.faq.deleteMany(), () => db.faq.createMany({ data: faqs.map((f, i) => ({ ...f, order: i })) }));
  await seedList("Testimonials (placeholders)", () => db.testimonial.count(), () => db.testimonial.deleteMany(), () => db.testimonial.createMany({ data: testimonials.map((t, i) => ({ ...t, order: i })) }));
  await seedList("Team (hidden placeholders)", () => db.teamMember.count(), () => db.teamMember.deleteMany(), () => db.teamMember.createMany({ data: team.map((t, i) => ({ ...t, order: i })) }));
  for (const [i, j] of jobs.entries()) await db.job.upsert({ where: { slug: j.slug }, update: force ? j : {}, create: { ...j, order: i } });
  console.log(`✓ ${jobs.length} job openings`);
}

main()
  .then(() => console.log("\nSeed complete."))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
