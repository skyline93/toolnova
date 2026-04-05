"use client";

import { Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

function ageCalendar(birthYmd: string, refYmd: string) {
  if (birthYmd > refYmd) return null;
  const [by, bm, bd] = birthYmd.split("-").map(Number);
  const [ry, rm, rd] = refYmd.split("-").map(Number);
  if ([by, bm, bd, ry, rm, rd].some((n) => !Number.isFinite(n))) return null;

  let years = ry - by;
  let months = rm - bm;
  let days = rd - bd;

  if (days < 0) {
    months -= 1;
    days += new Date(ry, rm - 1, 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return { years, months, days };
}

export default function AgeCalculatorPage() {
  const t = useTranslations("ageCalculator");
  const tc = useTranslations("common");
  const [birth, setBirth] = useState("1990-06-15");
  const [ref, setRef] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init
    setRef(new Date().toISOString().slice(0, 10));
  }, []);

  const result = useMemo(() => (ref ? ageCalendar(birth, ref) : null), [birth, ref]);

  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: "1", sm: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("birth")}
          </Text>
          <TextField.Root type="date" size="2" value={birth} onChange={(e) => setBirth(e.target.value)} />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("ref")}
          </Text>
          <TextField.Root type="date" size="2" value={ref} onChange={(e) => setRef(e.target.value)} />
        </Flex>
      </Grid>
      {ref === "" ? (
        <Text size="2" color="gray">
          {tc("loading")}
        </Text>
      ) : !result ? (
        <Text size="2" color="red">
          {t("error")}
        </Text>
      ) : (
        <Card size="3" variant="surface">
          <Text size="3" color="gray" highContrast>
            {t("result", {
              years: result.years,
              months: result.months,
              days: result.days,
            })}
          </Text>
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
