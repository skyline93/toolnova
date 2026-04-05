"use client";

import type { PreviewType } from "@uiw/react-md-editor";
import dynamic from "next/dynamic";
import type { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { useEffect, useMemo, useState } from "react";

import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const markdownComponents: Components = {
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

export type MarkdownViewMode = "source" | "preview" | "split";

function previewFromViewMode(viewMode: MarkdownViewMode, isFullscreen: boolean): PreviewType {
  if (isFullscreen) return "live";
  if (viewMode === "source") return "edit";
  if (viewMode === "preview") return "preview";
  return "live";
}

function useMdColorMode(): "light" | "dark" {
  const [mode, setMode] = useState<"light" | "dark">("light");
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => setMode(mq.matches ? "dark" : "light");
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);
  return mode;
}

export function MarkdownPreviewEditor({
  value,
  onChange,
  viewMode,
  isFullscreen,
}: {
  value: string;
  onChange: (value: string) => void;
  viewMode: MarkdownViewMode;
  isFullscreen: boolean;
}) {
  const colorMode = useMdColorMode();
  const preview = previewFromViewMode(viewMode, isFullscreen);
  const enableScroll = preview === "live";

  const previewOptions = useMemo(
    () => ({
      remarkPlugins: [remarkGfm],
      components: markdownComponents,
      wrapperElement: {
        "data-color-mode": colorMode,
        className: "markdown-preview-root markdown-preview-wide max-w-none",
      },
    }),
    [colorMode],
  );

  return (
    <div className="markdown-preview-md-editor-shell min-h-0 min-w-0 flex-1">
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? "")}
        preview={preview}
        enableScroll={enableScroll}
        highlightEnable
        hideToolbar
        visibleDragbar={false}
        previewOptions={previewOptions}
        textareaProps={{ spellCheck: false }}
        data-color-mode={colorMode}
      />
    </div>
  );
}
