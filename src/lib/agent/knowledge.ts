import "server-only";
import { getAboutSections, getFaqs, getProjects, getServices, getSettings, type ProjectVM } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";
import type { Settings } from "@/content/site";

/**
 * The agent's knowledge base, rebuilt from live CMS data (services, portfolio, FAQs, About,
 * contact). Edits in the dashboard flow into the agent automatically.
 * Output is deterministic for the same content so it caches well as a system-prompt prefix.
 */
export async function buildKnowledge() {
  const [settings, services, projects, faqs, about] = await Promise.all([getSettings(), getServices(), getProjects(), getFaqs(), getAboutSections()]);
  const c = settings.contact;

  const lines: string[] = [
    `# ${settings.site.name} (${settings.site.legalName})`,
    settings.site.description,
    "",
    "## Contact",
    `- Address: ${c.street}, ${c.city}, ${c.country}`,
    `- Phone / WhatsApp: ${c.phone}`,
    `- Email: ${c.email}`,
    `- Office hours: ${c.hours} (Pakistan Standard Time)`,
    `- Free consultation / quote form: ${absoluteUrl("/get-a-quote")}`,
    "",
    "## About",
    about.story?.answer ?? "",
    about.mission ? `Mission: ${about.mission.text}` : "",
    about.whyUs ? `Why clients choose us: ${about.whyUs.items.map((w) => w.title).join("; ")}.` : "",
    "",
    "## Services",
  ];
  for (const s of services) {
    lines.push(`### ${s.name} — ${absoluteUrl(`/services/${s.slug}`)}`);
    lines.push(s.answer || s.shortDescription);
    if (s.features.length) lines.push(`Includes: ${s.features.map((f) => f.title).join("; ")}.`);
    if (s.process.length) lines.push(`Process: ${s.process.map((p) => p.title).join(" → ")}.`);
    for (const f of s.faqs) lines.push(`Q: ${f.question} A: ${f.answer}`);
    lines.push("");
  }
  lines.push("## Portfolio (use the search_portfolio tool to share project cards)");
  for (const p of projects) {
    lines.push(`- [${p.category}] ${p.title}${p.isSample ? " (concept/sample project — not a real client)" : ""}: ${p.summary}`);
  }
  lines.push("", "## FAQ");
  for (const f of faqs) lines.push(`Q: ${f.question}\nA: ${f.answer}`);

  return lines.filter((l) => l !== undefined).join("\n");
}

export function isOpenNow(hours: Settings["agent"]["businessHours"], now = new Date()) {
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: hours.timezone || "Asia/Karachi", weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false });
  const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
  const day = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday);
  const hm = `${parts.hour}:${parts.minute}`;
  return hours.days.includes(day) && hm >= hours.open && hm < hours.close;
}

export type PortfolioCard = { slug: string; title: string; category: string; image: string | null; result: string | null; url: string; isSample: boolean };

export function toCard(p: ProjectVM): PortfolioCard {
  const r = p.results[0];
  return {
    slug: p.slug,
    title: p.title,
    category: p.category,
    image: p.coverImage,
    result: r ? `${r.value} — ${r.label}` : null,
    url: `/portfolio/${p.slug}`,
    isSample: p.isSample,
  };
}

/** Keyword/category search over the live portfolio. */
export async function searchPortfolio(query: string, category?: string, limit = 3): Promise<PortfolioCard[]> {
  const projects = await getProjects();
  const terms = query.toLowerCase().split(/[^a-z0-9/]+/).filter((t) => t.length > 2);
  const cat = category?.toLowerCase();
  const scored = projects
    .map((p) => {
      const hay = `${p.title} ${p.category} ${p.industry ?? ""} ${p.summary} ${p.techStack.join(" ")} ${p.services.map((s) => s.name).join(" ")}`.toLowerCase();
      let score = terms.reduce((n, t) => n + (hay.includes(t) ? 1 : 0), 0);
      if (cat && p.category.toLowerCase().includes(cat)) score += 5;
      if (p.isFeatured) score += 0.5;
      return { p, score };
    })
    .filter((x) => x.score > 0 || (!terms.length && !cat))
    .sort((a, b) => b.score - a.score);
  const list = (scored.length ? scored.map((x) => x.p) : projects.filter((p) => p.isFeatured)).slice(0, Math.min(Math.max(limit, 1), 6));
  return list.map(toCard);
}
