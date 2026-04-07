import { readFileSync } from "fs";
import { join } from "path";

/** Same idea as `services/markdown-pdf/app/document.py` `_MERMAID_PRE_IN_HTML`. */
const MERMAID_PRE_IN_HTML = /<pre\s[^>]*\bmermaid\b/i;

export function htmlIncludesMermaidPre(fragment: string): boolean {
  return MERMAID_PRE_IN_HTML.test(fragment);
}

let cachedMermaidMin: string | null = null;

/**
 * Bundled copy of `mermaid/dist/mermaid.min.js` at `web/assets/mermaid.min.js` (no CDN; PDF/offline HTML).
 * After `npm update mermaid`, run `npm run mermaid:sync-assets`.
 */
export function loadMermaidMinJs(): string {
  if (cachedMermaidMin !== null) {
    return cachedMermaidMin;
  }
  const filePath = join(process.cwd(), "assets", "mermaid.min.js");
  cachedMermaidMin = readFileSync(filePath, "utf8");
  return cachedMermaidMin;
}
