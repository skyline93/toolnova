export const SITE_THEME_STORAGE_KEY = "toolnova-theme";

const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export type SiteThemeSetting = "light" | "dark" | "system";

export function readStoredTheme(): SiteThemeSetting {
  if (typeof window === "undefined") return "system";
  try {
    const v = localStorage.getItem(SITE_THEME_STORAGE_KEY);
    if (v === "light" || v === "dark" || v === "system") return v;
  } catch {
    /* private mode / blocked */
  }
  return "system";
}

export function resolveThemeSetting(theme: SiteThemeSetting): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

/** Apply `light` / `dark` to `<html>` (class + color-scheme). Returns resolved mode. */
export function applyThemeToDocument(theme: SiteThemeSetting): "light" | "dark" {
  const resolved = resolveThemeSetting(theme);
  const root = document.documentElement;
  root.classList.remove("dark");
  if (resolved === "dark") root.classList.add("dark");
  root.style.colorScheme = resolved;
  return resolved;
}

/** Server can only honor explicit `dark`; everything else is light until the client runs. */
export function serverHtmlIsDark(cookieValue: string | undefined): boolean {
  return cookieValue === "dark";
}

/** Bootstrap Client Component state on the server from the theme cookie (no `localStorage` on RSC). */
export function themeSettingFromCookie(raw: string | undefined): SiteThemeSetting {
  if (raw === "dark" || raw === "light" || raw === "system") return raw;
  return "system";
}

export function resolvedThemeFromCookieForSSR(raw: string | undefined): "light" | "dark" {
  if (raw === "dark") return "dark";
  if (raw === "light") return "light";
  return "light";
}

export function writeThemeCookie(theme: SiteThemeSetting): void {
  if (typeof document === "undefined") return;
  document.cookie = `${SITE_THEME_STORAGE_KEY}=${encodeURIComponent(theme)};path=/;max-age=${THEME_COOKIE_MAX_AGE};SameSite=Lax`;
}

export function writeThemeLocal(theme: SiteThemeSetting): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SITE_THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}

/** Keep localStorage + theme cookie aligned (cookie drives SSR `<html class="dark">`). */
export function persistThemeClient(theme: SiteThemeSetting): void {
  writeThemeLocal(theme);
  writeThemeCookie(theme);
}
