import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import type { Metadata } from "next";
import { getLocale, getTranslations } from "next-intl/server";
import { getPathname } from "@/i18n/navigation";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "termsPage" });
  const path = await getPathname({ locale, href: "/terms" });
  return {
    title: t("title"),
    description: t("metaDescription", { siteName }),
    alternates: { canonical: path },
  };
}

export default async function TermsPage() {
  const t = await getTranslations("termsPage");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-semibold tracking-tight">{t("title")}</h1>
      <p className="mt-3 text-sm text-[var(--muted)]">{t("updated")}</p>
      <div className="prose prose-neutral mt-8 max-w-none space-y-4 text-[var(--muted)] dark:prose-invert">
        <p className="text-[var(--foreground)]">{t("intro", { siteName })}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hWarranty")}</h2>
        <p>{t("pWarranty")}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hAcceptable")}</h2>
        <p>{t("pAcceptable")}</p>
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("hChanges")}</h2>
        <p>{t("pChanges")}</p>
        <p>
          <Link href="/" className="text-[var(--accent)] hover:underline">
            {t("backHome")}
          </Link>
        </p>
      </div>
    </main>
  );
}
