"use client";

import type { Components } from "react-markdown";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Heading,
  SegmentedControl,
  Text,
  TextArea,
} from "@radix-ui/themes";
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

  const panelStyle = {
    display: "flex" as const,
    flexDirection: "column" as const,
    minHeight: 0,
    flex: 1,
    overflow: "hidden" as const,
    borderRadius: "var(--radius-3)",
    border: "1px solid var(--gray-a6)",
    backgroundColor: "var(--color-background)",
  };

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
          backgroundColor: isFullscreen ? "var(--color-background)" : "var(--gray-a2)",
          minHeight: isFullscreen ? "100dvh" : undefined,
        }}
      >
        <Flex align="center" gap="3" wrap="wrap" justify="between">
          <Flex align="center" gap="3" wrap="wrap">
            {!isFullscreen ? (
              <>
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
              </>
            ) : (
              <Text size="2" weight="medium" highContrast>
                {t("viewSplit")}
              </Text>
            )}
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
            <Button type="button" size="2" variant="outline" color="gray" disabled style={{ opacity: 0.55 }} title={t("pdfHint")}>
              {t("pdfExport")}
              <Badge size="1" color="gray" ml="2" variant="soft">
                {t("pdfSoon")}
              </Badge>
            </Button>
          </Flex>
        </Flex>

        <Flex
          direction={
            isFullscreen
              ? { initial: "column", sm: "row" }
              : viewMode === "split"
                ? { initial: "column", md: "row" }
                : "column"
          }
          gap="4"
          align={viewMode === "split" && !isFullscreen ? { md: "stretch" } : undefined}
          style={{
            minHeight: isFullscreen ? 0 : "min(68vh, 820px)",
            flex: isFullscreen ? 1 : undefined,
          }}
        >
          {showSource ? (
            <Flex direction="column" gap="2" className="min-h-0 min-w-0 flex-1">
              <Text size="2" weight="medium" color="gray">
                {t("source")}
              </Text>
              <TextArea
                size="2"
                variant="surface"
                resize="none"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                spellCheck={false}
                className="min-h-0 flex-1"
                style={{
                  minHeight: "min(240px, 40vh)",
                  fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
                  fontSize: "var(--font-size-2)",
                  lineHeight: 1.6,
                }}
              />
            </Flex>
          ) : null}

          {showPreview ? (
            <Flex direction="column" gap="2" className="min-h-0 min-w-0 flex-1">
              <Text size="2" weight="medium" color="gray">
                {t("preview")}
              </Text>
              <Box style={{ ...panelStyle, overflowY: "auto", padding: "var(--space-3) var(--space-4)" }} aria-live="polite">
                <article className="markdown-preview-root markdown-preview-wide max-w-none">
                  <Markdown remarkPlugins={remarkPlugins} components={markdownComponents}>
                    {source}
                  </Markdown>
                </article>
              </Box>
            </Flex>
          ) : null}
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
