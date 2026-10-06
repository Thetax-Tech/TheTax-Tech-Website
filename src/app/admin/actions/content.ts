"use server";

import { z } from "zod";
import { unlink } from "node:fs/promises";
import { db } from "@/lib/db";
import { mutate, remove, revalidateSite, zx } from "@/lib/admin-actions";
import { assertUser, hashPassword, logActivity, passwordProblem } from "@/lib/auth";
import { safeUploadPath } from "@/lib/uploads";
import { defaultSettings } from "@/content/site";
import type { FormResult } from "@/components/admin/form/types";
import { STATIC_SEO_PAGES } from "@/lib/seo-pages";
import { emailLayout, sendMail } from "@/lib/mail";

// ─────────────────────── Testimonials / team / FAQs / logos ───────────────────────

const blocks = {
  testimonial: z.object({
    id: z.string().optional(),
    name: zx.req("Name"),
    role: zx.opt(),
    company: zx.opt(),
    quote: zx.req("Quote", 2000),
    rating: z.coerce.number().int().min(1).max(5).catch(5),
    avatar: zx.opt(),
    order: zx.int(),
    isVisible: zx.bool(),
  }),
  teamMember: z.object({
    id: z.string().optional(),
    name: zx.req("Name"),
    role: zx.req("Role"),
    bio: zx.text(1500),
    photo: zx.opt(),
    linkedin: zx.opt(),
    order: zx.int(),
    isVisible: zx.bool(),
  }),
  faq: z.object({
    id: z.string().optional(),
    question: zx.req("Question", 500),
    answer: zx.req("Answer", 3000),
    group: zx.req("Group", 40),
    order: zx.int(),
    isVisible: zx.bool(),
  }),
  clientLogo: z.object({
    id: z.string().optional(),
    name: zx.req("Name"),
    logo: zx.opt(),
    url: zx.opt(),
    order: zx.int(),
    isVisible: zx.bool(),
  }),
};
export type BlockModel = keyof typeof blocks;

export async function saveBlock(model: BlockModel, values: Record<string, unknown>) {
  return mutate({
    permission: "content",
    schema: blocks[model],
    values,
    entity: model,
    action: values.id ? "updated" : "created",
    run: async (d) => {
      const { id, ...data } = d as { id?: string } & Record<string, unknown>;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const delegate = (db as any)[model];
      const row = id ? await delegate.update({ where: { id }, data }) : await delegate.create({ data });
      return { id: row.id, label: String(data.name ?? data.question ?? ""), redirect: `/admin/content?tab=${model}`, message: "Saved" };
    },
  });
}

export async function deleteBlock(model: BlockModel, id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return remove({ permission: "content", entity: model, run: () => (db as any)[model].delete({ where: { id } }), redirect: `/admin/content?tab=${model}` });
}

// ─────────────────────────── Page sections ───────────────────────────

