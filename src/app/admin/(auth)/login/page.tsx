import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { hasDatabase } from "@/lib/db";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (await getCurrentUser()) redirect("/admin");
  const { next, reset } = await searchParams;
  return (
    <>
      {!hasDatabase && (
        <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
          Database not connected — set <code>DATABASE_URL</code> in <code>.env</code>, then run <code>npm run db:setup</code>.
        </p>
      )}
      <LoginForm next={typeof next === "string" ? next : undefined} notice={reset ? "Password updated — please sign in." : undefined} />
    </>
  );
}
