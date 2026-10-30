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
      google: s.analytics.googleVerification || "Zjp8sFaFMt6gso5oAEpn_hubFKHRcju1gcYUozmJ7R0",
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

// Meta Pixel (Facebook) — base code + PageView
const META_PIXEL_ID = "1104379589068554";
const META_PIXEL_SCRIPT = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`;

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
        {/* Meta Pixel Code */}
        <script dangerouslySetInnerHTML={{ __html: META_PIXEL_SCRIPT }} />
        {/* End Meta Pixel Code */}
      </head>
      <body className="min-h-dvh">
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img height="1" width="1" style={{ display: "none" }} alt="" src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`} />
        </noscript>
        {children}
      </body>
    </html>
  );
}
