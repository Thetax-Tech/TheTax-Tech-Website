import "server-only";
import { randomUUID } from "node:crypto";
import type Anthropic from "@anthropic-ai/sdk";
import { db, hasDatabase } from "@/lib/db";
import type { PortfolioCard } from "@/lib/agent/knowledge";

/**
 * Conversation persistence. MySQL in production; an in-memory fallback keeps the chat usable in
 * local development without a database. Message `content` is stored exactly as the API returned it
 * so history replays unchanged (append-only).
 */
export type StoredMessage = { role: "user" | "assistant" | "tool"; content: unknown; text: string; cards?: PortfolioCard[] | null; createdAt: Date };
export type ConversationMeta = {
  id: string;
  channel: string;
  visitorId: string | null;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  budget?: string | null;
  status: string;
  leadId?: string | null;
  pageUrl?: string | null;
};

const mem = new Map<string, { meta: ConversationMeta; messages: StoredMessage[] }>();

export async function createConversation(data: { channel: string; visitorId: string | null; pageUrl?: string | null; ip?: string | null; userAgent?: string | null }): Promise<ConversationMeta> {
  if (hasDatabase) {
    const c = await db.chatConversation.create({ data: { channel: data.channel, visitorId: data.visitorId, pageUrl: data.pageUrl ?? null, ip: data.ip ?? null, userAgent: data.userAgent?.slice(0, 500) ?? null } });
    return c;
  }
  const meta: ConversationMeta = { id: randomUUID(), channel: data.channel, visitorId: data.visitorId, status: "open", pageUrl: data.pageUrl };
  mem.set(meta.id, { meta, messages: [] });
  return meta;
}

export async function getConversation(id: string): Promise<ConversationMeta | null> {
  if (hasDatabase) return db.chatConversation.findUnique({ where: { id } });
  return mem.get(id)?.meta ?? null;
}

export async function findConversationByVisitor(channel: string, visitorId: string) {
  if (hasDatabase) return db.chatConversation.findFirst({ where: { channel, visitorId }, orderBy: { lastMessageAt: "desc" } });
  for (const v of mem.values()) if (v.meta.channel === channel && v.meta.visitorId === visitorId) return v.meta;
  return null;
}

export async function updateConversation(id: string, data: Partial<Omit<ConversationMeta, "id">>) {
  if (hasDatabase) return void (await db.chatConversation.update({ where: { id }, data }));
  const c = mem.get(id);
  if (c) Object.assign(c.meta, data);
}

export async function getMessages(id: string): Promise<StoredMessage[]> {
  if (hasDatabase) {
    const rows = await db.chatMessage.findMany({ where: { conversationId: id }, orderBy: { createdAt: "asc" } });
    return rows.map((r) => ({ role: r.role as StoredMessage["role"], content: r.content, text: r.text, cards: (r.cards as PortfolioCard[] | null) ?? null, createdAt: r.createdAt }));
  }
  return mem.get(id)?.messages ?? [];
}

export async function addMessage(id: string, msg: Omit<StoredMessage, "createdAt">) {
  if (hasDatabase) {
    await db.$transaction([
      db.chatMessage.create({ data: { conversationId: id, role: msg.role, content: msg.content as object, text: msg.text, cards: (msg.cards ?? undefined) as object | undefined } }),
      db.chatConversation.update({ where: { id }, data: { messageCount: { increment: 1 }, lastMessageAt: new Date() } }),
    ]);
    return;
  }
  mem.get(id)?.messages.push({ ...msg, createdAt: new Date() });
}

/** Rebuild the Messages API history from stored rows (tool results are user-role turns). */
export function toApiMessages(messages: StoredMessage[]): Anthropic.Beta.BetaMessageParam[] {
  return messages.map((m) => ({
    role: m.role === "assistant" ? "assistant" : "user",
    content: m.content as Anthropic.Beta.BetaMessageParam["content"],
  }));
}

/** Plain-text transcript for emails / exports. */
export function transcript(messages: StoredMessage[]) {
  return messages
    .filter((m) => m.role !== "tool" && m.text.trim())
    .map((m) => `${m.role === "user" ? "Visitor" : "Agent"}: ${m.text}`)
    .join("\n\n");
}
