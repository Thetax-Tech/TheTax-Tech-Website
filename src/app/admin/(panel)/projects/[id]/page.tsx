import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { asArray } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { deleteProject, saveProject } from "@/app/admin/actions/catalog";
import { projectLayout } from "../../layouts";

export const metadata = { title: "Edit project" };

export default async function EditProjectPage({ params }: PageProps<"/admin/projects/[id]">) {
  await requireUser("projects");
  const { id } = await params;
  const [p, services, cats] = await Promise.all([
    db.project.findUnique({ where: { id }, include: { services: { select: { id: true } } } }),
    db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.project.findMany({ distinct: ["category"], select: { category: true } }),
  ]);
  if (!p) notFound();
  const { services: linked, createdAt: _c, updatedAt, ...rest } = p;
  return (
    <>
      <PageHeader title="Edit project" description={p.title} back={{ href: "/admin/projects", label: "Portfolio" }} />
      <EntityForm
        key={updatedAt.toISOString()}
        layout={projectLayout(services, cats.map((c) => c.category))}
        initial={{ ...rest, results: asArray(p.results), techStack: asArray(p.techStack), gallery: asArray(p.gallery), services: linked.map((s) => s.id) }}
        action={saveProject}
        deleteAction={deleteProject.bind(null, p.id)}
        viewHref={p.isPublished ? `/portfolio/${p.slug}` : undefined}
      />
    </>
  );
}
