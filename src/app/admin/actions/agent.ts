"use server";

import { db } from "@/lib/db";
import { assertUser, logActivity } from "@/lib/auth";
import { remove } from "@/lib/admin-actions";

const STATUSES = ["open", "lead", "handoff", "closed"] as const;

export async function setConversationStatus(id: string, status: (typeof STATUSES)[number]) {
  const user = await assertUser("agent");
  if (!STATUSES.includes(status)) return { ok: false, error: "Invalid status" };
  await db.chatConversation.update({ where: { id }, data: { status } });
  await logActivity(user.id, `chat-${status}`, "Conversation", id);
  return { ok: true };
}

export async function deleteConversation(id: string) {
  return remove({ permission: "agent", entity: "Conversation", run: () => db.chatConversation.delete({ where: { id } }), redirect: "/admin/agent" });
}
