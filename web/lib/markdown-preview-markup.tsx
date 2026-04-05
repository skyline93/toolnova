import type { Components } from "react-markdown";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Same link rules as PDF HTML (`markdown-to-preview-html.ts`) and the live preview. */
export const markdownPreviewComponents: Components = {
  a: ({ href, children, ...rest }) => {
    if (!href || href.toLowerCase().startsWith("javascript:") || href.toLowerCase().startsWith("data:")) {
      return <span>{children}</span>;
    }
    const external = href.startsWith("http://") || href.startsWith("https://");
    return (
      <a href={href} {...rest} target={external ? "_blank" : undefined} rel={external ? "noopener noreferrer" : undefined}>
        {children}
      </a>
    );
  },
};

export function MarkdownPreviewBody({ markdown }: { markdown: string }) {
  return (
    <div className="markdown-preview-root markdown-preview-wide max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownPreviewComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
