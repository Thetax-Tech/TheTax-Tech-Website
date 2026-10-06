import { getServices, getSettings } from "@/lib/data";
import { organizationSchema, websiteSchema } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { BackToTop } from "@/components/layout/back-to-top";
import { CookieConsent } from "@/components/layout/cookie-consent";
import { ScrollProgress } from "@/components/motion/scroll-progress";
import { SiteLoader } from "@/components/loader/site-loader";
import { CustomCursor } from "@/components/motion/custom-cursor";
import { ChatLauncher } from "@/components/chat/chat-launcher";
import { isOpenNow } from "@/lib/agent/knowledge";

export default async function SiteLayout({ children }: LayoutProps<"/">) {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const navServices = services.map((s) => ({ slug: s.slug, name: s.name, icon: s.icon, tagline: s.tagline }));

  return (
    <>
      <JsonLd data={[organizationSchema(settings), websiteSchema(settings)]} />
      {settings.theme.preloader && <SiteLoader />}
      <CustomCursor />
      <ScrollProgress />
      <Navbar
        services={navServices}
        logo={settings.site.logo}
        logoDark={settings.site.logoDark}
        name={settings.site.name}
        careersEnabled={settings.modules.careers}
      />
      <main id="main" tabIndex={-1} className="relative outline-none">
        {children}
      </main>
      <Footer settings={settings} services={navServices} />
      <BackToTop />
      {settings.agent.enabled && (
        <ChatLauncher name={settings.agent.name} greeting={settings.agent.greeting} quickReplies={settings.agent.quickReplies} online={isOpenNow(settings.agent.businessHours)} />
      )}
      <CookieConsent
        gaId={settings.analytics.gaId || undefined}
        gtmId={settings.analytics.gtmId || undefined}
        showBanner={settings.modules.cookieBanner}
      />
    </>
  );
}
