"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { mutate, remove, zx } from "@/lib/admin-actions";
import { readingTime, slugify, stripHtml, truncate } from "@/lib/utils";

const schema = z
  .object({
    id: z.string().optional(),
    title: zx.req("Title"),
    slug: zx.slug(),
    excerpt: z.string().trim().max(600).default(""),
    content: z.string().min(1, "Write some content first").max(500_000),
    coverImage: zx.opt(),
    coverAlt: zx.opt(),
    status: z.enum(["DRAFT", "PUBLISHED", "SCHEDULED"]),
    publishedAt: zx.date(),
    isFeatured: zx.bool(),
    categoryId: zx.opt(),
    tags: zx.strings(),
    seoTitle: zx.opt(),
    seoDescription: zx.text(400),
    ogImage: zx.opt(),
    faqs: zx.items({ question: z.string().default(""), answer: z.string().default("") }),
  })
  .superRefine((d, ctx) => {
    if (d.status === "SCHEDULED" && (!d.publishedAt || d.publishedAt <= new Date())) {
      ctx.addIssue({ code: "custom", path: ["publishedAt"], message: "Choose a future date to schedule" });
    }
  });

export async function savePost(values: Record<string, unknown>) {
  return mutate({
    permission: "posts",
    schema,
    values,
    entity: "Post",
    action: values.id ? "updated" : "created",
    run: async (d, userId) => {
      const publishedAt = d.status === "PUBLISHED" ? d.publishedAt ?? new Date() : d.publishedAt;
      const tagIds = await Promise.all(
        d.tags.map(async (name) => {
          const slug = slugify(name);
          const t = await db.tag.upsert({ where: { slug }, update: {}, create: { slug, name } });
          return { id: t.id };
        }),
      );
      const data = {
        title: d.title,
        slug: d.slug,
        excerpt: d.excerpt || truncate(stripHtml(d.content), 200),
        content: d.content,
        coverImage: d.coverImage,
        coverAlt: d.coverAlt,
        status: d.status,
        publishedAt,
        isFeatured: d.isFeatured,
        readingTime: readingTime(d.content),
        categoryId: d.categoryId,
        seoTitle: d.seoTitle,
        seoDescription: d.seoDescription,
        ogImage: d.ogImage,
        faqs: d.faqs.filter((f) => f.question && f.answer),
      };
      if (d.id) {
        await db.post.update({ where: { id: d.id }, data: { ...data, tags: { set: tagIds } } });
        return { id: d.id, label: d.title, message: d.status === "PUBLISHED" ? "Saved & published" : "Saved" };
      }
      const created = await db.post.create({ data: { ...data, authorId: userId, tags: { connect: tagIds } } });
      return { id: created.id, label: d.title, redirect: `/admin/posts/${created.id}`, message: "Post created" };
    },
  });
}

export async function deletePost(id: string) {
  const p = await db.post.findUnique({ where: { id }, select: { title: true } });
  return remove({ permission: "posts", entity: "Post", label: p?.title, run: () => db.post.delete({ where: { id } }), redirect: "/admin/posts" });
}

const catSchema = z.object({ id: z.string().optional(), name: zx.req("Name", 80), slug: zx.slug(), description: zx.text(500) });

export async function saveCategory(values: Record<string, unknown>) {
  return mutate({
    permission: "posts",
    schema: catSchema,
    values: { ...values, slug: values.slug || slugify(String(values.name ?? "")) },
    entity: "Category",
    action: values.id ? "updated" : "created",
    run: async (d) => {
      const { id, ...data } = d;
      const row = id ? await db.category.update({ where: { id }, data }) : await db.category.create({ data });
      return { id: row.id, label: row.name };
    },
  });
}

export async function deleteCategory(id: string) {
  return remove({ permission: "posts", entity: "Category", run: () => db.category.delete({ where: { id } }) });
}