/** Saves editable page copy (home/about/legal). Data is merged over the bundled defaults when rendering. */
export async function saveSections(page: "home" | "about" | "legal", values: Record<string, unknown>): Promise<FormResult> {
  try {
    const user = await assertUser("content");
    const entries = Object.entries(values).filter(([, v]) => v && typeof v === "object" && !Array.isArray(v));
    await db.$transaction(
      entries.map(([key, data], i) => {
        const { _visible, ...rest } = data as Record<string, unknown>;
        const isVisible = _visible !== false;
        return db.pageSection.upsert({
          where: { page_key: { page, key } },
          update: { data: rest as object, isVisible },
          create: { page, key, data: rest as object, isVisible, order: i },
        });
      }),
    );
    revalidateSite();
    await logActivity(user.id, "updated", "PageSection", page, `${page} page content`);
    return { ok: true, message: "Page content saved" };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─────────────────────────── SEO overrides ───────────────────────────

const seoEntry = z.object({ title: zx.opt(), description: zx.text(400), ogImage: zx.opt(), noIndex: zx.bool() });

/** values: { [key]: { title, description, ogImage, noIndex } } where key comes from STATIC_SEO_PAGES. */
export async function savePageSeo(values: Record<string, unknown>) {
  return mutate({
    permission: "seo",
    schema: z.record(z.string(), seoEntry),
    values,
    entity: "PageSeo",
    action: "updated",
    run: async (entries) => {
      const ops = [];
      for (const [key, data] of Object.entries(entries)) {
        const path = STATIC_SEO_PAGES.find((p) => p.key === key)?.path;
        if (path) ops.push(db.pageSeo.upsert({ where: { path }, update: data, create: { path, ...data } }));
      }
      await db.$transaction(ops);
      return { label: "Page SEO", message: "SEO settings saved" };
    },
  });
}

export async function sendTestEmail(): Promise<FormResult> {
  const user = await assertUser("settings");
  try {
    const sent = await sendMail({
      to: user.email,
      subject: "Theta X Tech — SMTP test",
      html: emailLayout("SMTP is working", "<p>Your website can send emails. Contact and quote forms will be delivered.</p>"),
    });
    return sent ? { ok: true, message: `Test email sent to ${user.email}` } : { ok: false, error: "SMTP is not configured yet. Fill in host, user and password, then save." };
  } catch (e) {
    return { ok: false, error: `SMTP error: ${(e as Error).message}` };
  }
}

// ─────────────────────────── Leads ───────────────────────────

export async function updateLead(id: string, data: { status?: "NEW" | "CONTACTED" | "CLOSED"; notes?: string }) {
  const user = await assertUser("leads");
  await db.lead.update({ where: { id }, data: { status: data.status, notes: data.notes } });
  await logActivity(user.id, data.status ? `lead-${data.status.toLowerCase()}` : "updated", "Lead", id);
  return { ok: true };
}

export async function deleteLead(id: string) {
  return remove({ permission: "leads", entity: "Lead", run: () => db.lead.delete({ where: { id } }), redirect: "/admin/leads" });
}

// ─────────────────────────── Media ───────────────────────────

export async function updateMedia(id: string, data: { name?: string; alt?: string }) {
  const user = await assertUser("media");
  await db.media.update({ where: { id }, data: { name: data.name?.trim().slice(0, 191) || undefined, alt: data.alt?.trim().slice(0, 191) ?? undefined } });
  await logActivity(user.id, "updated", "Media", id, data.name);
  return { ok: true };
}

export async function deleteMedia(id: string) {
  const m = await db.media.findUnique({ where: { id } });
  return remove({
    permission: "media",
    entity: "Media",
    label: m?.name,
    run: async () => {
      if (!m) return;
      await db.media.delete({ where: { id } });
      const file = safeUploadPath(m.filename);
      if (file) await unlink(file).catch(() => {});
    },
  });
}

// ─────────────────────────── Settings ───────────────────────────

type SettingKey = keyof typeof defaultSettings;
const SETTING_KEYS = Object.keys(defaultSettings) as SettingKey[];

export async function saveSettings(values: Record<string, unknown>): Promise<FormResult> {
  try {
    const user = await assertUser("settings");
    const brand = (values.theme as { brand?: string } | undefined)?.brand;
    if (brand && !/^#[0-9a-f]{6}$/i.test(brand)) return { ok: false, error: "Brand colour must be a hex value like #F7941D", fieldErrors: { "theme.brand": "Use a hex colour like #F7941D" } };
    const ops = [];
    for (const key of SETTING_KEYS) {
      const v = values[key];
      if (!v || typeof v !== "object") continue;
      let value = v as Record<string, unknown>;
      if (key === "smtp") {
        // keep the stored password when the field is left blank
        const current = await db.siteSetting.findUnique({ where: { key: "smtp" } });
        if (!value.password) value = { ...value, password: (current?.value as { password?: string } | null)?.password ?? "" };
      }
      ops.push(db.siteSetting.upsert({ where: { key }, update: { value: value as object }, create: { key, value: value as object } }));
    }
    await db.$transaction(ops);
    revalidateSite();
    await logActivity(user.id, "updated", "Settings", null, "Site settings");
    return { ok: true, message: "Settings saved" };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

// ─────────────────────────── Users ───────────────────────────

const userSchema = z.object({
  id: z.string().optional(),
  name: zx.req("Name", 80),
  email: z.email("Enter a valid email").transform((e) => e.toLowerCase()),
  role: z.enum(["SUPER_ADMIN", "ADMIN", "EDITOR"]),
  isActive: zx.bool(),
  password: z.string().optional().default(""),
});

export async function saveUser(values: Record<string, unknown>) {
  return mutate({
    permission: "users",
    schema: userSchema,
    values,
    entity: "User",
    action: values.id ? "updated" : "created",
    run: async (d, actorId) => {
      if (d.password) {
        const p = passwordProblem(d.password);
        if (p) throw new Error(`Password: ${p}`);
      } else if (!d.id) throw new Error("Set a temporary password for the new user.");
      if (d.id === actorId && (d.role !== "SUPER_ADMIN" || !d.isActive)) throw new Error("You can't demote or deactivate your own account.");
      const base = { name: d.name, email: d.email, role: d.role, isActive: d.isActive };
      if (d.id) {
        await db.user.update({
          where: { id: d.id },
          data: { ...base, ...(d.password ? { passwordHash: await hashPassword(d.password), mustChangePassword: true, sessionVersion: { increment: 1 } } : {}), ...(!d.isActive ? { sessionVersion: { increment: 1 } } : {}) },
        });
        return { id: d.id, label: d.email, redirect: "/admin/users" };
      }
      const u = await db.user.create({ data: { ...base, passwordHash: await hashPassword(d.password), mustChangePassword: true } });
      return { id: u.id, label: d.email, redirect: "/admin/users", message: "User created — they'll be asked to change the password at first login." };
    },
  });
}

export async function deleteUser(id: string) {
  const me = await assertUser("users");
  if (me.id === id) return { ok: false, error: "You can't delete your own account." };
  const supers = await db.user.count({ where: { role: "SUPER_ADMIN", isActive: true } });
  const target = await db.user.findUnique({ where: { id } });
  if (target?.role === "SUPER_ADMIN" && supers <= 1) return { ok: false, error: "At least one active super admin is required." };
  return remove({ permission: "users", entity: "User", label: target?.email, run: () => db.user.delete({ where: { id } }), redirect: "/admin/users" });
}

export async function signOutEverywhere(id: string) {
  const me = await assertUser("users");
  await db.user.update({ where: { id }, data: { sessionVersion: { increment: 1 }, ...(id === me.id ? {} : {}) } });
  await logActivity(me.id, "revoked-sessions", "User", id);
  return { ok: true };
}

// ─────────────────────────── Newsletter ───────────────────────────

export async function deleteSubscriber(id: string) {
  return remove({ permission: "subscribers", entity: "Subscriber", run: () => db.subscriber.delete({ where: { id } }) });
}

export async function revalidateAll() {
  await assertUser("settings");
  revalidateSite();
  return { ok: true };
}
