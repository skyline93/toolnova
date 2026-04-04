import { LanguageSwitcher } from "@/components/language-switcher";
import { Link } from "@/i18n/navigation";
import { siteName } from "@/lib/site";
import { getTranslations } from "next-intl/server";

export async function Header() {
  const t = await getTranslations("nav");

  return (
    <header className="border-b border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="shrink-0 font-semibold tracking-tight text-[var(--foreground)] hover:opacity-90"
        >
          {siteName}
        </Link>
        <div className="flex items-center gap-3 sm:gap-4">
          <nav className="flex items-center gap-4 text-sm font-medium text-[var(--muted)]">
            <Link href="/tools" className="hover:text-[var(--foreground)]">
              {t("tools")}
            </Link>
            <Link href="/privacy" className="hover:text-[var(--foreground)]">
              {t("privacy")}
            </Link>
            <Link href="/terms" className="hover:text-[var(--foreground)]">
              {t("terms")}
            </Link>
          </nav>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
