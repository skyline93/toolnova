"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { Card, Flex, Grid, Heading, Text, TextArea } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function decodePart(part: string): string {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const json = new TextDecoder().decode(bytes);
  const obj = JSON.parse(json);
  return JSON.stringify(obj, null, 2);
}

export default function JwtDecoderPage() {
  const t = useTranslations("jwt");
  const tc = useTranslations("common");
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    const tok = token.trim();
    if (!tok) return { kind: "empty" as const };
    const parts = tok.split(".");
    if (parts.length < 2) {
      return { kind: "error" as const, message: t("errorSegments") };
    }
    try {
      return {
        kind: "ok" as const,
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
      };
    } catch {
      return { kind: "error" as const, message: t("errorDecode") };
    }
  }, [token, t]);

  return (
    <Flex direction="column" gap="6">
      <Flex direction="column" gap="2">
        <Text size="2" weight="medium">
          {t("label")}
        </Text>
        <TextArea
          size="2"
          variant="surface"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t("placeholder")}
          spellCheck={false}
          style={{ minHeight: "120px", fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
        />
      </Flex>
      {result.kind === "error" ? (
        <Text size="2" color="red" role="alert">
          {result.message}
        </Text>
      ) : null}
      {result.kind === "ok" ? (
        <Grid columns={{ initial: "1", lg: "2" }} gap="4">
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between" gap="2" wrap="wrap">
              <Heading as="h2" size="3" color="gray">
                {t("header")}
              </Heading>
              <CopyTextButton
                key={`h:${result.header}`}
                text={result.header}
                idleLabel={tc("copy")}
                copiedLabel={tc("copied")}
                variant="link"
                className="!min-w-0"
              />
            </Flex>
            <Card size="2" variant="surface">
              <Text asChild size="1" style={{ fontFamily: "var(--font-geist-mono), monospace", lineHeight: 1.5 }}>
                <pre style={{ margin: 0, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {result.header}
                </pre>
              </Text>
            </Card>
          </Flex>
          <Flex direction="column" gap="2">
            <Flex align="center" justify="between" gap="2" wrap="wrap">
              <Heading as="h2" size="3" color="gray">
                {t("payload")}
              </Heading>
              <CopyTextButton
                key={`p:${result.payload}`}
                text={result.payload}
                idleLabel={tc("copy")}
                copiedLabel={tc("copied")}
                variant="link"
                className="!min-w-0"
              />
            </Flex>
            <Card size="2" variant="surface">
              <Text asChild size="1" style={{ fontFamily: "var(--font-geist-mono), monospace", lineHeight: 1.5 }}>
                <pre style={{ margin: 0, overflow: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                  {result.payload}
                </pre>
              </Text>
            </Card>
          </Flex>
        </Grid>
      ) : null}
      <Card size="3" variant="surface">
        <Heading as="h2" size="4" highContrast>
          {t("safetyTitle")}
        </Heading>
        <Text as="p" size="2" color="gray" mt="3" wrap="pretty">
          {t("safetyBody")}
        </Text>
      </Card>
    </Flex>
  );
}
