import type { Prisma } from "@/generated/prisma/client";

const STATUS = ["ALL", "NEW", "CONTACTED", "CLOSED"] as const;
const TYPES = ["ALL", "CONTACT", "QUOTE", "CAREER"] as const;
export const statusTone = { NEW: "brand", CONTACTED: "blue", CLOSED: "neutral" } as const;

export function leadWhere(sp: Record<string, string | string[] | undefined>): Prisma.LeadWhereInput {
  const status = STATUS.includes(sp.status as never) && sp.status !== "ALL" ? (sp.status as "NEW") : undefined;
  const type = TYPES.includes(sp.type as never) && sp.type !== "ALL" ? (sp.type as "CONTACT") : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  return {
    ...(status ? { status } : {}),
    ...(type ? { type } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { company: { contains: q } }, { message: { contains: q } }, { phone: { contains: q } }] } : {}),
  };
}

