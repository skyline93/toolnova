"use client";

import type { PreviewType } from "@uiw/react-md-editor";
import dynamic from "next/dynamic";
import remarkGfm from "remark-gfm";
import { useMemo } from "react";

import { createMarkdownPreviewComponents } from "@/lib/markdown-preview-components";
import { useMarkdownPreviewColorMode } from "@/lib/markdown-preview-color-mode";

import "@uiw/react-md-editor/markdown-editor.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

export type MarkdownViewMode = "source" | "preview" | "split";

function previewFromViewMode(viewMode: MarkdownViewMode): PreviewType {
  if (viewMode === "source") return "edit";
  if (viewMode === "preview") return "preview";
  return "live";
}

export function MarkdownPreviewEditor({
  value,
  onChange,
  viewMode,
}: {
  value: string;
  onChange: (value: string) => void;
  viewMode: MarkdownViewMode;
}) {
  const colorMode = useMarkdownPreviewColorMode();
  const preview = previewFromViewMode(viewMode);

  const previewOptions = useMemo(
    () => ({
      remarkPlugins: [remarkGfm],
      components: createMarkdownPreviewComponents(colorMode),
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
        height="auto"
        enableScroll={false}
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
