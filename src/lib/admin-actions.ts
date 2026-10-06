import "server-only";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { assertUser, logActivity } from "@/lib/auth";
import type { Permission } from "@/lib/permissions";
import type { FormResult } from "@/components/admin/form/types";

/** Purge every cached public page so admin edits show up immediately. */
export function revalidateSite() {
  revalidatePath("/", "layout");
}

/** Zod helpers for admin forms (empty strings → null, coercions). */
export const zx = {
  str: (max = 191) => z.string().trim().max(max),
  req: (label: string, max = 191) => z.string().trim().min(1, `${label} is required`).max(max),
  opt: (max = 191) =>
    z
      .string()
      .trim()
      .max(max)
      .nullish()
      .transform((v) => (v ? v : null)),
  text: (max = 20000) =>
    z
      .string()
      .max(max)
      .nullish()
      .transform((v) => (v && v.trim() ? v : null)),
  slug: () =>
    z
      .string()
      .trim()
      .min(1, "Slug is required")
      .max(120)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and hyphens"),
  bool: () => z.boolean().default(false),
  int: (def = 0) => z.coerce.number().int().catch(def),
  intOpt: () =>
    z
      .union([z.number(), z.string()])
      .nullish()
      .transform((v) => (v === "" || v == null || Number.isNaN(Number(v)) ? null : Math.trunc(Number(v)))),
  strings: () =>
    z
      .array(z.string())
      .default([])
      .transform((a) => a.map((s) => s.trim()).filter(Boolean)),
  items: <T extends z.ZodRawShape>(shape: T) =>
    z
      .array(z.object(shape).passthrough())
      .default([])
      .transform((a) => a.filter((it) => Object.values(it).some((v) => (typeof v === "string" ? v.trim() : v != null))) as Array<Record<string, string>>),
  date: () =>
    z
      .string()
      .nullish()
      .transform((v) => (v ? new Date(v) : null))
      .refine((d) => d === null || !Number.isNaN(d.getTime()), "Invalid date"),
};

function zodErrors(error: z.ZodError): FormResult {
  const fieldErrors: Record<string, string> = {};
  for (const i of error.issues) {
    const k = i.path.join(".") || "form";
    if (!fieldErrors[k]) fieldErrors[k] = i.message;
  }
  return { ok: false, error: Object.values(fieldErrors)[0] ?? "Please check the form.", fieldErrors };
}

/**
 * Standard admin mutation wrapper: permission check → zod parse → run → revalidate → log.
 * Maps unique-constraint violations to a friendly slug/email error.
 */
export async function mutate<S extends z.ZodType>(opts: {
  permission: Permission;
  schema: S;
  values: unknown;
  run: (data: z.output<S>, userId: string) => Promise<{ id?: string; label?: string; redirect?: string; message?: string } | void>;
  entity: string;
  action: string;
}): Promise<FormResult> {
  try {
    const user = await assertUser(opts.permission);
    const parsed = opts.schema.safeParse(opts.values);
    if (!parsed.success) return zodErrors(parsed.error);
    const res = (await opts.run(parsed.data, user.id)) || {};
    revalidateSite();
    await logActivity(user.id, opts.action, opts.entity, res.id, res.label);
    return { ok: true, redirect: res.redirect, message: res.message };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      const target = String((e.meta as { target?: unknown })?.target ?? "");
      const field = target.includes("email") ? "email" : "slug";
      return { ok: false, error: `That ${field} is already in use.`, fieldErrors: { [field]: `This ${field} is already in use` } };
    }
    console.error(`[admin:${opts.entity}]`, e);
    return { ok: false, error: (e as Error).message || "Something went wrong" };
  }
}

/** Delete wrapper with the same guarantees. */
export async function remove(opts: { permission: Permission; entity: string; label?: string; run: () => Promise<unknown>; redirect?: string }) {
  try {
    const user = await assertUser(opts.permission);
    await opts.run();
    revalidateSite();
    await logActivity(user.id, "deleted", opts.entity, null, opts.label);
    return { ok: true, redirect: opts.redirect };
  } catch (e) {
    console.error(`[admin:delete:${opts.entity}]`, e);
    return { ok: false, error: (e as Error).message || "Delete failed" };
  }
}
