import Link from "next/link";
import { CheckCircle2, Download, Search, XCircle } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { AGENT_MODEL, hasAI } from "@/lib/agent/agent";
import { isOpenNow } from "@/lib/agent/knowledge";
import { Badge, EmptyState, PageHeader, Panel, Table, btn, inputClass } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import type { FormLayout } from "@/components/admin/form/types";
import { saveSettings } from "@/app/admin/actions/content";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "AI Agent" };

const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000);

const STATUS_TONE = { open: "neutral", lead: "green", handoff: "amber", closed: "blue" } as const;
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const layout: FormLayout = {
  main: [
    {
      title: "Personality",
      description: "How the assistant introduces itself and talks to visitors.",
      fields: [
        { type: "switch", name: "agent.enabled", label: "Chat assistant enabled", hint: "Shows the chat bubble on every page", full: true },
        { type: "text", name: "agent.name", label: "Assistant name", required: true },
        { type: "list", name: "agent.quickReplies", label: "Quick-reply suggestions" },
        { type: "textarea", name: "agent.greeting", label: "Greeting message", rows: 2 },
        { type: "textarea", name: "agent.tone", label: "Tone of voice", rows: 2 },
        { type: "textarea", name: "agent.instructions", label: "Extra instructions", rows: 4, hint: "e.g. promote the free automation audit this month. The assistant only answers from your Services, Portfolio, FAQs, About and Contact content — it never invents prices or promises." },
      ],
    },
    {
      title: "Business hours",
      description: "Outside these hours the assistant still helps and tells visitors a person will follow up next business day.",
      fields: [
        { type: "multiselect", name: "agent.businessHours.days", label: "Working days", options: DAYS.map((d, i) => ({ value: String(i), label: d })) },
        { type: "text", name: "agent.businessHours.open", label: "Opens (24h, HH:MM)", placeholder: "09:00" },
        { type: "text", name: "agent.businessHours.close", label: "Closes (24h, HH:MM)", placeholder: "18:00" },
        { type: "text", name: "agent.businessHours.timezone", label: "Time zone", placeholder: "Asia/Karachi" },
        { type: "textarea", name: "agent.offHoursNote", label: "Off-hours note", rows: 2 },
      ],
    },
    {
      title: "Automatic replies",
      fields: [{ type: "switch", name: "agent.autoReplyForms", label: "AI acknowledgement for contact & quote forms", hint: "Sends an instant personalised email with relevant portfolio links (via SMTP)", full: true }],
    },
  ],
};

