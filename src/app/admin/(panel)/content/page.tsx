import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { homeSections, aboutSections } from "@/content/site";
import { legalPages } from "@/content/legal";
import { Badge, EmptyState, PageHeader, Table, btn } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { DeleteButton, OrderButtons, ToggleCell } from "@/components/admin/list-controls";
import { deleteBlock, saveSections } from "@/app/admin/actions/content";
import { reorder, toggleFlag } from "@/app/admin/actions/catalog";
import { aboutLayout, homeLayout, legalLayout } from "./layouts";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pages & content" };

const TABS = [
  { key: "home", label: "Homepage" },
  { key: "about", label: "About page" },
  { key: "testimonial", label: "Testimonials" },
  { key: "teamMember", label: "Team" },
  { key: "faq", label: "FAQs" },
  { key: "clientLogo", label: "Client logos" },
  { key: "legal", label: "Legal pages" },
] as const;
type Tab = (typeof TABS)[number]["key"];

async function sectionValues(page: "home" | "about" | "legal", defaults: Record<string, unknown>) {
  const rows = await db.pageSection.findMany({ where: { page } });
  const out: Record<string, unknown> = {};
  for (const [key, def] of Object.entries(defaults)) {
    const row = rows.find((r) => r.key === key);
    out[key] = { ...(def as object), ...((row?.data as object) ?? {}), _visible: row ? row.isVisible : true };
  }
  return out;
}

export default async function ContentPage({ searchParams }: PageProps<"/admin/content">) {
  await requireUser("content");
  const { tab: raw } = await searchParams;
  const tab: Tab = TABS.some((t) => t.key === raw) ? (raw as Tab) : "home";

  return (
    <>
      <PageHeader title="Pages & content" description="Edit page copy, counters, testimonials, team, FAQs and logos. Changes go live immediately." />
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-line" aria-label="Content sections">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/content?tab=${t.key}`} className={cn("-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium", tab === t.key ? "border-brand text-brand-ink" : "border-transparent text-muted hover:text-fg")}>
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "home" && <EntityForm key="home" layout={homeLayout} initial={await sectionValues("home", homeSections)} action={saveSections.bind(null, "home")} submitLabel="Save homepage" viewHref="/" />}
      {tab === "about" && <EntityForm key="about" layout={aboutLayout} initial={await sectionValues("about", aboutSections)} action={saveSections.bind(null, "about")} submitLabel="Save About page" viewHref="/about" />}
      {tab === "legal" && <EntityForm key="legal" layout={legalLayout} initial={await sectionValues("legal", legalPages)} action={saveSections.bind(null, "legal")} submitLabel="Save legal pages" />}
      {tab !== "home" && tab !== "about" && tab !== "legal" && <BlockList model={tab} />}
    </>
  );
}

async function BlockList({ model }: { model: "testimonial" | "teamMember" | "faq" | "clientLogo" }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = await (db as any)[model].findMany({ orderBy: [{ order: "asc" }, { createdAt: "asc" }] });
  const ids = rows.map((r) => r.id);
  const add = (
    <Link href={`/admin/content/${model}/new`} className={btn.primary}>
      <Plus /> Add
    </Link>
  );
  const title = (r: Record<string, string>) => r.name ?? r.question;
  const sub = (r: Record<string, string>) =>
    model === "testimonial" ? `${r.role ?? ""}${r.company ? `, ${r.company}` : ""}` : model === "teamMember" ? r.role : model === "faq" ? r.answer?.slice(0, 90) + "…" : r.url ?? "";

  return (
    <div className="space-y-4">
      {model === "testimonial" && <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm">The starter testimonials are placeholders. Replace them with genuine client reviews before launch.</p>}
      {model === "teamMember" && <p className="rounded-lg border border-line bg-surface px-4 py-3 text-sm text-muted">The Team section on the About page appears automatically once at least one member is visible.</p>}
      <div className="flex justify-end">{add}</div>
      {rows.length === 0 ? (
        <EmptyState title="Nothing here yet" action={add} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Item</th>
              {model === "faq" && <th>Shown on</th>}
              <th>Visible</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.id}>
                <td className="w-24">
                  <OrderButtons ids={ids} index={i} action={reorder.bind(null, model)} />
                </td>
                <td>
                  <Link href={`/admin/content/${model}/${r.id}`} className="font-medium hover:text-brand-ink">
                    {title(r)}
                  </Link>
                  <span className="block max-w-xl truncate text-xs text-subtle">{sub(r)}</span>
                </td>
                {model === "faq" && (
                  <td>
                    <Badge>{r.group}</Badge>
                  </td>
                )}
                <td>
                  <ToggleCell value={r.isVisible} label="Visible" action={toggleFlag.bind(null, model, r.id, "isVisible")} />
                </td>
                <td className="text-right">
                  <Link href={`/admin/content/${model}/${r.id}`} className={btn.ghost}>
                    Edit
                  </Link>
                  <DeleteButton iconOnly action={deleteBlock.bind(null, model, r.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
