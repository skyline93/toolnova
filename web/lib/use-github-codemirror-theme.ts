"use client";

import { useThemeContext } from "@radix-ui/themes";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import type { Extension } from "@codemirror/state";
import { useMemo, useSyncExternalStore } from "react";

function htmlHasDarkClass(): boolean {
  if (typeof document === "undefined") return false;
  const el = document.documentElement;
  return el.classList.contains("dark") || el.classList.contains("dark-theme");
}

function subscribeHtmlClass(onStoreChange: () => void): () => void {
  const el = document.documentElement;
  const mo = new MutationObserver(onStoreChange);
  mo.observe(el, { attributes: true, attributeFilter: ["class"] });
  return () => mo.disconnect();
}

/**
 * Matches Radix `Theme` appearance + `inherit` (html `.dark` / `.dark-theme` only — not prefers-color-scheme).
 */
export function useGithubCodemirrorTheme(): Extension {
  const { appearance } = useThemeContext();
  const inheritedDark = useSyncExternalStore(subscribeHtmlClass, htmlHasDarkClass, () => false);

  return useMemo(() => {
    const dark =
      appearance === "dark" || (appearance === "inherit" && inheritedDark);
    return dark ? githubDark : githubLight;
  }, [appearance, inheritedDark]);
}
