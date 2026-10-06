import Link from "next/link";
import { ArrowUpRight, Briefcase, FileText, Inbox, Layers, PenSquare, Plus, Users } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getSettings } from "@/lib/data";
import { can } from "@/lib/permissions";
import { Badge, PageHeader, Panel, btn } from "@/components/admin/ui";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Dashboard" };

const daysAgo = (n: number) => new Date(Date.now() - n * 86400_000);

function timeAgo(d: Date) {
  const s = Math.round((Date.now() - d.getTime()) / 1000);
  if (s < 60) return "just now";
  if (s < 3600) return `${Math.round(s / 60)}m ago`;
  if (s < 86400) return `${Math.round(s / 3600)}h ago`;
  return formatDate(d);
}

export default async function DashboardPage({ searchParams }: PageProps<"/admin">) {
  const user = await requireUser("dashboard");
  const { denied } = await searchParams;
  const since = daysAgo(30);
  const showLeads = can(user.role, "leads");

  const [settings, newLeads, leads30, totalLeads, published, drafts, scheduled, projects, services, subscribers, recentLeads, activity, leadsByDay] = await Promise.all([
    getSettings(),
    showLeads ? db.lead.count({ where: { status: "NEW" } }) : 0,
    showLeads ? db.lead.count({ where: { createdAt: { gte: since } } }) : 0,
    showLeads ? db.lead.count() : 0,
    db.post.count({ where: { status: "PUBLISHED" } }),
    db.post.count({ where: { status: "DRAFT" } }),
    db.post.count({ where: { status: "SCHEDULED", publishedAt: { gt: new Date() } } }),
    db.project.count({ where: { isPublished: true } }),
    db.service.count({ where: { isVisible: true } }),
    db.subscriber.count({ where: { isActive: true } }),
    showLeads ? db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6 }) : [],
    db.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 10, include: { user: { select: { name: true } } } }),
    showLeads ? db.lead.findMany({ where: { createdAt: { gte: daysAgo(14) } }, select: { createdAt: true } }) : [],
  ]);

  // 14-day lead sparkline
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = daysAgo(13 - i);
    const key = d.toISOString().slice(0, 10);
    return { key, label: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }), count: leadsByDay.filter((l) => l.createdAt.toISOString().slice(0, 10) === key).length };
  });
  const max = Math.max(1, ...days.map((d) => d.count));

  const stats = [
    ...(showLeads ? [{ label: "New leads", value: newLeads, sub: `${leads30} in last 30 days`, href: "/admin/leads?status=NEW", icon: Inbox, accent: true }] : []),
    { label: "Published posts", value: published, sub: `${drafts} drafts · ${scheduled} scheduled`, href: "/admin/posts", icon: FileText },
    { label: "Portfolio items", value: projects, sub: "Published case studies", href: "/admin/projects", icon: Briefcase },
    { label: "Active services", value: services, sub: settings.modules.newsletter ? `${subscribers} newsletter subscribers` : "Visible on site", href: "/admin/services", icon: Layers },
  ];

  return (
    <>
      <PageHeader
        title={`Welcome back, ${user.name.split(" ")[0]}`}
        description="Here's what's happening on your website."
        actions={
          <>
            <Link href="/admin/posts/new" className={btn.primary}>
              <Plus /> New post
            </Link>
            <Link href="/admin/projects/new" className={btn.secondary}>
              <Plus /> New project
            </Link>
          </>
        }
      />
      {denied && <p className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">You don&apos;t have permission to open that section.</p>}
      {user.mustChangePassword && (
        <p className="mb-6 rounded-lg border border-brand/40 bg-brand/10 px-4 py-3 text-sm">
          Please <Link href="/admin/account?force=1" className="font-semibold text-brand-ink underline">change your temporary password</Link> before continuing.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, sub, href, icon: Ico, accent }) => (
          <Link key={label} href={href} className="group rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-brand/50">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">{label}</span>
              <span className={accent ? "grid size-9 place-items-center rounded-lg bg-brand text-on-brand" : "grid size-9 place-items-center rounded-lg bg-surface-2 text-brand-ink"}>
                <Ico className="size-4" />
              </span>
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{value}</p>
            <p className="mt-1 text-xs text-subtle">{sub}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {showLeads && (
          <Panel title="Leads — last 14 days" description={`${totalLeads} total enquiries`} actions={<Link href="/admin/leads" className="text-sm text-brand-ink hover:underline">Open inbox</Link>}>
            <div className="flex h-36 items-end gap-1.5" role="img" aria-label="Bar chart of leads per day for the last 14 days">
              {days.map((d) => (
                <div key={d.key} className="group relative flex h-full flex-1 flex-col items-center justify-end">
                  <span className="absolute -top-6 hidden rounded bg-fg px-1.5 py-0.5 text-[10px] text-bg group-hover:block">{d.count}</span>
                  <span className="w-full rounded-t bg-gradient-to-t from-brand/50 to-brand" style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.25 }} />
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-subtle">
              <span>{days[0].label}</span>
              <span>{days[13].label}</span>
            </div>
            <ul className="mt-6 divide-y divide-line">
              {recentLeads.length === 0 && <li className="py-3 text-sm text-muted">No enquiries yet.</li>}
              {recentLeads.map((l) => (
                <li key={l.id}>
                  <Link href={`/admin/leads/${l.id}`} className="flex items-center gap-3 py-3 hover:text-brand-ink">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-2 text-sm font-semibold">{l.name.charAt(0)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{l.name}</span>
                      <span className="block truncate text-xs text-subtle">{l.service ?? l.subject ?? l.message.slice(0, 60)}</span>
                    </span>
                    <Badge tone={l.status === "NEW" ? "brand" : l.status === "CONTACTED" ? "blue" : "neutral"}>{l.status.toLowerCase()}</Badge>
                    <span className="hidden w-16 text-right text-xs text-subtle sm:block">{timeAgo(l.createdAt)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <div className="space-y-6">
          <Panel title="Quick actions">
            <div className="grid grid-cols-2 gap-2">
              {[
                { href: "/admin/posts/new", label: "Write a post", icon: PenSquare },
                { href: "/admin/projects/new", label: "Add project", icon: Briefcase },
                ...(can(user.role, "services") ? [{ href: "/admin/services/new", label: "Add service", icon: Layers }] : []),
                ...(can(user.role, "content") ? [{ href: "/admin/content", label: "Edit homepage", icon: FileText }] : []),
                ...(can(user.role, "users") ? [{ href: "/admin/users", label: "Manage users", icon: Users }] : []),
              ].map(({ href, label, icon: Ico }) => (
                <Link key={href} href={href} className="flex items-center gap-2 rounded-xl border border-line p-3 text-sm font-medium transition-colors hover:border-brand hover:text-brand-ink">
                  <Ico className="size-4" /> {label}
                </Link>
              ))}
            </div>
          </Panel>
          <Panel title="Recent activity">
            <ul className="space-y-3">
              {activity.length === 0 && <li className="text-sm text-muted">No activity yet.</li>}
              {activity.map((a) => (
                <li key={a.id} className="flex gap-3 text-sm">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-brand" />
                  <span className="min-w-0 flex-1">
                    <span className="font-medium">{a.user?.name ?? "System"}</span> <span className="text-muted">{a.action.replace(/-/g, " ")}</span>{" "}
                    <span className="text-muted">{a.entity.toLowerCase()}</span> {a.label && <span className="font-medium">“{a.label}”</span>}
                    <span className="block text-xs text-subtle">{timeAgo(a.createdAt)}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Panel>
          <Panel title="Analytics">
            {settings.analytics.gaId ? (
              <a href="https://analytics.google.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-brand-ink hover:underline">
                Open Google Analytics ({settings.analytics.gaId}) <ArrowUpRight className="size-4" />
              </a>
            ) : (
              <p className="text-sm text-muted">
                Connect Google Analytics in <Link href="/admin/settings" className="text-brand-ink underline">Settings → Analytics</Link> to track visits.
              </p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
