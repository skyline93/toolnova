"use client";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Select } from "@radix-ui/themes";
import { useLocale, useTranslations } from "next-intl";
import { useTransition } from "react";

export function LanguageSwitcher() {
  const pathname = usePathname();
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations("nav");
  const [pending, startTransition] = useTransition();

  return (
    <Select.Root
      value={locale}
      disabled={pending}
      onValueChange={(next) => {
        if (next === locale) return;
        startTransition(() => {
          router.replace(pathname, { locale: next });
        });
      }}
    >
      <Select.Trigger aria-label={t("language")} variant="soft" color="gray" style={{ minWidth: "9rem" }} />
      <Select.Content position="popper">
        {routing.locales.map((l) => (
          <Select.Item key={l} value={l}>
            {l === "en" ? t("english") : t("chineseSimplified")}
          </Select.Item>
        ))}
      </Select.Content>
    </Select.Root>
  );
}
