/**
 * Default site settings and page content. Seeded into the database and used as
 * fallbacks. Live values are edited in Admin → Settings / Content.
 */

export const defaultSettings = {
  site: {
    name: "Theta X Tech",
    legalName: "ThetaX Tech SMC Private Limited",
    tagline: "Innovation in Every Step",
    slogan: "Designed with passion, innovation, and purpose. Let's build something extraordinary together.",
    description:
      "Theta X Tech (ThetaX Tech SMC Private Limited) is a Karachi-based technology company providing AI automation, AI agents, BPO services, web development, UI/UX design, digital marketing and graphic design to businesses in Pakistan and worldwide.",
    logo: "/brand/logo-horizontal-sm.png",
    logoDark: "/brand/logo-horizontal-white-sm.png",
    icon: "/brand/logo-icon.png",
    foundingYear: "",
  },
  contact: {
    email: "info@thetaxtech.com.pk",
    phone: "+92 312 2535770",
    whatsapp: "923122535770",
    whatsappMessage: "Hi Theta X Tech, I'd like to discuss a project.",
    street: "R-402, 2nd Floor, Inchauli Cooperative Housing Society",
    city: "Karachi",
    region: "Sindh",
    country: "Pakistan",
    countryCode: "PK",
    postalCode: "",
    hours: "Mon – Fri, 09:00 – 18:00",
    hoursSpec: { days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "18:00" },
    mapQuery: "Inchauli Cooperative Housing Society, Karachi",
    latitude: "",
    longitude: "",
  },
  social: {
    linkedin: "https://www.linkedin.com/company/thetax-tech-pvt-ltd/",
    facebook: "https://www.facebook.com/profile.php?id=100089258083131",
    instagram: "https://www.instagram.com/thetax_tech/",
    x: "",
    youtube: "",
    tiktok: "",
  },
  seo: {
    titleTemplate: "%s | Theta X Tech",
    defaultTitle: "Theta X Tech — AI Automation, BPO & Web Development Company in Karachi",
    defaultDescription:
      "Theta X Tech is a Karachi technology company delivering AI automation, custom AI agents, BPO services, web development, UI/UX design and digital marketing for businesses in Pakistan and worldwide.",
    keywords:
      "AI automation Pakistan, BPO services Pakistan, web development company Karachi, AI agents development, digital marketing Karachi, UI/UX design Pakistan, tax and business consulting Karachi",
    ogImage: "",
    twitterHandle: "",
  },
  analytics: {
    gaId: "",
    gtmId: "",
    googleVerification: "",
    bingVerification: "",
  },
  theme: {
    brand: "#F7941D",
    defaultMode: "dark",
    preloader: true,
  },
  modules: {
    careers: true,
    newsletter: true,
    cookieBanner: true,
    /** show a "Sample project" badge on concept case studies (isSample) */
    sampleBadge: true,
  },
  agent: {
    enabled: true,
    name: "Theta Assistant",
    greeting: "Hi! 👋 I'm the Theta X Tech assistant. Ask me about AI automation, BPO, websites, design or marketing — or I can share examples of our work.",
    tone: "Warm, professional and concise. Short paragraphs, plain language, no hype. Reply in the visitor's language (English, Urdu or Roman Urdu).",
    instructions: "Our goal is to understand what the visitor needs and, when they are interested, collect their details so the team can follow up with a free consultation. Recommend relevant services and share portfolio examples when helpful.",
    quickReplies: ["What services do you offer?", "Show me your work", "I need a website", "Tell me about BPO"],
    businessHours: { timezone: "Asia/Karachi", days: [1, 2, 3, 4, 5], open: "09:00", close: "18:00" },
    offHoursNote: "Our team is offline right now (Mon–Fri, 09:00–18:00 PKT). I can still help, and a person will follow up next business day.",
    autoReplyForms: true,
  },
  smtp: {
    host: "",
    port: "",
    secure: true,
    user: "",
    password: "",
    from: "",
    notifyEmail: "info@thetaxtech.com.pk",
  },
};

