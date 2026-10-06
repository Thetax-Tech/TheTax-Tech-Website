import type { Permission } from "@/lib/permissions";

/**
 * Admin module registry. To add a new module (e.g. "Events"):
 *  1. add a Prisma model + migration,
 *  2. add pages under src/app/admin/(panel)/<key>,
 *  3. register it here (and optionally a feature flag in Settings → Modules).
 * The sidebar, permissions and dashboard shortcuts read from this list.
 */
export type AdminModule = {
  key: string;
  label: string;
  href: string;
  icon: string; // lucide icon name, see components/admin/admin-icon.tsx
  permission: Permission;
  group: "Overview" | "Content" | "Engagement" | "System";
  flag?: "careers" | "newsletter"; // hidden when the module flag is off
};

export const ADMIN_MODULES: AdminModule[] = [
  { key: "dashboard", label: "Dashboard", href: "/admin", icon: "layout-dashboard", permission: "dashboard", group: "Overview" },
  { key: "posts", label: "Blog posts", href: "/admin/posts", icon: "file-text", permission: "posts", group: "Content" },
  { key: "projects", label: "Portfolio", href: "/admin/projects", icon: "briefcase", permission: "projects", group: "Content" },
  { key: "services", label: "Services", href: "/admin/services", icon: "layers", permission: "services", group: "Content" },
  { key: "content", label: "Pages & content", href: "/admin/content", icon: "layout-template", permission: "content", group: "Content" },
  { key: "media", label: "Media library", href: "/admin/media", icon: "image", permission: "media", group: "Content" },
  { key: "leads", label: "Leads inbox", href: "/admin/leads", icon: "inbox", permission: "leads", group: "Engagement" },
  { key: "agent", label: "AI Agent", href: "/admin/agent", icon: "bot", permission: "agent", group: "Engagement" },
  { key: "careers", label: "Careers", href: "/admin/careers", icon: "users", permission: "careers", group: "Engagement", flag: "careers" },
  { key: "subscribers", label: "Newsletter", href: "/admin/subscribers", icon: "mail", permission: "subscribers", group: "Engagement", flag: "newsletter" },
  { key: "seo", label: "SEO", href: "/admin/seo", icon: "search", permission: "seo", group: "System" },
  { key: "settings", label: "Settings", href: "/admin/settings", icon: "settings", permission: "settings", group: "System" },
  { key: "users", label: "Users & roles", href: "/admin/users", icon: "shield", permission: "users", group: "System" },
];
