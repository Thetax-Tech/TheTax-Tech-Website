import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { Badge, EmptyState, PageHeader, Table, btn } from "@/components/admin/ui";
import { DeleteButton, OrderButtons, ToggleCell } from "@/components/admin/list-controls";
import { deleteProject, reorder, toggleFlag } from "@/app/admin/actions/catalog";

export const metadata = { title: "Portfolio" };

export default async function ProjectsPage() {
  await requireUser("projects");
  const projects = await db.project.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] });
  const ids = projects.map((p) => p.id);
  const add = (
    <Link href="/admin/projects/new" className={btn.primary}>
      <Plus /> New project
    </Link>
  );
  return (
    <>
      <PageHeader title="Portfolio" description="Case studies shown on /portfolio, service pages and the homepage. Items marked “sample” are concept projects — edit them with real work or delete them." actions={add} />
      {projects.length === 0 ? (
        <EmptyState title="No projects yet" action={add} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Project</th>
              <th>Category</th>
              <th>Published</th>
              <th>Featured</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p, i) => (
              <tr key={p.id}>
                <td className="w-24">
                  <OrderButtons ids={ids} index={i} action={reorder.bind(null, "project")} />
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    <span className="relative block h-10 w-14 shrink-0 overflow-hidden rounded-md bg-surface-2">
                      {p.coverImage && <Image src={p.coverImage} alt="" fill sizes="56px" className="object-cover" />}
                    </span>
                    <span>
                      <Link href={`/admin/projects/${p.id}`} className="font-medium hover:text-brand-ink">
                        {p.title}
                      </Link>
                      <span className="block text-xs text-subtle">
                        {p.client ?? "—"} · {p.year ?? ""}
                      </span>
                    </span>
                  </div>
                </td>
                <td>
                  <Badge>{p.category}</Badge> {p.isSample && <Badge tone="amber">sample</Badge>}
                </td>
                <td>
                  <ToggleCell value={p.isPublished} label="Published" action={toggleFlag.bind(null, "project", p.id, "isPublished")} />
                </td>
                <td>
                  <ToggleCell value={p.isFeatured} label="Featured" action={toggleFlag.bind(null, "project", p.id, "isFeatured")} />
                </td>
                <td className="text-right">
                  <Link href={`/admin/projects/${p.id}`} className={btn.ghost}>
                    Edit
                  </Link>
                  <DeleteButton iconOnly action={deleteProject.bind(null, p.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
