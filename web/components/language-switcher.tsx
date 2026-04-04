"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

function ChevronDown(props: { className?: string }) {
  return (
    <svg
      className={props.className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("nav");
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative border-l border-[var(--border)] pl-3">
      <select
        aria-label={t("language")}
        value={locale}
        disabled={pending}
        onChange={(e) => {
          const next = e.target.value;
          if (next === locale) return;
          startTransition(() => {
            router.replace(pathname, { locale: next });
          });
        }}
        className="lang-select"
      >
        {routing.locales.map((l) => (
          <option key={l} value={l}>
            {l === "en" ? t("english") : t("chineseSimplified")}
          </option>
        ))}
      </select>
      <span
        className="pointer-events-none absolute right-1 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center text-[var(--muted)]"
        aria-hidden
      >
        <ChevronDown />
      </span>
    </div>
  );
}
