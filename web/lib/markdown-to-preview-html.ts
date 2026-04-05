import rehypePrism from "rehype-prism-plus";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { visit } from "unist-util-visit";

/**
 * PDF export HTML: same stack as @uiw/react-md-editor live preview — remark-gfm + rehype-prism-plus.
 * Token colors come from `markdown-export.css` (GitHub Pretty Lights, aligned with @uiw/react-markdown-preview).
 */
function rehypePreviewLinks() {
  return (tree: Parameters<typeof visit>[0]) => {
    visit(tree, "element", (el) => {
      const node = el as {
        tagName: string;
        properties?: Record<string, string | string[] | boolean | undefined>;
      };
      if (node.tagName !== "a") return;
      const href = node.properties?.href;
      if (typeof href !== "string") return;
      const lower = href.toLowerCase();
      if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
        node.tagName = "span";
        const next = { ...node.properties };
        delete next.href;
        delete next.target;
        delete next.rel;
        node.properties = next;
        return;
      }
      if (href.startsWith("http://") || href.startsWith("https://")) {
        node.properties = { ...node.properties, target: "_blank", rel: "noopener noreferrer" };
      }
    });
  };
}

export function markdownToPreviewHtmlFragment(markdown: string, _colorMode: "light" | "dark"): string {
  void _colorMode;
  const file = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: false })
    .use(rehypePreviewLinks)
    .use(rehypePrism, { ignoreMissing: true })
    .use(rehypeStringify)
    .processSync(markdown);
  return `<div class="wmde-markdown markdown-preview-root markdown-preview-wide max-w-none">${String(file)}</div>`;
}
