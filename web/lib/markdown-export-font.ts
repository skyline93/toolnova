const MIN_PX = 12;
const MAX_PX = 22;
const DEFAULT_PX = 14;

/**
 * Server-only: `/api/markdown-html` and `/api/markdown-pdf` read `process.env` at request time.
 * Use `MARKDOWN_EXPORT_BASE_FONT_PX` only (no `NEXT_PUBLIC_` — not used in the browser).
 */
function readEnvBaseFontPx(): string | undefined {
  return process.env.MARKDOWN_EXPORT_BASE_FONT_PX?.trim();
}

/** Base body font size (px) for HTML/PDF export; from `MARKDOWN_EXPORT_BASE_FONT_PX` or default 14. */
export function getMarkdownExportBaseFontPx(): number {
  const raw = readEnvBaseFontPx();
  if (raw === undefined || raw === "") {
    return DEFAULT_PX;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n)) {
    return DEFAULT_PX;
  }
  return Math.min(MAX_PX, Math.max(MIN_PX, n));
}

/**
 * Overrides --md-font-size-* in the export sheet; placed after bundled CSS.
 * Also fixes `pre` to scale with base (main sheet uses rem tied to browser root).
 */
export function buildMarkdownExportFontOverrideCss(basePx: number): string {
  const b = basePx;
  const r = (num: number, den: number) => Math.round((num * b * 100) / den) / 100;
  const f4 = r(18, 16);
  const f5 = r(20, 16);
  const f7 = r(28, 16);
  return (
    `html[data-color-mode="light"],html[data-color-mode="dark"]{` +
    `--md-font-size-3:${b}px;--md-font-size-4:${f4}px;--md-font-size-5:${f5}px;--md-font-size-7:${f7}px;` +
    `}` +
    `.markdown-preview-root pre{font-size:calc(var(--md-font-size-3)*0.8125);}`
  );
}
