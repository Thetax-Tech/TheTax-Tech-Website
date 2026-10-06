import type { Field, FormLayout } from "@/components/admin/form/types";

const vis = (key: string, label: string): Field => ({ type: "switch", name: `${key}._visible`, label: `Show “${label}” section`, full: true });
const cta = (path: string, label: string): Field[] => [
  { type: "text", name: `${path}.label`, label: `${label} text` },
  { type: "text", name: `${path}.href`, label: `${label} link`, hint: "e.g. /get-a-quote — use “whatsapp” for the WhatsApp chat link" },
];
const items = (name: string, label: string, itemLabel: string): Field => ({
  type: "repeater",
  name,
  label,
  itemLabel,
  fields: [
    { type: "text", name: "title", label: "Title" },
    { type: "textarea", name: "description", label: "Description" },
  ],
});

export const homeLayout: FormLayout = {
  main: [
    {
      title: "Hero",
      description: "The first thing visitors see. Keep the headline under ~8 words.",
      fields: [
        vis("hero", "Hero"),
        { type: "text", name: "hero.eyebrow", label: "Eyebrow", full: true },
        { type: "text", name: "hero.headline", label: "Headline (H1)", full: true },
        { type: "list", name: "hero.rotatingWords", label: "Headline ending", hint: "Highlighted in orange after the headline — the last item is shown (e.g. further.)" },
        { type: "textarea", name: "hero.subheadline", label: "Sub-headline", rows: 3 },
        ...cta("hero.primaryCta", "Primary button"),
        ...cta("hero.secondaryCta", "Secondary button"),
        { type: "text", name: "hero.trustLine", label: "Trust line", full: true },
      ],
    },
    {
      title: "Who we are + stats counters",
      fields: [
        { type: "text", name: "intro.question", label: "Question heading", full: true },
        { type: "textarea", name: "intro.answer", label: "Direct answer (40–60 words)", rows: 4, counter: [220, 420] },
        vis("stats", "Stats"),
        {
          type: "repeater",
          name: "stats.items",
          label: "Animated counters",
          itemLabel: "Stat",
          fields: [
            { type: "number", name: "value", label: "Number" },
            { type: "text", name: "suffix", label: "Suffix (e.g. +)" },
            { type: "text", name: "label", label: "Label", full: true },
          ],
        },
      ],
    },
    ...(["spotlightAi", "spotlightBpo"] as const).map((k) => ({
      title: k === "spotlightAi" ? "AI Automation spotlight" : "BPO spotlight",
      fields: [
        vis(k, k === "spotlightAi" ? "AI spotlight" : "BPO spotlight"),
        { type: "text", name: `${k}.eyebrow`, label: "Eyebrow" },
        { type: "text", name: `${k}.title`, label: "Title" },
        { type: "textarea", name: `${k}.text`, label: "Text", rows: 3 },
        { type: "list", name: `${k}.bullets`, label: "Bullet points" },
        ...cta(`${k}.cta`, "Button"),
      ] as Field[],
    })),
    { title: "Process", fields: [vis("process", "Process"), { type: "text", name: "process.title", label: "Title", full: true }, items("process.steps", "Steps", "Step")] },
    {
      title: "Industries",
      fields: [
        vis("industries", "Industries"),
        { type: "text", name: "industries.title", label: "Title", full: true },
        { type: "repeater", name: "industries.items", label: "Industries", itemLabel: "Industry", fields: [{ type: "text", name: "name", label: "Name" }, { type: "icon", name: "icon", label: "Icon" }] },
      ],
    },
    { title: "Tech stack marquee", fields: [vis("techStack", "Tech stack"), { type: "text", name: "techStack.title", label: "Title", full: true }, { type: "list", name: "techStack.items", label: "Technologies" }] },
    {
      title: "Final call-to-action band",
      description: "Shown at the bottom of most pages.",
      fields: [vis("cta", "CTA band"), { type: "text", name: "cta.title", label: "Title", full: true }, { type: "textarea", name: "cta.text", label: "Text", rows: 2 }, ...cta("cta.primaryCta", "Primary button"), ...cta("cta.secondaryCta", "Secondary button")],
    },
  ],
};