export type Settings = typeof defaultSettings;

export const homeSections = {
  hero: {
    eyebrow: "AI • Automation • BPO • Digital",
    headline: "We build the technology that moves your business",
    rotatingWords: ["forward.", "faster.", "smarter.", "further."],
    subheadline:
      "Theta X Tech is a Karachi-based technology partner. We build AI agents, automate busywork, run expert BPO teams and design high-converting websites for ambitious companies in Pakistan and around the world.",
    primaryCta: { label: "Get a Free Consultation", href: "/get-a-quote" },
    secondaryCta: { label: "View Our Work", href: "/portfolio" },
    trustLine: "Trusted by startups, SMEs and enterprises across Pakistan, the UK and the Gulf",
  },
  stats: {
    items: [
      { value: 120, suffix: "+", label: "Projects delivered" },
      { value: 60, suffix: "+", label: "Happy clients" },
      { value: 5, suffix: "+", label: "Years of experience" },
      { value: 8, suffix: "", label: "Countries served" },
    ],
  },
  intro: {
    question: "Who is Theta X Tech?",
    answer:
      "Theta X Tech (ThetaX Tech SMC Private Limited) is a technology company in Karachi, Pakistan. We help businesses grow with AI automation, custom AI agents, business process outsourcing (BPO), web development, UI/UX design, digital marketing and graphic design — combining strategy, design and engineering in one accountable team.",
  },
  spotlightAi: {
    eyebrow: "AI Automation",
    title: "Put your busywork on autopilot",
    text: "We map your processes, then build AI agents and workflows that capture leads, read documents, update systems and report results — 24/7, in English and Urdu.",
    bullets: ["Custom AI agents for WhatsApp, web & email", "n8n / Make / Zapier workflow automation", "Document & invoice processing", "Integrations with your CRM, ERP and accounting"],
    cta: { label: "Explore AI Automation", href: "/services/ai-automation" },
  },
  spotlightBpo: {
    eyebrow: "BPO Services",
    title: "Your offshore team in Karachi, supercharged by AI",
    text: "Dedicated, trained and supervised teams for customer support, back-office, data processing, lead generation and bookkeeping support — with SLAs and weekly reporting.",
    bullets: ["Customer support & virtual assistants", "Data entry & document processing", "Lead generation & appointment setting", "Bookkeeping & tax support operations"],
    cta: { label: "Explore BPO Services", href: "/services/bpo-services" },
  },
  process: {
    title: "A proven process from idea to impact",
    steps: [
      { title: "Discover", description: "We learn your goals, users and processes, and define measurable success." },
      { title: "Design", description: "Strategy, UX and solution architecture you can see and approve." },
      { title: "Build", description: "Agile sprints, weekly demos and rigorous quality assurance." },
      { title: "Launch", description: "Smooth go-live, training and documentation for your team." },
      { title: "Grow", description: "Monitoring, optimisation and new ideas to keep you ahead." },
    ],
  },
  industries: {
    title: "Industries we serve",
    items: [
      { name: "E-commerce & Retail", icon: "shopping-bag" },
      { name: "Real Estate", icon: "building" },
      { name: "Healthcare", icon: "heart-pulse" },
      { name: "Finance & Accounting", icon: "landmark" },
      { name: "Logistics", icon: "truck" },
      { name: "Education", icon: "graduation-cap" },
      { name: "SaaS & Startups", icon: "rocket" },
      { name: "Professional Services", icon: "briefcase" },
    ],
  },
  techStack: {
    title: "Technologies we master",
    items: ["Next.js", "React", "TypeScript", "Node.js", "Python", "OpenAI", "Claude", "LangChain", "n8n", "Make", "Zapier", "Laravel", "WordPress", "Shopify", "Figma", "Tailwind CSS", "MySQL", "PostgreSQL", "AWS", "Google Cloud", "Meta Ads", "Google Ads"],
  },
  cta: {
    title: "Ready to build something extraordinary?",
    text: "Tell us about your goals. We'll reply within one business day with ideas, a plan and a transparent quote.",
    primaryCta: { label: "Get a Free Consultation", href: "/get-a-quote" },
    secondaryCta: { label: "Talk on WhatsApp", href: "whatsapp" },
  },
};

