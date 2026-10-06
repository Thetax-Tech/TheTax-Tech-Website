import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EmptyState, PageHeader, Table, btn } from "@/components/admin/ui";
import { DeleteButton, ToggleCell } from "@/components/admin/list-controls";
import { deleteJob, toggleFlag } from "@/app/admin/actions/catalog";

export const metadata = { title: "Careers" };

export default async function CareersAdminPage() {
  await requireUser("careers");
  const [jobs, applications] = await Promise.all([
    db.job.findMany({ orderBy: [{ order: "asc" }, { createdAt: "desc" }] }),
    db.lead.count({ where: { type: "CAREER", status: "NEW" } }),
  ]);
  const add = (
    <Link href="/admin/careers/new" className={btn.primary}>
      <Plus /> New job
    </Link>
  );
  return (
    <>
      <PageHeader
        title="Careers"
        description={
          <>
            Job openings shown on /careers. Applications arrive in the{" "}
            <Link href="/admin/leads?type=CAREER" className="text-brand-ink underline">
              Leads inbox
            </Link>{" "}
            ({applications} new).
          </>
        }
        actions={add}
      />
      {jobs.length === 0 ? (
        <EmptyState title="No job openings" action={add} />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Job</th>
              <th>Location</th>
              <th>Type</th>
              <th>Open</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>
                  <Link href={`/admin/careers/${j.id}`} className="font-medium hover:text-brand-ink">
                    {j.title}
                  </Link>
                  <span className="block text-xs text-subtle">{j.department}</span>
                </td>
                <td className="text-muted">{j.location}</td>
                <td className="text-muted">{j.type}</td>
                <td>
                  <ToggleCell value={j.isOpen} label="Open" action={toggleFlag.bind(null, "job", j.id, "isOpen")} />
                </td>
                <td className="text-right">
                  <Link href={`/admin/careers/${j.id}`} className={btn.ghost}>
                    Edit
                  </Link>
                  <DeleteButton iconOnly action={deleteJob.bind(null, j.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
