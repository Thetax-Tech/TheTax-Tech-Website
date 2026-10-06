import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { saveProject } from "@/app/admin/actions/catalog";
import { projectLayout } from "../../layouts";

export const metadata = { title: "New project" };

export default async function NewProjectPage() {
  await requireUser("projects");
  const [services, cats] = await Promise.all([
    db.service.findMany({ orderBy: { order: "asc" }, select: { id: true, name: true } }),
    db.project.findMany({ distinct: ["category"], select: { category: true } }),
  ]);
  return (
    <>
      <PageHeader title="New project" back={{ href: "/admin/projects", label: "Portfolio" }} />
      <EntityForm
        layout={projectLayout(services, cats.map((c) => c.category))}
        initial={{
          title: "", slug: "", summary: "", category: "AI Automation", client: "", industry: "", year: new Date().getFullYear(), problem: "", solution: "", description: "",
          results: [], techStack: [], services: [], coverImage: "", gallery: [], liveUrl: "", isPublished: true, isFeatured: false, isSample: false, order: 0, seoTitle: "", seoDescription: "", ogImage: "",
        }}
        action={saveProject}
        submitLabel="Create project"
      />
    </>
  );
}
