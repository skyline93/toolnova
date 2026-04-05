"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { JsonCodeEditor } from "@/components/json-code-editor";
import { Button, Card, Flex, Grid, Heading, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export default function JsonFormatterPage() {
  const t = useTranslations("jsonFormatter");
  const tc = useTranslations("common");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatJson = useCallback(() => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input]);

  const minifyJson = useCallback(() => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input]);

  return (
    <Flex direction="column" gap="6">
      <Flex gap="2" wrap="wrap">
        <Button type="button" size="2" variant="solid" highContrast onClick={formatJson}>
          {t("format")}
        </Button>
        <Button type="button" size="2" variant="outline" color="gray" onClick={minifyJson}>
          {t("minify")}
        </Button>
      </Flex>
      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("input")}
          </Text>
          <JsonCodeEditor
            value={input}
            onChange={setInput}
            placeholder={t("inputPlaceholder")}
            aria-label={t("input")}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Flex align="center" justify="between" gap="2" wrap="wrap">
            <Text size="2" weight="medium">
              {t("output")}
            </Text>
            <CopyTextButton
              key={output}
              text={output}
              idleLabel={tc("copyOutput")}
              copiedLabel={tc("copied")}
              variant="link"
              className="!min-w-0"
            />
          </Flex>
          <JsonCodeEditor value={output} readOnly placeholder={t("outputPlaceholder")} aria-label={t("output")} />
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
