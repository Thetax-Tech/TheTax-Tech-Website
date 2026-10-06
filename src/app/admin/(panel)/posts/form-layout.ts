import type { FormLayout } from "@/components/admin/form/types";

export function postLayout(categories: { id: string; name: string }[], tagSuggestions: string[]): FormLayout {
  return {
    main: [
      {
        title: "Content",
        fields: [
          { type: "text", name: "title", label: "Title", required: true, full: true, maxLength: 180 },
          { type: "slug", name: "slug", label: "URL slug", from: "title", prefix: "/blog/", required: true, full: true, hint: "Short, keyword-rich and lowercase, e.g. ai-automation-for-smes" },
          { type: "textarea", name: "excerpt", label: "Excerpt", rows: 3, counter: [120, 200], hint: "Shown on cards and used as the meta description fallback. Leave blank to auto-generate." },
          { type: "richtext", name: "content", label: "Article", required: true, hint: "Use H2 for main sections (they appear in the table of contents) and H3 for sub-sections. Start with a short direct answer for AI search engines." },
        ],
      },
      {
        title: "FAQ block (optional)",
        description: "Adds an FAQ section and FAQPage schema — great for Google and AI answer engines.",
        fields: [{ type: "repeater", name: "faqs", label: "Questions", itemLabel: "FAQ", addLabel: "Add question", fields: [{ type: "text", name: "question", label: "Question", full: true }, { type: "textarea", name: "answer", label: "Answer (40–60 words ideal)" }] }],
      },
      {
        title: "SEO",
        fields: [{ type: "seo", name: "seo", label: "SEO", pathPrefix: "/blog", titleFrom: "title", descriptionFrom: "excerpt" }],
      },
    ],
    side: [
      {
        title: "Publishing",
        fields: [
          {
            type: "select",
            name: "status",
            label: "Status",
            required: true,
            options: [
              { value: "DRAFT", label: "Draft (not visible)" },
              { value: "PUBLISHED", label: "Published" },
              { value: "SCHEDULED", label: "Scheduled" },
            ],
            full: true,
          },
          { type: "datetime", name: "publishedAt", label: "Publish date", full: true, hint: "For scheduled posts, the article goes live automatically at this time." },
          { type: "switch", name: "isFeatured", label: "Featured", hint: "Highlight at the top of the blog", full: true },
        ],
      },
      {
        title: "Organisation",
        fields: [
          { type: "select", name: "categoryId", label: "Category", options: categories.map((c) => ({ value: c.id, label: c.name })), full: true },
          { type: "tags", name: "tags", label: "Tags", suggestions: tagSuggestions, full: true },
        ],
      },
      {
        title: "Featured image",
        fields: [
          { type: "image", name: "coverImage", label: "Cover image", full: true, hint: "1200×630 recommended — also used as the social share (Open Graph) image. Auto-converted to WebP." },
          { type: "text", name: "coverAlt", label: "Alt text", full: true, hint: "Describe the image for accessibility & SEO." },
        ],
      },
    ],
  };
}
