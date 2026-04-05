"use client";

import { Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function RoiCalculatorPage() {
  const t = useTranslations("roiCalculator");
  const [start, setStart] = useState("1000");
  const [end, setEnd] = useState("1250");

  const result = useMemo(() => {
    const s = Number(start.replace(/,/g, ""));
    const e = Number(end.replace(/,/g, ""));
    if (!Number.isFinite(s) || !Number.isFinite(e) || s <= 0) return null;
    const gain = e - s;
    const roi = (gain / s) * 100;
    return { gain, roi };
  }, [start, end]);

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );

  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: "1", sm: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("start")}
          </Text>
          <TextField.Root
            size="2"
            inputMode="decimal"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("end")}
          </Text>
          <TextField.Root size="2" inputMode="decimal" value={end} onChange={(e) => setEnd(e.target.value)} />
        </Flex>
      </Grid>

      {result ? (
        <Card size="3" variant="surface">
          <Grid columns={{ initial: "1", sm: "2" }} gap="4">
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                {t("gain")}
              </Text>
              <Text size="5" weight="bold" style={{ fontVariantNumeric: "tabular-nums" }} highContrast>
                {fmt.format(result.gain)}
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                {t("roi")}
              </Text>
              <Text size="5" weight="bold" style={{ fontVariantNumeric: "tabular-nums" }} highContrast>
                {fmt.format(result.roi)}%
              </Text>
            </Flex>
          </Grid>
        </Card>
      ) : (
        <Text size="2" color="red" role="alert">
          {t("invalid")}
        </Text>
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
