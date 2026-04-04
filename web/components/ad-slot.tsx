"use client";

import { useConsent } from "@/components/consent-context";
import { useTranslations } from "next-intl";
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

const adsenseClient = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID?.trim();
const adsenseSlot = process.env.NEXT_PUBLIC_ADSENSE_SLOT_FOOTER?.trim();

/** Reserved display unit (~leaderboard). Fixed min-height reduces CLS when ads load. */
export function AdSlot() {
  const t = useTranslations("adSlot");
  const { tier, hydrated } = useConsent();
  const pushed = useRef(false);

  const showAd = hydrated && tier === "analytics" && Boolean(adsenseClient && adsenseSlot);

  useEffect(() => {
    if (!showAd || pushed.current) return;
    let attempts = 0;
    const id = window.setInterval(() => {
      attempts += 1;
      if (window.adsbygoogle) {
        try {
          window.adsbygoogle.push({});
          pushed.current = true;
        } catch {
          /* ad block or fill error */
        }
        window.clearInterval(id);
      } else if (attempts > 100) {
        window.clearInterval(id);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [showAd]);

  return (
    <aside
      className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6"
      aria-label={t("ariaLabel")}
    >
      <div
        className="flex min-h-[120px] w-full items-center justify-center overflow-hidden rounded-[calc(var(--radius)-4px)] border border-dashed border-[var(--border)] bg-[color-mix(in_srgb,var(--foreground)_3%,var(--background))]"
        data-ad-slot-root
      >
        {showAd ? (
          <ins
            className="adsbygoogle block w-full min-h-[100px] max-w-[728px]"
            style={{ display: "block" }}
            data-ad-client={adsenseClient}
            data-ad-slot={adsenseSlot}
            data-ad-format="horizontal"
            data-full-width-responsive="true"
          />
        ) : (
          <p className="px-4 py-8 text-center text-xs text-[var(--muted)]">{t("placeholder")}</p>
        )}
      </div>
    </aside>
  );
}
