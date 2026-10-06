/**
 * Generates original SVG mockups (cover + 3 gallery images) for every sample portfolio project.
 * No third-party logos or screenshots — everything is drawn from primitives.
 *
 *   npm run art:portfolio
 *
 * Output: public/portfolio/<slug>/{cover,1,2,3}.svg
 */
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// ── read project list from the TS content file (simple extraction, no TS runtime needed) ──
const src = await readFile(path.join(root, "src/content/projects.ts"), "utf8");
const projects = [...src.matchAll(/slug: "([^"]+)",\s*\n\s*title: "([^"]+)"[\s\S]*?art: \{ accent: "([^"]+)", cover: "(\w+)", gallery: \["(\w+)", "(\w+)", "(\w+)"\], brand: "([^"]+)" \}/g)].map((m) => ({
  slug: m[1],
  title: m[2],
  accent: m[3],
  cover: m[4],
  gallery: [m[5], m[6], m[7]],
  brand: m[8],
}));

const FONT = "Inter, 'Segoe UI', Arial, sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function rng(seed) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return ((h >>> 0) % 10000) / 10000;
  };
}

const T = (x, y, text, size = 18, fill = "#fff", weight = 500, anchor = "start", opacity = 1) =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}" opacity="${opacity}">${esc(text)}</text>`;
const R = (x, y, w, h, rx, fill, extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" ${extra}/>`;
const line = (n) => n.toFixed(1);

function backdrop(w, h, a, r) {
  const gx = 20 + r() * 60, gy = 10 + r() * 40;
  return `<defs>
  <radialGradient id="g1" cx="${gx}%" cy="${gy}%" r="70%"><stop offset="0" stop-color="${a}" stop-opacity=".45"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></radialGradient>
  <radialGradient id="g2" cx="${100 - gx}%" cy="100%" r="60%"><stop offset="0" stop-color="#ff7a1a" stop-opacity=".18"/><stop offset="1" stop-color="#ff7a1a" stop-opacity="0"/></radialGradient>
  <linearGradient id="acc" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${a}" stop-opacity=".55"/></linearGradient>
  <linearGradient id="fade" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".45"/><stop offset="1" stop-color="${a}" stop-opacity="0"/></linearGradient>
  <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse"><path d="M48 0H0V48" fill="none" stroke="#fff" stroke-opacity=".05"/></pattern>
  <filter id="sh" x="-20%" y="-20%" width="140%" height="160%"><feDropShadow dx="0" dy="30" stdDeviation="30" flood-color="#000" flood-opacity=".55"/></filter>
</defs>
<rect width="${w}" height="${h}" fill="#0a0b0f"/><rect width="${w}" height="${h}" fill="url(#grid)"/>
<rect width="${w}" height="${h}" fill="url(#g1)"/><rect width="${w}" height="${h}" fill="url(#g2)"/>`;
}

// ───────────────────── frames ─────────────────────
function browser(x, y, w, h, url, inner) {
  return `<g filter="url(#sh)">${R(x, y, w, h, 18, "#12141b", 'stroke="#ffffff1f"')}
  ${R(x, y, w, 46, 18, "#1a1d26")}${R(x, y + 30, w, 16, 0, "#1a1d26")}
  <circle cx="${x + 26}" cy="${y + 23}" r="6" fill="#ff5f57"/><circle cx="${x + 46}" cy="${y + 23}" r="6" fill="#febc2e"/><circle cx="${x + 66}" cy="${y + 23}" r="6" fill="#28c840"/>
  ${R(x + w / 2 - 170, y + 12, 340, 22, 11, "#0e1016")}${T(x + w / 2, y + 28, url, 12, "#9a9aa5", 500, "middle")}
  <svg x="${x}" y="${y + 46}" width="${w}" height="${h - 46}">${inner(w, h - 46)}</svg></g>`;
}
function phone(x, y, w, h, inner) {
  return `<g filter="url(#sh)">${R(x, y, w, h, 44, "#05060a", 'stroke="#ffffff33" stroke-width="2"')}
  ${R(x + 10, y + 10, w - 20, h - 20, 36, "#12141b")}
  <svg x="${x + 10}" y="${y + 10}" width="${w - 20}" height="${h - 20}"><clipPath id="pc${x}"><rect width="${w - 20}" height="${h - 20}" rx="36"/></clipPath><g clip-path="url(#pc${x})">${inner(w - 20, h - 20)}</g></svg>
  ${R(x + w / 2 - 50, y + 18, 100, 24, 12, "#05060a")}</g>`;
}

// ───────────────────── screen contents ─────────────────────
function dashboardScreen(a, r, brand) {
  return (w, h) => {
    const side = 200;
    let s = R(0, 0, w, h, 0, "#101218") + R(0, 0, side, h, 0, "#0c0e13");
    s += `<circle cx="34" cy="38" r="14" fill="${a}"/>` + T(56, 44, brand, 16, "#fff", 700);
    ["Overview", "Reports", "Customers", "Automations", "Settings"].forEach((n, i) => {
      if (i === 0) s += R(14, 80, side - 28, 36, 10, `${a}26`);
      s += R(30, 92 + i * 46, 12, 12, 3, i === 0 ? a : "#ffffff33") + T(54, 103 + i * 46, n, 14, i === 0 ? "#fff" : "#9a9aa5");
    });
    const cx = side + 28, cw = (w - side - 28 * 2 - 18 * 3) / 4;
    const kpis = [["Revenue", "₨ 4.8M", "+12%"], ["Leads", "1,284", "+28%"], ["Conversion", "6.4%", "+1.1%"], ["Tasks automated", "9,620", "+41%"]];
    kpis.forEach(([l, v, d], i) => {
      const x = cx + i * (cw + 18);
      s += R(x, 28, cw, 104, 14, "#161922", 'stroke="#ffffff12"') + T(x + 18, 58, l, 13, "#9a9aa5") + T(x + 18, 96, v, 28, "#fff", 700) + T(x + 18, 120, d, 13, a, 600);
    });
    const chY = 156, chH = h - chY - 28, chW = (w - cx - 28) * 0.64;
    s += R(cx, chY, chW, chH, 14, "#161922", 'stroke="#ffffff12"') + T(cx + 20, chY + 34, "Performance — last 30 days", 15, "#fff", 600);
    const pts = Array.from({ length: 14 }, (_, i) => [cx + 24 + (i * (chW - 48)) / 13, chY + chH - 30 - (0.25 + 0.6 * (i / 13) + (r() - 0.5) * 0.22) * (chH - 90)]);
    const d = pts.map((p, i) => `${i ? "L" : "M"}${line(p[0])} ${line(p[1])}`).join(" ");
    s += `<path d="${d} L${line(pts[13][0])} ${chY + chH - 20} L${line(pts[0][0])} ${chY + chH - 20}Z" fill="url(#fade)"/><path d="${d}" fill="none" stroke="${a}" stroke-width="3.5" stroke-linejoin="round"/>`;
    pts.forEach((p, i) => i % 3 === 0 && (s += `<circle cx="${line(p[0])}" cy="${line(p[1])}" r="5" fill="#101218" stroke="${a}" stroke-width="3"/>`));
    const bx = cx + chW + 18, bw = w - bx - 28;
    s += R(bx, chY, bw, chH, 14, "#161922", 'stroke="#ffffff12"') + T(bx + 20, chY + 34, "By channel", 15, "#fff", 600);
    ["Web", "WhatsApp", "Email", "Ads"].forEach((n, i) => {
      const v = 0.35 + r() * 0.6;
      s += T(bx + 20, chY + 78 + i * 52, n, 13, "#9a9aa5") + R(bx + 20, chY + 88 + i * 52, bw - 40, 10, 5, "#ffffff14") + R(bx + 20, chY + 88 + i * 52, (bw - 40) * v, 10, 5, i === 0 ? a : `${a}99`);
    });
    return s;
  };
}

function websiteScreen(a, r, brand) {
  return (w, h) => {
    let s = R(0, 0, w, h, 0, "#0f1116");
    s += `<circle cx="40" cy="36" r="12" fill="${a}"/>` + T(62, 42, brand, 17, "#fff", 700);
    ["Projects", "About", "Insights", "Contact"].forEach((n, i) => (s += T(w - 420 + i * 92, 42, n, 14, "#c9c9d1")));
    s += R(w - 140, 20, 110, 34, 17, a) + T(w - 85, 42, "Enquire", 14, "#0b0b0d", 700, "middle");
    s += T(48, 140, "Live where", 54, "#fff", 700) + T(48, 200, "the city", 54, "#fff", 700) + T(48 + 230, 200, "rises.", 54, a, 700);
    s += R(48, 230, 360, 12, 6, "#ffffff22") + R(48, 252, 300, 12, 6, "#ffffff16");
    s += R(48, 292, 160, 46, 23, a) + T(128, 321, "Explore", 15, "#0b0b0d", 700, "middle") + R(220, 292, 150, 46, 23, "none", 'stroke="#ffffff40"') + T(295, 321, "Book a visit", 15, "#fff", 600, "middle");
    const ix = w * 0.52, iw = w - ix - 40;
    s += `<defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}" stop-opacity=".9"/><stop offset="1" stop-color="#1b1e27"/></linearGradient></defs>`;
    s += R(ix, 80, iw, 280, 20, "url(#sky)");
    for (let i = 0; i < 9; i++) {
      const bw = 26 + r() * 40, bh = 60 + r() * 170, bx = ix + 20 + i * (iw - 60) / 9;
      s += R(bx, 360 - bh, bw, bh, 3, "#0d0f14", 'opacity=".92"');
      for (let k = 0; k < bh / 22 - 1; k++) s += R(bx + 6, 360 - bh + 10 + k * 22, bw - 12, 6, 2, `${a}${r() > 0.5 ? "aa" : "33"}`);
    }
    const cy = 400, cw = (w - 96 - 40) / 3;
    for (let i = 0; i < 3; i++) {
      const x = 48 + i * (cw + 20);
      s += R(x, cy, cw, h - cy - 30, 16, "#161922", 'stroke="#ffffff12"') + R(x + 16, cy + 16, cw - 32, (h - cy) * 0.42, 10, i === 1 ? `${a}55` : "#1f2330");
      s += T(x + 16, cy + (h - cy) * 0.42 + 46, ["Tower A — 2 & 3 bed", "Garden Villas", "Sky Penthouses"][i], 16, "#fff", 600) + R(x + 16, cy + (h - cy) * 0.42 + 60, cw * 0.6, 8, 4, "#ffffff22");
    }
    return s;
  };
}

function appScreen(a, r, brand, variant) {
  return (w, h) => {
    let s = R(0, 0, w, h, 0, "#101218") + T(24, 76, variant ? "Book a visit" : `Hi, Ayesha`, 22, "#fff", 700) + T(24, 100, brand, 13, "#9a9aa5");
    if (!variant) {
      s += `<defs><linearGradient id="card${w}" x1="0" x2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="#ff7a1a"/></linearGradient></defs>`;
      s += R(20, 120, w - 40, 150, 22, `url(#card${w})`) + T(40, 160, "Total balance", 14, "#0b0b0d", 600) + T(40, 206, "₨ 248,560", 34, "#0b0b0d", 800) + T(40, 244, "•••• 4821", 14, "#0b0b0d", 600, "start", 0.7);
      ["Send", "Pay bills", "Top up", "Scan"].forEach((n, i) => {
        const x = 20 + i * ((w - 40) / 4);
        s += R(x + 8, 294, (w - 40) / 4 - 16, 62, 16, "#1a1d26") + `<circle cx="${x + (w - 40) / 8}" cy="317" r="10" fill="${a}"/>` + T(x + (w - 40) / 8, 344, n, 11, "#c9c9d1", 500, "middle");
      });
      s += T(24, 396, "Recent", 15, "#fff", 700);
      ["Grocery store", "Electricity bill", "Salary credit", "Mobile top-up"].forEach((n, i) => {
        const y = 414 + i * 66;
        s += R(20, y, w - 40, 56, 14, "#161922") + `<circle cx="48" cy="${y + 28}" r="14" fill="${i === 2 ? a : "#ffffff22"}"/>` + T(72, y + 33, n, 14, "#fff", 500) + T(w - 36, y + 33, i === 2 ? "+85,000" : `-${(1200 + r() * 9000).toFixed(0)}`, 14, i === 2 ? a : "#c9c9d1", 600, "end");
      });
    } else {
      s += R(20, 122, w - 40, 46, 23, "#1a1d26") + T(44, 151, "Search doctor or specialty", 13, "#9a9aa5");
      ["Mon", "Tue", "Wed", "Thu", "Fri"].forEach((d, i) => {
        const x = 20 + i * ((w - 40) / 5);
        s += R(x + 4, 188, (w - 40) / 5 - 8, 64, 14, i === 2 ? a : "#1a1d26") + T(x + (w - 40) / 10, 214, d, 12, i === 2 ? "#0b0b0d" : "#9a9aa5", 600, "middle") + T(x + (w - 40) / 10, 238, String(12 + i), 18, i === 2 ? "#0b0b0d" : "#fff", 700, "middle");
      });
      ["09:30", "10:00", "11:15", "12:00", "14:30", "16:00"].forEach((t, i) => {
        const x = 20 + (i % 3) * ((w - 40) / 3), y = 276 + Math.floor(i / 3) * 56;
        s += R(x + 4, y, (w - 40) / 3 - 8, 44, 12, i === 1 ? `${a}33` : "#161922", i === 1 ? `stroke="${a}"` : "") + T(x + (w - 40) / 6, y + 28, t, 14, "#fff", 600, "middle");
      });
      s += R(20, 410, w - 40, 120, 18, "#161922") + `<circle cx="64" cy="470" r="26" fill="${a}55"/>` + T(104, 462, "Dr. Sana Malik", 16, "#fff", 700) + T(104, 486, "General Physician · 4.9★", 12, "#9a9aa5");
      s += R(20, h - 90, w - 40, 56, 28, a) + T(w / 2, h - 55, "Confirm booking", 16, "#0b0b0d", 700, "middle");
    }
    return s;
  };
}

function chatScreen(a, r, brand) {
  return (w, h) => {
    let s = R(0, 0, w, h, 0, "#0e1a17") + R(0, 0, w, 96, 0, "#122520") + `<circle cx="44" cy="62" r="20" fill="${a}"/>` + T(76, 58, brand, 16, "#fff", 700) + T(76, 80, "AI assistant · online", 12, a, 500);
    const msgs = [
      [0, "Assalam o Alaikum! Is the black kurta available in medium?"],
      [1, "Walaikum Assalam! Yes — Medium is in stock 🎉 Delivery in Karachi takes 1–2 days."],
      [0, "Great, what's the fabric?"],
      [1, "It's 100% cotton lawn. Here it is:"],
    ];
    let y = 120;
    msgs.forEach(([me, text]) => {
      const lines = text.match(/.{1,30}(\s|$)/g) ?? [text];
      const bh = 22 + lines.length * 21, bw = Math.min(w - 90, 26 + Math.max(...lines.map((l) => l.length)) * 8.2);
      const x = me ? w - bw - 18 : 18;
      s += R(x, y, bw, bh, 16, me ? "#1f3b33" : "#1a1d26");
      lines.forEach((l, i) => (s += T(x + 14, y + 26 + i * 21, l.trim(), 14, "#eaeaea")));
      y += bh + 14;
    });
    s += R(18, y, w * 0.62, 190, 16, "#1a1d26") + R(28, y + 10, w * 0.62 - 20, 110, 10, `${a}44`) + T(32, y + 146, "Black lawn kurta", 14, "#fff", 600) + T(32, y + 170, "₨ 4,990 · In stock", 13, a, 600);
    s += R(16, h - 66, w - 88, 46, 23, "#1a1d26") + T(40, h - 37, "Type a message", 14, "#9a9aa5") + `<circle cx="${w - 42}" cy="${h - 43}" r="22" fill="${a}"/>`;
    return s;
  };
}

// ───────────────────── full compositions ─────────────────────
const compose = {
  dashboard: (w, h, p, r) => browser(w * 0.08, h * 0.1, w * 0.84, h * 0.8, `app.${p.brand.toLowerCase().replace(/\W+/g, "")}.com/overview`, dashboardScreen(p.accent, r, p.brand)),
  browser: (w, h, p, r) => browser(w * 0.07, h * 0.08, w * 0.86, h * 0.84, `${p.brand.toLowerCase().replace(/\W+/g, "")}.com`, websiteScreen(p.accent, r, p.brand)),
  mobile: (w, h, p, r) =>
    phone(w * 0.5 - 420, h * 0.1, 380, h * 0.8, appScreen(p.accent, r, p.brand, 0)) + phone(w * 0.5 + 40, h * 0.06, 380, h * 0.8, appScreen(p.accent, r, p.brand, 1)),
  chat: (w, h, p, r) =>
    phone(w * 0.5 - 200, h * 0.06, 400, h * 0.88, chatScreen(p.accent, r, p.brand)) +
    `<g filter="url(#sh)">${R(w * 0.5 + 240, h * 0.3, 320, 150, 22, "#12141b", 'stroke="#ffffff1f"')}${T(w * 0.5 + 266, h * 0.3 + 46, "Resolved by AI", 15, "#9a9aa5")}${T(w * 0.5 + 266, h * 0.3 + 100, "72%", 46, p.accent, 800)}${T(w * 0.5 + 266, h * 0.3 + 130, "target · concept", 12, "#9a9aa5")}</g>` +
    `<g filter="url(#sh)">${R(w * 0.5 - 560, h * 0.55, 300, 130, 22, "#12141b", 'stroke="#ffffff1f"')}${T(w * 0.5 - 534, h * 0.55 + 46, "Avg. first reply", 15, "#9a9aa5")}${T(w * 0.5 - 534, h * 0.55 + 98, "< 10s", 42, "#fff", 800)}</g>`,
  workflow: (w, h, p, _r) => {
    const a = p.accent, cx = w / 2, cy = h / 2;
    const left = [["Email inbox", "✉"], ["WhatsApp", "◎"], ["Web forms", "▤"]], right = [["CRM updated", "◆"], ["Accounting", "₨"], ["Daily report", "▥"]];
    let s = "";
    const node = (x, y, label, icon, hi) =>
      `<g filter="url(#sh)">${R(x - 130, y - 38, 260, 76, 18, "#12141b", `stroke="${hi ? a : "#ffffff22"}"`)}${R(x - 112, y - 22, 44, 44, 12, hi ? a : "#1f2330")}${T(x - 90, y + 8, icon, 20, hi ? "#0b0b0d" : a, 700, "middle")}${T(x - 52, y + 6, label, 17, "#fff", 600)}</g>`;
    left.forEach((n, i) => {
      const y = cy - 220 + i * 220;
      s += `<path d="M${w * 0.2 + 130} ${y} C ${cx - 200} ${y}, ${cx - 200} ${cy}, ${cx - 110} ${cy}" fill="none" stroke="${a}" stroke-opacity=".55" stroke-width="3" stroke-dasharray="10 10"/>`;
    });
    right.forEach((n, i) => {
      const y = cy - 220 + i * 220;
      s += `<path d="M${cx + 110} ${cy} C ${cx + 200} ${cy}, ${cx + 200} ${y}, ${w * 0.8 - 130} ${y}" fill="none" stroke="${a}" stroke-opacity=".55" stroke-width="3" stroke-dasharray="10 10"/>`;
    });
    left.forEach((n, i) => (s += node(w * 0.2, cy - 220 + i * 220, n[0], n[1])));
    right.forEach((n, i) => (s += node(w * 0.8, cy - 220 + i * 220, n[0], n[1], i === 0)));
    s += `<circle cx="${cx}" cy="${cy}" r="170" fill="${a}" opacity=".12"/><circle cx="${cx}" cy="${cy}" r="120" fill="${a}" opacity=".18"/>`;
    s += `<g filter="url(#sh)">${R(cx - 100, cy - 100, 200, 200, 48, "url(#acc)")}</g>${T(cx, cy - 6, "AI", 64, "#0b0b0d", 800, "middle")}${T(cx, cy + 40, "agent", 22, "#0b0b0d", 600, "middle")}`;
    s += T(cx, h - 70, `${p.brand} · automation blueprint`, 20, "#9a9aa5", 500, "middle");
    return s;
  },
  docs: (w, h, p, _r) => {
    const a = p.accent;
    let s = `<g filter="url(#sh)" transform="rotate(-4 ${w * 0.3} ${h * 0.5})">${R(w * 0.12, h * 0.1, w * 0.36, h * 0.8, 14, "#f4f4f2")}`;
    const x = w * 0.12 + 40, W = w * 0.36 - 80;
    s += T(x, h * 0.1 + 70, "INVOICE", 34, "#111", 800) + T(x, h * 0.1 + 100, "INV-2026-0418", 15, "#555");
    s += R(x + W - 120, h * 0.1 + 44, 120, 40, 8, `${a}`) + T(x + W - 60, h * 0.1 + 70, p.brand.split(" ")[0], 14, "#0b0b0d", 700, "middle");
    for (let i = 0; i < 7; i++) {
      const y = h * 0.1 + 160 + i * 52;
      s += R(x, y, W * 0.55, 12, 6, "#d6d6d6") + R(x + W * 0.75, y, W * 0.25, 12, 6, "#d6d6d6");
    }
    s += R(x - 8, h * 0.1 + 520, W + 16, 60, 8, "none", `stroke="${a}" stroke-width="3" stroke-dasharray="8 6"`) + T(x, h * 0.1 + 558, "TOTAL", 18, "#111", 800) + T(x + W, h * 0.1 + 558, "₨ 386,400", 20, "#111", 800, "end");
    s += `</g>`;
    s += `<path d="M${w * 0.5} ${h * 0.5} L${w * 0.58} ${h * 0.5}" stroke="${a}" stroke-width="4"/><path d="M${w * 0.58 - 14} ${h * 0.5 - 12} L${w * 0.58} ${h * 0.5} L${w * 0.58 - 14} ${h * 0.5 + 12}" fill="none" stroke="${a}" stroke-width="4"/>`;
    s += `<g filter="url(#sh)">${R(w * 0.6, h * 0.18, w * 0.3, h * 0.64, 18, "#12141b", 'stroke="#ffffff1f"')}`;
    const fx = w * 0.6 + 28;
    s += T(fx, h * 0.18 + 50, "Extracted fields", 18, "#fff", 700);
    [["vendor", "Al-Noor Traders"], ["invoice_no", "INV-2026-0418"], ["date", "2026-04-18"], ["po_match", "PO-7731 ✓"], ["tax", "₨ 58,960"], ["total", "₨ 386,400"]].forEach(([k, v], i) => {
      const y = h * 0.18 + 96 + i * 62;
      s += R(fx, y, w * 0.3 - 56, 48, 10, i === 3 ? `${a}22` : "#1a1d26") + T(fx + 16, y + 30, k, 14, "#9a9aa5", 500) + T(fx + w * 0.3 - 72, y + 30, v, 15, i === 3 ? a : "#fff", 600, "end");
    });
    return s + `</g>`;
  },
  kanban: (w, h, p, _r) =>
    browser(w * 0.07, h * 0.1, w * 0.86, h * 0.8, `${p.brand.toLowerCase()}.app/board`, (W, H) => {
      const a = p.accent;
      let s = R(0, 0, W, H, 0, "#0f1116") + T(32, 52, `${p.brand} — Pipeline`, 22, "#fff", 700);
      const cols = ["New", "Screening", "Interview", "Done"], cw = (W - 64 - 3 * 20) / 4;
      cols.forEach((c, i) => {
        const x = 32 + i * (cw + 20);
        s += R(x, 80, cw, H - 110, 16, "#14161d") + T(x + 18, 112, c, 15, "#fff", 700) + R(x + cw - 50, 96, 32, 24, 12, i === 3 ? a : "#ffffff1a") + T(x + cw - 34, 113, String(3 + ((i * 7) % 5)), 13, i === 3 ? "#0b0b0d" : "#c9c9d1", 700, "middle");
        const n = 2 + ((i + 1) % 3);
        for (let k = 0; k < n; k++) {
          const y = 136 + k * 112;
          s += R(x + 14, y, cw - 28, 96, 12, "#1b1e27", k === 0 && i === 1 ? `stroke="${a}"` : "") + R(x + 30, y + 18, 60, 8, 4, k % 2 ? a : "#ffffff44") + R(x + 30, y + 40, cw * 0.65, 10, 5, "#ffffff2a") + R(x + 30, y + 58, cw * 0.45, 10, 5, "#ffffff1a") + `<circle cx="${x + cw - 46}" cy="${y + 72}" r="12" fill="${a}${k % 2 ? "88" : "44"}"/>`;
        }
      });
      return s;
    }),
  social: (w, h, p, r) => {
    const a = p.accent, size = 420, gap = 36, x0 = (w - (size * 3 + gap * 2)) / 2, y0 = (h - size) / 2;
    const heads = [["Grand", "Opening"], ["Book your", "visit today"], ["Limited", "offer"]];
    let s = "";
    heads.forEach((hd, i) => {
      const x = x0 + i * (size + gap), y = y0 + (i === 1 ? -30 : 20);
      const bg = i === 1 ? a : "#14161d";
      s += `<g filter="url(#sh)">${R(x, y, size, size, 26, bg, i === 1 ? "" : 'stroke="#ffffff1f"')}`;
      s += `<circle cx="${x + size - 70}" cy="${y + 90}" r="${70 + r() * 30}" fill="${i === 1 ? "#0b0b0d" : a}" opacity="${i === 1 ? 0.18 : 0.35}"/>`;
      s += R(x + 28, y + 28, 120, 28, 14, i === 1 ? "#0b0b0d" : `${a}33`) + T(x + 88, y + 47, p.brand.split(" ")[0], 13, i === 1 ? "#fff" : a, 700, "middle");
      s += T(x + 28, y + size - 150, hd[0], 46, i === 1 ? "#0b0b0d" : "#fff", 800) + T(x + 28, y + size - 96, hd[1], 46, i === 1 ? "#0b0b0d" : a, 800);
      s += R(x + 28, y + size - 66, 150, 38, 19, i === 1 ? "#0b0b0d" : a) + T(x + 103, y + size - 41, "Learn more", 14, i === 1 ? "#fff" : "#0b0b0d", 700, "middle");
      s += `</g>`;
    });
    return s;
  },
  funnel: (w, h, p, _r) => {
    const a = p.accent;
    let s = "";
    const stages = [["Impressions", "1.2M"], ["Clicks", "48k"], ["Leads", "3.1k"], ["Qualified", "940"], ["Site visits", "210"]];
    const top = h * 0.12, sh = (h * 0.72) / stages.length, maxW = w * 0.5;
    stages.forEach(([n, v], i) => {
      const w1 = maxW * (1 - i * 0.16), w2 = maxW * (1 - (i + 1) * 0.16), y = top + i * sh, cx = w * 0.36;
      s += `<path d="M${cx - w1 / 2} ${y} L${cx + w1 / 2} ${y} L${cx + w2 / 2} ${y + sh - 8} L${cx - w2 / 2} ${y + sh - 8}Z" fill="${a}" opacity="${0.95 - i * 0.15}"/>`;
      s += T(cx, y + sh / 2 + 6, n, 20, "#0b0b0d", 700, "middle") + T(w * 0.66, y + sh / 2 + 8, v, 32, "#fff", 800) + T(w * 0.66 + 130, y + sh / 2 + 6, "illustrative", 13, "#9a9aa5");
    });
    s += T(w * 0.66, top - 20, `${p.brand} — campaign funnel`, 18, "#9a9aa5");
    return s;
  },
  brand: (w, h, p, _r) => {
    const a = p.accent, initial = p.brand.charAt(0);
    let s = `<g filter="url(#sh)">${R(w * 0.06, h * 0.1, w * 0.42, h * 0.8, 28, "#14161d", 'stroke="#ffffff1f"')}</g>`;
    const cx = w * 0.27, cy = h * 0.42;
    s += `<circle cx="${cx}" cy="${cy}" r="130" fill="${a}"/><circle cx="${cx + 52}" cy="${cy - 52}" r="54" fill="#0b0b0d"/>` + T(cx - 10, cy + 52, initial, 160, "#0b0b0d", 800, "middle");
    s += T(cx, cy + 230, p.brand, 44, "#fff", 800, "middle") + T(cx, cy + 266, "Primary logo lockup", 15, "#9a9aa5", 500, "middle");
    const sw = [a, "#0b0b0d", "#f4f4f2", "#9a9aa5", `${a}88`];
    sw.forEach((c, i) => {
      const x = w * 0.53 + i * 140;
      s += `<g filter="url(#sh)">${R(x, h * 0.1, 120, 180, 18, c, 'stroke="#ffffff22"')}</g>` + T(x + 14, h * 0.1 + 210, c.length > 7 ? "Tint" : c.toUpperCase(), 13, "#c9c9d1", 600);
    });
    s += `<g filter="url(#sh)">${R(w * 0.53, h * 0.47, w * 0.41, h * 0.43, 24, "#14161d", 'stroke="#ffffff1f"')}</g>`;
    s += T(w * 0.53 + 40, h * 0.47 + 150, "Aa", 130, "#fff", 800) + T(w * 0.53 + 260, h * 0.47 + 80, "Display — Bold", 18, a, 700) + T(w * 0.53 + 260, h * 0.47 + 112, "Body — Regular", 18, "#c9c9d1", 500);
    s += T(w * 0.53 + 260, h * 0.47 + 160, "ABCDEFGHIJKLM", 20, "#9a9aa5", 600) + T(w * 0.53 + 260, h * 0.47 + 192, "abcdefghijklm 0123456789", 20, "#9a9aa5", 400);
    return s;
  },
  print: (w, h, p, _r) => {
    const a = p.accent, cols = [a, "#F59E0B", "#EF4444"];
    let s = "";
    cols.forEach((c, i) => {
      const pw = 300, ph = 460, x = w / 2 - 520 + i * 360, y = h / 2 - ph / 2 + (i === 1 ? -30 : 20);
      s += `<g filter="url(#sh)"><path d="M${x + 20} ${y} L${x + pw - 20} ${y} Q${x + pw} ${y + 30} ${x + pw - 10} ${y + 80} L${x + pw} ${y + ph - 20} Q${x + pw} ${y + ph} ${x + pw - 20} ${y + ph} L${x + 20} ${y + ph} Q${x} ${y + ph} ${x} ${y + ph - 20} L${x + 10} ${y + 80} Q${x} ${y + 30} ${x + 20} ${y}Z" fill="${c}"/>`;
      s += R(x + 10, y + 14, pw - 20, 18, 4, "#00000022") + `<circle cx="${x + pw / 2}" cy="${y + 190}" r="78" fill="#fff" opacity=".9"/>`;
      s += T(x + pw / 2, y + 205, p.brand, 30, "#0b0b0d", 800, "middle") + T(x + pw / 2, y + 310, ["Sea Salt", "Chilli Lime", "BBQ"][i], 26, "#0b0b0d", 800, "middle");
      s += T(x + pw / 2, y + 344, "Baked · Organic", 15, "#0b0b0d", 600, "middle") + R(x + 40, y + ph - 70, pw - 80, 30, 15, "#0b0b0d") + T(x + pw / 2, y + ph - 50, "NET WT 60g", 13, "#fff", 700, "middle") + `</g>`;
    });
    return s;
  },
  support: (w, h, p, _r) =>
    browser(w * 0.06, h * 0.08, w * 0.88, h * 0.84, `support.${p.brand.toLowerCase().replace(/\W+/g, "")}.com`, (W, H) => {
      const a = p.accent;
      let s = R(0, 0, W, H, 0, "#0f1116") + T(32, 54, "Support operations — live", 22, "#fff", 700) + R(W - 190, 30, 160, 34, 17, "#10b98133") + T(W - 110, 52, "SLA on track", 14, "#34d399", 700, "middle");
      [["Open tickets", "128"], ["Avg. first reply", "38m"], ["CSAT (target)", "90%+"], ["Agents online", "14"]].forEach(([l, v], i) => {
        const cw = (W - 64 - 54) / 4, x = 32 + i * (cw + 18);
        s += R(x, 84, cw, 96, 14, "#161922") + T(x + 18, 114, l, 13, "#9a9aa5") + T(x + 18, 156, v, 30, i === 2 ? a : "#fff", 800);
      });
      s += R(32, 204, W * 0.62, H - 234, 14, "#161922") + T(52, 240, "Ticket queue", 16, "#fff", 700);
      ["Login issue after update", "Refund request #4418", "API rate limit question", "Invoice copy needed", "Feature request: export"].forEach((t, i) => {
        const y = 262 + i * 58;
        s += R(48, y, W * 0.62 - 32, 46, 10, i === 0 ? `${a}1f` : "#1b1e27") + `<circle cx="72" cy="${y + 23}" r="9" fill="${["#ef4444", a, "#f59e0b", "#10b981", "#6366f1"][i]}"/>` + T(92, y + 29, t, 14, "#eaeaea") + T(W * 0.62, y + 29, ["P1", "P2", "P2", "P3", "P3"][i], 13, "#9a9aa5", 700, "end");
      });
      const gx = W * 0.62 + 52, gw = W - gx - 32;
      s += R(gx, 204, gw, H - 234, 14, "#161922") + T(gx + 20, 240, "Agents", 16, "#fff", 700);
      for (let i = 0; i < 6; i++) {
        const y = 262 + i * 52;
        s += `<circle cx="${gx + 40}" cy="${y + 20}" r="16" fill="${a}${i % 2 ? "55" : "aa"}"/>` + R(gx + 66, y + 10, gw * 0.4, 9, 4, "#ffffff33") + R(gx + 66, y + 26, gw * 0.25, 7, 3, "#ffffff1a") + `<circle cx="${gx + gw - 24}" cy="${y + 20}" r="6" fill="${i === 4 ? "#f59e0b" : "#10b981"}"/>`;
      }
      return s;
    }),
};

function render(kind, w, h, p, seed) {
  const r = rng(seed);
  const body = (compose[kind] ?? compose.dashboard)(w, h, p, r);
  const badge = `<g opacity=".9">${R(w - 230, h - 64, 200, 36, 18, "#00000066", 'stroke="#ffffff22"')}${T(w - 130, h - 40, "Concept mockup", 14, "#ffffffcc", 600, "middle")}</g>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="${esc(p.title)} — ${kind} mockup">${backdrop(w, h, p.accent, r)}${body}${badge}</svg>`;
}

let count = 0;
for (const p of projects) {
  const dir = path.join(root, "public/portfolio", p.slug);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, "cover.svg"), render(p.cover, 1600, 1200, p, p.slug + "c"));
  for (let i = 0; i < 3; i++) await writeFile(path.join(dir, `${i + 1}.svg`), render(p.gallery[i], 1600, 1000, p, p.slug + i));
  count += 4;
}
console.log(`Generated ${count} SVG mockups for ${projects.length} projects.`);
