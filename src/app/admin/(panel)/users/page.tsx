import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABELS, PERMISSIONS } from "@/lib/permissions";
import { Badge, PageHeader, Panel, Table, btn } from "@/components/admin/ui";
import { DeleteButton } from "@/components/admin/list-controls";
import { deleteUser } from "@/app/admin/actions/content";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Users & roles" };

export default async function UsersPage() {
  const me = await requireUser("users");
  const users = await db.user.findMany({ orderBy: { createdAt: "asc" } });
  return (
    <>
      <PageHeader
        title="Users & roles"
        description="Invite teammates and control what they can edit."
        actions={
          <Link href="/admin/users/new" className={btn.primary}>
            <Plus /> Add user
          </Link>
        }
      />
      <Table>
        <thead>
          <tr>
            <th>User</th>
            <th>Role</th>
            <th>Status</th>
            <th>2FA</th>
            <th>Last login</th>
            <th className="text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id}>
              <td>
                <Link href={`/admin/users/${u.id}`} className="font-medium hover:text-brand-ink">
                  {u.name} {u.id === me.id && <span className="text-xs text-subtle">(you)</span>}
                </Link>
                <span className="block text-xs text-subtle">{u.email}</span>
              </td>
              <td>
                <Badge tone={u.role === "SUPER_ADMIN" ? "brand" : u.role === "ADMIN" ? "blue" : "neutral"}>{ROLE_LABELS[u.role]}</Badge>
              </td>
              <td>
                {u.isActive ? <Badge tone="green">active</Badge> : <Badge tone="red">disabled</Badge>}
                {u.mustChangePassword && <Badge tone="amber">temp password</Badge>}
              </td>
              <td>{u.twoFactorEnabled ? <Badge tone="green">on</Badge> : <Badge>off</Badge>}</td>
              <td className="text-muted">{u.lastLoginAt ? formatDate(u.lastLoginAt) : "Never"}</td>
              <td className="text-right">
                <Link href={`/admin/users/${u.id}`} className={btn.ghost}>
                  Edit
                </Link>
                {u.id !== me.id && <DeleteButton iconOnly action={deleteUser.bind(null, u.id)} confirmText={`Delete ${u.email}?`} />}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      <Panel title="What each role can do" className="mt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wider text-subtle">
                <th className="py-2">Area</th>
                {Object.values(ROLE_LABELS).map((r) => (
                  <th key={r} className="py-2">
                    {r}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(PERMISSIONS).map(([perm, roles]) => (
                <tr key={perm} className="border-t border-line">
                  <td className="py-2 capitalize">{perm}</td>
                  {(["SUPER_ADMIN", "ADMIN", "EDITOR"] as const).map((r) => (
                    <td key={r} className="py-2">
                      {(roles as readonly string[]).includes(r) ? "✓" : <span className="text-subtle">—</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </>
  );
}
