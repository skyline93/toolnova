"use client";

import { Theme as RadixTheme } from "@radix-ui/themes";
import { SiteThemeContext } from "@/lib/site-theme-context";
import {
  SITE_THEME_STORAGE_KEY,
  applyThemeToDocument,
  persistThemeClient,
  readStoredTheme,
  resolveThemeSetting,
  resolvedThemeFromCookieForSSR,
  themeSettingFromCookie,
  type SiteThemeSetting,
} from "@/lib/site-theme";
import { useCallback, useEffect, useLayoutEffect, useMemo, useState, type ReactNode } from "react";

function RadixThemeBridge({
  children,
  className,
  resolvedTheme,
}: {
  children: ReactNode;
  className: string;
  resolvedTheme: "light" | "dark";
}) {
  return (
    <RadixTheme
      accentColor="blue"
      grayColor="slate"
      panelBackground="solid"
      radius="large"
      scaling="100%"
      hasBackground
      appearance={resolvedTheme}
      className={className}
      suppressHydrationWarning
    >
      {children}
    </RadixTheme>
  );
}

export function SiteThemeProvider({
  children,
  localeClass,
  serverThemeCookie,
}: {
  children: React.ReactNode;
  localeClass: string;
  /** Raw `toolnova-theme` cookie from RSC (aligns first paint with SSR `<html class>`). */
  serverThemeCookie: string | undefined;
}) {
  const className = `flex min-h-dvh flex-1 flex-col ${localeClass}`;

  const [theme, setThemeState] = useState<SiteThemeSetting>(() =>
    typeof window === "undefined" ? themeSettingFromCookie(serverThemeCookie) : readStoredTheme(),
  );
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() =>
    typeof window === "undefined"
      ? resolvedThemeFromCookieForSSR(serverThemeCookie)
      : resolveThemeSetting(readStoredTheme()),
  );

  const setTheme = useCallback((next: SiteThemeSetting) => {
    setThemeState(next);
    persistThemeClient(next);
    setResolvedTheme(applyThemeToDocument(next));
  }, []);

  useLayoutEffect(() => {
    const stored = readStoredTheme();
    persistThemeClient(stored);
    const resolved = applyThemeToDocument(stored);
    /* eslint-disable react-hooks/set-state-in-effect -- one-shot: localStorage may differ from SSR cookie snapshot */
    setThemeState(stored);
    setResolvedTheme(resolved);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => setResolvedTheme(applyThemeToDocument("system"));
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [theme]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== SITE_THEME_STORAGE_KEY || e.newValue == null) return;
      const v = e.newValue;
      if (v !== "light" && v !== "dark" && v !== "system") return;
      setThemeState(v);
      persistThemeClient(v);
      setResolvedTheme(applyThemeToDocument(v));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const value = useMemo(
    () => ({ theme, setTheme, resolvedTheme }),
    [theme, resolvedTheme, setTheme],
  );

  return (
    <SiteThemeContext.Provider value={value}>
      <RadixThemeBridge className={className} resolvedTheme={resolvedTheme}>
        {children}
      </RadixThemeBridge>
    </SiteThemeContext.Provider>
  );
}
