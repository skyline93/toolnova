"use client";

import { useConsent } from "@/components/consent-context";
import Script from "next/script";

const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID?.trim();
const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();

export function ConditionalAnalytics() {
  const { tier, hydrated } = useConsent();

  if (!hydrated || tier !== "analytics") {
    return null;
  }

  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="lazyOnload" />
          <Script id="ga4-consent-init" strategy="lazyOnload">
            {`
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${gaId}', { anonymize_ip: true });
            `}
          </Script>
        </>
      ) : null}
      {adsenseClient ? (
        <Script
          async
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseClient}`}
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      ) : null}
    </>
  );
}
