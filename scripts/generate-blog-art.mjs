/**
 * Generates original, royalty-free blog illustrations (no stock photos, no third-party logos):
 * a 1200x630 cover per post (also used as the Open Graph / Twitter image) plus in-article figures.
 * Drawn as SVG, rendered to optimised WebP with sharp.
 *
 *   npm run art:blog
 *
 * Output: public/blog/<slug>/cover.webp, figure-1.webp, figure-2.webp ...
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONT = "Inter, 'Segoe UI', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const T = (x, y, text, size = 22, fill = "#fff", weight = 600, anchor = "start", extra = "") =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" ${extra}>${esc(text)}</text>`;
const R = (x, y, w, h, rx, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const O = "#F7941D";

function frame(w, h, accent, body, { tag, title } = {}) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
<defs>
  <radialGradient id="g1" cx="78%" cy="30%" r="65%"><stop offset="0" stop-color="${accent}" stop-opacity=".55"/><stop offset="1" stop-color="${accent}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx="10%" cy="100%" r="60%"><stop offset="0" stop-color="${O}" stop-opacity=".22"/><stop offset="1" stop-color="${O}" stop-opacity="0"/></radialGradient>
  <linearGradient id="acc" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="${O}"/></linearGradient>
  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".045"/></pattern>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="18" stdDeviation="20" flood-color="#000" flood-opacity=".5"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="#0a0b0f"/><rect width="${w}" height="${h}" fill="url(#grid)"/><rect width="${w}" height="${h}" fill="url(#g1)"/><rect width="${w}" height="${h}" fill="url(#g2)"/>
${body}
${tag ? `${R(56, 52, tag.length * 11 + 40, 38, 19, "#ffffff14", 'stroke="#ffffff26"')}${T(76, 77, tag.toUpperCase(), 15, accent, 700, "start", 'letter-spacing="2"')}` : ""}
${title ? title.map((l, i) => T(56, 160 + i * 62, l, 50, "#fff", 700)).join("") : ""}
${T(w - 56, h - 40, "THETA X TECH", 15, "#ffffff80", 700, "end", 'letter-spacing="4"')}
</svg>`;
}

const icon = {
  cloud: (x, y, s, c) => `<path transform="translate(${x} ${y}) scale(${s})" d="M18 40a14 14 0 0 1 2-27.8A20 20 0 0 1 58 18a12 12 0 0 1 4 23.4V42H18z" fill="${c}"/>`,
  chip: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="10" y="10" width="40" height="40" rx="8" fill="${c}"/><rect x="21" y="21" width="18" height="18" rx="3" fill="#0a0b0f"/>${[16, 26, 36, 44].map((p) => `<rect x="${p - 2}" y="0" width="4" height="10" fill="${c}"/><rect x="${p - 2}" y="50" width="4" height="10" fill="${c}"/><rect x="0" y="${p - 2}" width="10" height="4" fill="${c}"/><rect x="50" y="${p - 2}" width="10" height="4" fill="${c}"/>`).join("")}</g>`,
  gear: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><circle cx="30" cy="30" r="18" fill="none" stroke="${c}" stroke-width="8"/>${[0, 45, 90, 135, 180, 225, 270, 315].map((a) => `<rect x="26" y="0" width="8" height="12" rx="2" fill="${c}" transform="rotate(${a} 30 30)"/>`).join("")}</g>`,
  blocks: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect width="26" height="26" rx="6" fill="${c}"/><rect x="34" width="26" height="26" rx="6" fill="${c}" opacity=".6"/><rect y="34" width="26" height="26" rx="6" fill="${c}" opacity=".6"/><rect x="34" y="34" width="26" height="26" rx="6" fill="${c}"/></g>`,
  headset: (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${c}" stroke-width="6" stroke-linecap="round"><path d="M10 36v-6a20 20 0 0 1 40 0v6"/><rect x="6" y="34" width="10" height="18" rx="4" fill="${c}"/><rect x="44" y="34" width="10" height="18" rx="4" fill="${c}"/><path d="M50 52c0 6-8 8-16 8"/></g>`,
};

// ─────────────────────────── per-post art ───────────────────────────
const posts = {
  "how-innovation-is-transforming-the-it-landscape": {
    accent: "#3B82F6",
    cover: (w, h, a) => {
      let s = "";
      const cx = 880, cy = 330;
      s += `<circle cx="${cx}" cy="${cy}" r="210" fill="none" stroke="#ffffff1a" stroke-dasharray="6 10"/><circle cx="${cx}" cy="${cy}" r="130" fill="none" stroke="#ffffff22"/>`;
      s += `<g filter="url(#sh)">${R(cx - 70, cy - 70, 140, 140, 36, "url(#acc)")}</g>${T(cx, cy + 14, "IT", 48, "#0a0b0f", 800, "middle")}`;
      const items = [["cloud", -210, 0], ["chip", 0, -210], ["gear", 210, 0], ["blocks", 0, 210]];
      items.forEach(([k, dx, dy], i) => {
        const x = cx + dx, y = cy + dy;
        s += `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="${i % 2 ? a : O}" stroke-opacity=".5" stroke-width="2"/>`;
        s += `<g filter="url(#sh)">${R(x - 44, y - 44, 88, 88, 22, "#14161d", 'stroke="#ffffff22"')}</g>` + icon[k](x - 30, y - 30, 1, i % 2 ? a : O);
      });
      return s;
    },
    coverTitle: ["How innovation is", "transforming IT"],
    tag: "Technology",
    figures: [
      {
        alt: "Diagram of the four forces reshaping IT: cloud computing, artificial intelligence, automation and low-code platforms",
        caption: "The four forces reshaping IT for businesses of every size.",
        draw: (w, h, a) => {
          const items = [["cloud", "Cloud computing", "Infrastructure on demand"], ["chip", "Artificial intelligence", "Software that understands"], ["gear", "Automation", "Work without copy-paste"], ["blocks", "Low-code", "Tools anyone can build"]];
          let s = T(w / 2, 90, "Four forces reshaping IT", 40, "#fff", 700, "middle");
          items.forEach(([k, t, d], i) => {
            const x = 70 + (i % 2) * 540, y = 140 + Math.floor(i / 2) * 250;
            s += `<g filter="url(#sh)">${R(x, y, 520, 220, 26, "#14161d", 'stroke="#ffffff1f"')}</g>${icon[k](x + 36, y + 40, 1.2, i % 3 ? a : O)}${T(x + 140, y + 92, t, 30, "#fff", 700)}${T(x + 140, y + 132, d, 22, "#a8a8b3", 500)}`;
          });
          return s;
        },
      },
    ],
  },
  "ai-and-tech-innovation-business-impact-2025": {
    accent: "#8B5CF6",
    cover: (w, h, a) => {
      let s = "";
      const bx = 700, by = 480;
      [120, 170, 150, 230, 280, 340].forEach((v, i) => (s += R(bx + i * 70, by - v, 46, v, 10, i === 5 ? "url(#acc)" : `${a}55`)));
      s += `<path d="M${bx + 20} ${by - 140} L${bx + 90} ${by - 190} L${bx + 160} ${by - 170} L${bx + 230} ${by - 250} L${bx + 300} ${by - 300} L${bx + 370} ${by - 370}" fill="none" stroke="${O}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
      s += `<circle cx="${bx + 370}" cy="${by - 370}" r="10" fill="${O}"/>`;
      s += `<g filter="url(#sh)">${R(860, 90, 230, 120, 22, "#14161d", 'stroke="#ffffff22"')}</g>${icon.chip(884, 118, 1, a)}${T(964, 148, "AI agent", 22, "#fff", 700)}${T(964, 178, "online 24/7", 17, "#a8a8b3", 500)}`;
      return s;
    },
    coverTitle: ["AI & tech innovation:", "business impact"],
    tag: "Artificial Intelligence",
    figures: [
      {
        alt: "Three ways AI impacts business: lower operating costs, higher revenue and better decisions",
        caption: "Where AI creates measurable value for businesses.",
        draw: (w, h, a) => {
          const cards = [["↓", "Lower costs", "Automate repetitive work"], ["↑", "More revenue", "Faster, personal responses"], ["◎", "Better decisions", "Clear insight from data"]];
          let s = T(w / 2, 100, "Three ways AI impacts business", 40, "#fff", 700, "middle");
          cards.forEach(([g, t, d], i) => {
            const x = 60 + i * 370;
            s += `<g filter="url(#sh)">${R(x, 170, 340, 380, 28, "#14161d", 'stroke="#ffffff1f"')}</g><circle cx="${x + 170}" cy="${270}" r="58" fill="${i === 1 ? O : a}"/>${T(x + 170, 292, g, 60, "#0a0b0f", 800, "middle")}${T(x + 170, 400, t, 30, "#fff", 700, "middle")}${T(x + 170, 445, d, 21, "#a8a8b3", 500, "middle")}`;
          });
          return s;
        },
      },
    ],
  },
  "what-is-bpo-guide-for-businesses-outsourcing-to-pakistan": {
    accent: "#10B981",
    cover: (w, h, a) => {
      let s = "";
      const cx = 900, cy = 320;
      s += `<circle cx="${cx}" cy="${cy}" r="180" fill="#14161d" stroke="#ffffff22"/>`;
      for (let i = -2; i <= 2; i++) s += `<ellipse cx="${cx}" cy="${cy}" rx="${180 - Math.abs(i) * 20}" ry="${Math.abs(i) * 45 + 8}" fill="none" stroke="#ffffff14" transform="rotate(90 ${cx} ${cy})"/>`;
      for (let i = -2; i <= 2; i++) s += `<line x1="${cx - 175}" y1="${cy + i * 60}" x2="${cx + 175}" y2="${cy + i * 60}" stroke="#ffffff14"/>`;
      const pk = [cx + 40, cy - 30];
      [[cx - 120, cy - 90, "UK"], [cx - 140, cy + 60, "US"], [cx + 130, cy - 110, "Gulf"], [cx + 150, cy + 80, "EU"]].forEach(([x, y, l]) => {
        s += `<path d="M${pk[0]} ${pk[1]} Q ${(pk[0] + x) / 2} ${Math.min(pk[1], y) - 90} ${x} ${y}" fill="none" stroke="${a}" stroke-width="3" stroke-dasharray="8 8"/>`;
        s += `<circle cx="${x}" cy="${y}" r="8" fill="${a}"/>${T(x, y - 18, l, 16, "#fff", 700, "middle")}`;
      });
      s += `<circle cx="${pk[0]}" cy="${pk[1]}" r="14" fill="${O}"/><circle cx="${pk[0]}" cy="${pk[1]}" r="30" fill="none" stroke="${O}" stroke-opacity=".5"/>${T(pk[0], pk[1] + 44, "Karachi", 17, O, 700, "middle")}`;
      s += `<g filter="url(#sh)">${R(1000, 470, 150, 110, 22, "#14161d", 'stroke="#ffffff22"')}</g>${icon.headset(1045, 492, 1, a)}`;
      return s;
    },
    coverTitle: ["What is BPO?", "Outsourcing to Pakistan"],
    tag: "Business & Outsourcing",
    figures: [
      {
        alt: "Grid of business processes that can be outsourced: customer support, back office, data entry, virtual assistants, lead generation, bookkeeping and document processing",
        caption: "Common processes businesses outsource to a BPO partner.",
        draw: (w, h, a) => {
          const items = ["Customer support", "Back-office operations", "Data entry & processing", "Virtual assistants", "Lead generation", "Bookkeeping & tax support", "Document processing", "Appointment setting"];
          let s = T(w / 2, 96, "What can you outsource?", 40, "#fff", 700, "middle");
          items.forEach((t, i) => {
            const x = 60 + (i % 4) * 275, y = 160 + Math.floor(i / 4) * 210;
            s += `<g filter="url(#sh)">${R(x, y, 255, 180, 22, "#14161d", 'stroke="#ffffff1f"')}</g><circle cx="${x + 44}" cy="${y + 48}" r="18" fill="${i % 3 ? a : O}"/>${T(x + 24, y + 120, t.split(" & ")[0], 22, "#fff", 700)}${t.includes("&") ? T(x + 24, y + 150, "& " + t.split(" & ")[1], 22, "#fff", 700) : ""}`;
          });
          return s;
        },
      },
      {
        alt: "Checklist for choosing a BPO partner: paid pilot, data security, clear KPIs, weekly reporting and automation expertise",
        caption: "A simple checklist for choosing a reliable BPO partner.",
        draw: (w, h, a) => {
          const items = ["Start with a short paid pilot", "Verify NDAs, access control & data security", "Agree KPIs: response time, accuracy, volume", "Insist on transparent weekly reporting", "Prefer partners who also automate"];
          let s = T(80, 110, "Choosing a BPO partner", 40, "#fff", 700);
          items.forEach((t, i) => {
            const y = 170 + i * 92;
            s += `<g filter="url(#sh)">${R(80, y, 1040, 72, 18, "#14161d", 'stroke="#ffffff1f"')}</g><circle cx="122" cy="${y + 36}" r="18" fill="${a}"/><path d="M113 ${y + 36} l7 7 l13 -14" fill="none" stroke="#0a0b0f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>${T(160, y + 45, t, 24, "#fff", 600)}`;
          });
          return s;
        },
      },
    ],
  },
  "ai-automation-for-small-businesses-in-pakistan": {
    accent: "#F59E0B",
    cover: (w, h, a) => {
      let s = "";
      const nodes = [[640, 200, "Lead form"], [640, 330, "Invoice email"], [640, 460, "WhatsApp"], [1040, 260, "CRM"], [1040, 400, "Accounting"]];
      const hub = [860, 330];
      nodes.forEach(([x, y], i) => (s += `<path d="M${x + (i < 3 ? 80 : -80)} ${y} C ${hub[0]} ${y}, ${hub[0]} ${hub[1]}, ${hub[0]} ${hub[1]}" fill="none" stroke="${O}" stroke-opacity=".6" stroke-width="3" stroke-dasharray="8 8"/>`));
      nodes.forEach(([x, y, l]) => (s += `<g filter="url(#sh)">${R(x - 80, y - 30, 160, 60, 16, "#14161d", 'stroke="#ffffff22"')}</g>${T(x, y + 7, l, 18, "#fff", 600, "middle")}`));
      s += `<circle cx="${hub[0]}" cy="${hub[1]}" r="95" fill="${a}" opacity=".12"/><g filter="url(#sh)">${R(hub[0] - 60, hub[1] - 60, 120, 120, 30, "url(#acc)")}</g>${icon.gear(hub[0] - 30, hub[1] - 30, 1, "#0a0b0f")}`;
      return s;
    },
    coverTitle: ["AI automation for", "small businesses"],
    tag: "AI Automation",
    figures: [
      {
        alt: "Comparison of no-code automation tools: Zapier is easiest to start, Make offers visual control at lower cost, n8n can be self-hosted for data control",
        caption: "How the popular workflow tools compare for small businesses.",
        draw: (w, h, a) => {
          const cols = [["Zapier", "Easiest to start", ["Fast setup", "Huge app library", "Higher cost at volume"]], ["Make", "Visual & affordable", ["Complex flows", "Lower cost", "Learning curve"]], ["n8n", "Self-hostable", ["Data stays in-house", "Lowest cost at scale", "Needs a server"]]];
          let s = T(w / 2, 96, "Choosing an automation tool", 40, "#fff", 700, "middle");
          cols.forEach(([n, sub, pts], i) => {
            const x = 60 + i * 370;
            s += `<g filter="url(#sh)">${R(x, 150, 340, 420, 26, "#14161d", i === 2 ? `stroke="${a}"` : 'stroke="#ffffff1f"')}</g>${T(x + 30, 215, n, 36, i === 2 ? a : "#fff", 800)}${T(x + 30, 252, sub, 21, "#a8a8b3", 500)}`;
            pts.forEach((p, k) => (s += `<circle cx="${x + 40}" cy="${318 + k * 64}" r="7" fill="${k === 2 ? "#ffffff55" : O}"/>${T(x + 60, 326 + k * 64, p, 22, "#e5e5e5", 500)}`));
          });
          return s;
        },
      },
      {
        alt: "Thirty-day AI automation starter plan: week 1 list tasks, week 2 design the workflow, week 3 build and test, week 4 go live and measure",
        caption: "A realistic 30-day plan for your first automation.",
        draw: (w, h, a) => {
          const weeks = [["Week 1", "List repetitive tasks", "Estimate hours spent"], ["Week 2", "Pick one & design", "Map the workflow"], ["Week 3", "Build & test", "Use real data"], ["Week 4", "Go live", "Measure time saved"]];
          let s = T(w / 2, 100, "Your 30-day automation plan", 40, "#fff", 700, "middle");
          s += `<line x1="195" y1="230" x2="1005" y2="230" stroke="${a}" stroke-opacity=".7" stroke-width="4"/>`;
          weeks.forEach(([wk, t, d], i) => {
            const x = 195 + i * 270;
            s += `<circle cx="${x}" cy="230" r="22" fill="#0a0b0f" stroke="${i === 3 ? O : a}" stroke-width="5"/>${T(x, 238, String(i + 1), 20, "#fff", 800, "middle")}`;
            s += `<g filter="url(#sh)">${R(x - 125, 290, 250, 230, 24, "#14161d", 'stroke="#ffffff1f"')}</g>${T(x, 340, wk, 20, i === 3 ? O : a, 700, "middle")}${T(x, 395, t, 23, "#fff", 700, "middle")}${T(x, 435, d, 19, "#a8a8b3", 500, "middle")}`;
          });
          return s;
        },
      },
    ],
  },
};

let count = 0;
for (const [slug, p] of Object.entries(posts)) {
  const dir = path.join(root, "public/blog", slug);
  await mkdir(dir, { recursive: true });
  const cover = frame(1200, 630, p.accent, p.cover(1200, 630, p.accent), { tag: p.tag, title: p.coverTitle });
  await sharp(Buffer.from(cover)).webp({ quality: 80, effort: 6 }).toFile(path.join(dir, "cover.webp"));
  count++;
  for (const [i, f] of p.figures.entries()) {
    const svg = frame(1200, 675, p.accent, f.draw(1200, 675, p.accent));
    await sharp(Buffer.from(svg)).webp({ quality: 80, effort: 6 }).toFile(path.join(dir, `figure-${i + 1}.webp`));
    count++;
  }
}

console.log(`Generated ${count} WebP images for ${Object.keys(posts).length} posts.`);


