import Link from "next/link";
import { ResetForm } from "./reset-form";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordPage({ searchParams }: PageProps<"/admin/reset-password">) {
  const { token, email } = await searchParams;
  if (typeof token !== "string" || typeof email !== "string") {
    return (
      <p className="text-sm text-muted">
        This link is incomplete. <Link href="/admin/forgot-password" className="text-brand-ink underline">Request a new one</Link>.
      </p>
    );
  }
  return <ResetForm token={token} email={email} />;
}
