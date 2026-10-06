import { requireUser } from "@/lib/auth";
import { getSettings } from "@/lib/data";
import { PageHeader } from "@/components/admin/ui";
import { EntityForm } from "@/components/admin/form/entity-form";
import type { FormLayout } from "@/components/admin/form/types";
import { saveSettings } from "@/app/admin/actions/content";
import { SettingsTools } from "./settings-tools";

export const metadata = { title: "Settings" };

const layout: FormLayout = {
  main: [
    {
      title: "Company",
      fields: [
        { type: "text", name: "site.name", label: "Brand name", required: true },
        { type: "text", name: "site.legalName", label: "Legal name", required: true },
        { type: "text", name: "site.tagline", label: "Tagline" },
        { type: "text", name: "site.foundingYear", label: "Founding year", hint: "Used in Organization schema" },
        { type: "textarea", name: "site.slogan", label: "Footer slogan", rows: 2 },
        { type: "textarea", name: "site.description", label: "Company description (used by search & AI engines)", rows: 3 },
      ],
    },
    {
      title: "Contact details",
      description: "Shown in the footer, contact page, schema markup and llms.txt.",
      fields: [
        { type: "email", name: "contact.email", label: "Email", required: true },
        { type: "text", name: "contact.phone", label: "Phone", required: true },
        { type: "text", name: "contact.whatsapp", label: "WhatsApp number", hint: "International format, digits only, e.g. 923122535770" },
        { type: "text", name: "contact.whatsappMessage", label: "WhatsApp pre-filled message" },
        { type: "text", name: "contact.street", label: "Street address", full: true },
        { type: "text", name: "contact.city", label: "City" },
        { type: "text", name: "contact.region", label: "Province / region" },
        { type: "text", name: "contact.country", label: "Country" },
        { type: "text", name: "contact.postalCode", label: "Postal code" },
        { type: "text", name: "contact.hours", label: "Office hours (display)" },
        { type: "text", name: "contact.mapQuery", label: "Google Maps search query" },
        { type: "text", name: "contact.latitude", label: "Latitude (optional)" },
        { type: "text", name: "contact.longitude", label: "Longitude (optional)" },
      ],
    },
    {
      title: "Social links",
      fields: [
        { type: "url", name: "social.linkedin", label: "LinkedIn" },
        { type: "url", name: "social.facebook", label: "Facebook" },
        { type: "url", name: "social.instagram", label: "Instagram" },
        { type: "url", name: "social.x", label: "X (Twitter)" },
        { type: "url", name: "social.youtube", label: "YouTube" },
        { type: "url", name: "social.tiktok", label: "TikTok" },
      ],
    },
    {
      title: "SEO defaults",
      fields: [
        { type: "text", name: "seo.defaultTitle", label: "Default title (homepage)", full: true },
        { type: "text", name: "seo.titleTemplate", label: "Title template", hint: "%s is replaced with the page title" },
        { type: "text", name: "seo.twitterHandle", label: "X/Twitter handle", placeholder: "@thetaxtech" },
        { type: "textarea", name: "seo.defaultDescription", label: "Default meta description", rows: 3, counter: [120, 160] },
        { type: "textarea", name: "seo.keywords", label: "Target keywords", rows: 2 },
        { type: "image", name: "seo.ogImage", label: "Default social share image (1200×630)", hint: "Leave empty to use the auto-generated branded card." },
      ],
    },
    {
      title: "Analytics & verification",
      description: "Analytics loads only after visitors accept cookies.",
      fields: [
        { type: "text", name: "analytics.gaId", label: "Google Analytics 4 ID", placeholder: "G-XXXXXXXXXX" },
        { type: "text", name: "analytics.gtmId", label: "Google Tag Manager ID", placeholder: "GTM-XXXXXXX" },
        { type: "text", name: "analytics.googleVerification", label: "Google Search Console verification code", hint: "Only the content value of the meta tag" },
        { type: "text", name: "analytics.bingVerification", label: "Bing Webmaster verification code" },
      ],
    },
    {
      title: "Email (SMTP)",
      description: "Used for contact/quote notifications and password resets. Hostinger: smtp.hostinger.com, port 465, SSL on. Leave password blank to keep the saved one.",
      fields: [
        { type: "text", name: "smtp.host", label: "SMTP host", placeholder: "smtp.hostinger.com" },
        { type: "text", name: "smtp.port", label: "Port", placeholder: "465" },
        { type: "text", name: "smtp.user", label: "Username", placeholder: "info@thetaxtech.com.pk" },
        { type: "password", name: "smtp.password", label: "Password", placeholder: "••••••••" },
        { type: "text", name: "smtp.from", label: "From name & address", placeholder: "Theta X Tech <info@thetaxtech.com.pk>" },
        { type: "email", name: "smtp.notifyEmail", label: "Send new leads to" },
        { type: "switch", name: "smtp.secure", label: "Use SSL/TLS", hint: "On for port 465" },
      ],
    },
  ],
  side: [
    {
      title: "Branding",
      fields: [
        { type: "image", name: "site.logo", label: "Logo — light backgrounds", full: true },
        { type: "image", name: "site.logoDark", label: "Logo — dark backgrounds", full: true },
        { type: "image", name: "site.icon", label: "Square icon (schema logo)", full: true },
        { type: "color", name: "theme.brand", label: "Brand colour", full: true },
        {
          type: "select",
          name: "theme.defaultMode",
          label: "Default theme",
          required: true,
          full: true,
          options: [
            { value: "dark", label: "Dark" },
            { value: "light", label: "Light" },
          ],
        },
        { type: "switch", name: "theme.preloader", label: "Show intro preloader", full: true },
      ],
    },
    {
      title: "Modules",
      description: "Turn optional features on or off.",
      fields: [
        { type: "switch", name: "modules.careers", label: "Careers page", full: true },
        { type: "switch", name: "modules.newsletter", label: "Newsletter sign-up", full: true },
        { type: "switch", name: "modules.cookieBanner", label: "Cookie consent banner", full: true },
        { type: "switch", name: "modules.sampleBadge", label: "Show sample badge", hint: "Label concept portfolio projects as “Sample project”", full: true },
      ],
    },
  ],
};

export default async function SettingsPage() {
  await requireUser("settings");
  const s = await getSettings();
  return (
    <>
      <PageHeader title="Settings" description="Company details, branding, SEO defaults, analytics, email and modules." actions={<SettingsTools />} />
      <EntityForm layout={layout} initial={{ ...s, smtp: { ...s.smtp, password: "" } }} action={saveSettings} submitLabel="Save settings" />
    </>
  );
}
