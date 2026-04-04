import type { Metadata } from "next";
import { ToolShell } from "@/components/tool-shell";
import { getPathname } from "@/i18n/navigation";
import { getLocale, getTranslations } from "next-intl/server";

const href = "/date-calculator";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "dateCalculator" });
  const path = await getPathname({ locale, href });
  const title = t("metaTitle");
  const description = t("metaDescription");
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description },
  };
}

export default async function Layout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const t = await getTranslations({ locale, namespace: "dateCalculator" });
  return (
    <ToolShell
      href={href}
      title={t("title")}
      description={t("metaDescription")}
      intro={t("intro")}
      category="UtilitiesApplication"
    >
      {children}
    </ToolShell>
  );
}
