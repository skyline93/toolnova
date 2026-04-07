"use client";

import { useSiteTheme } from "@/lib/site-theme-context";
import { Box, IconButton } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useSyncExternalStore } from "react";

function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle() {
  const t = useTranslations("nav");
  const { resolvedTheme, setTheme } = useSiteTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return <Box style={{ width: "var(--space-6)", height: "var(--space-6)" }} flexShrink="0" />;
  }

  const isDark = resolvedTheme === "dark";

  return (
    <IconButton
      type="button"
      aria-label={isDark ? t("themeUseLight") : t("themeUseDark")}
      variant="soft"
      color="gray"
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  );
}
