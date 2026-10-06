/**
 * Default service content. Used by the seed script and as a fallback when the
 * database is unreachable. Edit live content in Admin → Services, not here.
 */

export type Item = { title: string; description: string };
export type Faq = { question: string; answer: string };

export type ServiceContent = {
  slug: string;
  name: string;
  icon: string;
  tagline: string;
  shortDescription: string;
  answerQuestion: string;
  answer: string;
  problem: string;
  solution: string;
  features: Item[];
  benefits: Item[];
  process: Item[];
  faqs: Faq[];
  longDescription: string;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  isFeatured: boolean;
  order: number;
};

export const services: ServiceContent[] = [
  {
    slug: "ai-automation",
    name: "AI Automation",
    icon: "workflow",
    tagline: "Automate the busywork. Keep the growth.",
    shortDescription:
      "End-to-end automation of repetitive business processes for SMEs and startups — from lead intake and invoicing to reporting — so your team spends time on work that moves revenue.",
    answerQuestion: "What is AI automation for small businesses?",
    answer:
      "AI automation connects your existing tools — email, CRM, spreadsheets, accounting and WhatsApp — and uses AI to handle repetitive steps such as data entry, document reading, follow-ups and reporting. Theta X Tech designs, builds and maintains these workflows for SMEs and startups in Pakistan and abroad, typically cutting manual effort by 40–70%.",
    problem:
      "Growing teams drown in copy-paste work: re-typing orders, chasing invoices, updating spreadsheets and answering the same questions. It is slow, error-prone and expensive, and it keeps skilled people away from customers.",
    solution:
      "We map your processes, find the steps a machine can do reliably, and build automations with tools like n8n, Make and Zapier plus custom AI where judgement is needed. Every workflow is monitored, documented and handed over with training.",
    features: [
      { title: "Process discovery & mapping", description: "We document how work really flows today and rank automation opportunities by ROI." },
      { title: "Workflow automation", description: "n8n, Make or Zapier workflows that move data between your apps without manual steps." },
      { title: "AI document processing", description: "Read invoices, receipts, CVs and forms automatically and push clean data into your systems." },
      { title: "Smart notifications & reporting", description: "Daily dashboards and alerts delivered to email, Slack or WhatsApp." },
      { title: "Monitoring & support", description: "Error alerts, logs and monthly optimisation so automations keep running." },
    ],
    benefits: [
      { title: "Hours back every week", description: "Free your team from repetitive tasks and refocus them on customers." },
      { title: "Fewer errors", description: "Machines don't mistype figures or forget follow-ups." },
      { title: "Scale without hiring", description: "Handle more orders, leads and tickets with the same headcount." },
      { title: "Fast payback", description: "Most automations pay for themselves within the first few months." },
    ],
    process: [
      { title: "Audit", description: "Workshops to map processes and quantify time spent." },
      { title: "Blueprint", description: "A prioritised automation roadmap with expected savings." },
      { title: "Build & test", description: "We build workflows in sprints and test against real data." },
      { title: "Launch & improve", description: "Go-live, training, monitoring and continuous tuning." },
    ],
    faqs: [
      { question: "Which processes can be automated first?", answer: "Start with high-volume, rule-based tasks: lead capture, invoice processing, data entry between apps, report generation and customer follow-ups. These usually deliver the fastest return." },
      { question: "Do I need to replace my current software?", answer: "No. We connect the tools you already use — Google Workspace, Microsoft 365, HubSpot, QuickBooks, WhatsApp Business and more — through their APIs." },
      { question: "How long does an automation project take?", answer: "A single workflow is often live in 1–2 weeks. A full automation programme for a department typically runs 4–8 weeks." },
      { question: "Is my data secure?", answer: "Yes. We use least-privilege access, encrypted connections and can self-host tools like n8n on your own server when data must stay in-house." },
    ],
    longDescription:
      "<h2>Why SMEs in Pakistan are investing in AI automation</h2><p>Labour-intensive back-office work used to be the only way to scale. Today, affordable automation platforms and AI models let a five-person team operate like a fifty-person one. Theta X Tech helps businesses in Karachi, across Pakistan and internationally adopt automation safely and measurably.</p><h2>What we automate</h2><ul><li>Lead capture from websites, Facebook and WhatsApp into your CRM</li><li>Invoice, receipt and purchase-order processing</li><li>Customer onboarding and follow-up sequences</li><li>Inventory, order and delivery status updates</li><li>Weekly KPI reports and management dashboards</li></ul><h2>Built to last</h2><p>Every automation is documented, monitored and owned by you. We provide training so your team can make small changes without calling a developer.</p>",
    seoTitle: "AI Automation Services in Pakistan for SMEs & Startups",
    seoDescription:
      "Theta X Tech automates repetitive business processes for SMEs and startups in Pakistan — n8n, Make & Zapier workflows, AI document processing and reporting. Book a free automation audit.",
    seoKeywords: "AI automation Pakistan, business process automation Karachi, n8n automation, workflow automation SMEs",
    isFeatured: true,
    order: 1,
  },
  {
    slug: "ai-services",
    name: "AI Services & Agents",
    icon: "bot",
    tagline: "Custom AI agents that work like your best employee.",
    shortDescription:
      "AI strategy and consulting, custom AI agents and chatbots, document and data automation, and AI integrations into the systems you already run.",
    answerQuestion: "What AI services does Theta X Tech provide?",
    answer:
      "Theta X Tech, a Karachi-based technology company, provides AI strategy and consulting, custom AI agents and chatbots, workflow automation, document and data automation, and AI integration into existing software. We design practical, secure AI solutions that answer customers, qualify leads, process documents and support teams around the clock.",
    problem:
      "Most businesses know AI matters but don't know where to start. Off-the-shelf chatbots give generic answers, pilots stall, and nobody is sure how to use AI safely with company data.",
    solution:
      "We start with strategy — where AI creates measurable value for you — then build custom agents grounded in your own knowledge base, connected to your CRM, helpdesk and databases, with guardrails, human hand-off and analytics.",
    features: [
      { title: "AI strategy & consulting", description: "Opportunity assessment, use-case prioritisation, data readiness and a practical roadmap." },
      { title: "Custom AI agents & chatbots", description: "Website, WhatsApp and internal assistants trained on your documents and policies." },
      { title: "Workflow automation", description: "n8n, Make and Zapier-style flows with AI steps for classification, extraction and drafting." },
      { title: "Document & data automation", description: "Extract, validate and route data from PDFs, emails, forms and scans." },
      { title: "AI integrations", description: "Add AI features to your existing CRM, ERP, helpdesk or web app via APIs." },
      { title: "Training & governance", description: "Staff training, usage policies and evaluation so AI stays accurate and compliant." },
    ],
    benefits: [
      { title: "24/7 customer response", description: "Answer common questions instantly in English and Urdu, day and night." },
      { title: "Higher lead conversion", description: "Agents qualify and book leads before competitors reply." },
      { title: "Grounded, accurate answers", description: "Retrieval from your own knowledge base reduces made-up answers." },
      { title: "Measurable ROI", description: "Every agent ships with analytics on resolution rate and time saved." },
    ],
    process: [
      { title: "Discover", description: "Identify high-value AI use cases and success metrics." },
      { title: "Prototype", description: "A working proof-of-concept on your real data within weeks." },
      { title: "Productionise", description: "Security, guardrails, integrations, human hand-off and monitoring." },
      { title: "Scale", description: "Roll out to more teams and channels; improve with feedback." },
    ],
    faqs: [
      { question: "What is an AI agent?", answer: "An AI agent is software that uses a large language model to understand requests, look up information and take actions — such as booking a meeting, creating a ticket or updating a CRM — on behalf of a user or customer." },
      { question: "Can the chatbot speak Urdu?", answer: "Yes. Our agents can understand and reply in English, Urdu and Roman Urdu, which suits customers in Pakistan." },
      { question: "Will AI replace my staff?", answer: "Our goal is augmentation. AI handles repetitive questions and data work so your people can focus on complex, high-value conversations." },
      { question: "How do you keep company data private?", answer: "We use enterprise AI APIs that don't train on your data, restrict access by role, and can deploy components on your own infrastructure." },
    ],
    longDescription:
      "<h2>AI that fits how your business already works</h2><p>We don't sell hype. Every AI engagement begins with a clear business case — fewer hours spent, faster responses, more qualified leads — and ends with a system your team trusts.</p><h2>Popular AI agent use cases</h2><ul><li>Website and WhatsApp sales assistants that qualify and book leads</li><li>Customer-support agents that resolve FAQs and escalate the rest</li><li>Internal knowledge assistants for HR, policies and SOPs</li><li>Document agents that read invoices, contracts and applications</li></ul>",
    seoTitle: "AI Agents Development & AI Consulting in Karachi, Pakistan",
    seoDescription:
      "Custom AI agents, chatbots and AI integrations by Theta X Tech, Karachi. AI strategy, document automation and workflow automation for businesses in Pakistan and worldwide.",
    seoKeywords: "AI agents development, AI chatbot Pakistan, AI consulting Karachi, custom AI solutions",
    isFeatured: true,
    order: 2,
  },
  {
    slug: "bpo-services",
    name: "BPO Services",
    icon: "headset",
    tagline: "Your offshore team in Karachi — trained, managed, measured.",
    shortDescription:
      "Business process outsourcing from Pakistan: customer support, back-office operations, data entry, virtual assistants, lead generation, bookkeeping and tax support operations, and document processing.",
    answerQuestion: "What BPO services does Theta X Tech offer in Pakistan?",
    answer:
      "Theta X Tech provides business process outsourcing from Karachi, Pakistan: customer support, back-office operations, data entry and processing, virtual assistants, lead generation and appointment setting, bookkeeping and tax support operations, and document processing. Our trained, supervised teams combine human expertise with AI tools to deliver accurate work at lower cost.",
    problem:
      "Hiring and managing in-house staff for support and back-office work is costly and slow. Quality drops when volumes spike, and senior people end up doing admin instead of growing the business.",
    solution:
      "We give you a dedicated or shared team in Karachi with clear SLAs, quality checks and weekly reporting. Because we are also an AI company, we automate the repetitive parts first — so you pay for skilled work, not keystrokes.",
    features: [
      { title: "Customer support", description: "Email, chat, phone and social support with defined response-time SLAs." },
      { title: "Back-office operations", description: "Order processing, CRM updates, reconciliations and admin tasks." },
      { title: "Data entry & processing", description: "Accurate, double-checked data capture, cleansing and migration." },
      { title: "Virtual assistants", description: "Dedicated assistants for inbox, calendar, research and coordination." },
      { title: "Lead generation & appointment setting", description: "Prospect research, outreach and booked meetings for your sales team." },
      { title: "Bookkeeping & tax support operations", description: "Transaction coding, reconciliations and document preparation for your accountants." },
      { title: "Document processing", description: "Scanning, indexing, extraction and verification of high-volume documents." },
    ],
    benefits: [
      { title: "Save up to 60% on costs", description: "Skilled Pakistani talent at a fraction of in-house costs." },
      { title: "AI-assisted accuracy", description: "Automation and QA checks keep error rates low." },
      { title: "Overlap with your time zone", description: "Shifts aligned to UK, EU, US or Gulf business hours." },
      { title: "Transparent reporting", description: "Weekly KPIs: volumes, turnaround times and quality scores." },
    ],
    process: [
      { title: "Scope", description: "We document tasks, volumes, tools and SLAs with you." },
      { title: "Pilot", description: "A 2–4 week pilot proves quality before you commit." },
      { title: "Onboard", description: "Team selection, training on your SOPs and secure tool access." },
      { title: "Operate & optimise", description: "Daily QA, weekly reporting and continuous automation." },
    ],
    faqs: [
      { question: "Why outsource to Pakistan?", answer: "Pakistan has a large English-speaking, university-educated workforce, competitive costs and convenient time-zone overlap with the UK, Europe and the Gulf, plus flexible shifts for North America." },
      { question: "Is there a minimum contract?", answer: "We offer a short pilot followed by monthly contracts. You can start with a single dedicated resource and scale up as volumes grow." },
      { question: "How do you protect client data?", answer: "Staff sign NDAs, access is role-based through your tools or secure VPN, and we follow documented data-handling procedures with regular audits." },
      { question: "Can you support bookkeeping and tax work?", answer: "Yes. Our team supports accountants and businesses with bookkeeping, reconciliations and tax-document preparation; final filings remain with your licensed tax adviser." },
    ],
    longDescription:
      "<h2>BPO from Karachi, powered by automation</h2><p>Traditional outsourcing moves work to cheaper hands. We go further: we first automate what can be automated, then assign trained people to the work that needs judgement. The result is faster turnaround, higher accuracy and lower cost.</p><h2>Industries we support</h2><p>E-commerce, logistics, real estate, healthcare administration, professional services, accounting firms and SaaS companies.</p>",
    seoTitle: "BPO Services in Pakistan | Outsourcing from Karachi",
    seoDescription:
      "Outsource customer support, back-office, data entry, virtual assistants, lead generation and bookkeeping to Theta X Tech in Karachi, Pakistan. AI-assisted BPO with clear SLAs.",
    seoKeywords: "BPO services Pakistan, outsourcing Karachi, virtual assistant Pakistan, data entry services, bookkeeping outsourcing Pakistan",
    isFeatured: true,
    order: 3,
  },
  {
    slug: "web-development",
    name: "Web Development",
    icon: "code",
    tagline: "Fast, secure websites and web apps that convert.",
    shortDescription:
      "High-performance websites, e-commerce stores and custom web applications built with modern frameworks, SEO-ready from day one.",
    answerQuestion: "Why choose Theta X Tech as your web development company in Karachi?",
    answer:
      "Theta X Tech builds fast, secure and SEO-ready websites and web applications using modern frameworks such as Next.js, React and Node.js. As a Karachi web development company, we combine design, development, SEO and AI integration in one team, delivering sites that load quickly, rank well and turn visitors into customers.",
    problem:
      "Slow, outdated or template websites lose visitors in seconds, rank poorly on Google and are hard to update. Many businesses also juggle separate vendors for design, development and hosting.",
    solution:
      "We design and build bespoke websites and web apps on modern, maintainable stacks — with Core Web Vitals, technical SEO, accessibility and an easy admin panel built in — and support you after launch.",
    features: [
      { title: "Corporate websites", description: "Premium, animated, content-managed sites that reflect your brand." },
      { title: "E-commerce", description: "Shopify, WooCommerce and custom stores with local payment gateways." },
      { title: "Custom web applications", description: "Portals, dashboards, SaaS products and internal tools." },
      { title: "APIs & integrations", description: "Connect CRMs, ERPs, payment gateways and AI services." },
      { title: "Performance & SEO", description: "Lighthouse 90+ targets, structured data and technical SEO." },
      { title: "Maintenance & hosting", description: "Updates, backups, security monitoring and uptime support." },
    ],
    benefits: [
      { title: "Speed that ranks", description: "Fast sites rank higher and convert better." },
      { title: "You stay in control", description: "Edit content yourself through a clean admin dashboard." },
      { title: "Built to scale", description: "Clean architecture that grows with your business." },
      { title: "One accountable team", description: "Design, build, SEO and support under one roof." },
    ],
    process: [
      { title: "Discovery", description: "Goals, audience, sitemap and technical requirements." },
      { title: "Design", description: "Wireframes and high-fidelity UI approved before build." },
      { title: "Development", description: "Agile sprints with staging previews you can review." },
      { title: "Launch & support", description: "QA, SEO checks, go-live and ongoing care." },
    ],
    faqs: [
      { question: "How much does a website cost in Pakistan?", answer: "Cost depends on scope. A professional corporate site is typically quoted after a short discovery call; custom web apps are priced per milestone. Request a free quote for an exact figure." },
      { question: "How long does it take to build a website?", answer: "A corporate website usually takes 3–6 weeks; e-commerce stores and custom web applications take 6–16 weeks depending on features." },
      { question: "Will my website be mobile-friendly and SEO-optimised?", answer: "Yes. Every site is mobile-first, accessible and built with technical SEO, schema markup and fast loading as standard." },
      { question: "Do you provide hosting and maintenance?", answer: "Yes. We deploy to reliable hosting such as Hostinger, AWS or Vercel and offer monthly maintenance plans." },
    ],
    longDescription:
      "<h2>Modern web development, done properly</h2><p>We build with Next.js, React, TypeScript, Node.js, Laravel and headless CMS platforms — choosing the right tool for your goals, not the trendiest one.</p><h2>What's included as standard</h2><ul><li>Mobile-first, accessible design</li><li>Technical SEO and JSON-LD schema</li><li>Analytics and Search Console setup</li><li>Security headers, SSL and backups</li></ul>",
    seoTitle: "Web Development Company in Karachi | Websites & Web Apps",
    seoDescription:
      "Theta X Tech is a web development company in Karachi building fast, SEO-ready websites, e-commerce stores and custom web apps with Next.js and React. Get a free quote.",
    seoKeywords: "web development company Karachi, website development Pakistan, Next.js developers Pakistan, ecommerce development Karachi",
    isFeatured: true,
    order: 4,
  },
  {
    slug: "ui-ux-design",
    name: "UI/UX Design",
    icon: "pen-tool",
    tagline: "Interfaces people understand at first glance.",
    shortDescription:
      "Research-led user experience and interface design for websites, mobile apps and SaaS products, delivered as developer-ready design systems.",
    answerQuestion: "What does a UI/UX design agency do?",
    answer:
      "A UI/UX design agency researches how users think and behave, then designs the structure (UX) and visual interface (UI) of websites and apps so they are easy, accessible and enjoyable to use. Theta X Tech in Pakistan delivers user research, wireframes, prototypes and complete design systems that developers can build from directly.",
    problem:
      "Confusing navigation, cluttered screens and inconsistent visuals frustrate users and quietly kill conversions, sign-ups and retention.",
    solution:
      "We combine user research, information architecture and polished visual design, validated with clickable prototypes and usability testing before a single line of code is written.",
    features: [
      { title: "UX research & audits", description: "Interviews, analytics review and heuristic audits to find friction." },
      { title: "Wireframes & user flows", description: "Clear journeys mapped from first visit to conversion." },
      { title: "UI design", description: "Modern, on-brand interfaces for web and mobile." },
      { title: "Interactive prototypes", description: "Clickable Figma prototypes for testing and stakeholder buy-in." },
      { title: "Design systems", description: "Reusable components, tokens and guidelines for consistent products." },
    ],
    benefits: [
      { title: "Higher conversions", description: "Clear journeys turn more visitors into customers." },
      { title: "Lower development cost", description: "Problems are solved in design, not in code." },
      { title: "Accessible by default", description: "WCAG-aware colour, typography and interaction design." },
      { title: "Consistent brand", description: "One design language across every screen." },
    ],
    process: [
      { title: "Research", description: "Understand users, goals and competitors." },
      { title: "Structure", description: "Information architecture, flows and wireframes." },
      { title: "Design", description: "Visual design and interactive prototypes." },
      { title: "Validate & hand off", description: "Usability tests and developer-ready specs." },
    ],
    faqs: [
      { question: "What is the difference between UI and UX?", answer: "UX (user experience) is how a product works and feels — structure, flows and usability. UI (user interface) is how it looks — layout, colour, typography and components." },
      { question: "Which tools do you use?", answer: "We design in Figma, prototype interactions in Figma and Framer, and document components in shared design systems." },
      { question: "Can you redesign an existing app?", answer: "Yes. We start with a UX audit, prioritise the biggest issues and redesign in phases so your users aren't disrupted." },
      { question: "Do you also develop the designs?", answer: "Yes. Our web and app developers build directly from our design systems, so nothing gets lost in translation." },
    ],
    longDescription:
      "<h2>Design that earns trust in seconds</h2><p>Users judge a product within moments. We design interfaces that feel premium, communicate clearly and guide people effortlessly to the action that matters.</p>",
    seoTitle: "UI/UX Design Agency in Pakistan | Web & App Design",
    seoDescription:
      "Research-led UI/UX design for websites, mobile apps and SaaS by Theta X Tech, Pakistan. Wireframes, prototypes and design systems that boost conversions.",
    seoKeywords: "UI/UX design Pakistan, UX agency Karachi, app design Pakistan, Figma design system",
    isFeatured: false,
    order: 5,
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    icon: "megaphone",
    tagline: "Be found. Be chosen. Grow.",
    shortDescription:
      "SEO, answer-engine optimisation, social media, paid ads and content marketing that turn attention into qualified leads and sales.",
    answerQuestion: "How can digital marketing grow a business in Karachi?",
    answer:
      "Digital marketing grows a business by making it visible where customers search and scroll — Google, AI answer engines, Facebook, Instagram, LinkedIn and TikTok — and converting that attention into leads. Theta X Tech in Karachi plans and runs SEO, paid ads, social media and content campaigns measured against clear revenue goals.",
    problem:
      "Many businesses spend on ads and posts without a strategy, can't see what is working and depend on a single channel for leads.",
    solution:
      "We build a data-driven growth plan across search, social and paid channels, with conversion tracking and monthly reporting tied to leads and revenue — not vanity metrics.",
    features: [
      { title: "SEO & AEO", description: "Technical, on-page and content SEO plus optimisation for AI answer engines." },
      { title: "Social media marketing", description: "Strategy, content calendars, creatives and community management." },
      { title: "Paid advertising", description: "Google, Meta, LinkedIn and TikTok ads with conversion tracking." },
      { title: "Content marketing", description: "Blogs, guides and videos that build authority and rank." },
      { title: "Analytics & CRO", description: "GA4, tag management, funnels and A/B testing." },
    ],
    benefits: [
      { title: "More qualified leads", description: "Targeting and messaging tuned to buyers, not browsers." },
      { title: "Lower cost per lead", description: "Continuous optimisation of spend and creative." },
      { title: "Compounding organic traffic", description: "SEO and content that keep delivering." },
      { title: "Clear reporting", description: "Monthly reports linking activity to results." },
    ],
    process: [
      { title: "Audit", description: "Review channels, competitors, tracking and goals." },
      { title: "Strategy", description: "Channel mix, budgets, KPIs and content plan." },
      { title: "Execute", description: "Campaigns, content and SEO work delivered on schedule." },
      { title: "Measure & scale", description: "Optimise weekly; scale what works." },
    ],
    faqs: [
      { question: "What is AEO (answer engine optimisation)?", answer: "AEO structures your content so AI tools like Google AI Overviews, ChatGPT and Perplexity can understand and cite it — using clear questions, concise answers, schema markup and strong entity information." },
      { question: "How long does SEO take to show results?", answer: "Most businesses see meaningful ranking and traffic gains in 3–6 months, depending on competition and the starting point of the website." },
      { question: "Do you manage ad budgets?", answer: "Yes. We plan and manage your ad spend on Google, Meta, LinkedIn and TikTok; the media budget is paid directly to the platforms." },
      { question: "Will I get reports?", answer: "Yes. You receive a monthly report and a live dashboard showing traffic, leads, cost per lead and ROI." },
    ],
    longDescription:
      "<h2>Marketing that's measured in revenue</h2><p>We connect every campaign to your CRM and analytics so you can see exactly which channel, keyword and creative brings in customers.</p>",
    seoTitle: "Digital Marketing Agency in Karachi | SEO, Ads & Social",
    seoDescription:
      "Theta X Tech is a digital marketing agency in Karachi offering SEO, AEO, social media marketing, Google & Meta ads and content marketing focused on leads and revenue.",
    seoKeywords: "digital marketing Karachi, SEO services Pakistan, social media marketing Karachi, Google ads Pakistan",
    isFeatured: false,
    order: 6,
  },
  {
    slug: "graphic-design",
    name: "Graphic Design",
    icon: "palette",
    tagline: "Brand visuals that look as good as you are.",
    shortDescription:
      "Logo and brand identity, marketing collateral, social media creatives, packaging and presentation design that make your business instantly recognisable.",
    answerQuestion: "What graphic design services does Theta X Tech offer?",
    answer:
      "Theta X Tech offers logo and brand identity design, brand guidelines, social media creatives, marketing collateral such as brochures and flyers, packaging, pitch decks and motion graphics. Our Karachi design team creates consistent, professional visuals that build recognition and trust across print and digital channels.",
    problem:
      "Inconsistent, amateur visuals make a business look smaller than it is and weaken every marketing campaign.",
    solution:
      "We create a cohesive visual identity and a library of on-brand assets, so every post, brochure and presentation looks professional and recognisably yours.",
    features: [
      { title: "Logo & brand identity", description: "Logos, colour palettes, typography and brand guidelines." },
      { title: "Social media creatives", description: "Post, story and ad designs for every platform." },
      { title: "Marketing collateral", description: "Brochures, flyers, business cards and banners." },
      { title: "Pitch decks & presentations", description: "Investor and sales decks that tell a clear story." },
      { title: "Packaging & motion", description: "Packaging design and short animated graphics." },
    ],
    benefits: [
      { title: "Instant recognition", description: "A consistent look across every touchpoint." },
      { title: "Premium perception", description: "Professional design justifies premium pricing." },
      { title: "Faster marketing", description: "Ready-made templates speed up campaigns." },
      { title: "Print & digital ready", description: "Files prepared correctly for every medium." },
    ],
    process: [
      { title: "Brief", description: "Understand your brand, audience and goals." },
      { title: "Concepts", description: "Initial design directions to choose from." },
      { title: "Refine", description: "Iterations based on your feedback." },
      { title: "Deliver", description: "Final files in every format you need." },
    ],
    faqs: [
      { question: "How many logo concepts will I get?", answer: "Our brand identity packages include multiple initial concepts and refinement rounds until you are satisfied with the final direction." },
      { question: "Which file formats do you deliver?", answer: "Vector (AI, SVG, PDF) and raster (PNG, JPG) files in colour, black and white variants, plus brand guidelines." },
      { question: "Can you design monthly social media posts?", answer: "Yes. We offer monthly creative retainers with content calendars and post designs for all platforms." },
      { question: "Do I own the designs?", answer: "Yes. Full rights to the final approved designs transfer to you on completion." },
    ],
    longDescription:
      "<h2>Design that builds brands</h2><p>From a single logo to a complete visual system, our graphic designers help businesses in Karachi and beyond look established, trustworthy and modern.</p>",
    seoTitle: "Graphic Design Services in Karachi | Logo & Branding",
    seoDescription:
      "Logo design, brand identity, social media creatives, brochures and pitch decks by Theta X Tech's graphic design team in Karachi, Pakistan.",
    seoKeywords: "graphic design Karachi, logo design Pakistan, branding agency Karachi, social media design",
    isFeatured: false,
    order: 7,
  },
];
