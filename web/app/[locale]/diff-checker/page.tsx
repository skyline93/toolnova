"use client";

import { Card, Flex, Grid, Heading, Text, TextArea } from "@radix-ui/themes";
import { diffLines } from "diff";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function DiffCheckerPage() {
  const t = useTranslations("diffChecker");
  const [left, setLeft] = useState("line one\nline two\nline three");
  const [right, setRight] = useState("line one\nline two edited\nline three\nline four");

  const parts = useMemo(() => diffLines(left, right), [left, right]);

  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("left")}
          </Text>
          <TextArea
            size="2"
            variant="surface"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
            style={{ minHeight: "220px", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("right")}
          </Text>
          <TextArea
            size="2"
            variant="surface"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
            style={{ minHeight: "220px", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
      </Grid>

      <Flex gap="4" wrap="wrap" align="center">
        <Flex gap="2" align="center">
          <span
            style={{
              height: "12px",
              width: "24px",
              borderRadius: "var(--radius-2)",
              background: "var(--red-a4)",
            }}
          />
          <Text size="1" color="gray">
            {t("legendRemoved")}
          </Text>
        </Flex>
        <Flex gap="2" align="center">
          <span
            style={{
              height: "12px",
              width: "24px",
              borderRadius: "var(--radius-2)",
              background: "var(--accent-a4)",
            }}
          />
          <Text size="1" color="gray">
            {t("legendAdded")}
          </Text>
        </Flex>
      </Flex>

      <Card size="2" variant="surface" style={{ maxHeight: "min(70vh, 520px)", overflow: "auto" }} aria-live="polite">
        <Text asChild size="2" style={{ fontFamily: "var(--font-geist-mono), ui-monospace, monospace", lineHeight: 1.6 }}>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {parts.map((part, i) => {
              if (part.added) {
                return (
                  <span key={i} style={{ background: "var(--accent-a4)", color: "var(--gray-12)" }}>
                    {part.value}
                  </span>
                );
              }
              if (part.removed) {
                return (
                  <span
                    key={i}
                    style={{
                      background: "var(--red-a4)",
                      color: "var(--gray-12)",
                      textDecoration: "line-through",
                      textDecorationColor: "var(--red-a8)",
                    }}
                  >
                    {part.value}
                  </span>
                );
              }
              return (
                <span key={i} style={{ color: "var(--gray-12)" }}>
                  {part.value}
                </span>
              );
            })}
          </pre>
        </Text>
      </Card>

      <Card size="3" variant="surface">
        <Heading as="h2" size="4" highContrast>
          {t("howTitle")}
        </Heading>
        <Text as="p" size="2" color="gray" mt="3" wrap="pretty">
          {t("howBody")}
        </Text>
      </Card>
    </Flex>
  );
}
