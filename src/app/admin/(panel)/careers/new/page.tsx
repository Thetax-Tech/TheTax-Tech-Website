import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { saveJob } from "@/app/admin/actions/catalog";
import { jobLayout } from "../../layouts";

export const metadata = { title: "New job" };

export default async function NewJobPage() {
  await requireUser("careers");
  return (
    <>
      <PageHeader title="New job" back={{ href: "/admin/careers", label: "Careers" }} />
      <EntityForm
        layout={jobLayout()}
        initial={{ title: "", slug: "", department: "", location: "Karachi, Pakistan", type: "Full-time", summary: "", description: "", isOpen: true, order: 0 }}
        action={saveJob}
        submitLabel="Create job"
      />
    </>
  );
}
