"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { Box, Button, Card, Flex, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

function makeUuid(): string {
  const c = globalThis.crypto;
  if (typeof c?.randomUUID === "function") {
    return c.randomUUID();
  }
  if (!c?.getRandomValues) {
    throw new Error("Web Crypto API (getRandomValues) is not available");
  }
  const bytes = new Uint8Array(16);
  c.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export default function UuidGeneratorPage() {
  const t = useTranslations("uuidGenerator");
  const tc = useTranslations("common");
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const initialBatchSize = useRef<number | null>(null);
  if (initialBatchSize.current === null) {
    initialBatchSize.current = Math.min(100, Math.max(1, Math.floor(count)));
  }

  const safeCount = useMemo(() => Math.min(100, Math.max(1, Math.floor(count))), [count]);

  useLayoutEffect(() => {
    const n = initialBatchSize.current ?? 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init only
    setUuids(Array.from({ length: n }, () => makeUuid()));
  }, []);

  const regenerate = useCallback(() => {
    const next: string[] = [];
    for (let i = 0; i < safeCount; i += 1) next.push(makeUuid());
    setUuids(next);
  }, [safeCount]);

  const allText = useMemo(() => uuids.join("\n"), [uuids]);

  return (
    <Flex direction="column" gap="6">
      <Flex gap="4" align="end" wrap="wrap">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("quantity")}
          </Text>
          <TextField.Root
            type="number"
            size="2"
            min={1}
            max={100}
            style={{ width: "7rem" }}
            value={String(count)}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </Flex>
        <Button type="button" size="2" variant="solid" highContrast onClick={regenerate}>
          {tc("generate")}
        </Button>
        <CopyTextButton
          key={allText}
          text={allText}
          idleLabel={tc("copyAll")}
          copiedLabel={tc("allCopied")}
          variant="secondary"
        />
      </Flex>
      <Card size="2" variant="surface" style={{ padding: 0, overflow: "hidden" }}>
        {uuids.length === 0 ? (
          <Box p="6">
            <Text size="2" color="gray">
              {tc("loading")}
            </Text>
          </Box>
        ) : (
          <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
            {uuids.map((u, idx) => (
              <li key={u} style={{ borderTop: idx === 0 ? undefined : "1px solid var(--gray-a6)" }}>
                <Flex align="center" justify="between" gap="3" p="4">
                  <Text size="2" style={{ wordBreak: "break-all", fontFamily: "var(--font-geist-mono), monospace" }} highContrast>
                    {u}
                  </Text>
                  <CopyTextButton key={u} text={u} idleLabel={tc("copy")} copiedLabel={tc("copied")} variant="link" />
                </Flex>
              </li>
            ))}
          </ul>
        )}
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
