"use client";

import { MarkdownPreviewEditor } from "@/components/markdown-preview-editor";
import { useMarkdownPreviewColorMode } from "@/lib/markdown-preview-color-mode";
import {
  Box,
  Button,
  Card,
  Flex,
  Heading,
  SegmentedControl,
  Text,
} from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

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
- [x] Built-in PDF export

## Code

Inline \`code\` and a block:

\`\`\`ts
const greeting = "hello";
console.log(greeting);
\`\`\`
`;

type ViewMode = "source" | "preview" | "split";

export default function MarkdownPreviewPage() {
  const t = useTranslations("markdownPreview");
  const [source, setSource] = useState(DEFAULT_MARKDOWN);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const fsRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const colorMode = useMarkdownPreviewColorMode();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

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

  const exportPdf = useCallback(async () => {
    setPdfError(null);
    setPdfBusy(true);
    const pdfFilename = `${Date.now()}.pdf`;
    try {
      const res = await fetch("/api/markdown-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          markdown: source,
          color_mode: colorMode,
          filename: pdfFilename,
        }),
      });
      if (!res.ok) {
        let message = t("pdfErrorGeneric");
        try {
          const data = (await res.json()) as { error?: string };
          if (typeof data.error === "string" && data.error) {
            message = data.error;
          }
        } catch {
          /* ignore */
        }
        setPdfError(message);
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = pdfFilename;
      a.rel = "noopener";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError(t("pdfErrorGeneric"));
    } finally {
      setPdfBusy(false);
    }
  }, [colorMode, source, t]);

  return (
    <Flex direction="column" gap="6">
      <Box
        ref={fsRef}
        p={{ initial: "4", sm: "5" }}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-4)",
          borderRadius: isFullscreen ? 0 : "var(--radius-4)",
          border: isFullscreen ? "none" : "1px solid var(--gray-a6)",
          backgroundColor: "var(--color-background)",
          boxShadow: isFullscreen
            ? undefined
            : "0 1px 3px rgba(15, 23, 42, 0.06), 0 6px 20px rgba(15, 23, 42, 0.05)",
          minHeight: isFullscreen ? "100dvh" : undefined,
        }}
      >
        <Flex align="center" gap="3" wrap="wrap" justify="between">
          <Flex align="center" gap="3" wrap="wrap">
            <Text size="1" weight="bold" color="gray" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
              {t("viewModeLabel")}
            </Text>
            <SegmentedControl.Root
              value={viewMode}
              onValueChange={(v) => setViewMode(v as ViewMode)}
              size="2"
              aria-label={t("viewModeLabel")}
            >
              <SegmentedControl.Item value="source">{t("viewSource")}</SegmentedControl.Item>
              <SegmentedControl.Item value="preview">{t("viewPreview")}</SegmentedControl.Item>
              <SegmentedControl.Item value="split">{t("viewSplit")}</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>
          <Flex gap="2" wrap="wrap">
            {isFullscreen ? (
              <Button type="button" size="2" variant="outline" color="gray" onClick={exitFullscreen}>
                {t("exitFullscreen")}
              </Button>
            ) : (
              <Button type="button" size="2" variant="outline" color="gray" onClick={enterFullscreen}>
                {t("fullscreen")}
              </Button>
            )}
            <Button
              type="button"
              size="2"
              variant="outline"
              color="gray"
              disabled={pdfBusy || source.trim().length === 0}
              title={t("pdfHint")}
              onClick={exportPdf}
            >
              {pdfBusy ? t("pdfExporting") : t("pdfExport")}
            </Button>
          </Flex>
        </Flex>
        {pdfError ? (
          <Text size="2" color="red" role="alert">
            {pdfError}
          </Text>
        ) : null}

        <Flex
          direction="column"
          gap="4"
          className="min-h-0 min-w-0"
          style={{
            minHeight: isFullscreen ? 0 : "min(68vh, 820px)",
            flex: isFullscreen ? 1 : undefined,
          }}
        >
          <MarkdownPreviewEditor value={source} onChange={setSource} viewMode={viewMode} />
        </Flex>
      </Box>

      {!isFullscreen ? (
        <Card size="3" variant="surface">
          <Heading as="h2" size="4" highContrast>
            {t("howTitle")}
          </Heading>
          <Text as="p" size="2" color="gray" mt="3" wrap="pretty">
            {t("howBody")}
          </Text>
        </Card>
      ) : null}
    </Flex>
  );
}
