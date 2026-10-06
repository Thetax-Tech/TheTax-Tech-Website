import type { Metadata, Viewport } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/seo";
import { LOADER_HEAD_SCRIPT } from "@/components/loader/site-loader";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const space = Space_Grotesk({ variable: "--font-space", subsets: ["latin"], display: "swap", weight: ["500", "600"] }); // only the weights headings use

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: s.seo.defaultTitle, template: s.seo.titleTemplate },
    description: s.seo.defaultDescription,
    applicationName: s.site.name,
    authors: [{ name: s.site.legalName, url: SITE_URL }],
    creator: s.site.legalName,
    publisher: s.site.legalName,
    formatDetection: { telephone: true, email: true, address: true },
    verification: {
      google: s.analytics.googleVerification || undefined,
      other: s.analytics.bingVerification ? { "msvalidate.01": s.analytics.bingVerification } : undefined,
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#07080b" },
    { media: "(prefers-color-scheme: light)", color: "#fafaf9" },
  ],
  colorScheme: "dark light",
  viewportFit: "cover", // enables env(safe-area-inset-*) for floating buttons on notched phones
};

const HEX = /^#[0-9a-f]{6}$/i;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSettings();
  const defaultMode = settings.theme.defaultMode === "light" ? "light" : "dark";
  const brand = HEX.test(settings.theme.brand) ? settings.theme.brand : "#F7941D";
  // Runs before first paint: apply the saved theme so there is no flash.
  const themeScript = `(function(){try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t='${defaultMode}';document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

  return (
    <html lang="en" data-theme={defaultMode} className={`${inter.variable} ${space.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <script dangerouslySetInnerHTML={{ __html: LOADER_HEAD_SCRIPT }} />
        {brand.toLowerCase() !== "#f7941d" && <style>{`:root{--brand:${brand}}`}</style>}
      </head>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
