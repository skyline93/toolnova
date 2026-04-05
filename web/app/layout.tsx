import type { ReactNode } from "react";
import "@radix-ui/themes/styles.css";
import "./globals.css";

/** Root pass-through; `<html>` / `<body>` live in `[locale]/layout.tsx` for per-locale `lang` and fonts. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
