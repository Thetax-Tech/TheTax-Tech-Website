import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { saveService } from "@/app/admin/actions/catalog";
import { serviceLayout } from "../../layouts";

export const metadata = { title: "New service" };

export default async function NewServicePage() {
  await requireUser("services");
  return (
    <>
      <PageHeader title="New service" back={{ href: "/admin/services", label: "Services" }} />
      <EntityForm
        layout={serviceLayout()}
        initial={{
          name: "", slug: "", icon: "sparkles", tagline: "", shortDescription: "", answerQuestion: "", answer: "", problem: "", solution: "",
          features: [], benefits: [], process: [], faqs: [], longDescription: "", image: "", order: 99, isVisible: true, isFeatured: false,
          seoTitle: "", seoDescription: "", seoKeywords: "", ogImage: "",
        }}
        action={saveService}
        submitLabel="Create service"
      />
    </>
  );
}
