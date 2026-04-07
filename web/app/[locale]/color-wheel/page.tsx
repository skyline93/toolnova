"use client";

import { ColorWheelCanvas } from "@/components/color-wheel-canvas";
import { CopyTextButton } from "@/components/copy-text-button";
import { copyTextToClipboard } from "@/lib/clipboard";
import {
  type HarmonyRuleId,
  circularHueDistance,
  formatHslCss,
  formatRgbCss,
  harmonyPalette,
  harmonySwatchDelta,
  hexToHsl,
  hslToHex,
  hslToRgb,
  isHarmonyPrimaryIndex,
  normalizeHue,
} from "@/lib/color-harmony";
import { Box, Button, Card, Flex, Grid, Heading, Slider, Text, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_HSL = { h: 220, s: 0.75, l: 0.5 };

const RULES: HarmonyRuleId[] = [
  "complementary",
  "split",
  "triadic",
  "tetradic",
  "analogous",
  "monochromatic",
];

function ruleMessageKey(rule: HarmonyRuleId): string {
  const map: Record<HarmonyRuleId, string> = {
    complementary: "ruleComplementary",
    split: "ruleSplit",
    triadic: "ruleTriadic",
    tetradic: "ruleTetradic",
    analogous: "ruleAnalogous",
    monochromatic: "ruleMonochromatic",
  };
  return map[rule];
}

function ruleHintKey(rule: HarmonyRuleId): string {
  const map: Record<HarmonyRuleId, string> = {
    complementary: "ruleComplementaryHint",
    split: "ruleSplitHint",
    triadic: "ruleTriadicHint",
    tetradic: "ruleTetradicHint",
    analogous: "ruleAnalogousHint",
    monochromatic: "ruleMonochromaticHint",
  };
  return map[rule];
}

function ruleTabKey(rule: HarmonyRuleId): string {
  const map: Record<HarmonyRuleId, string> = {
    complementary: "ruleTabComplementary",
    split: "ruleTabSplit",
    triadic: "ruleTabTriadic",
    tetradic: "ruleTabTetradic",
    analogous: "ruleTabAnalogous",
    monochromatic: "ruleTabMonochromatic",
  };
  return map[rule];
}

function formatDeltaN(n: number): string {
  return n > 0 ? `+${n}` : String(n);
}

function ColorWheelContent() {
  const t = useTranslations("colorWheel");
  const tc = useTranslations("common");
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const urlInitialized = useRef(false);

  const [hsl, setHsl] = useState(DEFAULT_HSL);
  const [rule, setRule] = useState<HarmonyRuleId>("complementary");
  const [hexInput, setHexInput] = useState(hslToHex(DEFAULT_HSL));
  const [copyHexStatus, setCopyHexStatus] = useState<"idle" | "ok" | "err">("idle");
  const [copyCssStatus, setCopyCssStatus] = useState<"idle" | "ok" | "err">("idle");
  const [swatchFlash, setSwatchFlash] = useState<string | null>(null);

  useEffect(() => {
    if (urlInitialized.current) return;
    urlInitialized.current = true;
    const hexParam = searchParams.get("hex");
    if (!hexParam) return;
    const parsed = hexToHsl(hexParam.startsWith("#") ? hexParam : `#${hexParam}`);
    if (parsed) {
      setHsl(parsed);
      setHexInput(hslToHex(parsed));
    }
  }, [searchParams]);

  useEffect(() => {
    setHexInput(hslToHex(hsl));
  }, [hsl]);

  useEffect(() => {
    const hex = hslToHex(hsl).slice(1);
    const tId = window.setTimeout(() => {
      const next = `${pathname}?hex=${hex}`;
      if (typeof window !== "undefined" && `${window.location.pathname}${window.location.search}` !== next) {
        window.history.replaceState(null, "", next);
      }
    }, 280);
    return () => window.clearTimeout(tId);
  }, [hsl, pathname]);

  const rgb = hslToRgb(hsl);
  const hex = hslToHex(hsl);

  const palette = useMemo(
    () => harmonyPalette(hsl, rule),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- harmonyPalette only depends on h/s/l + rule
    [hsl.h, hsl.s, hsl.l, rule],
  );

  const harmonyHuesOnRing = useMemo(() => {
    const primary = normalizeHue(hsl.h);
    const used = new Set<number>();
    const out: number[] = [];
    for (const c of palette) {
      const h = normalizeHue(c.h);
      if (circularHueDistance(h, primary) < 0.5) continue;
      const key = Math.round(h);
      if (used.has(key)) continue;
      used.add(key);
      out.push(h);
    }
    return out;
  }, [palette, hsl.h]);

  const applyHex = useCallback(() => {
    const raw = hexInput.trim();
    const withHash = raw.startsWith("#") ? raw : `#${raw}`;
    const next = hexToHsl(withHash);
    if (next) setHsl({ h: normalizeHue(next.h), s: next.s, l: next.l });
  }, [hexInput]);

  const paletteCssBlock = useMemo(() => {
    const lines = palette.map((c, i) => `  --harmony-${i + 1}: ${hslToHex(c)};`);
    return `:root {\n${lines.join("\n")}\n}`;
  }, [palette]);

  const onCopyGroupHex = useCallback(async () => {
    const lines = palette.map((c) => hslToHex(c));
    try {
      await copyTextToClipboard(lines.join("\n"));
      setCopyHexStatus("ok");
      window.setTimeout(() => setCopyHexStatus("idle"), 2000);
    } catch {
      setCopyHexStatus("err");
      window.setTimeout(() => setCopyHexStatus("idle"), 2800);
    }
  }, [palette]);

  const onCopyGroupCss = useCallback(async () => {
    try {
      await copyTextToClipboard(paletteCssBlock);
      setCopyCssStatus("ok");
      window.setTimeout(() => setCopyCssStatus("idle"), 2000);
    } catch {
      setCopyCssStatus("err");
      window.setTimeout(() => setCopyCssStatus("idle"), 2800);
    }
  }, [paletteCssBlock]);

  const onSwatchCopy = useCallback(async (hslColor: (typeof palette)[0]) => {
    const h = hslToHex(hslColor);
    try {
      await copyTextToClipboard(h);
      setSwatchFlash(h);
      window.setTimeout(() => setSwatchFlash(null), 1200);
    } catch {
      /* ignore */
    }
  }, []);

  const onHueChange = useCallback((nh: number) => {
    setHsl((prev) => ({ ...prev, h: normalizeHue(nh) }));
  }, []);

  const extreme = hsl.l <= 0.04 || hsl.l >= 0.96;
  const hueDeg = Math.round(normalizeHue(hsl.h)) % 360;

  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: "1", md: "2" }} gap="6" align="start">
        <Flex direction="column" gap="4">
          <Box style={{ touchAction: "none", alignSelf: "center" }}>
            <ColorWheelCanvas
              hue={hsl.h}
              harmonyHues={harmonyHuesOnRing}
              onHueChange={onHueChange}
              size={280}
              ariaLabel={t("ariaColorWheel")}
            />
          </Box>

          <Flex direction="column" gap="2">
            <Flex justify="between" align="center">
              <Text size="2" weight="medium" asChild>
                <span id="label-hue">{t("labelHue")}</span>
              </Text>
              <Text size="2" color="gray">
                {hueDeg}°
              </Text>
            </Flex>
            <Slider
              aria-labelledby="label-hue"
              value={[hueDeg]}
              min={0}
              max={359}
              step={1}
              onValueChange={([v]) => setHsl((prev) => ({ ...prev, h: normalizeHue(v ?? 0) }))}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Flex justify="between" align="center">
              <Text size="2" weight="medium" asChild>
                <span id="label-sat">{t("labelSaturation")}</span>
              </Text>
              <Text size="2" color="gray">
                {Math.round(hsl.s * 100)}%
              </Text>
            </Flex>
            <Slider
              aria-labelledby="label-sat"
              value={[Math.round(hsl.s * 100)]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => setHsl((prev) => ({ ...prev, s: (v ?? 0) / 100 }))}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Flex justify="between" align="center">
              <Text size="2" weight="medium" asChild>
                <span id="label-light">{t("labelLightness")}</span>
              </Text>
              <Text size="2" color="gray">
                {Math.round(hsl.l * 100)}%
              </Text>
            </Flex>
            <Slider
              aria-labelledby="label-light"
              value={[Math.round(hsl.l * 100)]}
              min={0}
              max={100}
              step={1}
              onValueChange={([v]) => setHsl((prev) => ({ ...prev, l: (v ?? 0) / 100 }))}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {t("previewSwatchTitle")}
            </Text>
            <Text size="1" color="gray" wrap="pretty">
              {t("previewSwatchHint")}
            </Text>
            <Box
              aria-hidden
              style={{
                minHeight: "4rem",
                borderRadius: "var(--radius-4)",
                backgroundColor: hex,
                border: "1px solid var(--gray-6)",
              }}
            />
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium">
              {hex}
            </Text>
            <Text size="2" color="gray" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              {formatRgbCss(rgb)}
            </Text>
            <Text size="2" color="gray" style={{ fontFamily: "var(--font-mono, monospace)" }}>
              {formatHslCss(hsl)}
            </Text>
          </Flex>

          <Flex direction="column" gap="2">
            <Text size="2" weight="medium" asChild>
              <label htmlFor="color-hex-input">{t("labelHex")}</label>
            </Text>
            <Flex gap="2" wrap="wrap" align="center">
              <TextField.Root
                id="color-hex-input"
                size="2"
                value={hexInput}
                onChange={(e) => setHexInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyHex();
                }}
                style={{ maxWidth: "12rem" }}
              />
              <Button type="button" size="2" variant="soft" onClick={applyHex}>
                {t("applyHex")}
              </Button>
            </Flex>
          </Flex>
        </Flex>

        <Card size="3" variant="surface">
          <Flex direction="column" gap="4">
            <Flex direction="column" gap="2">
              <Heading as="h2" size="4" highContrast>
                {t("harmonySection")}
              </Heading>
              <Text size="2" color="gray" wrap="pretty">
                {t("harmonyIntro")}
              </Text>
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium" asChild>
                <span id="harmony-rules-label">{t("harmonyPickRule")}</span>
              </Text>
              <Flex
                role="group"
                aria-labelledby="harmony-rules-label"
                wrap="wrap"
                gap="2"
                align="center"
              >
                {RULES.map((r) => {
                  const selected = rule === r;
                  return (
                    <Button
                      key={r}
                      type="button"
                      size="1"
                      variant={selected ? "solid" : "outline"}
                      color={selected ? "blue" : "gray"}
                      highContrast={selected}
                      aria-pressed={selected}
                      aria-label={t(ruleMessageKey(r))}
                      title={t(ruleMessageKey(r))}
                      onClick={() => setRule(r)}
                      style={{ flex: "0 0 auto", width: "auto", minWidth: "unset" }}
                    >
                      {t(ruleTabKey(r))}
                    </Button>
                  );
                })}
              </Flex>
              <Text size="2" weight="medium" highContrast>
                {t("harmonyActive", { rule: t(ruleMessageKey(rule)) })}
              </Text>
            </Flex>

            <Text size="2" color="gray" wrap="pretty">
              {t(ruleHintKey(rule))}
            </Text>

            <Flex direction="column" gap="3">
              {palette.map((c, index) => {
                const hx = hslToHex(c);
                const primary = isHarmonyPrimaryIndex(rule, index);
                const delta = harmonySwatchDelta(hsl, c, rule);
                const deltaText =
                  delta.kind === "hue"
                    ? t("deltaHue", { n: formatDeltaN(delta.degrees) })
                    : delta.kind === "light"
                      ? t("deltaLight", { n: formatDeltaN(delta.percent) })
                      : null;

                return (
                  <Flex
                    key={`${rule}-${index}-${c.h}-${c.s}-${c.l}`}
                    align="center"
                    gap="3"
                    wrap="wrap"
                    p="3"
                    style={{
                      borderRadius: "var(--radius-3)",
                      border: "1px solid var(--gray-6)",
                      background: "var(--gray-a2)",
                      boxShadow: swatchFlash === hx ? "0 0 0 2px var(--accent-9)" : undefined,
                    }}
                  >
                    <button
                      type="button"
                      aria-label={t("ariaSwatch", { hex: hx })}
                      onClick={() => void onSwatchCopy(c)}
                      style={{
                        width: "3.25rem",
                        height: "3.25rem",
                        flexShrink: 0,
                        borderRadius: "var(--radius-2)",
                        backgroundColor: hx,
                        border: "1px solid var(--gray-7)",
                        cursor: "pointer",
                        padding: 0,
                      }}
                    />
                    <Flex direction="column" gap="1" style={{ flex: "1 1 12rem", minWidth: 0 }}>
                      <Flex align="center" gap="2" wrap="wrap">
                        <Text size="2" weight="bold" style={{ fontFamily: "var(--font-mono, monospace)" }}>
                          {hx}
                        </Text>
                        {primary ? (
                          <Text size="1" weight="medium" style={{ color: "var(--accent-11)" }}>
                            {t("swatchPrimaryBadge")}
                          </Text>
                        ) : null}
                      </Flex>
                      {deltaText ? (
                        <Text size="1" color="gray">
                          {deltaText}
                        </Text>
                      ) : null}
                    </Flex>
                    <CopyTextButton
                      text={hx}
                      idleLabel={tc("copy")}
                      copiedLabel={tc("copied")}
                      errorLabel={tc("copyFailed")}
                      variant="secondary"
                    />
                  </Flex>
                );
              })}
            </Flex>

            <Flex direction="column" gap="2">
              <Text size="2" weight="medium">
                {t("harmonyExportTitle")}
              </Text>
              <Flex gap="2" wrap="wrap">
                <Button type="button" size="2" variant="solid" highContrast onClick={() => void onCopyGroupHex()}>
                  {copyHexStatus === "ok"
                    ? tc("allCopied")
                    : copyHexStatus === "err"
                      ? tc("copyFailed")
                      : t("copyGroup")}
                </Button>
                <Button type="button" size="2" variant="soft" onClick={() => void onCopyGroupCss()}>
                  {copyCssStatus === "ok"
                    ? tc("copied")
                    : copyCssStatus === "err"
                      ? tc("copyFailed")
                      : t("copyPaletteCss")}
                </Button>
              </Flex>
              <Text size="1" color="gray" wrap="pretty">
                {t("harmonyExportHint")}
              </Text>
            </Flex>

            {extreme ? (
              <Text size="2" style={{ color: "var(--amber-11)" }}>
                {t("extremeLightHint")}
              </Text>
            ) : null}
          </Flex>
        </Card>
      </Grid>

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

export default function ColorWheelPage() {
  const t = useTranslations("colorWheel");
  return (
    <Suspense
      fallback={
        <Text size="2" color="gray">
          {t("metaTitle")}
        </Text>
      }
    >
      <ColorWheelContent />
    </Suspense>
  );
}
