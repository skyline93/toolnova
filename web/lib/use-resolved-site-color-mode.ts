"use client";

import { useSiteTheme } from "@/lib/site-theme-context";

/** Matches the active site appearance (Radix + html.dark). */
export function useResolvedSiteColorMode(): "light" | "dark" {
  return useSiteTheme().resolvedTheme;
}
