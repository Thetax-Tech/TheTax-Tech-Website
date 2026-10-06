"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { mutate, remove, revalidateSite, zx } from "@/lib/admin-actions";
import { assertUser } from "@/lib/auth";

/* Portfolio projects, services and careers (jobs). */

const itemShape = { title: z.string().default(""), description: z.string().default("") };

// ─────────────────────────── Projects ───────────────────────────

const projectSchema = z.object({
  id: z.string().optional(),
  title: zx.req("Title"),
  slug: zx.slug(),
  client: zx.opt(),
  category: zx.req("Category", 80),
  industry: zx.opt(),
  year: zx.intOpt(),
  summary: zx.req("Summary", 1000),
  description: zx.text(200_000),
  problem: zx.text(5000),
  solution: zx.text(5000),
  results: zx.items({ label: z.string().default(""), value: z.string().default("") }),
  techStack: zx.strings(),
  services: zx.strings(),
  coverImage: zx.opt(),
  gallery: zx.strings(),
  liveUrl: zx.opt(),
  isFeatured: zx.bool(),
  isPublished: zx.bool(),
  isSample: zx.bool(),
  order: zx.int(),
  seoTitle: zx.opt(),
  seoDescription: zx.text(400),
  ogImage: zx.opt(),
});

export async function saveProject(values: Record<string, unknown>) {
  return mutate({
    permission: "projects",
    schema: projectSchema,
    values,
    entity: "Project",
    action: values.id ? "updated" : "created",
    run: async (d) => {
      const { id, services, ...rest } = d;
      const connect = services.map((sid) => ({ id: sid }));
      if (id) {
        await db.project.update({ where: { id }, data: { ...rest, services: { set: connect } } });
        return { id, label: d.title };
      }
      const p = await db.project.create({ data: { ...rest, services: { connect } } });
      return { id: p.id, label: d.title, redirect: `/admin/projects/${p.id}`, message: "Project created" };
    },
  });
}

export async function deleteProject(id: string) {
  return remove({ permission: "projects", entity: "Project", run: () => db.project.delete({ where: { id } }), redirect: "/admin/projects" });
}

// ─────────────────────────── Services ───────────────────────────

const serviceSchema = z.object({
  id: z.string().optional(),
  name: zx.req("Name"),
  slug: zx.slug(),
  icon: zx.str(40).default("sparkles"),
  tagline: zx.opt(),
  shortDescription: zx.req("Short description", 1000),
  answerQuestion: zx.opt(),
  answer: zx.text(1200),
  problem: zx.text(4000),
  solution: zx.text(4000),
  features: zx.items(itemShape),
  benefits: zx.items(itemShape),
  process: zx.items(itemShape),
  faqs: zx.items({ question: z.string().default(""), answer: z.string().default("") }),
  longDescription: zx.text(200_000),
  image: zx.opt(),
  order: zx.int(),
  isVisible: zx.bool(),
  isFeatured: zx.bool(),
  seoTitle: zx.opt(),
  seoDescription: zx.text(400),
  seoKeywords: zx.text(600),
  ogImage: zx.opt(),
});

export async function saveService(values: Record<string, unknown>) {
  return mutate({
    permission: "services",
    schema: serviceSchema,
    values,
    entity: "Service",
    action: values.id ? "updated" : "created",
    run: async (d) => {
      const { id, ...data } = d;
      if (id) {
        await db.service.update({ where: { id }, data });
        return { id, label: d.name };
      }
      const s = await db.service.create({ data });
      return { id: s.id, label: d.name, redirect: `/admin/services/${s.id}`, message: "Service created" };
    },
  });
}

export async function deleteService(id: string) {
  return remove({ permission: "services", entity: "Service", run: () => db.service.delete({ where: { id } }), redirect: "/admin/services" });
}

/** Persist drag-and-drop order for services / projects / content lists. */
export async function reorder(model: "service" | "project" | "testimonial" | "teamMember" | "faq" | "clientLogo" | "job", ids: string[]) {
  const perm = model === "project" ? "projects" : model === "service" ? "services" : model === "job" ? "careers" : "content";
  await assertUser(perm);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const delegate = (db as any)[model];
  await db.$transaction(ids.map((id, order) => delegate.update({ where: { id }, data: { order } })));
  revalidateSite();
  return { ok: true };
}

/** Quick toggles from list views (visibility, featured, published, open). */
export async function toggleFlag(model: "service" | "project" | "testimonial" | "teamMember" | "faq" | "clientLogo" | "job", id: string, field: string, value: boolean) {
  const allowed: Record<string, string[]> = {
    service: ["isVisible", "isFeatured"],
    project: ["isPublished", "isFeatured", "isSample"],
    testimonial: ["isVisible"],
    teamMember: ["isVisible"],
    faq: ["isVisible"],
    clientLogo: ["isVisible"],
    job: ["isOpen"],
  };
  if (!allowed[model]?.includes(field)) return { ok: false, error: "Not allowed" };
  const perm = model === "project" ? "projects" : model === "service" ? "services" : model === "job" ? "careers" : "content";
  await assertUser(perm);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (db as any)[model].update({ where: { id }, data: { [field]: value } });
  revalidateSite();
  return { ok: true };
}

// ─────────────────────────── Careers ───────────────────────────

const jobSchema = z.object({
  id: z.string().optional(),
  title: zx.req("Title"),
  slug: zx.slug(),
  department: zx.opt(),
  location: zx.req("Location"),
  type: zx.req("Type", 40),
  summary: zx.req("Summary", 1000),
  description: zx.text(100_000),
  isOpen: zx.bool(),
  order: zx.int(),
});

export async function saveJob(values: Record<string, unknown>) {
  return mutate({
    permission: "careers",
    schema: jobSchema,
    values,
    entity: "Job",
    action: values.id ? "updated" : "created",
    run: async (d) => {
      const { id, ...data } = d;
      if (id) {
        await db.job.update({ where: { id }, data });
        return { id, label: d.title };
      }
      const j = await db.job.create({ data });
      return { id: j.id, label: d.title, redirect: "/admin/careers", message: "Job created" };
    },
  });
}

export async function deleteJob(id: string) {
  return remove({ permission: "careers", entity: "Job", run: () => db.job.delete({ where: { id } }), redirect: "/admin/careers" });
}
