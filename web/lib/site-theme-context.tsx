"use client";

import { createContext, useContext } from "react";
import type { SiteThemeSetting } from "@/lib/site-theme";

export type SiteThemeContextValue = {
  theme: SiteThemeSetting;
  setTheme: (next: SiteThemeSetting) => void;
  resolvedTheme: "light" | "dark";
};

export const SiteThemeContext = createContext<SiteThemeContextValue | null>(null);

export function useSiteTheme(): SiteThemeContextValue {
  const ctx = useContext(SiteThemeContext);
  if (!ctx) throw new Error("useSiteTheme must be used within SiteThemeProvider");
  return ctx;
}
