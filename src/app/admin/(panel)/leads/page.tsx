import Link from "next/link";
import { Download, Search } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { leadWhere, statusTone } from "@/lib/leads";
import { Badge, EmptyState, PageHeader, Table, btn, inputClass } from "@/components/admin/ui";
import { cn, formatDate } from "@/lib/utils";

export const metadata = { title: "Leads" };

const STATUS = ["ALL", "NEW", "CONTACTED", "CLOSED"] as const;
const TYPES = ["ALL", "CONTACT", "QUOTE", "CAREER"] as const;

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  await requireUser("leads");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const where = leadWhere(sp);
  const [leads, total, counts] = await Promise.all([
    db.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * 50, take: 50 }),
    db.lead.count({ where }),
    db.lead.groupBy({ by: ["status"], _count: true }),
  ]);
  const pages = Math.ceil(total / 50);
  const qs = (patch: Record<string, string>) => {
    const p = new URLSearchParams(Object.entries({ ...sp, ...patch }).filter(([, v]) => typeof v === "string" && v && v !== "ALL") as [string, string][]);
    if (!patch.page) p.delete("page");
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const exportQs = new URLSearchParams(Object.entries(sp).filter(([, v]) => typeof v === "string") as [string, string][]).toString();

  return (
    <>
      <PageHeader
        title="Leads inbox"
        description="Contact, quote and career form submissions."
        actions={
          <a href={`/api/admin/leads/export${exportQs ? `?${exportQs}` : ""}`} className={btn.secondary}>
            <Download /> Export CSV
          </a>
        }
      />
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-4">
          <nav className="flex flex-wrap gap-1" aria-label="Filter by status">
            {STATUS.map((s) => (
              <Link key={s} href={`/admin/leads${qs({ status: s })}`} className={cn("rounded-lg px-3 py-1.5 text-sm", (sp.status ?? "ALL") === s ? "bg-brand/15 font-medium text-brand-ink" : "text-muted hover:bg-surface-2")}>
                {s.charAt(0) + s.slice(1).toLowerCase()}
                {s !== "ALL" && <span className="text-subtle"> ({counts.find((c) => c.status === s)?._count ?? 0})</span>}
              </Link>
            ))}
          </nav>
          <nav className="flex flex-wrap gap-1 border-l border-line pl-4" aria-label="Filter by type">
            {TYPES.map((t) => (
              <Link key={t} href={`/admin/leads${qs({ type: t })}`} className={cn("rounded-lg px-3 py-1.5 text-sm", (sp.type ?? "ALL") === t ? "bg-surface-2 font-medium" : "text-muted hover:bg-surface-2")}>
                {t === "ALL" ? "All types" : t.charAt(0) + t.slice(1).toLowerCase()}
              </Link>
            ))}
          </nav>
        </div>
        <form className="relative w-full lg:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-subtle" />
          {typeof sp.status === "string" && <input type="hidden" name="status" value={sp.status} />}
          {typeof sp.type === "string" && <input type="hidden" name="type" value={sp.type} />}
          <input name="q" defaultValue={typeof sp.q === "string" ? sp.q : ""} placeholder="Search name, email, message…" className={cn(inputClass, "pl-9")} />
        </form>
      </div>

      {leads.length === 0 ? (
        <EmptyState title="No leads match" text="New form submissions will appear here and are emailed to your team." />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Contact</th>
              <th>Type</th>
              <th>Interest</th>
              <th>Status</th>
              <th>Received</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id} className={l.status === "NEW" ? "font-medium" : undefined}>
                <td>
                  <Link href={`/admin/leads/${l.id}`} className="hover:text-brand-ink">
                    {l.name}
                  </Link>
                  <span className="block text-xs font-normal text-subtle">
                    {l.email}
                    {l.phone ? ` · ${l.phone}` : ""}
                  </span>
                </td>
                <td>
                  <Badge>{l.type.toLowerCase()}</Badge>
                </td>
                <td className="max-w-xs truncate font-normal text-muted">{l.service ?? l.subject ?? l.message.slice(0, 60)}</td>
                <td>
                  <Badge tone={statusTone[l.status]}>{l.status.toLowerCase()}</Badge>
                </td>
                <td className="whitespace-nowrap font-normal text-muted">{formatDate(l.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      {pages > 1 && (
        <nav className="mt-6 flex justify-center gap-2" aria-label="Pagination">
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <Link key={n} href={`/admin/leads${qs({ page: String(n) })}`} className={cn("grid size-9 place-items-center rounded-lg border text-sm", n === page ? "border-brand bg-brand text-on-brand" : "border-line-strong")}>
              {n}
            </Link>
          ))}
        </nav>
      )}
    </>
  );
}
