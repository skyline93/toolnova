"use client";

import { Button, Card, Flex, Grid, Heading, Text, TextArea } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function escapeCsvCell(v: string): string {
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function jsonToCsvString(raw: string): string {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("parse");
  }

  const rows: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        rows.push(item as Record<string, unknown>);
      }
    }
    if (rows.length === 0 && data.length > 0) {
      throw new Error("shape");
    }
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    rows.push(data as Record<string, unknown>);
  } else {
    throw new Error("shape");
  }

  if (rows.length === 0) {
    throw new Error("empty");
  }

  const keySet = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => keySet.add(k));
  }
  const headers = Array.from(keySet);
  const lines = [headers.map((h) => escapeCsvCell(h)).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(String(row[h] ?? ""))).join(","));
  }
  return lines.join("\n");
}

export default function JsonToCsvPage() {
  const t = useTranslations("jsonToCsv");
  const [input, setInput] = useState('[{"name":"Ada","score":10},{"name":"Bob","score":8}]');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    setError(null);
    try {
      setOutput(jsonToCsvString(input));
    } catch (e) {
      setOutput("");
      if (e instanceof Error) {
        if (e.message === "parse") setError(t("errorParse"));
        else if (e.message === "shape") setError(t("errorShape"));
        else if (e.message === "empty") setError(t("errorEmpty"));
        else setError(t("errorParse"));
      }
    }
  }, [input, t]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <Flex direction="column" gap="6">
      <Flex gap="2" wrap="wrap">
        <Button type="button" size="2" variant="solid" highContrast onClick={convert}>
          {t("convert")}
        </Button>
        <Button type="button" size="2" variant="outline" color="gray" onClick={download} disabled={!output}>
          {t("download")}
        </Button>
      </Flex>
      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("input")}
          </Text>
          <TextArea
            size="2"
            variant="surface"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
            style={{ minHeight: "280px", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("output")}
          </Text>
          <TextArea
            size="2"
            variant="surface"
            value={output}
            readOnly
            placeholder="CSV…"
            spellCheck={false}
            style={{ minHeight: "280px", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
      </Grid>
      {error ? (
        <Text size="2" color="red" role="alert">
          {error}
        </Text>
      ) : null}
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
