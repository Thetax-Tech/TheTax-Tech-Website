import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { asArray } from "@/lib/utils";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import { deleteService, saveService } from "@/app/admin/actions/catalog";
import { serviceLayout } from "../../layouts";

export const metadata = { title: "Edit service" };

export default async function EditServicePage({ params }: PageProps<"/admin/services/[id]">) {
  await requireUser("services");
  const { id } = await params;
  const s = await db.service.findUnique({ where: { id } });
  if (!s) notFound();
  const { createdAt: _c, updatedAt, accent: _a, ...rest } = s;
  return (
    <>
      <PageHeader title="Edit service" description={s.name} back={{ href: "/admin/services", label: "Services" }} />
      <EntityForm
        key={updatedAt.toISOString()}
        layout={serviceLayout()}
        initial={{ ...rest, features: asArray(s.features), benefits: asArray(s.benefits), process: asArray(s.process), faqs: asArray(s.faqs) }}
        action={saveService}
        deleteAction={deleteService.bind(null, s.id)}
        viewHref={s.isVisible ? `/services/${s.slug}` : undefined}
      />
    </>
  );
}
