import {
  Award, BarChart3, Bot, Brain, Briefcase, Building, Cloud, Code, Cpu, Database, FileText, Globe, GraduationCap,
  Handshake, Headset, HeartPulse, Landmark, Layers, Lightbulb, LineChart, Lock, Mail, Megaphone, MessageCircle,
  Palette, PenTool, Rocket, Search, Settings, ShieldCheck, ShoppingBag, Smartphone, Sparkles, Target, Truck, Users,
  Workflow, Zap, type LucideIcon,
} from "lucide-react";

/** Icons selectable from the admin (service icon, industry icon, value icon...). */
export const ICONS: Record<string, LucideIcon> = {
  award: Award, "bar-chart": BarChart3, bot: Bot, brain: Brain, briefcase: Briefcase, building: Building, cloud: Cloud,
  code: Code, cpu: Cpu, database: Database, "file-text": FileText, globe: Globe, "graduation-cap": GraduationCap,
  handshake: Handshake, headset: Headset, "heart-pulse": HeartPulse, landmark: Landmark, layers: Layers,
  lightbulb: Lightbulb, "line-chart": LineChart, lock: Lock, mail: Mail, megaphone: Megaphone,
  "message-circle": MessageCircle, palette: Palette, "pen-tool": PenTool, rocket: Rocket, search: Search,
  settings: Settings, "shield-check": ShieldCheck, "shopping-bag": ShoppingBag, smartphone: Smartphone,
  sparkles: Sparkles, target: Target, truck: Truck, users: Users, workflow: Workflow, zap: Zap,
};

export const ICON_NAMES = Object.keys(ICONS);

export function Icon({ name, className, strokeWidth = 1.75 }: { name: string; className?: string; strokeWidth?: number }) {
  const Cmp = ICONS[name] ?? Sparkles;
  return <Cmp className={className} strokeWidth={strokeWidth} aria-hidden="true" />;
}
