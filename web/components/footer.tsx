import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import { getTranslations } from "next-intl/server";

export async function Footer() {
  const t = await getTranslations("footer");
  const tn = await getTranslations("nav");

  return (
    <footer className="mt-auto border-t border-[var(--border)] bg-[var(--surface)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-sm text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} {siteName}. {t("tagline")}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/tools" className="hover:text-[var(--foreground)]">
            {t("allTools")}
          </Link>
          <Link href="/privacy" className="hover:text-[var(--foreground)]">
            {tn("privacy")}
          </Link>
          <Link href="/terms" className="hover:text-[var(--foreground)]">
            {tn("terms")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
