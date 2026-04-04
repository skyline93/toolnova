import { JsonLd, webApplicationJsonLd } from "@/components/json-ld";
import { getPathname, Link } from "@/i18n/navigation";
import { getSiteUrl } from "@/lib/site";
import { getLocale, getTranslations } from "next-intl/server";

export async function ToolShell({
  href,
  title,
  description,
  intro,
  category,
  children,
}: {
  href: string;
  title: string;
  description: string;
  intro: string;
  category?: string;
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const pathname = await getPathname({ locale, href });
  const url = `${getSiteUrl()}${pathname}`;
  const t = await getTranslations({ locale, namespace: "common" });

  return (
    <>
      <JsonLd
        data={webApplicationJsonLd({
          name: title,
          description,
          url,
          category,
        })}
      />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        <p>
          <Link
            href="/tools"
            className="text-sm font-medium text-[var(--accent)] hover:underline"
          >
            {t("allToolsLink")}
          </Link>
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-3 max-w-3xl text-pretty leading-relaxed text-[var(--muted)]">
          {intro}
        </p>
        <div className="mt-8">{children}</div>
      </main>
    </>
  );
}
