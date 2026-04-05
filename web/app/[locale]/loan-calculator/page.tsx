"use client";

import { Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function monthlyPayment(principal: number, annualAprPercent: number, years: number) {
  const n = Math.round(years * 12);
  if (!Number.isFinite(principal) || !Number.isFinite(annualAprPercent) || !Number.isFinite(years)) {
    return null;
  }
  if (principal <= 0 || years <= 0 || n <= 0) return null;
  if (annualAprPercent < 0) return null;
  const r = annualAprPercent / 100 / 12;
  if (r === 0) {
    return { monthly: principal / n, total: principal, interest: 0 };
  }
  const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = monthly * n;
  const interest = total - principal;
  return { monthly, total, interest };
}

export default function LoanCalculatorPage() {
  const t = useTranslations("loanCalculator");
  const [principal, setPrincipal] = useState("100000");
  const [apr, setApr] = useState("6.5");
  const [years, setYears] = useState("30");

  const result = useMemo(() => {
    const p = Number(principal.replace(/,/g, ""));
    const a = Number(apr);
    const y = Number(years);
    return monthlyPayment(p, a, y);
  }, [principal, apr, years]);

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
      <Grid columns={{ initial: "1", sm: "3" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("principal")}
          </Text>
          <TextField.Root
            size="2"
            inputMode="decimal"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("apr")}
          </Text>
          <TextField.Root size="2" inputMode="decimal" value={apr} onChange={(e) => setApr(e.target.value)} />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("years")}
          </Text>
          <TextField.Root size="2" inputMode="decimal" value={years} onChange={(e) => setYears(e.target.value)} />
        </Flex>
      </Grid>

      {result ? (
        <Card size="3" variant="surface">
          <Grid columns={{ initial: "1", sm: "3" }} gap="4">
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                {t("monthly")}
              </Text>
              <Text size="5" weight="bold" style={{ fontVariantNumeric: "tabular-nums" }} highContrast>
                {fmt.format(result.monthly)}
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                {t("totalPaid")}
              </Text>
              <Text size="5" weight="bold" style={{ fontVariantNumeric: "tabular-nums" }} highContrast>
                {fmt.format(result.total)}
              </Text>
            </Flex>
            <Flex direction="column" gap="1">
              <Text size="2" color="gray">
                {t("totalInterest")}
              </Text>
              <Text size="5" weight="bold" style={{ fontVariantNumeric: "tabular-nums" }} highContrast>
                {fmt.format(result.interest)}
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
