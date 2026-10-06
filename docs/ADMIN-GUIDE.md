# Theta X Tech — Admin User Guide

Sign in at **https://thetaxtech.com.pk/admin** with your email and password. Changes you save appear on the website immediately.

> **First login:** you'll be asked to replace the temporary password. Then go to **My account** (click your name, bottom-left) and turn on **two-factor authentication** — scan the QR code with Google Authenticator or Microsoft Authenticator.

---

## Write and publish a blog post

1. Go to **Blog posts → New post**.
2. Enter the **Title**. The **URL slug** fills in automatically (keep it short, e.g. `ai-automation-for-smes`).
3. Write the **Excerpt** (1–2 sentences). It appears on blog cards and in Google if you leave the meta description empty.
4. Write the **Article** in the editor:
   - Use **H2** for main sections and **H3** for sub-sections. They build the table of contents automatically.
   - Start with a short, direct answer to the article's main question. Google AI Overviews and ChatGPT like to quote these.
   - Use the toolbar to add links, images (from the Media library), tables or a YouTube video.
5. *(Optional)* Add a few questions in **FAQ block**. They appear under the article and help with Google rich results.
6. In the right-hand column:
   - **Category** and **Tags**.
   - **Featured image** plus **Alt text** (describe the image). Every post should have one: it shows on the blog cards, at the top of the article, and as the preview image when the link is shared on Facebook, LinkedIn, X or WhatsApp. Use **1200×630** pixels; uploads are converted to WebP automatically. Use only your own images or royalty-free ones (e.g. Unsplash, Pexels).
7. **SEO** section: write an SEO title (around 50–60 characters) and a meta description (around 120–160). The counters turn green when the length is right, and the box underneath shows how the result will look on Google.
8. Choose how to publish:
   - **Publish now**, which goes live immediately.
   - **Save draft**, which is invisible on the site. Use **Preview** to check it.
   - **Scheduled**: set *Status = Scheduled* and choose a future **Publish date**. It goes live automatically within about 5 minutes of that time.

To edit later, open **Blog posts**, click the title, change it and press **Save**. Manage categories at the bottom of the Blog posts page.

---

## Add a portfolio project (case study)

1. **Portfolio → New project**.
2. Fill in **Title**, **Summary**, **Problem** and **Solution**. Optionally write a longer **Full case study**.
3. **Results:** add 2–3 numbers, for example *Value* `72%` with *Label* `chats handled automatically`. Numbers animate on the site.
4. Right-hand column:
   - **Category**, for example *AI Solutions*, *Web Development* or *BPO*. Reuse the same names so the portfolio filter stays tidy.
   - **Client**, **Industry**, **Year**.
   - **Tech stack**: type a tool name and press Enter.
   - **Related services**: tick the services involved. The project then appears on those service pages.
   - **Cover image**: about 1600×1200.
5. Add screenshots under **Gallery**.
6. **Published** shows the project on the site. **Featured** puts it in the homepage carousel.
7. Press **Create project**. Use the ↑ ↓ arrows on the Portfolio list to change the order.

### Replacing the sample projects

The 14 projects installed at setup are **concept samples**. They're marked "sample" in the list and show a **Sample project** badge on the website. To replace one with real work:

1. Open it in **Portfolio**.
2. Change the title, client, text and results to the real project.
3. Upload real screenshots as the cover and gallery images.
4. Switch off **Sample / concept project**, then press **Save**.

You can also delete a sample with the bin icon, or hide it by unticking *Published*. To hide every sample badge at once, use **Settings → Modules → Show sample badge**. Do that only once the projects are real.

---

## AI Agent (website chat)

The chat bubble on every page is an AI assistant. It answers questions about your services, shows portfolio projects, collects leads and hands visitors over to your team.

- **Conversations:** **AI Agent → Conversations** lists every chat.
  - Filter by *lead* (contact details were saved, and the lead is also in the Leads inbox) or *handoff* (the visitor asked for a person, and you got an email).
  - Open a chat to read the full transcript, then mark it **Closed** once someone has followed up.
- **Settings:** **AI Agent → Agent settings** lets you change the assistant's name, greeting, quick-reply suggestions, tone, extra instructions and business hours. You can also turn the chat off.
  - Changes to Services, Portfolio and FAQs are picked up automatically.
  - The assistant never quotes prices or makes promises.
- **Export:** **Export chats (CSV)** downloads the transcripts.
- **Form replies:** when someone submits the contact or quote form, the assistant emails them a personalised thank-you with related projects. You can switch this off under *Automatic replies*.
- **Not configured:** if the status card says *Not configured*, the Claude API key hasn't been added on the server yet. Until it is, a simpler assistant answers.

---

## Add or edit a service

1. **Services → New service**, or click an existing one.
2. **Basics:** name, slug, tagline, short description, and an **Icon** (right column).
3. **Direct answer (AEO):** a question heading such as *"What BPO services does Theta X Tech offer?"* and a factual answer of 40–60 words. This is the most important block for AI search engines.
4. Fill **Problem & solution**, **What's included**, **Process**, **Benefits** and **FAQs**. Use **Add item** to add rows and the arrows to reorder them.
5. **SEO:** title, meta description and target keywords.
6. **Visible on website** shows or hides the service everywhere: menu, footer, services page and sitemap.

New services automatically get their own page at `/services/your-slug` and appear in the navigation mega-menu.

---

## Other everyday tasks

| Task | Where |
|---|---|
| Change homepage headline, counters, spotlights, process, industries, tech list or the bottom call-to-action | **Pages & content → Homepage**. Each section has a *Show* switch. |
| Edit the About page (story, mission, values, timeline) | **Pages & content → About page** |
| Add testimonials, team members, FAQs and client logos | **Pages & content →** matching tab. Only publish genuine client reviews. |
| Edit the Privacy Policy and Terms | **Pages & content → Legal pages** |
| Reply to enquiries | **Leads inbox**: open a lead, reply by email or WhatsApp, set *Contacted* or *Closed*, add notes. Use **Export CSV** for Excel. |
| Upload, rename and delete images | **Media library**: drag and drop files in. Always fill in *Alt text*. |
| Post a job | **Careers → New job**. Applications arrive in the Leads inbox. |
| Change logo, colours, contact details, social links, Google Analytics, email settings | **Settings** |
| Turn Careers, the Newsletter or the cookie banner on or off | **Settings → Modules** (the WhatsApp number still appears as a link on the Contact page and in the footer; the AI assistant is the only floating chat button) |
| Override page titles and descriptions for Google, and see SEO warnings | **SEO** |
| Add teammates and set roles | **Users & roles** (super admin only) |

### Roles
- **Editor:** blog, portfolio, media.
- **Admin:** everything except managing users.
- **Super admin:** everything.

### Forgot your password?
Click **Forgot password?** on the sign-in page. A reset link valid for one hour is emailed to you.

### Tips
- Images are automatically converted to fast WebP, but upload reasonably sized originals (under 5 MB).
- Leaving a page with unsaved changes shows a warning, and the bottom bar shows *● Unsaved changes*.
- If something doesn't update on the website, go to **Settings → Clear cache**.
