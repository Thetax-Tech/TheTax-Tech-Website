import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { deleteBlock, saveBlock, type BlockModel } from "@/app/admin/actions/content";
import { blockLayouts } from "../../layouts";

const LABELS: Record<BlockModel, string> = { testimonial: "testimonial", teamMember: "team member", faq: "FAQ", clientLogo: "client logo" };
const BLANK: Record<BlockModel, Record<string, unknown>> = {
  testimonial: { name: "", role: "", company: "", quote: "", rating: "5", avatar: "", order: 0, isVisible: true },
  teamMember: { name: "", role: "", bio: "", photo: "", linkedin: "", order: 0, isVisible: true },
  faq: { question: "", answer: "", group: "home", order: 0, isVisible: true },
  clientLogo: { name: "", logo: "", url: "", order: 0, isVisible: true },
};

export default async function BlockEditPage({ params }: PageProps<"/admin/content/[model]/[id]">) {
  await requireUser("content");
  const { model, id } = await params;
  if (!(model in BLANK)) notFound();
  const m = model as BlockModel;
  let initial = BLANK[m];
  if (id !== "new") {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const row = await (db as any)[m].findUnique({ where: { id } });
    if (!row) notFound();
    const { createdAt: _c, updatedAt: _u, ...rest } = row;
    initial = { ...rest, ...(m === "testimonial" ? { rating: String(row.rating) } : {}) };
    for (const k of Object.keys(initial)) if (initial[k] === null) initial[k] = "";
  }
  return (
    <>
      <PageHeader title={id === "new" ? `Add ${LABELS[m]}` : `Edit ${LABELS[m]}`} back={{ href: `/admin/content?tab=${m}`, label: "Back to list" }} />
      <div className="max-w-3xl">
        <EntityForm
          layout={blockLayouts[m]}
          initial={initial}
          action={saveBlock.bind(null, m)}
          deleteAction={id !== "new" ? deleteBlock.bind(null, m, id) : undefined}
        />
      </div>
    </>
  );
}
