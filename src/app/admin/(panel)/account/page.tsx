import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ROLE_LABELS } from "@/lib/permissions";
import { PageHeader } from "@/components/admin/ui";
import { AccountForms } from "./account-forms";

export const metadata = { title: "My account" };

export default async function AccountPage({ searchParams }: PageProps<"/admin/account">) {
  const me = await requireUser(undefined, { allowPasswordChange: true });
  const { force } = await searchParams;
  const full = await db.user.findUniqueOrThrow({ where: { id: me.id }, select: { bio: true } });
  return (
    <>
      <PageHeader title="My account" description={`${me.email} · ${ROLE_LABELS[me.role]}`} />
      {(force || me.mustChangePassword) && (
        <p className="mb-6 rounded-lg border border-brand/50 bg-brand/10 px-4 py-3 text-sm">
          <strong>Action required:</strong> you&apos;re using a temporary password. Choose a new password to continue.
        </p>
      )}
      <AccountForms name={me.name} bio={full.bio ?? ""} twoFactorEnabled={me.twoFactorEnabled} mustChange={me.mustChangePassword} />
    </>
  );
}
