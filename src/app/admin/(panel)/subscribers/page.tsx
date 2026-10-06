import { Download } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { EmptyState, PageHeader, Table, btn } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/list-controls";
import { deleteSubscriber } from "@/app/admin/actions/content";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Newsletter" };

export default async function SubscribersPage() {
  await requireUser("subscribers");
  const subs = await db.subscriber.findMany({ orderBy: { createdAt: "desc" }, take: 1000 });
  return (
    <>
      <PageHeader
        title="Newsletter subscribers"
        description="People who signed up in the footer. Export to CSV to import into Mailchimp, Brevo or similar."
        actions={
          <a href="/api/admin/subscribers/export" className={btn.secondary}>
            <Download /> Export CSV
          </a>
        }
      />
      {subs.length === 0 ? (
        <EmptyState title="No subscribers yet" />
      ) : (
        <Table>
          <thead>
            <tr>
              <th>Email</th>
              <th>Subscribed</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s) => (
              <tr key={s.id}>
                <td>{s.email}</td>
                <td className="text-muted">{formatDate(s.createdAt)}</td>
                <td className="text-right">
                  <DeleteButton iconOnly action={deleteSubscriber.bind(null, s.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </>
  );
}
