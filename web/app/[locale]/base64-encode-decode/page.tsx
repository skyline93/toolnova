"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { Button, Card, Flex, Grid, Heading, Text, TextArea } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Base64Page() {
  const t = useTranslations("base64");
  const tc = useTranslations("common");
  const [text, setText] = useState("");
  const [b64, setB64] = useState("");
  const [error, setError] = useState<string | null>(null);

  const encode = useCallback(() => {
    setError(null);
    try {
      setB64(utf8ToBase64(text));
    } catch {
      setError(t("encodeError"));
    }
  }, [text, t]);

  const decode = useCallback(() => {
    setError(null);
    try {
      setText(base64ToUtf8(b64.trim()));
    } catch {
      setError(t("decodeError"));
    }
  }, [b64, t]);

  return (
    <Flex direction="column" gap="6">
      <Flex gap="2" wrap="wrap">
        <Button type="button" size="2" variant="solid" highContrast onClick={encode}>
          {t("encode")}
        </Button>
        <Button type="button" size="2" variant="outline" color="gray" onClick={decode}>
          {t("decode")}
        </Button>
      </Flex>
      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between" gap="2" wrap="wrap">
            <Text size="2" weight="medium">
              {t("plain")}
            </Text>
            <CopyTextButton
              key={text}
              text={text}
              idleLabel={tc("copyText")}
              copiedLabel={tc("copied")}
              variant="link"
              className="!min-w-0"
            />
          </Flex>
          <TextArea
            size="2"
            variant="surface"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
            style={{ minHeight: "220px", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between" gap="2" wrap="wrap">
            <Text size="2" weight="medium">
              {t("b64")}
            </Text>
            <CopyTextButton
              key={b64}
              text={b64}
              idleLabel={tc("copyBase64")}
              copiedLabel={tc("copied")}
              variant="link"
              className="!min-w-0"
            />
          </Flex>
          <TextArea
            size="2"
            variant="surface"
            value={b64}
            onChange={(e) => setB64(e.target.value)}
            spellCheck={false}
            style={{ minHeight: "220px", fontFamily: "var(--font-geist-mono), ui-monospace, monospace", fontSize: "var(--font-size-2)" }}
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
