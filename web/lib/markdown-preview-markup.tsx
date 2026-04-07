"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { createMarkdownPreviewComponents } from "@/lib/markdown-preview-components";
import { useMarkdownPreviewColorMode } from "@/lib/markdown-preview-color-mode";

export function MarkdownPreviewBody({ markdown }: { markdown: string }) {
  const colorMode = useMarkdownPreviewColorMode();
  const components = createMarkdownPreviewComponents(colorMode);
  return (
    <div className="markdown-preview-root markdown-preview-wide max-w-none">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
