# Theta X Tech — Website & Admin Dashboard

Corporate website and content-management dashboard for **ThetaX Tech SMC Private Limited** (Karachi, Pakistan).

- **Public site:** home, about, services (+ one page per service), portfolio/case studies, blog, careers, contact, get-a-quote, privacy, terms, 404.
- **Admin dashboard** at `/admin`: blog, portfolio, services, page content, testimonials, team, FAQs, client logos, media library, leads inbox (CSV export), **AI Agent** (conversations, settings, export), careers, newsletter, SEO, settings, users & roles, 2FA.
- **AI sales/support agent** (Claude API): chat widget on every page, portfolio cards in chat, lead capture, human handoff, personalised auto-replies to contact/quote forms, optional WhatsApp.
- **3D homepage** (React Three Fiber): interactive AI-core scene with scroll storytelling; lightweight fallbacks for mobile, low-end devices and reduced motion.
- **Portfolio** with 14 seeded concept case studies (original SVG mockups) across AI Automation, Digital Marketing, UI/UX, Web, Graphic Design and BPO.
- **SEO / AEO:** per-page metadata, Open Graph/Twitter cards, JSON-LD (Organization, LocalBusiness, WebSite, Service, BlogPosting, BreadcrumbList, FAQPage, Review, JobPosting), `sitemap.xml`, `robots.txt`, `llms.txt`.