export const aboutSections = {
  hero: {
    eyebrow: "About Theta X Tech",
    title: "Innovation in every step",
    text: "We are a Karachi-based team of engineers, designers, marketers and operations specialists helping businesses work smarter with technology.",
  },
  story: {
    title: "Our story",
    question: "What does Theta X Tech do?",
    answer:
      "Theta X Tech is a technology and outsourcing company headquartered in Karachi, Pakistan. We design and build websites and software, develop AI agents and automations, run BPO teams and grow brands through digital marketing — giving clients one partner for strategy, technology and operations.",
    body: "Theta X Tech started with a simple belief: great technology should be accessible to every ambitious business, not just large enterprises. What began as a design and web studio has grown into a full-service technology partner. Today we combine creative design, modern engineering, AI and skilled operations teams to help clients in Pakistan and abroad launch faster, operate leaner and grow with confidence.",
  },
  mission: { title: "Our mission", text: "To empower businesses with practical, innovative technology that saves time, reduces cost and creates exceptional customer experiences." },
  vision: { title: "Our vision", text: "To be Pakistan's most trusted partner for AI-driven digital transformation and global outsourcing." },
  values: {
    title: "Our values",
    items: [
      { title: "Innovation", description: "We explore new ideas and technologies to find better solutions.", icon: "lightbulb" },
      { title: "Integrity", description: "Honest advice, transparent pricing and promises we keep.", icon: "shield-check" },
      { title: "Excellence", description: "Craftsmanship and attention to detail in every deliverable.", icon: "award" },
      { title: "Partnership", description: "We succeed when our clients succeed.", icon: "handshake" },
    ],
  },
  whyUs: {
    title: "Why choose Theta X Tech",
    items: [
      { title: "One team, end to end", description: "Strategy, design, development, AI, marketing and operations under one roof." },
      { title: "AI-first thinking", description: "We automate what can be automated, so you pay for real expertise." },
      { title: "Transparent and measurable", description: "Clear proposals, weekly updates and results tied to your KPIs." },
      { title: "Global standards, local value", description: "World-class quality at Pakistani cost efficiency." },
      { title: "Long-term support", description: "We stay with you after launch to maintain, improve and scale." },
      { title: "Secure by design", description: "NDAs, role-based access and security best practices as standard." },
    ],
  },
  timeline: {
    title: "Our journey",
    items: [
      { year: "Founded", title: "Design & web studio", description: "Started delivering UI/UX, websites and graphic design for local businesses." },
      { year: "Growth", title: "Digital marketing", description: "Added SEO, social media and performance marketing services." },
      { year: "Expansion", title: "International clients", description: "Began serving clients in the UK, Gulf and North America." },
      { year: "Today", title: "AI & BPO", description: "Launched AI automation, AI agents and BPO services to help clients scale." },
    ],
  },
};

