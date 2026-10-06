import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Bot, Mail, Phone, UserRound } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { PortfolioCard } from "@/lib/agent/knowledge";
import { Badge, PageHeader, Panel, btn } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/list-controls";
import { deleteConversation } from "@/app/admin/actions/agent";
import { StatusButtons } from "./status-buttons";

export const metadata = { title: "Conversation" };

export default async function ConversationPage({ params }: PageProps<"/admin/agent/[id]">) {
  await requireUser("agent");
  const { id } = await params;
  const conv = await db.chatConversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!conv) notFound();
  const visible = conv.messages.filter((m) => (m.role !== "tool" && m.text.trim()) || (m.cards as unknown[] | null)?.length);

  return (
    <>
      <PageHeader
        title={conv.name ?? "Anonymous visitor"}
        description={
          <span className="flex flex-wrap gap-2">
            <Badge>{conv.channel}</Badge> <Badge tone={conv.status === "lead" ? "green" : conv.status === "handoff" ? "amber" : "neutral"}>{conv.status}</Badge>
            <span className="text-xs text-subtle">Started {conv.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}</span>
          </span>
        }
        back={{ href: "/admin/agent", label: "All conversations" }}
        actions={<DeleteButton action={deleteConversation.bind(null, conv.id)} confirmText="Delete this conversation permanently?" />}
      />
      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel title="Transcript">
          <ol className="space-y-4">
            {visible.map((m) => {
              const cards = (m.cards as PortfolioCard[] | null) ?? [];
              const user = m.role === "user";
              return (
                <li key={m.id} className={user ? "flex justify-end" : "flex justify-start"}>
                  <div className="max-w-[85%] space-y-2">
                    {m.text.trim() && (
                      <div className={user ? "rounded-2xl rounded-br-sm bg-brand px-4 py-2.5 text-sm text-on-brand" : "rounded-2xl rounded-bl-sm bg-surface-2 px-4 py-2.5 text-sm"}>
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      </div>
                    )}
                    {cards.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {cards.map((c) => (
                          <a key={c.slug} href={c.url} target="_blank" className="flex w-48 items-center gap-2 rounded-xl border border-line bg-bg p-2 text-xs hover:border-brand">
                            <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-surface-2">{c.image && <Image src={c.image} alt="" fill sizes="40px" className="object-cover" />}</span>
                            <span className="line-clamp-2 font-medium">{c.title}</span>
                          </a>
                        ))}
                      </div>
                    )}
                    <p className={`flex items-center gap-1 text-[10px] text-subtle ${user ? "justify-end" : ""}`}>
                      {user ? <UserRound className="size-3" /> : <Bot className="size-3" />} {m.createdAt.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </Panel>
        <div className="space-y-6">
          <Panel title="Visitor">
            <dl className="space-y-3 text-sm">
              {[
                ["Name", conv.name],
                ["Company", conv.company],
                ["Service", conv.service],
                ["Budget", conv.budget],
                ["Page", conv.pageUrl],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <dt className="text-subtle">{k}</dt>
                  <dd className="text-right">{v ?? "—"}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-5 flex flex-col gap-2">
              {conv.email && (
                <a href={`mailto:${conv.email}`} className={btn.primary}>
                  <Mail /> {conv.email}
                </a>
              )}
              {conv.phone && (
                <a href={`tel:${conv.phone}`} className={btn.secondary}>
                  <Phone /> {conv.phone}
                </a>
              )}
              {conv.leadId && (
                <Link href={`/admin/leads/${conv.leadId}`} className={btn.secondary}>
                  Open lead
                </Link>
              )}
            </div>
          </Panel>
          <StatusButtons id={conv.id} status={conv.status} />
        </div>
      </div>
    </>
  );
}
