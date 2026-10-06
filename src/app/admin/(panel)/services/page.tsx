import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EmptyState, PageHeader, Table, btn } from "@/components/admin/ui";
import { DeleteButton, OrderButtons, ToggleCell } from "@/components/admin/list-controls";
import { deleteService, reorder, toggleFlag } from "@/app/admin/actions/catalog";
import { Icon } from "@/components/ui/icon";

export const metadata = { title: "Services" };

export default async function ServicesAdminPage() {
  await requireUser("services");
  const services = await db.service.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }], include: { _count: { select: { projects: true } } } });
  const ids = services.map((s) => s.id);
  const add = (
    <Link href="/admin/services/new" className={btn.primary}>
      <Plus /> New service
    </Link>
  );
  return (
    <>
      <PageHeader title="Services" description="Each service gets its own SEO landing page, mega-menu entry and footer link." actions={add} />
      {services.length === 0 ? (
        <EmptyState title="No services yet" action={add} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Service</th>
              <th>Case studies</th>
              <th>Visible</th>
              <th>Featured</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s, i) => (
              <tr key={s.id}>
                <td className="w-24">
                  <OrderButtons ids={ids} index={i} action={reorder.bind(null, "service")} />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-brand/15 text-brand-ink">
                      <Icon name={s.icon} className="size-4" />
                    </span>
                    <span>
                      <Link href={`/admin/services/${s.id}`} className="font-medium hover:text-brand-ink">
                        {s.name}
                      </Link>
                      <span className="block text-xs text-subtle">/services/{s.slug}</span>
                    </span>
                  </div>
                </td>
                <td className="text-muted">{s._count.projects}</td>
                <td>
                  <ToggleCell value={s.isVisible} label="Visible" action={toggleFlag.bind(null, "service", s.id, "isVisible")} />
                </td>
                <td>
                  <ToggleCell value={s.isFeatured} label="Featured" action={toggleFlag.bind(null, "service", s.id, "isFeatured")} />
                </td>
                <td className="text-right">
                  <Link href={`/admin/services/${s.id}`} className={btn.ghost}>
                    Edit
                  </Link>
                  <a href={`/services/${s.slug}`} target="_blank" className={btn.ghost}>
                    View
                  </a>
                  <DeleteButton iconOnly action={deleteService.bind(null, s.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
