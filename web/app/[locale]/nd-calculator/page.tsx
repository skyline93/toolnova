"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import {
  BASE_SHUTTER_PRESETS,
  applyNdToSeconds,
  equivalentShutterReadableParts,
  formatShutterDisplay,
  formatStopsDisplay,
  parseShutterToSeconds,
  stopsFromFactor,
  totalFactorFromStack,
} from "@/lib/nd-filter";
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Heading,
  SegmentedControl,
  Select,
  Text,
  TextField,
} from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import styles from "./nd-calculator.module.css";

const DEFAULT_PRESET_INDEX = Math.max(
  0,
  BASE_SHUTTER_PRESETS.findIndex((s) => Math.abs(s - 1 / 125) < 1e-9),
);

type NdMode = "factor" | "stops" | "stack";

function formatFactorDisplay(n: number): string {
  if (!Number.isFinite(n)) return "—";
  if (Math.abs(n - Math.round(n)) < 1e-6) return String(Math.round(n));
  return String(Math.round(n * 100) / 100);
}

function formatExactSeconds(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";
  return `${seconds.toFixed(3)} s`;
}

export default function NdCalculatorPage() {
  const t = useTranslations("ndCalculator");
  const tc = useTranslations("common");

  const [presetIndex, setPresetIndex] = useState(DEFAULT_PRESET_INDEX);
  const [customShutter, setCustomShutter] = useState("");
  const [mode, setMode] = useState<NdMode>("factor");
  const [singleFactor, setSingleFactor] = useState("64");
  const [singleStops, setSingleStops] = useState("6");
  const [stackUnit, setStackUnit] = useState<"factor" | "stops">("factor");
  const [stackInputs, setStackInputs] = useState<string[]>(["8", "8"]);

  const baseSeconds = useMemo(() => {
    const trimmed = customShutter.trim();
    if (trimmed) {
      return parseShutterToSeconds(trimmed);
    }
    const p = BASE_SHUTTER_PRESETS[presetIndex];
    return p !== undefined ? p : null;
  }, [customShutter, presetIndex]);

  const ndComputation = useMemo(() => {
    if (baseSeconds === null) {
      return { error: "invalidShutter" as const, factor: null as number | null, stops: null as number | null };
    }

    if (mode === "factor") {
      const n = Number(singleFactor.replace(/,/g, ""));
      if (!Number.isFinite(n) || n < 1) {
        return { error: "invalidFactor" as const, factor: null, stops: null };
      }
      return { error: null, factor: n, stops: stopsFromFactor(n) };
    }

    if (mode === "stops") {
      const s = Number(singleStops.replace(/,/g, ""));
      if (!Number.isFinite(s) || s < 0) {
        return { error: "invalidStops" as const, factor: null, stops: null };
      }
      return { error: null, factor: 2 ** s, stops: s };
    }

    const nums = stackInputs.map((raw) => Number(String(raw).replace(/,/g, "")));
    const factor = totalFactorFromStack(stackUnit, nums);
    if (factor === null) {
      return { error: "invalidStack" as const, factor: null, stops: null };
    }
    return { error: null, factor, stops: stopsFromFactor(factor) };
  }, [baseSeconds, mode, singleFactor, singleStops, stackInputs, stackUnit]);

  const resultSeconds =
    ndComputation.factor !== null && baseSeconds !== null
      ? applyNdToSeconds(baseSeconds, ndComputation.factor)
      : null;

  const readableParts = useMemo(
    () => (resultSeconds !== null ? equivalentShutterReadableParts(resultSeconds) : null),
    [resultSeconds],
  );

  const readableMain =
    readableParts === null
      ? "—"
      : readableParts.display.type === "recip"
        ? t("readableReciprocal", { denom: readableParts.display.denom })
        : readableParts.display.type === "secOnly"
          ? t("durationSecondsOnly", { seconds: readableParts.display.seconds })
          : readableParts.display.type === "hourMinSec"
            ? t("durationHoursMinutesSeconds", {
                hours: readableParts.display.hours,
                minutes: readableParts.display.minutes,
                seconds: readableParts.display.seconds,
              })
            : t("durationMinutesSeconds", {
                minutes: readableParts.display.minutes,
                seconds: readableParts.display.seconds,
              });

  const readableSublineSeconds =
    readableParts !== null && readableParts.roundedTotalSeconds >= 1
      ? t("readableSublineSeconds", { seconds: readableParts.roundedTotalSeconds })
      : null;

  const exactMain = resultSeconds !== null ? formatExactSeconds(resultSeconds) : "—";

  const baseLabel =
    baseSeconds !== null ? formatShutterDisplay(baseSeconds) : formatShutterDisplay(1 / 125);

  const resultForCopy =
    readableSublineSeconds !== null && readableParts !== null
      ? t("copySummaryResultComposite", {
          human: readableMain,
          seconds: readableParts.roundedTotalSeconds,
        })
      : readableMain;

  const copyText =
    resultSeconds !== null && ndComputation.factor !== null && ndComputation.stops !== null
      ? t("copySummaryTemplate", {
          base: baseLabel,
          factor: formatFactorDisplay(ndComputation.factor),
          stops: formatStopsDisplay(ndComputation.stops, 3),
          result: resultForCopy,
        })
      : "";

  const showNd1000Hint =
    ndComputation.factor !== null &&
    ((ndComputation.factor >= 990 && ndComputation.factor <= 1010) ||
      (ndComputation.stops !== null && ndComputation.stops >= 9.95 && ndComputation.stops <= 10.05));

  const showBulbHint = resultSeconds !== null && resultSeconds > 30;

  const applyPresetFactor = (n: number) => {
    setMode("factor");
    setSingleFactor(String(n));
  };

  const applyPresetStops = (s: number) => {
    setMode("stops");
    setSingleStops(String(s));
  };

  const appendStackFactor = (value: string) => {
    setMode("stack");
    if (stackUnit === "stops") {
      setStackInputs([value]);
    } else {
      setStackInputs((prev) => [...prev, value]);
    }
    setStackUnit("factor");
  };

  const appendStackStops = (value: string) => {
    setMode("stack");
    if (stackUnit === "factor") {
      setStackInputs([value]);
    } else {
      setStackInputs((prev) => [...prev, value]);
    }
    setStackUnit("stops");
  };

  return (
    <div className={styles.shell}>
      <div className={styles.grid}>
        <Card size="4" className={styles.controlCard}>
          <Flex direction="column" gap="5">
            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" highContrast>
                {t("labelBaseShutter")}
              </Text>
              <Text asChild size="1" color="gray" weight="medium">
                <label htmlFor="nd-preset-shutter">{t("presetShutter")}</label>
              </Text>
              <Select.Root
                value={`p-${presetIndex}`}
                onValueChange={(v) => {
                  const idx = Number(v.replace(/^p-/, ""));
                  if (Number.isFinite(idx)) setPresetIndex(idx);
                }}
              >
                <Select.Trigger id="nd-preset-shutter" variant="soft" color="gray" style={{ width: "100%" }} />
                <Select.Content position="popper">
                  {BASE_SHUTTER_PRESETS.map((sec, i) => (
                    <Select.Item key={`p-${i}`} value={`p-${i}`}>
                      {formatShutterDisplay(sec)}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>

              <Text asChild size="1" color="gray" weight="medium" mt="2">
                <label htmlFor="nd-custom-shutter">{t("customShutter")}</label>
              </Text>
              <TextField.Root
                id="nd-custom-shutter"
                size="2"
                placeholder={t("customShutterPlaceholder")}
                value={customShutter}
                onChange={(e) => setCustomShutter(e.target.value)}
              />
              <Text size="1" color="gray">
                {t("customShutterHint")}
              </Text>
            </Flex>

            <Flex direction="column" gap="3">
              <Text size="2" weight="bold" highContrast>
                {t("labelNdMode")}
              </Text>
              <SegmentedControl.Root
                value={mode}
                onValueChange={(v) => setMode(v as NdMode)}
              >
                <SegmentedControl.Item value="factor">{t("modeFactor")}</SegmentedControl.Item>
                <SegmentedControl.Item value="stops">{t("modeStops")}</SegmentedControl.Item>
                <SegmentedControl.Item value="stack">{t("modeStack")}</SegmentedControl.Item>
              </SegmentedControl.Root>

              {mode === "factor" ? (
                <Flex direction="column" gap="2">
                  <Text asChild size="2" weight="medium">
                    <label htmlFor="nd-factor">{t("labelFactor")}</label>
                  </Text>
                  <TextField.Root
                    id="nd-factor"
                    size="2"
                    inputMode="decimal"
                    placeholder={t("factorPlaceholder")}
                    value={singleFactor}
                    onChange={(e) => setSingleFactor(e.target.value)}
                  />
                </Flex>
              ) : null}

              {mode === "stops" ? (
                <Flex direction="column" gap="2">
                  <Text asChild size="2" weight="medium">
                    <label htmlFor="nd-stops">{t("labelStops")}</label>
                  </Text>
                  <TextField.Root
                    id="nd-stops"
                    size="2"
                    inputMode="decimal"
                    placeholder={t("stopsPlaceholder")}
                    value={singleStops}
                    onChange={(e) => setSingleStops(e.target.value)}
                  />
                </Flex>
              ) : null}

              {mode === "stack" ? (
                <Flex direction="column" gap="3">
                  <SegmentedControl.Root
                    value={stackUnit}
                    onValueChange={(v) => {
                      const u = v as "factor" | "stops";
                      setStackUnit(u);
                      setStackInputs([u === "factor" ? "8" : "3"]);
                    }}
                  >
                    <SegmentedControl.Item value="factor">{t("stackUnitFactor")}</SegmentedControl.Item>
                    <SegmentedControl.Item value="stops">{t("stackUnitStops")}</SegmentedControl.Item>
                  </SegmentedControl.Root>
                  <Flex direction="column" gap="2">
                    {stackInputs.map((row, i) => (
                      <div key={`row-${i}`} className={styles.stackRow}>
                        <Flex direction="column" gap="1" style={{ minWidth: 0 }}>
                          <Text size="1" color="gray" weight="medium">
                            {t("stackRow", { n: i + 1 })}
                          </Text>
                          <TextField.Root
                            size="2"
                            inputMode="decimal"
                            placeholder={stackUnit === "factor" ? t("factorPlaceholder") : t("stopsPlaceholder")}
                            value={row}
                            onChange={(e) => {
                              const v = e.target.value;
                              setStackInputs((prev) => prev.map((p, j) => (j === i ? v : p)));
                            }}
                          />
                        </Flex>
                        <Button
                          type="button"
                          size="2"
                          variant="soft"
                          color="gray"
                          disabled={stackInputs.length <= 1}
                          onClick={() => setStackInputs((prev) => prev.filter((_, j) => j !== i))}
                        >
                          {t("removeStackRow")}
                        </Button>
                      </div>
                    ))}
                  </Flex>
                  <Button
                    type="button"
                    size="2"
                    variant="outline"
                    color="gray"
                    onClick={() => setStackInputs((prev) => [...prev, stackUnit === "factor" ? "8" : "3"])}
                  >
                    {t("addStackRow")}
                  </Button>
                </Flex>
              ) : null}
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="bold" highContrast>
                {t("presetsTitle")}
              </Text>
              <Flex gap="2" wrap="wrap">
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => applyPresetFactor(8)}
                >
                  {t("presetNd8")}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => applyPresetFactor(64)}
                >
                  {t("presetNd64")}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => applyPresetFactor(1000)}
                >
                  {t("presetNd1000")}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => applyPresetStops(3)}
                >
                  {t("presetStops3")}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => applyPresetStops(6)}
                >
                  {t("presetStops6")}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="soft"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => applyPresetStops(10)}
                >
                  {t("presetStops10")}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="outline"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => appendStackFactor("8")}
                >
                  {t("stackQuickNd8")}
                </Button>
                <Button
                  type="button"
                  size="1"
                  variant="outline"
                  color="gray"
                  className={styles.presetChip}
                  onClick={() => appendStackStops("3")}
                >
                  {t("stackQuick3Stops")}
                </Button>
              </Flex>
            </Flex>
          </Flex>
        </Card>

        <Box position="relative">
          <div className={styles.resultHero}>
            <span className={`${styles.viewfinderCorner} ${styles.vfTl}`} aria-hidden />
            <span className={`${styles.viewfinderCorner} ${styles.vfBr}`} aria-hidden />
            <Flex direction="column" gap="4" style={{ position: "relative", zIndex: 1 }}>
              <Flex justify="between" align="start" wrap="wrap" gap="3">
                <Heading as="h2" size="5" highContrast style={{ maxWidth: "14rem" }}>
                  {t("resultTitle")}
                </Heading>
                {ndComputation.error === null && copyText ? (
                  <CopyTextButton
                    text={copyText}
                    idleLabel={t("copySummary")}
                    copiedLabel={tc("copied")}
                    errorLabel={tc("copyFailed")}
                    variant="secondary"
                  />
                ) : null}
              </Flex>

              {ndComputation.error !== null ? (
                <Text size="2" color="red" role="alert" aria-live="polite">
                  {t(ndComputation.error)}
                </Text>
              ) : (
                <>
                  <Flex direction="column" gap="1">
                    <div className={styles.resultValue}>{readableMain}</div>
                    {readableSublineSeconds ? (
                      <Text size="2" color="gray" className={styles.resultSub}>
                        {readableSublineSeconds}
                      </Text>
                    ) : null}
                  </Flex>

                  <Grid columns={{ initial: "1", sm: "2" }} gap="3">
                    <Flex direction="column" gap="1">
                      <Text size="1" color="gray" weight="medium">
                        {t("resultExact")}
                      </Text>
                      <Text size="3" weight="bold" className={styles.resultSub} highContrast>
                        {exactMain}
                      </Text>
                    </Flex>
                    <Flex direction="column" gap="1">
                      <Text size="1" color="gray" weight="medium">
                        {t("resultNdFactor")} / {t("resultStops")}
                      </Text>
                      <Flex align="center" gap="2" wrap="wrap">
                        <Badge size="2" color="blue" variant="soft" className={styles.presetChip}>
                          ×{formatFactorDisplay(ndComputation.factor!)}
                        </Badge>
                        <Badge size="2" color="amber" variant="soft" className={styles.presetChip}>
                          {formatStopsDisplay(ndComputation.stops!, 3)} {t("unitStops")}
                        </Badge>
                      </Flex>
                    </Flex>
                  </Grid>

                  {showNd1000Hint ? (
                    <Text size="1" color="gray">
                      {t("approxTenStopsHint")}
                    </Text>
                  ) : null}
                  {showBulbHint ? (
                    <Text size="1" color="amber">
                      {t("hintBulb")}
                    </Text>
                  ) : null}
                </>
              )}
            </Flex>
          </div>
        </Box>
      </div>

      <Card size="3" variant="surface" mt="6">
        <Heading as="h2" size="4" highContrast>
          {t("howTitle")}
        </Heading>
        <Text as="p" size="2" color="gray" mt="3" wrap="pretty">
          {t("howBody")}
        </Text>
      </Card>
    </div>
  );
}