export default async function AgentPage({ searchParams }: PageProps<"/admin/agent">) {
  await requireUser("agent");
  const sp = await searchParams;
  const tab = sp.tab === "settings" ? "settings" : "conversations";
  const settings = await getSettings();
  const status = typeof sp.status === "string" && sp.status in STATUS_TONE ? sp.status : undefined;
  const channel = typeof sp.channel === "string" ? sp.channel : undefined;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";

  const where = {
    ...(status ? { status } : {}),
    ...(channel ? { channel } : {}),
    ...(q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }, { phone: { contains: q } }, { messages: { some: { text: { contains: q } } } }] } : {}),
  };
  const [convs, counts, total7] = await Promise.all([
    tab === "conversations" ? db.chatConversation.findMany({ where, orderBy: { lastMessageAt: "desc" }, take: 100, include: { messages: { where: { role: "user" }, orderBy: { createdAt: "asc" }, take: 1, select: { text: true } } } }) : [],
    db.chatConversation.groupBy({ by: ["status"], _count: true }),
    db.chatConversation.count({ where: { createdAt: { gte: daysAgo(7) } } }),
  ]);
  const count = (s: string) => counts.find((c) => c.status === s)?._count ?? 0;
  const qs = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams(Object.entries({ status, channel, q, ...patch }).filter(([, v]) => v) as [string, string][]);
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const wa = Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);

  return (
    <>
      <PageHeader
        title="AI Agent"
        description="Conversations from the website chat, WhatsApp and form auto-replies — and how the assistant behaves."
        actions={
          <a href={`/api/admin/agent/export${qs({})}`} className={btn.secondary}>
            <Download /> Export chats (CSV)
          </a>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Panel>
          <p className="text-sm text-muted">Claude API</p>
          <p className="mt-2 flex items-center gap-2 font-semibold">
            {hasAI() ? <CheckCircle2 className="size-5 text-emerald-500" /> : <XCircle className="size-5 text-amber-500" />}
            {hasAI() ? "Connected" : "Not configured"}
          </p>
          <p className="mt-1 text-xs text-subtle">{hasAI() ? `Model: ${AGENT_MODEL}` : "Set ANTHROPIC_API_KEY — until then a basic rule-based assistant answers."}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">Status</p>
          <p className="mt-2 font-semibold">{settings.agent.enabled ? "Chat enabled" : "Chat disabled"}</p>
          <p className="mt-1 text-xs text-subtle">Team {isOpenNow(settings.agent.businessHours) ? "online now" : "offline now"} (business hours)</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">Conversations (7 days)</p>
          <p className="mt-2 font-display text-2xl font-semibold">{total7}</p>
          <p className="mt-1 text-xs text-subtle">
            {count("lead")} leads · {count("handoff")} handoffs
          </p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted">WhatsApp</p>
          <p className="mt-2 flex items-center gap-2 font-semibold">
            {wa ? <CheckCircle2 className="size-5 text-emerald-500" /> : <XCircle className="size-5 text-subtle" />}
            {wa ? "Connected" : "Not connected"}
          </p>
          <p className="mt-1 text-xs text-subtle">Optional — see README → WhatsApp agent</p>
        </Panel>
      </div>

      <nav className="mb-6 flex gap-1 border-b border-line" aria-label="AI agent sections">
        {[
          ["conversations", "Conversations"],
          ["settings", "Agent settings"],
        ].map(([k, l]) => (
          <Link key={k} href={k === "settings" ? "/admin/agent?tab=settings" : "/admin/agent"} className={cn("-mb-px border-b-2 px-4 py-2.5 text-sm font-medium", tab === k ? "border-brand text-brand-ink" : "border-transparent text-muted hover:text-fg")}>
            {l}
          </Link>
        ))}
      </nav>

      {tab === "settings" ? (
        <EntityForm
          layout={layout}
          initial={{ agent: { ...settings.agent, businessHours: { ...settings.agent.businessHours, days: settings.agent.businessHours.days.map(String) } } }}
          action={async (values) => {
            "use server";
            const a = (values.agent ?? {}) as { businessHours?: { days?: (string | number)[] } };
            if (a.businessHours?.days) a.businessHours.days = a.businessHours.days.map(Number);
            return saveSettings(values);
          }}
          submitLabel="Save agent settings"
        />
      ) : (
        <>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-1">
              {[undefined, "open", "lead", "handoff", "closed"].map((s) => (
                <Link key={s ?? "all"} href={`/admin/agent${qs({ status: s })}`} className={cn("rounded-lg px-3 py-1.5 text-sm capitalize", status === s ? "bg-brand/15 font-medium text-brand-ink" : "text-muted hover:bg-surface-2")}>
                  {s ?? "All"}
                  {s && <span className="text-subtle"> ({count(s)})</span>}
                </Link>
              ))}
              <span className="mx-2 w-px bg-line" />
              {[undefined, "web", "whatsapp", "form"].map((c) => (
                <Link key={c ?? "any"} href={`/admin/agent${qs({ channel: c })}`} className={cn("rounded-lg px-3 py-1.5 text-sm capitalize", channel === c ? "bg-surface-2 font-medium" : "text-muted hover:bg-surface-2")}>
                  {c ?? "All channels"}
                </Link>
              ))}
            </div>
            <form className="relative w-full lg:w-72">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
              {status && <input type="hidden" name="status" value={status} />}
              {channel && <input type="hidden" name="channel" value={channel} />}
              <input name="q" defaultValue={q} placeholder="Search name, email, message…" className={cn(inputClass, "pl-9")} />
            </form>
          </div>
          {convs.length === 0 ? (
            <EmptyState title="No conversations yet" text="Chats from the website widget, WhatsApp and form auto-replies appear here." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <th>Visitor</th>
                  <th>First message</th>
                  <th>Channel</th>
                  <th>Status</th>
                  <th>Msgs</th>
                  <th>Last activity</th>
                </tr>
              </thead>
              <tbody>
                {convs.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <Link href={`/admin/agent/${c.id}`} className="font-medium hover:text-brand-ink">
                        {c.name ?? "Anonymous visitor"}
                      </Link>
                      <span className="block text-xs text-subtle">{c.email ?? c.phone ?? c.pageUrl ?? "—"}</span>
                    </td>
                    <td className="max-w-xs truncate text-muted">{c.messages[0]?.text ?? "—"}</td>
                    <td>
                      <Badge>{c.channel}</Badge>
                    </td>
                    <td>
                      <Badge tone={STATUS_TONE[c.status as keyof typeof STATUS_TONE] ?? "neutral"}>{c.status}</Badge>
                    </td>
                    <td className="text-muted">{c.messageCount}</td>
                    <td className="whitespace-nowrap text-muted">{formatDate(c.lastMessageAt)}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      )}
    </>
  );
}
