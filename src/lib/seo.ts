import type { Metadata } from "next";
import { getPageSeo, getSettings, type FaqVM, type PostVM, type ProjectVM, type ServiceVM } from "@/lib/data";
import type { Settings } from "@/content/site";
import { stripHtml } from "@/lib/utils";

// On Vercel, fall back to the project's production domain when NEXT_PUBLIC_SITE_URL isn't set.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "";
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || vercelUrl || "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

type BuildMetaInput = {
  path: string;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  type?: "website" | "article";
  publishedTime?: Date;
  modifiedTime?: Date;
  keywords?: string | null;
  noIndex?: boolean;
  /** Use the title exactly as given (skip the "| Theta X Tech" template). */
  absoluteTitle?: boolean;
};

/**
 * Builds complete metadata for a route: title, description, canonical, Open Graph and
 * Twitter cards. Static-page values can be overridden from Admin → SEO (PageSeo table).
 */
export async function buildMetadata(input: BuildMetaInput): Promise<Metadata> {
  const [settings, override] = await Promise.all([getSettings(), getPageSeo(input.path)]);
  const title = override?.title || input.title || settings.seo.defaultTitle;
  const description = override?.description || input.description || settings.seo.defaultDescription;
  const image = override?.ogImage || input.image || settings.seo.ogImage || "/opengraph-image";
  const url = absoluteUrl(input.path);
  const noIndex = override?.noIndex || input.noIndex;

  return {
    title: input.absoluteTitle || input.path === "/" ? { absolute: title } : title,
    description,
    keywords: input.keywords || undefined,
    alternates: { canonical: url },
    robots: noIndex ? { index: false, follow: true } : undefined,
    openGraph: {
      type: input.type ?? "website",
      url,
      title,
      description,
      siteName: settings.site.name,
      locale: "en_PK",
      images: [{ url: absoluteUrl(image), width: 1200, height: 630, alt: title }],
      ...(input.type === "article"
        ? { publishedTime: input.publishedTime?.toISOString(), modifiedTime: input.modifiedTime?.toISOString() }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [absoluteUrl(image)],
      site: settings.seo.twitterHandle || undefined,
    },
  };
}

// ─────────────────────────── JSON-LD ───────────────────────────

const ORG_ID = () => `${SITE_URL}/#organization`;
const SITE_ID = () => `${SITE_URL}/#website`;

function sameAs(settings: Settings) {
  return Object.values(settings.social).filter((v): v is string => Boolean(v));
}

export function organizationSchema(settings: Settings) {
  const c = settings.contact;
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness", "ProfessionalService"],
    "@id": ORG_ID(),
    name: settings.site.name,
    legalName: settings.site.legalName,
    alternateName: ["ThetaX Tech", "Theta X Tech SMC"],
    slogan: settings.site.tagline,
    description: settings.site.description,
    url: SITE_URL,
    logo: absoluteUrl(settings.site.icon),
    image: absoluteUrl(settings.site.logo),
    email: c.email,
    telephone: c.phone,
    ...(settings.site.foundingYear ? { foundingDate: settings.site.foundingYear } : {}),
    address: {
      "@type": "PostalAddress",
      streetAddress: c.street,
      addressLocality: c.city,
      addressRegion: c.region,
      addressCountry: c.countryCode,
      ...(c.postalCode ? { postalCode: c.postalCode } : {}),
    },
    ...(c.latitude && c.longitude ? { geo: { "@type": "GeoCoordinates", latitude: c.latitude, longitude: c.longitude } } : {}),
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: c.hoursSpec.days, opens: c.hoursSpec.opens, closes: c.hoursSpec.closes },
    ],
    areaServed: [{ "@type": "City", name: "Karachi" }, { "@type": "Country", name: "Pakistan" }, "Worldwide"],
    contactPoint: [{ "@type": "ContactPoint", telephone: c.phone, email: c.email, contactType: "sales", availableLanguage: ["English", "Urdu"] }],
    knowsAbout: ["AI automation", "AI agents", "Business process outsourcing", "Web development", "UI/UX design", "Digital marketing", "Graphic design"],
    sameAs: sameAs(settings),
  };
}

export function websiteSchema(settings: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": SITE_ID(),
    url: SITE_URL,
    name: settings.site.name,
    description: settings.seo.defaultDescription,
    publisher: { "@id": ORG_ID() },
    inLanguage: "en",
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/blog?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function breadcrumbSchema(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.path) })),
  };
}

export function faqSchema(faqs: { question: string; answer: string }[]) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };
}

export function serviceSchema(service: ServiceVM, settings: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${absoluteUrl(`/services/${service.slug}`)}#service`,
    name: service.name,
    serviceType: service.name,
    description: service.answer || service.shortDescription,
    url: absoluteUrl(`/services/${service.slug}`),
    provider: { "@id": ORG_ID(), name: settings.site.name },
    areaServed: [{ "@type": "Country", name: "Pakistan" }, "Worldwide"],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `${service.name} services`,
      itemListElement: service.features.map((f) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: f.title, description: f.description } })),
    },
  };
}

export function blogPostingSchema(post: PostVM, settings: Settings) {
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.seoDescription || post.excerpt,
    image: absoluteUrl(post.coverImage || post.ogImage || `/og/blog/${post.slug}`),
    datePublished: post.publishedAt.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    author: post.author ? { "@type": "Person", name: post.author.name } : { "@id": ORG_ID() },
    publisher: { "@id": ORG_ID(), name: settings.site.name, logo: { "@type": "ImageObject", url: absoluteUrl(settings.site.icon) } },
    mainEntityOfPage: url,
    articleSection: post.category?.name,
    keywords: post.tags.map((t) => t.name).join(", "),
    wordCount: stripHtml(post.content).split(" ").length,
    inLanguage: "en",
  };
}

export function projectSchema(project: ProjectVM, settings: Settings) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.summary,
    url: absoluteUrl(`/portfolio/${project.slug}`),
    creator: { "@id": ORG_ID(), name: settings.site.name },
    ...(project.year ? { dateCreated: String(project.year) } : {}),
    ...(project.coverImage ? { image: absoluteUrl(project.coverImage) } : {}),
    keywords: project.techStack.join(", "),
  };
}

export function reviewsSchema(settings: Settings, reviews: { name: string; quote: string; rating: number }[]) {
  if (!reviews.length) return null;
  const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORG_ID(),
    name: settings.site.name,
    aggregateRating: { "@type": "AggregateRating", ratingValue: avg.toFixed(1), reviewCount: reviews.length, bestRating: 5, worstRating: 1 },
    review: reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      reviewBody: r.quote,
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
  };
}

export type { FaqVM };
