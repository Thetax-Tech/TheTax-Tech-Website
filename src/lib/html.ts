import "server-only";
import sanitizeHtml from "sanitize-html";
import { slugify } from "@/lib/utils";

/** Whitelist for rich text coming from the admin editor. */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "h2", "h3", "h4", "p", "br", "hr", "strong", "b", "em", "i", "u", "s", "a", "ul", "ol", "li", "blockquote", "code", "pre",
    "img", "figure", "figcaption", "table", "thead", "tbody", "tr", "th", "td", "iframe", "div", "span", "mark",
  ],
  allowedAttributes: {
    a: ["href", "title", "target", "rel"],
    img: ["src", "alt", "title", "width", "height", "loading"],
    iframe: ["src", "width", "height", "allowfullscreen", "frameborder", "allow", "title"],
    th: ["colspan", "rowspan"],
    td: ["colspan", "rowspan"],
    "*": ["id", "class"],
  },
  allowedSchemes: ["http", "https", "mailto", "tel"],
  allowedIframeHostnames: ["www.youtube.com", "www.youtube-nocookie.com", "player.vimeo.com", "www.google.com"],
  transformTags: {
    a: (tagName, attribs) => {
      const external = /^https?:\/\//.test(attribs.href ?? "") && !(attribs.href ?? "").includes(process.env.NEXT_PUBLIC_SITE_URL ?? "@@");
      return { tagName, attribs: external ? { ...attribs, target: "_blank", rel: "noopener noreferrer" } : attribs };
    },
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy" } }),
  },
};

export type TocItem = { id: string; text: string; level: 2 | 3 };

/**
 * Sanitises editor HTML and adds stable ids to h2/h3 headings for the table of contents.
 * Any <h1> is demoted to <h2> so each page keeps a single H1.
 */
export function prepareHtml(html: string | null | undefined): { html: string; toc: TocItem[] } {
  if (!html) return { html: "", toc: [] };
  const toc: TocItem[] = [];
  const used = new Set<string>();
  const demoted = html.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
  const clean = sanitizeHtml(demoted, OPTIONS);
  const withIds = clean.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (_m, level: string, attrs: string, inner: string) => {
    const text = inner.replace(/<[^>]+>/g, "").trim();
    let id = slugify(text) || "section";
    while (used.has(id)) id += "-x";
    used.add(id);
    toc.push({ id, text, level: Number(level) as 2 | 3 });
    const cleanedAttrs = attrs.replace(/\sid="[^"]*"/, "");
    return `<h${level}${cleanedAttrs} id="${id}">${inner}</h${level}>`;
  });
  return { html: withIds, toc };
}
