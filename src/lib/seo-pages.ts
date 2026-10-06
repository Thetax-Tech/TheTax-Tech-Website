/** Static routes whose SEO title/description/OG image can be overridden in Admin → SEO. */
export const STATIC_SEO_PAGES = [
  { key: "home", path: "/", label: "Homepage" },
  { key: "about", path: "/about", label: "About" },
  { key: "services", path: "/services", label: "Services" },
  { key: "portfolio", path: "/portfolio", label: "Portfolio" },
  { key: "blog", path: "/blog", label: "Blog" },
  { key: "contact", path: "/contact", label: "Contact" },
  { key: "quote", path: "/get-a-quote", label: "Get a quote" },
  { key: "careers", path: "/careers", label: "Careers" },
  { key: "privacy", path: "/privacy-policy", label: "Privacy policy" },
  { key: "terms", path: "/terms", label: "Terms" },
] as const;
