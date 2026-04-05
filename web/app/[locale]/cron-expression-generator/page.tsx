"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { CronExpressionParser } from "cron-parser";
import { Button, Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function buildExpr(m: string, h: string, dom: string, mon: string, dow: string) {
  return [m, h, dom, mon, dow].join(" ").replace(/\s+/g, " ").trim();
}

function nextRuns(expr: string, count: number): string[] {
  try {
    const interval = CronExpressionParser.parse(expr, { currentDate: new Date() });
    return interval.take(count).map((d) => d.toString());
  } catch {
    return [];
  }
}

export default function CronExpressionGeneratorPage() {
  const t = useTranslations("cronGenerator");
  const tc = useTranslations("common");
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("*");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");

  const expression = useMemo(
    () => buildExpr(minute, hour, dom, month, dow),
    [minute, hour, dom, month, dow],
  );

  const runs = useMemo(() => nextRuns(expression, 8), [expression]);

  const cronError = useMemo(() => {
    try {
      CronExpressionParser.parse(expression, { currentDate: new Date() });
      return null;
    } catch {
      return t("errorCron");
    }
  }, [expression, t]);

  return (
    <Flex direction="column" gap="6">
      <Flex gap="2" wrap="wrap">
        <Button
          type="button"
          size="2"
          variant="outline"
          color="gray"
          onClick={() => {
            setMinute("0");
            setHour("*");
            setDom("*");
            setMonth("*");
            setDow("*");
          }}
        >
          {t("presetEveryHour")}
        </Button>
        <Button
          type="button"
          size="2"
          variant="outline"
          color="gray"
          onClick={() => {
            setMinute("0");
            setHour("0");
            setDom("*");
            setMonth("*");
            setDow("*");
          }}
        >
          {t("presetMidnight")}
        </Button>
        <Button
          type="button"
          size="2"
          variant="outline"
          color="gray"
          onClick={() => {
            setMinute("0");
            setHour("9");
            setDom("*");
            setMonth("*");
            setDow("1-5");
          }}
        >
          {t("presetDailyNine")}
        </Button>
      </Flex>

      <Grid columns={{ initial: "2", sm: "3", lg: "5" }} gap="3">
        <Flex direction="column" gap="1">
          <Text size="1" weight="medium" color="gray">
            {t("minute")}
          </Text>
          <TextField.Root
            size="2"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Flex direction="column" gap="1">
          <Text size="1" weight="medium" color="gray">
            {t("hour")}
          </Text>
          <TextField.Root
            size="2"
            value={hour}
            onChange={(e) => setHour(e.target.value)}
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Flex direction="column" gap="1">
          <Text size="1" weight="medium" color="gray">
            {t("dayOfMonth")}
          </Text>
          <TextField.Root
            size="2"
            value={dom}
            onChange={(e) => setDom(e.target.value)}
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Flex direction="column" gap="1">
          <Text size="1" weight="medium" color="gray">
            {t("month")}
          </Text>
          <TextField.Root
            size="2"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Flex direction="column" gap="1">
          <Text size="1" weight="medium" color="gray">
            {t("dayOfWeek")}
          </Text>
          <TextField.Root
            size="2"
            value={dow}
            onChange={(e) => setDow(e.target.value)}
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
      </Grid>

      <Card size="3" variant="surface">
        <Flex align="center" justify="between" gap="2" wrap="wrap">
          <Text size="2" weight="medium" color="gray">
            {t("expression")}
          </Text>
          <CopyTextButton text={expression} idleLabel={tc("copy")} copiedLabel={tc("copied")} variant="secondary" />
        </Flex>
        <Text
          as="p"
          size="2"
          mt="3"
          style={{ fontFamily: "var(--font-geist-mono), monospace", wordBreak: "break-all" }}
          highContrast
        >
          {expression}
        </Text>
        <Text size="1" color="gray" mt="2">
          {t("copyHint")}
        </Text>
      </Card>

      {cronError ? (
        <Text size="2" color="red" role="alert">
          {cronError}
        </Text>
      ) : (
        <Card size="3" variant="surface">
          <Text size="2" weight="medium" color="gray">
            {t("nextRuns")}
          </Text>
          <ul style={{ margin: "var(--space-2) 0 0", padding: 0, listStyle: "none" }}>
            {runs.map((r, i) => (
              <li key={i}>
                <Text size="2" style={{ fontFamily: "var(--font-geist-mono), monospace" }} highContrast>
                  {r}
                </Text>
              </li>
            ))}
          </ul>
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
