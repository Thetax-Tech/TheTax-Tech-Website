import { getFaqs, getPosts, getProjects, getServices, getSettings } from "@/lib/data";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

/**
 * /llms.txt — a concise, Markdown description of the company and its key pages for AI answer
 * engines (ChatGPT, Perplexity, Claude, Gemini). Generated from live CMS content.
 */
export async function GET() {
  const [s, services, projects, posts, faqs] = await Promise.all([getSettings(), getServices(), getProjects(), getPosts(), getFaqs()]);
  const c = s.contact;

  const lines = [
    `# ${s.site.name} (${s.site.legalName})`,
    "",
    `> ${s.site.description}`,
    "",
    "## Company facts",
    `- Legal name: ${s.site.legalName}`,
    `- Brand: ${s.site.name} — "${s.site.tagline}"`,
    `- Headquarters: ${c.street}, ${c.city}, ${c.country}`,
    `- Phone / WhatsApp: ${c.phone}`,
    `- Email: ${c.email}`,
    `- Office hours: ${c.hours} (Pakistan Standard Time)`,
    `- Serves: Pakistan and international clients (UK, Europe, Gulf, North America)`,
    `- Website: ${absoluteUrl("/")}`,
    "",
    "## Services",
    ...services.map((sv) => `- [${sv.name}](${absoluteUrl(`/services/${sv.slug}`)}): ${sv.answer ?? sv.shortDescription}`),
    "",
    "## Key pages",
    `- [About](${absoluteUrl("/about")}): Company story, mission, values and team`,
    `- [Portfolio](${absoluteUrl("/portfolio")}): Case studies and results`,
    `- [Blog](${absoluteUrl("/blog")}): Articles on AI, automation, BPO and digital growth`,
    `- [Contact](${absoluteUrl("/contact")}): Address, phone, WhatsApp, map`,
    `- [Get a quote](${absoluteUrl("/get-a-quote")}): Free consultation request`,
    "",
    "## Portfolio by category",
    "Projects marked (concept) are sample case studies that illustrate our approach; their figures are illustrative targets, not client results.",
    ...[...new Set(projects.map((p) => p.category))].flatMap((cat) => [
      `### ${cat}`,
      ...projects.filter((p) => p.category === cat).map((p) => `- [${p.title}](${absoluteUrl(`/portfolio/${p.slug}`)})${p.isSample ? " (concept)" : ""}: ${p.summary}`),
    ]),
    "",
    "## AI assistant",
    `${s.site.name} runs an AI assistant (chat bubble on every page${process.env.WHATSAPP_ACCESS_TOKEN ? " and on WhatsApp" : ""}) that answers questions about our services from this same content, shares relevant portfolio projects and connects visitors with the team. It does not quote prices; the team sends quotes after a free consultation.`,
    "",
    "## Articles",
    ...posts.map((p) => `- [${p.title}](${absoluteUrl(`/blog/${p.slug}`)}): ${p.excerpt}`),
    "",
    "## FAQ",
    ...faqs.flatMap((f) => [`### ${f.question}`, f.answer, ""]),
  ];

  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