export const aboutLayout: FormLayout = {
  main: [
    { title: "Hero", fields: [{ type: "text", name: "hero.eyebrow", label: "Eyebrow" }, { type: "text", name: "hero.title", label: "Title (H1)" }, { type: "textarea", name: "hero.text", label: "Intro", rows: 3 }] },
    {
      title: "Story",
      fields: [
        { type: "text", name: "story.question", label: "Question heading (AEO)", full: true },
        { type: "textarea", name: "story.answer", label: "Direct answer (40–60 words)", rows: 4, counter: [220, 420] },
        { type: "text", name: "story.title", label: "Story heading", full: true },
        { type: "textarea", name: "story.body", label: "Our story", rows: 6 },
      ],
    },
    {
      title: "Mission & vision",
      fields: [
        { type: "text", name: "mission.title", label: "Mission heading" },
        { type: "text", name: "vision.title", label: "Vision heading" },
        { type: "textarea", name: "mission.text", label: "Mission", rows: 3 },
        { type: "textarea", name: "vision.text", label: "Vision", rows: 3 },
      ],
    },
    {
      title: "Values",
      fields: [
        vis("values", "Values"),
        { type: "text", name: "values.title", label: "Title", full: true },
        { type: "repeater", name: "values.items", label: "Values", itemLabel: "Value", fields: [{ type: "text", name: "title", label: "Title" }, { type: "icon", name: "icon", label: "Icon" }, { type: "textarea", name: "description", label: "Description" }] },
      ],
    },
    { title: "Why choose us", fields: [vis("whyUs", "Why choose us"), { type: "text", name: "whyUs.title", label: "Title", full: true }, items("whyUs.items", "Reasons", "Reason")] },
    {
      title: "Timeline",
      fields: [
        vis("timeline", "Timeline"),
        { type: "text", name: "timeline.title", label: "Title", full: true },
        { type: "repeater", name: "timeline.items", label: "Milestones", itemLabel: "Milestone", fields: [{ type: "text", name: "year", label: "Year / label" }, { type: "text", name: "title", label: "Title" }, { type: "textarea", name: "description", label: "Description" }] },
      ],
    },
  ],
};

export const legalLayout: FormLayout = {
  main: (["privacy", "terms"] as const).map((k) => ({
    title: k === "privacy" ? "Privacy Policy" : "Terms of Service",
    description: "Have a lawyer review legal text before publishing.",
    fields: [
      { type: "text", name: `${k}.title`, label: "Page title", full: true },
      { type: "richtext", name: `${k}.html`, label: "Content" },
    ] as Field[],
  })),
};

export const blockLayouts: Record<string, FormLayout> = {
  testimonial: {
    main: [
      {
        title: "Testimonial",
        description: "Only publish genuine reviews from real clients — Google penalises fake reviews.",
        fields: [
          { type: "textarea", name: "quote", label: "Quote", required: true, rows: 4 },
          { type: "text", name: "name", label: "Client name", required: true },
          { type: "text", name: "role", label: "Role / title" },
          { type: "text", name: "company", label: "Company" },
          { type: "select", name: "rating", label: "Rating", required: true, options: [5, 4, 3, 2, 1].map((n) => ({ value: String(n), label: "★".repeat(n) })) },
          { type: "image", name: "avatar", label: "Photo (optional)" },
          { type: "number", name: "order", label: "Order" },
          { type: "switch", name: "isVisible", label: "Visible on website" },
        ],
      },
    ],
  },
  teamMember: {
    main: [
      {
        title: "Team member",
        fields: [
          { type: "text", name: "name", label: "Name", required: true },
          { type: "text", name: "role", label: "Role", required: true },
          { type: "textarea", name: "bio", label: "Short bio", rows: 3 },
          { type: "image", name: "photo", label: "Photo (portrait 4:5)" },
          { type: "url", name: "linkedin", label: "LinkedIn URL" },
          { type: "number", name: "order", label: "Order" },
          { type: "switch", name: "isVisible", label: "Visible on About page" },
        ],
      },
    ],
  },
  faq: {
    main: [
      {
        title: "FAQ",
        description: "Concise, factual answers (40–60 words) work best for Google and AI answer engines.",
        fields: [
          { type: "text", name: "question", label: "Question", required: true, full: true },
          { type: "textarea", name: "answer", label: "Answer", required: true, rows: 4, counter: [150, 420] },
          { type: "select", name: "group", label: "Where to show", required: true, options: [{ value: "home", label: "Homepage FAQ" }, { value: "general", label: "Services page FAQ" }] },
          { type: "number", name: "order", label: "Order" },
          { type: "switch", name: "isVisible", label: "Visible" },
        ],
      },
    ],
  },
  clientLogo: {
    main: [
      {
        title: "Client / partner logo",
        fields: [
          { type: "text", name: "name", label: "Company name", required: true },
          { type: "url", name: "url", label: "Website (optional)" },
          { type: "image", name: "logo", label: "Logo (transparent PNG/SVG-like)" },
          { type: "number", name: "order", label: "Order" },
          { type: "switch", name: "isVisible", label: "Visible" },
        ],
      },
    ],
  },
};
