"use client";

import { Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

function parseYmdUtcDays(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  if (Number.isNaN(t)) return null;
  return Math.floor(t / 86400000);
}

function addDaysYmd(ymd: string, days: number): string | null {
  const base = parseYmdUtcDays(ymd);
  if (base === null) return null;
  const ms = (base + days) * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

export default function DateCalculatorPage() {
  const t = useTranslations("dateCalculator");
  const tc = useTranslations("common");
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-04-04");
  const [base, setBase] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init
    setBase(new Date().toISOString().slice(0, 10));
  }, []);

  const [delta, setDelta] = useState(30);

  const diff = useMemo(() => {
    const a = parseYmdUtcDays(start);
    const b = parseYmdUtcDays(end);
    if (a === null || b === null) return null;
    return b - a;
  }, [start, end]);

  const shifted = useMemo(
    () => (base ? addDaysYmd(base, delta) : null),
    [base, delta],
  );

  return (
    <Flex direction="column" gap="10">
      <Flex direction="column" gap="4">
        <Heading as="h2" size="5" highContrast>
          {t("diffTitle")}
        </Heading>
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("start")}
            </Text>
            <TextField.Root type="date" size="2" value={start} onChange={(e) => setStart(e.target.value)} />
          </Flex>
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("end")}
            </Text>
            <TextField.Root type="date" size="2" value={end} onChange={(e) => setEnd(e.target.value)} />
          </Flex>
        </Grid>
        {diff === null ? (
          <Text size="2" color="red">
            {t("invalidRange")}
          </Text>
        ) : (
          <Card size="2" variant="surface">
            <Text size="2" color="gray">
              {t("span", { days: diff })}
            </Text>
          </Card>
        )}
      </Flex>
      <Flex direction="column" gap="4">
        <Heading as="h2" size="5" highContrast>
          {t("addTitle")}
        </Heading>
        <Grid columns={{ initial: "1", sm: "2" }} gap="4">
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("base")}
            </Text>
            <TextField.Root type="date" size="2" value={base} onChange={(e) => setBase(e.target.value)} />
          </Flex>
          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("delta")}
            </Text>
            <TextField.Root
              type="number"
              size="2"
              value={String(delta)}
              onChange={(e) => setDelta(Number(e.target.value))}
            />
          </Flex>
        </Grid>
        {base === "" ? (
          <Text size="2" color="gray">
            {tc("loading")}
          </Text>
        ) : shifted ? (
          <Card size="2" variant="surface">
            <Text size="2" color="gray">
              {t("result")}{" "}
              <Text as="span" weight="bold" style={{ fontFamily: "var(--font-geist-mono), monospace" }} highContrast>
                {shifted}
              </Text>
            </Text>
          </Card>
        ) : (
          <Text size="2" color="red">
            {t("invalidBase")}
          </Text>
        )}
      </Flex>
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
