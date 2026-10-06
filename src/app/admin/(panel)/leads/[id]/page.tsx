import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, PageHeader, Panel, btn } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/list-controls";
import { WhatsAppIcon } from "@/components/ui/brand-icons";
import { deleteLead } from "@/app/admin/actions/content";
import { LeadControls } from "./lead-controls";
import { statusTone } from "@/lib/leads";

export const metadata = { title: "Lead" };

export default async function LeadPage({ params }: PageProps<"/admin/leads/[id]">) {
  await requireUser("leads");
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) notFound();

  const facts = [
    ["Type", lead.type.toLowerCase()],
    ["Company", lead.company],
    ["Service", lead.service],
    ["Budget", lead.budget],
    ["Timeline", lead.timeline],
    ["Subject", lead.subject],
    ["Submitted from", lead.sourceUrl],
    ["Received", lead.createdAt.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })],
  ].filter(([, v]) => v) as [string, string][];
  const wa = lead.phone ? `https://wa.me/${lead.phone.replace(/\D/g, "").replace(/^0/, "92")}` : null;

  return (
    <>
      <PageHeader
        title={lead.name}
        description={<Badge tone={statusTone[lead.status]}>{lead.status.toLowerCase()}</Badge>}
        back={{ href: "/admin/leads", label: "All leads" }}
        actions={<DeleteButton action={deleteLead.bind(null, lead.id)} confirmText="Delete this lead permanently?" />}
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Message">
            <p className="whitespace-pre-wrap leading-relaxed">{lead.message}</p>
          </Panel>
          <Panel title="Details">
            <dl className="grid gap-4 sm:grid-cols-2">
              {facts.map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs uppercase tracking-wider text-subtle">{k}</dt>
                  <dd className="mt-1 break-words text-sm">{v}</dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
        <div className="space-y-6">
          <Panel title="Reply">
            <div className="flex flex-col gap-2">
              <a href={`mailto:${lead.email}?subject=${encodeURIComponent("Re: your enquiry — Theta X Tech")}`} className={btn.primary}>
                <Mail /> {lead.email}
              </a>
              {lead.phone && (
                <a href={`tel:${lead.phone}`} className={btn.secondary}>
                  <Phone /> {lead.phone}
                </a>
              )}
              {wa && (
                <a href={wa} target="_blank" rel="noopener noreferrer" className={btn.secondary}>
                  <WhatsAppIcon /> WhatsApp
                </a>
              )}
            </div>
          </Panel>
          <LeadControls id={lead.id} status={lead.status} notes={lead.notes ?? ""} />
        </div>
      </div>
    </>
  );
}
