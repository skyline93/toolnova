"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

function parseInput(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000);
  if (/^\d{13}$/.test(s)) return new Date(Number(s));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimestampConverterPage() {
  const t = useTranslations("timestamp");
  const tc = useTranslations("common");
  const [raw, setRaw] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init
    setRaw(String(Math.floor(Date.now() / 1000)));
  }, []);

  const date = useMemo(() => parseInput(raw), [raw]);

  const rows = useMemo(() => {
    if (!date) return null;
    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toString(),
      seconds: Math.floor(date.getTime() / 1000),
      millis: date.getTime(),
    };
  }, [date]);

  const rowDefs = useMemo(() => {
    if (!rows) return [];
    return [
      ["rowIso", rows.iso],
      ["rowUtc", rows.utc],
      ["rowLocal", rows.local],
      ["rowSeconds", String(rows.seconds)],
      ["rowMillis", String(rows.millis)],
    ] as const;
  }, [rows]);

  return (
    <Flex direction="column" gap="6">
      <Flex direction="column" gap="2" style={{ maxWidth: "36rem" }}>
        <Text size="2" weight="medium">
          {t("label")}
        </Text>
        <TextField.Root
          size="2"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
          style={{ fontFamily: "var(--font-geist-mono), monospace" }}
        />
      </Flex>
      {raw === "" ? (
        <Text size="2" color="gray">
          {tc("loading")}
        </Text>
      ) : !date ? (
        <Text size="2" color="red">
          {t("parseError")}
        </Text>
      ) : (
        <Card size="2" variant="surface" style={{ padding: 0, overflow: "hidden" }}>
          {rowDefs.map(([key, v], idx) => (
            <Flex
              key={key}
              direction={{ initial: "column", sm: "row" }}
              align={{ sm: "start" }}
              justify={{ sm: "between" }}
              gap="2"
              p="4"
              style={{
                borderTop: idx === 0 ? undefined : "1px solid var(--gray-a6)",
              }}
            >
              <Text size="2" weight="medium" color="gray" className="shrink-0">
                {t(key)}
              </Text>
              <Flex align="start" justify="end" gap="2" className="min-w-0 flex-1" style={{ maxWidth: "100%" }}>
                <Text
                  size="2"
                  align="right"
                  style={{
                    wordBreak: "break-all",
                    fontFamily: "var(--font-geist-mono), monospace",
                  }}
                  highContrast
                >
                  {v}
                </Text>
                <CopyTextButton
                  key={`${key}:${v}`}
                  text={v}
                  idleLabel={tc("copy")}
                  copiedLabel={tc("copied")}
                  variant="link"
                  className="!min-w-0 shrink-0"
                />
              </Flex>
            </Flex>
          ))}
        </Card>
      )}
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
