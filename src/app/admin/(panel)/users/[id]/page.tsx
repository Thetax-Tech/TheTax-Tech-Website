import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import type { FormLayout } from "@/components/admin/form/types";
import { deleteUser, saveUser } from "@/app/admin/actions/content";

export const metadata = { title: "User" };

function layout(isNew: boolean): FormLayout {
  return {
    main: [
      {
        title: "Account",
        fields: [
          { type: "text", name: "name", label: "Full name", required: true },
          { type: "email", name: "email", label: "Email (login)", required: true },
          {
            type: "select",
            name: "role",
            label: "Role",
            required: true,
            options: [
              { value: "EDITOR", label: "Editor — blog, portfolio, media" },
              { value: "ADMIN", label: "Admin — everything except users" },
              { value: "SUPER_ADMIN", label: "Super admin — full access" },
            ],
          },
          { type: "switch", name: "isActive", label: "Active", hint: "Disabled users can't sign in" },
          {
            type: "password",
            name: "password",
            label: isNew ? "Temporary password" : "Set a new temporary password",
            required: isNew,
            hint: "Min. 10 characters with upper/lower case and a number. The user must change it at first login.",
            full: true,
          },
        ],
      },
    ],
  };
}

export default async function UserPage({ params }: PageProps<"/admin/users/[id]">) {
  const me = await requireUser("users");
  const { id } = await params;
  const isNew = id === "new";
  const user = isNew ? null : await db.user.findUnique({ where: { id } });
  if (!isNew && !user) notFound();
  return (
    <>
      <PageHeader title={isNew ? "Add user" : `Edit ${user!.name}`} back={{ href: "/admin/users", label: "Users" }} />
      <div className="max-w-3xl">
        <EntityForm
          layout={layout(isNew)}
          initial={user ? { id: user.id, name: user.name, email: user.email, role: user.role, isActive: user.isActive, password: "" } : { name: "", email: "", role: "EDITOR", isActive: true, password: "" }}
          action={saveUser}
          submitLabel={isNew ? "Create user" : "Save"}
          deleteAction={user && user.id !== me.id ? deleteUser.bind(null, user.id) : undefined}
        />
      </div>
    </>
  );
}
