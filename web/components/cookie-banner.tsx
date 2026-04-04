"use client";

import { Link } from "@/i18n/navigation";
import { useConsent } from "@/components/consent-context";
import { useTranslations } from "next-intl";
import { useEffect } from "react";

export function CookieBanner() {
  const t = useTranslations("consentBanner");
  const { tier, hydrated, acceptAnalytics, acceptEssentialOnly } = useConsent();

  useEffect(() => {
    if (!hydrated || tier !== "unknown") return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "calc(9rem + env(safe-area-inset-bottom, 0px))";
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [hydrated, tier]);

  if (!hydrated || tier !== "unknown") {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[200] border-t border-[var(--border)] bg-[var(--surface)]/95 p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-[var(--surface)]/88"
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="min-w-0 flex-1 space-y-2 text-sm leading-relaxed text-[var(--foreground)]">
          <p id="cookie-banner-title" className="font-semibold">
            {t("title")}
          </p>
          <p className="text-[var(--muted)]">{t("body")}</p>
          <p>
            <Link href="/privacy" className="text-[var(--accent)] underline underline-offset-2 hover:opacity-90">
              {t("privacyLink")}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
          <button type="button" className="tool-btn w-full sm:w-auto" onClick={acceptAnalytics}>
            {t("acceptAll")}
          </button>
          <button
            type="button"
            className="tool-btn tool-btn-secondary w-full sm:w-auto"
            onClick={acceptEssentialOnly}
          >
            {t("essentialOnly")}
          </button>
        </div>
      </div>
    </div>
  );
}
