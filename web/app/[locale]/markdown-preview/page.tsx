"use client";

import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_MARKDOWN = `# Markdown preview

Write **bold**, *italic*, and ~~strikethrough~~.

## Lists

- First
- Second

1. Step one
2. Step two

## Table

| Feature | Status |
| --- | --- |
| GFM tables | Yes |
| Task lists | Yes |

## Task list

- [x] Live preview
- [ ] Built-in PDF export (planned)

## Code

Inline \`code\` and a block:

\`\`\`ts
const greeting = "hello";
console.log(greeting);
\`\`\`
`;

const markdownComponents: Components = {
  a: ({ href, children, ...rest }) => {
    if (!href || href.toLowerCase().startsWith("javascript:") || href.toLowerCase().startsWith("data:")) {
      return <span>{children}</span>;
    }
    const external = href.startsWith("http://") || href.startsWith("https://");
    return (
      <a
        href={href}
        {...rest}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  },
};

type ViewMode = "source" | "preview" | "split";

export default function MarkdownPreviewPage() {
  const t = useTranslations("markdownPreview");
  const [source, setSource] = useState(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const fsRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const remarkPlugins = useMemo(() => [remarkGfm], []);

  useEffect(() => {
    const sync = () => {
      setIsFullscreen(document.fullscreenElement === fsRef.current);
    };
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const enterFullscreen = useCallback(async () => {
    const el = fsRef.current;
    if (!el) return;
    try {
      await el.requestFullscreen();
    } catch {
      /* user denied or unsupported */
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    if (document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const showSource = isFullscreen || viewMode === "source" || viewMode === "split";
  const showPreview = isFullscreen || viewMode === "preview" || viewMode === "split";

  const modeButtonClass = (active: boolean) =>
    `rounded-md px-3 py-1.5 text-sm font-medium transition ${
      active
        ? "bg-[var(--accent)] text-white shadow-sm"
        : "bg-transparent text-[var(--muted)] hover:bg-[color-mix(in_srgb,var(--foreground)_6%,transparent)] hover:text-[var(--foreground)]"
    }`;

  const panelShell =
    "flex min-h-0 flex-col overflow-hidden rounded-[calc(var(--radius)-4px)] border border-[var(--border)] bg-[var(--background)]";

  return (
    <div className="space-y-6">
      <div
        ref={fsRef}
        className={
          isFullscreen
            ? "flex min-h-[100dvh] w-full flex-col bg-[var(--background)] p-4 sm:p-5"
            : "flex flex-col gap-4 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface)]/60 p-4 sm:p-5"
        }
      >
        <div className="flex flex-wrap items-center gap-3">
          {!isFullscreen ? (
            <>
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t("viewModeLabel")}
              </span>
              <div
                className="inline-flex flex-wrap gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] p-1"
                role="group"
                aria-label={t("viewModeLabel")}
              >
                <button
                  type="button"
                  className={modeButtonClass(viewMode === "source")}
                  aria-pressed={viewMode === "source"}
                  onClick={() => setViewMode("source")}
                >
                  {t("viewSource")}
                </button>
                <button
                  type="button"
                  className={modeButtonClass(viewMode === "preview")}
                  aria-pressed={viewMode === "preview"}
                  onClick={() => setViewMode("preview")}
                >
                  {t("viewPreview")}
                </button>
                <button
                  type="button"
                  className={modeButtonClass(viewMode === "split")}
                  aria-pressed={viewMode === "split"}
                  onClick={() => setViewMode("split")}
                >
                  {t("viewSplit")}
                </button>
              </div>
            </>
          ) : (
            <span className="text-sm font-medium text-[var(--foreground)]">{t("viewSplit")}</span>
          )}

          <div className="ml-auto flex flex-wrap items-center gap-2">
            {isFullscreen ? (
              <button type="button" className="tool-btn tool-btn-secondary" onClick={exitFullscreen}>
                {t("exitFullscreen")}
              </button>
            ) : (
              <button type="button" className="tool-btn tool-btn-secondary" onClick={enterFullscreen}>
                {t("fullscreen")}
              </button>
            )}
            <button
              type="button"
              className="tool-btn tool-btn-secondary opacity-55"
              disabled
              title={t("pdfHint")}
              aria-disabled="true"
            >
              {t("pdfExport")}
              <span className="ml-2 rounded bg-[color-mix(in_srgb,var(--foreground)_10%,transparent)] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--muted)]">
                {t("pdfSoon")}
              </span>
            </button>
          </div>
        </div>

        <div
          className={
            isFullscreen
              ? "flex min-h-0 flex-1 flex-col gap-3 sm:flex-row sm:gap-4"
              : viewMode === "split"
                ? "flex min-h-[min(68vh,820px)] flex-col gap-4 md:min-h-[min(70vh,860px)] md:flex-row md:items-stretch"
                : "flex min-h-[min(68vh,820px)] flex-col"
          }
        >
          {showSource ? (
            <label className="flex min-h-0 min-w-0 flex-1 flex-col space-y-2">
              <span className="shrink-0 text-sm font-medium text-[var(--muted)]">{t("source")}</span>
              <textarea
                className="tool-input min-h-[min(240px,40vh)] flex-1 resize-none font-mono text-sm leading-relaxed md:min-h-0"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                spellCheck={false}
              />
            </label>
          ) : null}

          {showPreview ? (
            <div className="flex min-h-0 min-w-0 flex-1 flex-col space-y-2">
              <span className="shrink-0 text-sm font-medium text-[var(--muted)]">{t("preview")}</span>
              <div
                className={`${panelShell} flex-1 overflow-y-auto px-4 py-3 sm:px-5 sm:py-4`}
                aria-live="polite"
              >
                <article className="markdown-preview-root markdown-preview-wide max-w-none">
                  <Markdown remarkPlugins={remarkPlugins} components={markdownComponents}>
                    {source}
                  </Markdown>
                </article>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {!isFullscreen ? (
        <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
          <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
          <p>{t("howBody")}</p>
        </section>
      ) : null}
    </div>
  );
}
