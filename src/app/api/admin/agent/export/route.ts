import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { toCsv } from "@/lib/csv";

/** Export chat transcripts (one row per message) honouring the dashboard filters. */
export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || !can(user.role, "agent")) return new Response("Unauthorized", { status: 401 });
  const sp = new URL(req.url).searchParams;
  const status = sp.get("status") ?? undefined;
  const channel = sp.get("channel") ?? undefined;
  const convs = await db.chatConversation.findMany({
    where: { ...(status ? { status } : {}), ...(channel ? { channel } : {}) },
    orderBy: { createdAt: "desc" },
    take: 2000,
    include: { messages: { where: { role: { in: ["user", "assistant"] } }, orderBy: { createdAt: "asc" } } },
  });
  const rows = convs.flatMap((c) =>
    c.messages
      .filter((m) => m.text.trim())
      .map((m) => [c.id, c.channel, c.status, c.name, c.email, c.phone, c.company, c.service, m.createdAt, m.role === "user" ? "Visitor" : "Agent", m.text]),
  );
  return new Response(toCsv(["Conversation", "Channel", "Status", "Name", "Email", "Phone", "Company", "Service", "Time", "From", "Message"], rows), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="thetax-chats-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "no-store",
    },
  });
}
