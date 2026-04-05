"use client";

import { Card, Flex, Grid, Heading, Text, TextField } from "@radix-ui/themes";
import { useLocale, useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

function getZones(): string[] {
  try {
    const fn = (
      Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
    ).supportedValuesOf;
    if (typeof fn === "function") return fn("timeZone").slice().sort();
  } catch {
    /* ignore */
  }
  return [
    "UTC",
    "America/New_York",
    "America/Los_Angeles",
    "Europe/London",
    "Europe/Paris",
    "Asia/Tokyo",
    "Asia/Shanghai",
    "Australia/Sydney",
  ];
}

function formatInZone(iso: string, zone: string, locale: string) {
  const d = new Date(iso);
  const loc = locale === "zh-CN" ? "zh-CN" : "en-US";
  return new Intl.DateTimeFormat(loc, {
    timeZone: zone,
    dateStyle: "full",
    timeStyle: "long",
  }).format(d);
}

export default function TimeZoneConverterPage() {
  const t = useTranslations("timeZone");
  const tc = useTranslations("common");
  const locale = useLocale();
  const zones = useMemo(() => getZones(), []);
  const [a, setA] = useState("America/New_York");
  const [b, setB] = useState("Europe/London");
  const [iso, setIso] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init
    setIso(new Date().toISOString().slice(0, 16));
  }, []);

  const instant = useMemo(() => {
    const d = new Date(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  }, [iso]);

  return (
    <Flex direction="column" gap="6">
      <Flex direction="column" gap="2" style={{ maxWidth: "28rem" }}>
        <Text size="2" weight="medium">
          {t("labelDt")}
        </Text>
        <TextField.Root type="datetime-local" size="2" value={iso} onChange={(e) => setIso(e.target.value)} />
      </Flex>
      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("zoneA")}
          </Text>
          <select className="radix-native-select" value={a} onChange={(e) => setA(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("zoneB")}
          </Text>
          <select className="radix-native-select" value={b} onChange={(e) => setB(e.target.value)}>
            {zones.map((z) => (
              <option key={z} value={z}>
                {z}
              </option>
            ))}
          </select>
        </Flex>
      </Grid>
      {iso === "" ? (
        <Text size="2" color="gray">
          {tc("loading")}
        </Text>
      ) : !instant ? (
        <Text size="2" color="red">
          {t("invalid")}
        </Text>
      ) : (
        <Grid columns={{ initial: "1", lg: "2" }} gap="4">
          <Card size="3" variant="surface">
            <Text size="2" weight="bold" highContrast>
              {a}
            </Text>
            <Text size="2" color="gray" mt="2">
              {formatInZone(instant.toISOString(), a, locale)}
            </Text>
          </Card>
          <Card size="3" variant="surface">
            <Text size="2" weight="bold" highContrast>
              {b}
            </Text>
            <Text size="2" color="gray" mt="2">
              {formatInZone(instant.toISOString(), b, locale)}
            </Text>
          </Card>
        </Grid>
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
