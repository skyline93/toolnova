/**
 * Shared Mermaid options for live preview, exported HTML, and PDF (`pdf_render.py` inline init).
 *
 * `strict` escapes/rejects HTML in node text and breaks many real diagrams (e.g. `<br/>` in labels).
 * Markdown content is user-controlled but rendered in an isolated preview context; `loose` matches
 * typical editor expectations. See: https://mermaid.js.org/config/security.html
 */
export const MERMAID_SECURITY_LEVEL = "loose" as const;

export function getMermaidInitializeConfig(colorMode: "light" | "dark") {
  return {
    startOnLoad: false,
    theme: colorMode === "dark" ? "dark" : "default",
    securityLevel: MERMAID_SECURITY_LEVEL,
  } as const;
}