| | |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4, custom design tokens (dark-first, light mode toggle) |
| Animation | Three.js + React Three Fiber (lazy, client-only), CSS scroll-driven animations, Motion, GSAP ScrollTrigger (lazy), custom cursor — native scrolling |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`, server-side streaming + tool use) |
| Database | MySQL / MariaDB via Prisma 7 (`@prisma/adapter-mariadb`) |
| Auth | JWT session cookie (jose), bcrypt passwords, lockout, rate limiting, roles, TOTP 2FA |
| Editor | TipTap (headings, lists, links, images, tables, YouTube embeds, HTML view) |
| Media | Uploads converted to WebP with sharp; served from `/uploads`; `next/image` serves AVIF/WebP |
| Email | Nodemailer over SMTP (Hostinger mail) |

---

## 1. Local setup

Requirements: **Node.js 20.9+** (22 LTS recommended) and a MySQL 8 / MariaDB 10.6+ database.

```bash
npm install                 # also runs `prisma generate`
cp .env.example .env        # then fill in the values (see below)
npm run db:setup            # create tables + load starter content + admin user
npm run dev                 # http://localhost:3000  ·  admin: http://localhost:3000/admin
```

> **No database yet?** Leave `DATABASE_URL=""`. The public site still runs using the built-in starter content (`src/content/*`), so you can review the design. The admin needs a database.

### Using the Hostinger database from your PC
1. hPanel → **Databases → MySQL Databases** → create database + user.
2. hPanel → **Databases → Remote MySQL** → add your public IP (or `%` temporarily).
3. Use the host shown there (e.g. `srv123.hstgr.io`) in `DATABASE_URL`.

### Environment variables (`.env`)

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | ✅ | Public URL, e.g. `https://thetaxtech.com.pk` (canonical URLs, sitemap, OG). |
| `DATABASE_URL` | ✅ | `mysql://USER:PASSWORD@HOST:3306/DATABASE` — URL-encode special characters in the password. |
| `DATABASE_POOL_SIZE` | | Connection pool size (default 5). |
| `AUTH_SECRET` | ✅ | 32+ random characters. `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `SESSION_TIMEOUT_MINUTES` | | Admin session lifetime (default 120). |
| `SMTP_HOST` `SMTP_PORT` `SMTP_SECURE` `SMTP_USER` `SMTP_PASSWORD` `SMTP_FROM` `LEADS_NOTIFY_EMAIL` | | Email for lead notifications & password resets. Can instead be set in **Admin → Settings → Email**. |
| `SEED_ADMIN_EMAIL` `SEED_ADMIN_PASSWORD` | | Default admin created by the seed (forced password change at first login). |
| `UPLOAD_DIR` | | Where media uploads are stored (default `./uploads`, outside the build so deploys don't wipe them). |
| `ANTHROPIC_API_KEY` | ✅ for AI | Claude API key (console.anthropic.com). Server-side only. Without it the chat uses a basic rule-based fallback. |
| `ANTHROPIC_MODEL` | | Override the agent model (default `claude-opus-5-5`, low effort for fast replies). |
| `WHATSAPP_VERIFY_TOKEN` `WHATSAPP_APP_SECRET` `WHATSAPP_ACCESS_TOKEN` `WHATSAPP_PHONE_NUMBER_ID` | | Optional WhatsApp Business Cloud API connection (see §4). |

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` | `prisma generate` + production build |
| `npm start` | Production server (honours `PORT`) |
| `npm run db:migrate` | Apply migrations (production-safe) |
| `npm run db:seed` | Load starter content (idempotent; `-- --force` resets content to defaults, keeps users/leads/media) |
| `npm run db:setup` | `db:migrate` + `db:seed` |
| `npm run db:migrate:dev -- --name x` | Create a new migration after editing `prisma/schema.prisma` |
| `npm run lint` / `npm run typecheck` | Code quality checks |
| `npm run art:portfolio` | Regenerate the SVG mockups for the sample portfolio projects |
| `npm run art:blog` | Regenerate the blog cover (1200×630) and in-article images as WebP in `public/blog/<slug>/` |

Default admin after seeding: **admin@thetaxtech.com.pk / ChangeMe!2026** (or your `SEED_ADMIN_*` values) — you must change it at first login.

---

## 2. Deploying to Hostinger (Business / Cloud plan — Node.js apps)

> Plain shared **PHP-only** hosting cannot run this site. You need a plan with **Node.js Web Apps** (Business or Cloud) or a **VPS** (see 2b).

### 2a. Hostinger Node.js Web App (recommended)

1. **Create the database** — hPanel → *Databases → MySQL Databases*. Note DB name, user, password. Host is `localhost` for apps on the same plan.
2. **Push the code to GitHub** (private repo). Do **not** commit `.env` or `uploads/` (already in `.gitignore`).
3. hPanel → **Websites → Add website → Node.js Web App** (or *Advanced → Node.js*), connect the GitHub repo, then set:
   - **Node version:** 22.x (minimum 20.9)
   - **Framework preset:** Next.js
   - **Install command:** `npm ci`
   - **Build command:** `npm run build`
   - **Start command:** `npm start`
   - **Root/entry:** project root (where `package.json` is)
4. **Environment variables** — add every variable from `.env.example` in the app's *Environment variables* screen. Set `NEXT_PUBLIC_SITE_URL=https://thetaxtech.com.pk` and `DATABASE_URL=mysql://u123_thetax:PASSWORD@localhost:3306/u123_thetax`.
5. **First deploy**, then initialise the database once (hPanel → *Node.js app → Terminal/SSH*, in the app folder):
   ```bash
   npm run db:setup
   ```
   (Alternative: run `npm run db:setup` from your PC with `DATABASE_URL` pointing at the Remote-MySQL host.)
6. **Domain & SSL** — point `thetaxtech.com.pk` to the app (*Domains → connect*). In *Security → SSL* install the free SSL and enable **Force HTTPS**.
7. **www redirect** — in *Domains → Redirects* add a 301 from `www.thetaxtech.com.pk` → `https://thetaxtech.com.pk` (or the reverse — just be consistent with `NEXT_PUBLIC_SITE_URL`).
8. **Email** — create `info@thetaxtech.com.pk` in *Emails*, then fill **Admin → Settings → Email (SMTP)**: host `smtp.hostinger.com`, port `465`, SSL on, user = mailbox, password = mailbox password. Click **Send test email**.
9. Sign in at `https://thetaxtech.com.pk/admin`, change the temporary password, and enable 2FA (*My account*).

**Updating the site later:** push to GitHub → Hostinger rebuilds automatically (or click *Redeploy*). If you changed `prisma/schema.prisma`, also run `npm run db:migrate` once. Always stop the old app process before starting the new build, and if you rebuild in place (VPS) delete the old `.next` folder first — otherwise Next.js can keep serving cached pages from the previous version (`.next/server/route-cache`).

**Uploads persistence:** media is stored in `UPLOAD_DIR`. If your plan replaces the app folder on each deploy, set `UPLOAD_DIR` to a folder outside it, e.g. `/home/u123456789/thetax-uploads`.

### 2b. Hostinger VPS (Ubuntu) alternative

```bash
# as root / sudo
apt update && apt install -y nginx mariadb-server git
curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && apt install -y nodejs
npm i -g pm2
mysql -e "CREATE DATABASE thetax; CREATE USER 'thetax'@'localhost' IDENTIFIED BY 'STRONG_PASS'; GRANT ALL ON thetax.* TO 'thetax'@'localhost';"

git clone <repo> /var/www/thetax && cd /var/www/thetax
cp .env.example .env && nano .env        # fill values, UPLOAD_DIR=/var/www/thetax-uploads
npm ci && npm run build && npm run db:setup
pm2 start npm --name thetax -- start && pm2 save && pm2 startup
```
Nginx site (`/etc/nginx/sites-available/thetax`):
```nginx
server {
  server_name thetaxtech.com.pk www.thetaxtech.com.pk;
  client_max_body_size 20m;
  location / { proxy_pass http://127.0.0.1:3000; proxy_set_header Host $host; proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; proxy_set_header X-Forwarded-Proto $scheme; }
}
```
Then `ln -s` it into `sites-enabled`, `nginx -t && systemctl reload nginx`, and `apt install certbot python3-certbot-nginx && certbot --nginx -d thetaxtech.com.pk -d www.thetaxtech.com.pk` for SSL.

---

## 3. Production checklist

- [ ] `NEXT_PUBLIC_SITE_URL` is the final https domain; `AUTH_SECRET` is long and random.
- [ ] HTTPS forced, SSL valid, single canonical host (www → non-www or vice versa).
- [ ] Default admin password changed; **2FA enabled** for every admin; remove unused users.
- [ ] SMTP configured and test email received; submit the contact form once to confirm delivery.
- [ ] Replace **placeholder content**: stats counters, testimonials (must be genuine), team members, legal text (have a lawyer review Privacy/Terms).
- [ ] Portfolio: the 14 seeded projects are **concept samples** (badge “Sample project”). Replace them with real ThetaX work in Admin → Portfolio (edit, or delete), and untick “Sample / concept project” on real ones.
- [ ] Add `ANTHROPIC_API_KEY`, then test the chat (Admin → AI Agent shows “Claude API: Connected”). Review the agent's greeting/tone/instructions and business hours.
- [ ] Set a monthly spend limit for the Claude API in the Anthropic Console.
- [ ] Add social links, Google Analytics ID and Search Console verification in Settings.
- [ ] Submit `https://thetaxtech.com.pk/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
- [ ] Security headers are sent automatically (HSTS, X-Frame-Options, nosniff, Referrer-Policy, Permissions-Policy — see `next.config.ts`).
- [ ] **Backups:** enable Hostinger daily/weekly backups *and* export the database monthly (hPanel → phpMyAdmin → Export) + download the `uploads` folder.
- [ ] **Error logging:** Hostinger *Node.js app → Logs* (or `pm2 logs thetax` on VPS). Server errors are written with `[data]`, `[leads]`, `[mail]`, `[admin:…]` prefixes for easy searching. Optionally add Sentry later.
- [ ] Uptime monitor (e.g. UptimeRobot, free) on the homepage.
- [ ] **Speed / caching** (see below), then check with PageSpeed Insights (mobile) on the live domain.

### Performance & caching on Hostinger

The app is already tuned: the hero text is plain HTML with a single CSS slide. The WebGL visuals are layered and adaptive:
- **Hero backdrop** (every hero, `components/three/shader-backdrop.tsx`): one fragment shader (aurora, wave grid, particles, pointer glow) rendered in a **Web Worker via OffscreenCanvas**, so it costs the main thread almost nothing; reduced resolution, DPR cap, adaptive quality, paused off-screen / in background tabs.
- **Homepage 3D scene** (`ai-core-scene.tsx`, React Three Fiber): quality tiers from `quality.ts` — *high* (desktop), *mid* (tablets, ≤ 4-core / ≤ 4 GB machines), *low* (phones, loaded on first scroll/touch). All vertex animation runs in shaders; an FPS monitor lowers pixel ratio, particle count and extras on slow devices; rendering stops when off-screen.
- Reduced-motion and data-saver visitors get static visuals; devices without GPU acceleration get the CSS hero (no WebGL at all).

Beyond that, the chat widget, Analytics and the admin editor load on demand; images are AVIF/WebP via `next/image` with lazy loading; fonts are self-hosted (`next/font`, `display: swap`).

On the server side:
- **Compression:** Next.js gzips responses itself. Hostinger's LiteSpeed/hCDN adds **Brotli** — leave it on.
- **HTTP/2 and HTTP/3:** enabled by default on Hostinger with SSL; on a VPS use `listen 443 ssl http2;` in Nginx.
- **Cache headers:** `/_next/static/*` is served `immutable` for one year; `/brand/*` is immutable; generated portfolio and blog art is cached for a week (`next.config.ts`). Optimised images are cached by Next.js.
- **CDN:** turn on **Hostinger CDN** (hPanel → *Performance → CDN*) or put the domain behind **Cloudflare** (free). Do **not** cache HTML pages at the CDN for longer than a few minutes — pages revalidate every 5 minutes so admin edits appear quickly. Never cache `/admin` or `/api`.

---

## 4. AI agent & WhatsApp

**How it works.** Visitor messages go to `POST /api/chat`, which streams Claude's reply back (server-sent events). The agent answers only from a knowledge base built live from your Services, Portfolio, FAQs, About and Contact content, so dashboard edits update it automatically. Tools let it show portfolio cards, save a lead (Leads inbox + email to info@), or hand off to a human (email notification). It never quotes prices or invents facts. Conversations are stored per session and visible in **Admin → AI Agent** (export to CSV). Rate limits: 20 messages / 5 min per IP and 60 per conversation; messages max 1,500 characters.

**Contact & quote forms.** After a form is submitted, the agent emails the visitor a personalised acknowledgement with related portfolio links (toggle in Admin → AI Agent → Settings). Requires SMTP.

**Costs.** Each chat reply is one or more Claude API calls; the knowledge base is prompt-cached to keep repeat costs low. Set a budget in the Anthropic Console. To favour speed/cost you can set `ANTHROPIC_MODEL` to a smaller model.

**WhatsApp (optional).**
1. In Meta for Developers create an app → add **WhatsApp** → note the Phone number ID and generate a permanent access token (System User).
2. Set `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET` (App settings → Basic) and choose any `WHATSAPP_VERIFY_TOKEN` string.
3. Webhooks → Callback URL `https://thetaxtech.com.pk/api/whatsapp/webhook`, Verify token = your `WHATSAPP_VERIFY_TOKEN`, subscribe to **messages**.
4. Admin → AI Agent shows “WhatsApp: Connected”. Incoming messages are answered by the same agent and logged as WhatsApp conversations.

**Inbound email.** Replies to the auto-acknowledgement land in the info@ mailbox as normal (the agent does not read the mailbox).

## 5. Project structure

```
prisma/               schema.prisma, migrations, seed.ts
public/brand/         official logo files
src/app/(site)/       public pages (home, about, services, portfolio, blog, careers, contact, quote, legal)
src/app/admin/        admin: (auth) login/reset, (panel) dashboard modules, actions/ (server actions)
src/app/api/          leads, newsletter, admin media upload, CSV exports
src/app/uploads/      serves uploaded media
src/app/sitemap.ts · robots.ts · llms.txt/ · opengraph-image.tsx · og/blog/[slug]
src/components/       UI, layout, motion (animation primitives), admin (form engine, media picker, editor)
src/content/          starter content (seed + fallback when DB is unavailable)
src/lib/              data access, auth, permissions, SEO/JSON-LD, mail, validation, rate limit
```

### Adding a new module (plug-in architecture)
1. Add a model to `prisma/schema.prisma` → `npm run db:migrate:dev -- --name add_events`.
2. Add server actions in `src/app/admin/actions/` using the `mutate()` / `remove()` helpers (`src/lib/admin-actions.ts`).
3. Add admin pages under `src/app/admin/(panel)/<module>/` — forms are declared as data and rendered by `EntityForm` (see `layouts.ts` for examples).
4. Register it in `src/lib/admin-modules.ts` (sidebar, permissions) and optionally add a feature flag under *Settings → Modules*.
5. Add public pages in `src/app/(site)/` and data loaders in `src/lib/data.ts`.

See **[docs/ADMIN-GUIDE.md](docs/ADMIN-GUIDE.md)** for the non-technical admin guide.
