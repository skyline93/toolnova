"use client";

import { getMermaidInitializeConfig } from "@/lib/mermaid-runtime-config";
import { Flex, IconButton, Text } from "@radix-ui/themes";
import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";

const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.5;
const ZOOM_STEP = 0.25;

function MermaidZoomResetIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function formatMermaidError(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  try {
    return JSON.stringify(err);
  } catch {
    return String(err);
  }
}

export function MermaidPreviewBlock({
  source,
  colorMode,
}: {
  source: string;
  colorMode: "light" | "dark";
}) {
  const preRef = useRef<HTMLPreElement>(null);
  const [renderError, setRenderError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
  }, [source, colorMode]);

  useEffect(() => {
    const pre = preRef.current;
    if (!pre) return;

    let cancelled = false;
    setRenderError(null);

    (async () => {
      const mermaid = (await import("mermaid")).default;
      if (cancelled) return;

      pre.classList.remove("mermaid-error");
      /* Mermaid skips nodes that already have data-processed; React Strict Mode re-runs this effect
         on the same DOM node, leaving the attribute set → run() no-ops with no error (user sees raw source). */
      pre.removeAttribute("data-processed");
      pre.replaceChildren(document.createTextNode(source));

      mermaid.initialize({
        ...getMermaidInitializeConfig(colorMode),
      });

      try {
        await mermaid.run({ nodes: [pre], suppressErrors: false });
        if (!cancelled) setRenderError(null);
      } catch (err) {
        console.error("[mermaid] render failed", err);
        if (cancelled) return;
        setRenderError(formatMermaidError(err));
        pre.classList.add("mermaid-error");
        pre.replaceChildren(document.createTextNode(source));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [source, colorMode]);

  const showZoom = renderError === null;

  return (
    <div className="markdown-mermaid-block">
      <div className="markdown-mermaid-chrome">
        {showZoom ? (
          <Flex
            align="center"
            justify="end"
            gap="1"
            wrap="nowrap"
            className="markdown-mermaid-zoom-controls"
            role="toolbar"
            aria-label="Mermaid 图表缩放"
          >
            <IconButton
              type="button"
              size="1"
              variant="ghost"
              color="gray"
              radius="full"
              highContrast={false}
              className="markdown-mermaid-zoom-icon"
              aria-label="缩小"
              disabled={zoom <= ZOOM_MIN + 1e-6}
              onClick={() => setZoom((z) => Math.max(ZOOM_MIN, Math.round((z - ZOOM_STEP) * 100) / 100))}
            >
              −
            </IconButton>
            <Text size="1" weight="medium" className="markdown-mermaid-zoom-label">
              {Math.round(zoom * 100)}%
            </Text>
            <IconButton
              type="button"
              size="1"
              variant="ghost"
              color="gray"
              radius="full"
              highContrast={false}
              className="markdown-mermaid-zoom-icon"
              aria-label="放大"
              disabled={zoom >= ZOOM_MAX - 1e-6}
              onClick={() => setZoom((z) => Math.min(ZOOM_MAX, Math.round((z + ZOOM_STEP) * 100) / 100))}
            >
              +
            </IconButton>
            <IconButton
              type="button"
              size="1"
              variant="ghost"
              color="gray"
              radius="full"
              highContrast={false}
              className="markdown-mermaid-zoom-icon"
              aria-label="重置为 100%"
              disabled={zoom === 1}
              onClick={() => setZoom(1)}
            >
              <MermaidZoomResetIcon />
            </IconButton>
          </Flex>
        ) : null}
        <div className="markdown-mermaid-zoom-viewport">
          {/* `zoom` affects layout size so overflow scrolling works; `transform: scale` alone does not. */}
          <div className="markdown-mermaid-zoom-inner" style={{ zoom } as CSSProperties}>
            <pre ref={preRef} className="mermaid" />
          </div>
        </div>
      </div>
      {renderError ? (
        <div className="mermaid-render-error" role="alert">
          <strong>Mermaid 渲染失败</strong>
          <pre className="mermaid-render-error-detail">{renderError}</pre>
          <p className="mermaid-render-error-hint">
            常见原因：<code>{'%%{init: …}%%'}</code> 内须为合法 JSON（键与字符串用双引号）；完整报错见控制台。
          </p>
        </div>
      ) : null}
    </div>
  );
}
