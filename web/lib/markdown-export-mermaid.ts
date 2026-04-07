import { MERMAID_SECURITY_LEVEL } from "@/lib/mermaid-runtime-config";

/**
 * Mermaid library is inlined from `web/assets/mermaid.min.js` (see `load-mermaid-min-js.ts`).
 * Run `npm run mermaid:sync-assets` after bumping the `mermaid` package.
 */
export const MERMAID_PACKAGE_VERSION = "11.14.0";

/**
 * For standalone downloaded HTML: run diagrams after DOM is ready (after inline `mermaid.min.js`).
 * PDF service uses Playwright `evaluate` instead; see `services/markdown-pdf`.
 */
export function markdownExportMermaidBootScript(): string {
  return `<script>
(function () {
  function run() {
    if (typeof mermaid === "undefined") return Promise.resolve();
    var mode = document.documentElement.getAttribute("data-color-mode") || "light";
    mermaid.initialize({
      startOnLoad: false,
      theme: mode === "dark" ? "dark" : "default",
      securityLevel: "${MERMAID_SECURITY_LEVEL}",
    });
    return mermaid.run();
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      run().catch(function () {});
    });
  } else {
    run().catch(function () {});
  }
})();
</script>`;
}
