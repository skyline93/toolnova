import type { Element, Root, RootContent } from "hast";
import { visit } from "unist-util-visit";

function hastToText(node: RootContent | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.value;
  if (node.type === "element" && node.children?.length) {
    return node.children.map((c) => hastToText(c as RootContent)).join("");
  }
  return "";
}

function isMermaidCodeBlock(code: Element): boolean {
  const cls = code.properties?.className;
  if (Array.isArray(cls)) {
    return cls.some((c) => String(c).includes("language-mermaid"));
  }
  if (typeof cls === "string") {
    return cls.split(/\s+/).includes("language-mermaid");
  }
  return false;
}

/**
 * Turn `pre > code.language-mermaid` into `pre.mermaid` with plain text so Prism skips it
 * and Mermaid can run in browser / Playwright.
 */
export function rehypeMermaidPre() {
  return (tree: Root) => {
    visit(tree, "element", (node, index, parent) => {
      if (node.tagName !== "pre" || parent == null || typeof index !== "number") return;
      const first = node.children[0];
      if (!first || first.type !== "element" || first.tagName !== "code") return;
      if (!isMermaidCodeBlock(first as Element)) return;

      const text = hastToText(first as Element).replace(/\n$/, "");
      const replacement: Element = {
        type: "element",
        tagName: "pre",
        properties: { className: "mermaid" },
        children: [{ type: "text", value: text }],
      };
      parent.children[index] = replacement;
    });
  };
}
