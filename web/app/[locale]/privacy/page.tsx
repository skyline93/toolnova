import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "privacyPage" });
  const path = await getPathname({ locale, href: "/privacy" });
  return {
    title: t("title"),
    description: t("metaDescription", { siteName }),
    alternates: { canonical: path },
  };
}

export default async function PrivacyPage() {
  const t = await getTranslations("privacyPage");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">{t("updated")}</p>
      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-[var(--muted)] dark:prose-invert">
        <p className="text-[var(--foreground)]">{t("intro", { siteName })}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hLocal")}</h2>
        <p>{t("pLocal")}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hPdf")}</h2>
        <p>{t("pPdf")}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hAnalytics")}</h2>
        <p>{t("pAnalytics")}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hConsent")}</h2>
        <p>{t("pConsent")}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hAdvertising")}</h2>
        <p>{t("pAdvertising")}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hContact")}</h2>
        <p>{t("pContact")}</p>
        <p>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            {t("backHome")}
          </Link>
        </p>
      </div>
    </main>
  );
}
