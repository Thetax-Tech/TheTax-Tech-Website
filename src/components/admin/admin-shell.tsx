"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, LogOut, Menu, UserCog, X } from "lucide-react";
import { LogoMark } from "@/components/brand/logo-mark";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { AdminIcon } from "@/components/admin/admin-icon";
import { logoutAction } from "@/app/admin/actions/auth";
import type { AdminModule } from "@/lib/admin-modules";
import { cn } from "@/lib/utils";

type Props = {
  modules: AdminModule[];
  user: { name: string; email: string; roleLabel: string };
  newLeads: number;
  children: React.ReactNode;
};

export function AdminShell({ modules, user, newLeads, children }: Props) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    setOpen(false);
  }

  const groups = modules.reduce<Record<string, AdminModule[]>>((acc, m) => {
    (acc[m.group] ??= []).push(m);
    return acc;
  }, {});
  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const sidebar = (
    <nav aria-label="Admin" className="flex h-full flex-col">
      <Link href="/admin" className="flex items-center gap-3 px-5 py-5">
        <LogoMark className="h-8" />
        <span className="leading-tight">
          <span className="block font-display font-semibold">Theta X Tech</span>
          <span className="block text-xs text-subtle">Admin</span>
        </span>
      </Link>
      <div className="flex-1 space-y-6 overflow-y-auto px-3 py-2">
        {Object.entries(groups).map(([group, items]) => (
          <div key={group}>
            <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-widest text-subtle">{group}</p>
            <ul className="space-y-0.5">
              {items.map((m) => (
                <li key={m.key}>
                  <Link
                    href={m.href}
                    aria-current={isActive(m.href) ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive(m.href) ? "bg-brand/15 text-brand-ink" : "text-muted hover:bg-surface-2 hover:text-fg",
                    )}
                  >
                    <AdminIcon name={m.icon} className="size-4" />
                    <span className="flex-1">{m.label}</span>
                    {m.key === "leads" && newLeads > 0 && <span className="rounded-full bg-brand px-2 text-xs font-semibold text-on-brand">{newLeads}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-line p-3">
        <Link href="/admin/account" className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-surface-2">
          <span className="grid size-9 place-items-center rounded-full bg-brand font-semibold text-on-brand">{user.name.charAt(0)}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{user.name}</span>
            <span className="block truncate text-xs text-subtle">{user.roleLabel}</span>
          </span>
          <UserCog className="size-4 text-subtle" />
        </Link>
        <form action={logoutAction}>
          <button className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
            <LogOut className="size-4" /> Sign out
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-line bg-bg-elevated lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button aria-label="Close menu" className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 border-r border-line bg-bg-elevated">{sidebar}</aside>
        </div>
      )}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-line px-4 glass sm:px-6">
          <button className="grid size-10 place-items-center rounded-lg border border-line lg:hidden" aria-label="Open menu" onClick={() => setOpen(true)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
          <p className="hidden text-sm text-subtle sm:block">Signed in as {user.email}</p>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted hover:text-fg">
              View site <ExternalLink className="size-4" />
            </a>
            <ThemeToggle className="size-9" />
          </div>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
      </div>
    </div>
  );
}
