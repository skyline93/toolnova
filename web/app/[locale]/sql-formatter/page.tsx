"use client";

import { SqlCodeEditor } from "@/components/sql-code-editor";
import { CopyTextButton } from "@/components/copy-text-button";
import { getSqlFormatLanguage, sqlToolDialectOrder, type SqlToolDialectId } from "@/lib/sql-tool-dialects";
import { Button, Card, Flex, Grid, Heading, Select, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";
import { format } from "sql-formatter";

const dialectMessageKey: Record<SqlToolDialectId, string> = {
  standard: "dialectStandard",
  postgresql: "dialectPostgresql",
  mysql: "dialectMysql",
  mariadb: "dialectMariadb",
  sqlite: "dialectSqlite",
  mssql: "dialectMssql",
  plsql: "dialectPlsql",
};

export default function SqlFormatterPage() {
  const t = useTranslations("sqlFormatter");
  const tc = useTranslations("common");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [dialectId, setDialectId] = useState<SqlToolDialectId>("postgresql");

  const formatSql = useCallback(() => {
    setError(null);
    const trimmed = input.trim();
    if (!trimmed) {
      setOutput("");
      return;
    }
    try {
      const language = getSqlFormatLanguage(dialectId);
      setOutput(
        format(trimmed, {
          language,
          keywordCase: "upper",
        }),
      );
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : t("formatError"));
    }
  }, [dialectId, input, t]);

  return (
    <Flex direction="column" gap="6">
      <Flex gap="4" align="center" wrap="wrap">
        <Flex align="center" gap="2" wrap="wrap">
          <Text size="2" weight="medium" asChild>
            <label htmlFor="sql-dialect-select" style={{ cursor: "default" }}>
              {t("dialect")}
            </label>
          </Text>
          <Select.Root
            value={dialectId}
            onValueChange={(v) => setDialectId(v as SqlToolDialectId)}
          >
            <Select.Trigger id="sql-dialect-select" variant="soft" color="gray" style={{ minWidth: "11rem" }} />
            <Select.Content position="popper">
              {sqlToolDialectOrder.map((id) => (
                <Select.Item key={id} value={id}>
                  {t(dialectMessageKey[id])}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </Flex>
        <Button type="button" size="2" variant="solid" highContrast onClick={formatSql}>
          {t("format")}
        </Button>
      </Flex>
      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("input")}
          </Text>
          <SqlCodeEditor
            value={input}
            onChange={setInput}
            dialectId={dialectId}
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
          <SqlCodeEditor
            value={output}
            readOnly
            dialectId={dialectId}
            placeholder={t("outputPlaceholder")}
            aria-label={t("output")}
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
