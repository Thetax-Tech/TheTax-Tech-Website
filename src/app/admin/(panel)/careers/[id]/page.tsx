import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { deleteJob, saveJob } from "@/app/admin/actions/catalog";
import { jobLayout } from "../../layouts";

export const metadata = { title: "Edit job" };

export default async function EditJobPage({ params }: PageProps<"/admin/careers/[id]">) {
  await requireUser("careers");
  const { id } = await params;
  const j = await db.job.findUnique({ where: { id } });
  if (!j) notFound();
  const { createdAt: _c, updatedAt, ...rest } = j;
  return (
    <>
      <PageHeader title="Edit job" description={j.title} back={{ href: "/admin/careers", label: "Careers" }} />
      <EntityForm
        key={updatedAt.toISOString()}
        layout={jobLayout()}
        initial={rest}
        action={saveJob}
        deleteAction={deleteJob.bind(null, j.id)}
        viewHref={j.isOpen ? `/careers/${j.slug}` : undefined}
      />
    </>
  );
}