export const faqs = [
  { group: "home", question: "What services does Theta X Tech offer?", answer: "Theta X Tech offers AI automation, custom AI agents and chatbots, BPO (business process outsourcing), web development, UI/UX design, digital marketing and graphic design for businesses in Pakistan and internationally." },
  { group: "home", question: "Where is Theta X Tech located?", answer: "Our office is at R-402, 2nd Floor, Inchauli Cooperative Housing Society, Karachi, Pakistan. We work with clients locally and remotely worldwide." },
  { group: "home", question: "Do you work with international clients?", answer: "Yes. We serve clients in Pakistan, the UK, Europe, the Gulf and North America, with working hours that overlap with your time zone." },
  { group: "home", question: "How much does a project cost?", answer: "Every project is scoped individually. After a free consultation we send a transparent, fixed-scope quote or a monthly retainer proposal, depending on your needs." },
  { group: "home", question: "How quickly can you start?", answer: "Most projects kick off within 1–2 weeks of approval. BPO pilots and small automations can often start within days." },
  { group: "home", question: "Can you help with tax and business consulting in Karachi?", answer: "We support accountants and businesses with bookkeeping and tax support operations, process automation and business systems. Statutory tax filing and advice remain with your licensed tax consultant, whom we can work alongside." },
  { group: "general", question: "What are your working hours?", answer: "Our office hours are Monday to Friday, 09:00 to 18:00 Pakistan Standard Time. BPO teams can work shifts aligned to your business hours." },
  { group: "general", question: "Do you sign NDAs?", answer: "Yes. We are happy to sign a non-disclosure agreement before you share any confidential information." },
];

/** PLACEHOLDER testimonials — replace with real client reviews before launch. */
export const testimonials = [
  { name: "Ahmed R.", role: "Operations Director", company: "Logistics company", rating: 5, quote: "Theta X Tech automated our invoice processing end to end. What used to take three people a week now runs on its own, and the team finally has time for customers." },
  { name: "Sarah K.", role: "Founder", company: "E-commerce brand", rating: 5, quote: "Their WhatsApp AI assistant answers customers instantly, even at 2am. Our overnight sales went up and our support team is far less stressed." },
  { name: "James W.", role: "Head of Customer Success", company: "SaaS company, UK", rating: 5, quote: "The support team they built for us in Karachi is professional, fast and genuinely cares about our customers. Response times dropped by more than half." },
  { name: "Fatima N.", role: "Marketing Manager", company: "Education provider", rating: 5, quote: "Our cost per lead almost halved within two months, and the automated follow-ups mean no enquiry slips through the cracks anymore." },
];

/** PLACEHOLDER team — hidden until real members and photos are added in Admin → Team. */
export const team = [
  { name: "Founder & CEO", role: "Leadership", bio: "Add your founder's bio in Admin → Team.", isVisible: false },
  { name: "Head of Engineering", role: "Technology", bio: "Add bio in Admin → Team.", isVisible: false },
  { name: "Head of Design", role: "Design", bio: "Add bio in Admin → Team.", isVisible: false },
  { name: "Operations Lead", role: "BPO", bio: "Add bio in Admin → Team.", isVisible: false },
];

export const jobs = [
  {
    slug: "customer-support-representative",
    title: "Customer Support Representative (BPO)",
    department: "BPO",
    location: "Karachi, Pakistan (On-site)",
    type: "Full-time",
    summary: "Support international customers via email and chat with excellent written English and empathy.",
    description: "<h2>Responsibilities</h2><ul><li>Respond to customer queries by email and live chat</li><li>Meet response-time and quality targets</li><li>Document issues and escalate when needed</li></ul><h2>Requirements</h2><ul><li>Excellent written and spoken English</li><li>Comfortable working rotating shifts</li><li>Prior support experience is a plus</li></ul>",
  },
  {
    slug: "ai-automation-engineer",
    title: "AI Automation Engineer",
    department: "Engineering",
    location: "Karachi, Pakistan (Hybrid)",
    type: "Full-time",
    summary: "Design and build AI agents and n8n/Make workflows for clients across industries.",
    description: "<h2>Responsibilities</h2><ul><li>Build workflows in n8n, Make and Zapier</li><li>Develop AI agents using LLM APIs</li><li>Integrate CRMs, ERPs and databases via APIs</li></ul><h2>Requirements</h2><ul><li>Experience with JavaScript/TypeScript or Python</li><li>Understanding of REST APIs and webhooks</li><li>Curiosity about AI and automation</li></ul>",
  },
];

export const legal = {
  privacyUpdated: "2026-01-01",
  termsUpdated: "2026-01-01",
};
