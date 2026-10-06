import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { ADMIN_MODULES } from "@/lib/admin-modules";
import { can, ROLE_LABELS } from "@/lib/permissions";
import { AdminShell } from "@/components/admin/admin-shell";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser(undefined, { allowPasswordChange: true });
  const [settings, newLeads] = await Promise.all([getSettings(), can(user.role, "leads") ? db.lead.count({ where: { status: "NEW" } }) : 0]);
  const modules = ADMIN_MODULES.filter((m) => can(user.role, m.permission) && (!m.flag || settings.modules[m.flag]));

  return (
    <AdminShell modules={modules} user={{ name: user.name, email: user.email, roleLabel: ROLE_LABELS[user.role] }} newLeads={newLeads}>
      {children}
    </AdminShell>
  );
}
