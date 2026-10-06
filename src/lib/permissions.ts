/** Role-based access control. Shared by server code and the admin sidebar. */
export type Role = "SUPER_ADMIN" | "ADMIN" | "EDITOR";

export const PERMISSIONS = {
  dashboard: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  posts: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  projects: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  media: ["SUPER_ADMIN", "ADMIN", "EDITOR"],
  services: ["SUPER_ADMIN", "ADMIN"],
  content: ["SUPER_ADMIN", "ADMIN"],
  leads: ["SUPER_ADMIN", "ADMIN"],
  agent: ["SUPER_ADMIN", "ADMIN"],
  careers: ["SUPER_ADMIN", "ADMIN"],
  subscribers: ["SUPER_ADMIN", "ADMIN"],
  seo: ["SUPER_ADMIN", "ADMIN"],
  settings: ["SUPER_ADMIN", "ADMIN"],
  users: ["SUPER_ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission) {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

export const ROLE_LABELS: Record<Role, string> = { SUPER_ADMIN: "Super admin", ADMIN: "Admin", EDITOR: "Editor" };
