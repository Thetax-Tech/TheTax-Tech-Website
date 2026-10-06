import type { FormLayout, SubField } from "@/components/admin/form/types";

/* Form layouts for portfolio projects, services and jobs. */

const itemFields: SubField[] = [
  { type: "text", name: "title", label: "Title" },
  { type: "textarea", name: "description", label: "Description" },
];

export function projectLayout(services: { id: string; name: string }[], categories: string[]): FormLayout {
  return {
    main: [
      {
        title: "Project",
        fields: [
          { type: "text", name: "title", label: "Title", required: true, full: true },
          { type: "slug", name: "slug", label: "URL slug", from: "title", prefix: "/portfolio/", required: true, full: true },
          { type: "textarea", name: "summary", label: "Summary", required: true, rows: 3, counter: [80, 220], hint: "One or two sentences shown on cards and as the meta description fallback." },
          { type: "textarea", name: "problem", label: "Problem", rows: 4, hint: "What challenge did the client face?" },
          { type: "textarea", name: "solution", label: "Solution", rows: 4, hint: "What did we build or do?" },
          { type: "richtext", name: "description", label: "Full case study (optional)" },
        ],
      },
      {
        title: "Results",
        description: "Numbers make case studies convincing. Values starting with a number animate on the site (e.g. 72%, 3.4×).",
        fields: [{ type: "repeater", name: "results", label: "Key results", itemLabel: "Result", addLabel: "Add result", fields: [{ type: "text", name: "value", label: "Value (e.g. 72%)" }, { type: "text", name: "label", label: "Label (e.g. chats automated)" }] }],
      },
      { title: "Gallery", fields: [{ type: "gallery", name: "gallery", label: "Screenshots & photos" }] },
      { title: "SEO", fields: [{ type: "seo", name: "seo", label: "SEO", pathPrefix: "/portfolio", titleFrom: "title", descriptionFrom: "summary" }] },
    ],
    side: [
      {
        title: "Visibility",
        fields: [
          { type: "switch", name: "isPublished", label: "Published", hint: "Visible on the website", full: true },
          { type: "switch", name: "isFeatured", label: "Featured", hint: "Show in the homepage carousel", full: true },
          { type: "switch", name: "isSample", label: "Sample / concept project", hint: "Turn off once this describes a real client project (removes the Sample badge)", full: true },
          { type: "number", name: "order", label: "Order", hint: "Lower numbers appear first", full: true },
        ],
      },
      {
        title: "Details",
        fields: [
          { type: "select", name: "category", label: "Category", required: true, full: true, options: [...new Set(["AI Automation", "Digital Marketing", "UI/UX Design", "Web Development", "Graphic Design", "BPO", ...categories])].map((c) => ({ value: c, label: c })), hint: "Used for the portfolio filter tabs" },
          { type: "text", name: "client", label: "Client", full: true },
          { type: "text", name: "industry", label: "Industry", full: true },
          { type: "number", name: "year", label: "Year", full: true },
          { type: "url", name: "liveUrl", label: "Live link", full: true, placeholder: "https://" },
          { type: "tags", name: "techStack", label: "Tech stack", full: true },
          { type: "multiselect", name: "services", label: "Related services", options: services.map((s) => ({ value: s.id, label: s.name })), full: true },
        ],
      },
      { title: "Cover image", fields: [{ type: "image", name: "coverImage", label: "Cover", full: true, hint: "1600×1200 recommended" }] },
    ],
  };
}

export function serviceLayout(): FormLayout {
  return {
    main: [
      {
        title: "Basics",
        fields: [
          { type: "text", name: "name", label: "Service name", required: true },
          { type: "slug", name: "slug", label: "URL slug", from: "name", prefix: "/services/", required: true },
          { type: "text", name: "tagline", label: "Tagline", full: true },
          { type: "textarea", name: "shortDescription", label: "Short description", required: true, rows: 3, counter: [100, 220] },
        ],
      },
      {
        title: "Direct answer (AEO)",
        description: "A question-style heading plus a 40–60 word factual answer. This is what Google AI Overviews, ChatGPT and Perplexity quote.",
        fields: [
          { type: "text", name: "answerQuestion", label: "Question heading", full: true, placeholder: "What is …?" },
          { type: "textarea", name: "answer", label: "Answer (40–60 words)", rows: 4, counter: [220, 420] },
        ],
      },
      {
        title: "Problem & solution",
        fields: [
          { type: "textarea", name: "problem", label: "The challenge", rows: 4 },
          { type: "textarea", name: "solution", label: "Our solution", rows: 4 },
        ],
      },
      { title: "What's included", fields: [{ type: "repeater", name: "features", label: "Features / sub-services", itemLabel: "Feature", addLabel: "Add feature", fields: itemFields }] },
      { title: "Process", fields: [{ type: "repeater", name: "process", label: "Process steps", itemLabel: "Step", addLabel: "Add step", fields: itemFields }] },
      { title: "Benefits", fields: [{ type: "repeater", name: "benefits", label: "Benefits", itemLabel: "Benefit", addLabel: "Add benefit", fields: itemFields }] },
      { title: "FAQs", fields: [{ type: "repeater", name: "faqs", label: "Questions", itemLabel: "FAQ", addLabel: "Add question", fields: [{ type: "text", name: "question", label: "Question", full: true }, { type: "textarea", name: "answer", label: "Answer" }] }] },
      { title: "Long description", fields: [{ type: "richtext", name: "longDescription", label: "Additional content (optional)" }] },
      {
        title: "SEO",
        fields: [
          { type: "seo", name: "seo", label: "SEO", pathPrefix: "/services", titleFrom: "name", descriptionFrom: "shortDescription" },
          { type: "textarea", name: "seoKeywords", label: "Target keywords", rows: 2, hint: "Comma-separated, e.g. BPO services Pakistan, outsourcing Karachi" },
        ],
      },
    ],
    side: [
      {
        title: "Display",
        fields: [
          { type: "switch", name: "isVisible", label: "Visible on website", full: true },
          { type: "switch", name: "isFeatured", label: "Featured", full: true },
          { type: "number", name: "order", label: "Order", hint: "Lower numbers appear first", full: true },
          { type: "icon", name: "icon", label: "Icon", full: true },
          { type: "image", name: "image", label: "Image (optional)", full: true },
        ],
      },
    ],
  };
}

export function jobLayout(): FormLayout {
  return {
    main: [
      {
        title: "Job",
        fields: [
          { type: "text", name: "title", label: "Job title", required: true, full: true },
          { type: "slug", name: "slug", label: "URL slug", from: "title", prefix: "/careers/", required: true, full: true },
          { type: "textarea", name: "summary", label: "Summary", required: true, rows: 3 },
          { type: "richtext", name: "description", label: "Description (responsibilities, requirements, benefits)" },
        ],
      },
    ],
    side: [
      {
        title: "Details",
        fields: [
          { type: "switch", name: "isOpen", label: "Accepting applications", full: true },
          { type: "text", name: "department", label: "Department", full: true },
          { type: "text", name: "location", label: "Location", required: true, full: true },
          {
            type: "select",
            name: "type",
            label: "Employment type",
            required: true,
            full: true,
            options: ["Full-time", "Part-time", "Contract", "Internship", "Remote"].map((v) => ({ value: v, label: v })),
          },
          { type: "number", name: "order", label: "Order", full: true },
        ],
      },
    ],
  };
}
