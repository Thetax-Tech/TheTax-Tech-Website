import {
  Bot, Briefcase, FileText, Image, Inbox, Layers, LayoutDashboard, LayoutTemplate, Mail, Search, Settings, Shield, Users, Circle, type LucideIcon,
} from "lucide-react";

const MAP: Record<string, LucideIcon> = {
  "layout-dashboard": LayoutDashboard, "file-text": FileText, briefcase: Briefcase, layers: Layers, "layout-template": LayoutTemplate,
  image: Image, inbox: Inbox, users: Users, mail: Mail, search: Search, settings: Settings, shield: Shield, bot: Bot,
};

export function AdminIcon({ name, className }: { name: string; className?: string }) {
  const Cmp = MAP[name] ?? Circle;
  return <Cmp className={className} aria-hidden />;
}
