"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import Script from "next/script";
import { Cookie } from "lucide-react";

const KEY = "tx-cookie-consent"; // "all" | "essential"

/**
 * Cookie banner + consent-gated analytics. Google Analytics / GTM only load after the visitor
 * accepts analytics cookies. Uses Google Consent Mode defaults (denied) until then.
 */
const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}
function readConsent() {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function CookieConsent({ gaId, gtmId, showBanner }: { gaId?: string; gtmId?: string; showBanner: boolean }) {
  // "pending" on the server so nothing consent-dependent renders before hydration
  const consent = useSyncExternalStore(subscribe, readConsent, () => "pending");

  function choose(value: "all" | "essential") {
    try {
      localStorage.setItem(KEY, value);
    } catch {}
    listeners.forEach((l) => l());
  }

  const analyticsAllowed = consent === "all" || (!showBanner && consent !== "essential");
  const visible = showBanner && consent === null;

  return (
    <>
      {analyticsAllowed && gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
          <Script id="ga-init" strategy="lazyOnload">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
          </Script>
        </>
      )}
      {analyticsAllowed && gtmId && (
        <Script id="gtm" strategy="lazyOnload">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`}
        </Script>
      )}

      {visible && (
          <div
            role="dialog"
            aria-live="polite"
            aria-label="Cookie consent"
            style={{ "--d": "1.2s" } as React.CSSProperties}
            className="ui-in [--iy:40px] [animation-duration:0.5s] fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-2xl border border-line-strong p-5 shadow-2xl glass sm:left-6 sm:right-auto sm:bottom-6"
          >
            <div className="flex gap-4">
              <Cookie className="mt-0.5 size-6 shrink-0 text-brand-ink" aria-hidden />
              <div>
                <p className="text-sm leading-relaxed text-muted">
                  We use essential cookies to run this site and, with your permission, analytics cookies to improve it.{" "}
                  <Link href="/privacy-policy" className="text-brand-ink underline underline-offset-2">Privacy Policy</Link>
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button onClick={() => choose("all")} className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-on-brand hover:bg-brand-soft">
                    Accept all
                  </button>
                  <button onClick={() => choose("essential")} className="rounded-full border border-line-strong px-5 py-2 text-sm font-semibold hover:border-brand">
                    Essential only
                  </button>
                </div>
              </div>
            </div>
          </div>
      )}
    </>
  );
}
