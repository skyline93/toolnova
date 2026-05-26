"use client";

import { TextDesensitizeSplitDiff } from "@/components/text-desensitize-split-diff";
import { copyTextToClipboard } from "@/lib/clipboard";
import { buildSplitDiffModel } from "@/lib/text-desensitize-split-diff";
import {
  ALL_DESENSITIZE_RULE_KEYS,
  desensitizeText,
  MAX_DESENSITIZE_CHARS,
  type DesensitizeRuleKey,
} from "@/lib/text-desensitize";
import { Box, Button, Card, Checkbox, Flex, Heading, Text, TextArea, TextField } from "@radix-ui/themes";
import { useLocale, useTranslations } from "next-intl";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function formatCount(n: number, locale: string) {
  return n.toLocaleString(locale);
}

export default function TextDesensitizePage() {
  const t = useTranslations("textDesensitize");
  const locale = useLocale();
  const [input, setInput] = useState("");
  const [excludeRules, setExcludeRules] = useState("");
  const [excludeIgnoreCase, setExcludeIgnoreCase] = useState(false);
  const [enabled, setEnabled] = useState<Set<DesensitizeRuleKey>>(
    () => new Set(ALL_DESENSITIZE_RULE_KEYS),
  );
  const [lastMaskedText, setLastMaskedText] = useState("");
  const [diffModel, setDiffModel] = useState<ReturnType<typeof buildSplitDiffModel> | null>(null);
  const [stats, setStats] = useState<{ total: number; changedLines: number; excludedLines: number } | null>(
    null,
  );
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  useEffect(() => {
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const numberLocale = locale;

  const inputLen = input.length;
  const outputLen = lastMaskedText.length;

  const ruleLabels: Record<DesensitizeRuleKey, string> = useMemo(
    () => ({
      phone: t("rulePhone"),
      idCard: t("ruleIdCard"),
      email: t("ruleEmail"),
      bankCard: t("ruleBankCard"),
      ip: t("ruleIp"),
      name: t("ruleName"),
      password: t("rulePassword"),
      dbUri: t("ruleDbUri"),
      webhook: t("ruleWebhook"),
    }),
    [t],
  );

  const toggleRule = (key: DesensitizeRuleKey) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const runDesensitize = useCallback(() => {
    if (!input.trim()) {
      showToast(t("toastEmpty"));
      return;
    }

    const { text, total, excludedLines } = desensitizeText(input, enabled, excludeRules, excludeIgnoreCase);
    const model = buildSplitDiffModel(input, text);
    setLastMaskedText(text);
    setDiffModel(model);
    setStats({ total, changedLines: model.changedLineCount, excludedLines });

    const skipMsg = excludedLines > 0 ? t("toastSkippedLines", { count: excludedLines }) : "";
    if (model.changedLineCount > 0) {
      showToast(
        t("toastDoneWithChanges", {
          total,
          lines: model.changedLineCount,
          skip: skipMsg,
        }),
      );
    } else if (total > 0) {
      showToast(t("toastDoneMatches", { total }));
    } else {
      showToast(t("toastNoMatches"));
    }
  }, [input, enabled, excludeRules, excludeIgnoreCase, showToast, t]);

  const handleCopy = async () => {
    if (!lastMaskedText) {
      showToast(t("toastNothingToCopy"));
      return;
    }
    try {
      await copyTextToClipboard(lastMaskedText);
      showToast(t("toastCopied"));
    } catch {
      showToast(t("toastCopyFailed"));
    }
  };

  const handleClear = () => {
    setInput("");
    setLastMaskedText("");
    setDiffModel(null);
    setStats(null);
  };

  return (
    <Flex direction="column" gap="6">
      <Card size="2" variant="surface">
        <Text as="div" size="2" weight="medium" mb="3" color="gray">
          {t("optionsTitle")}
        </Text>
        <Flex wrap="wrap" gap="3">
          {ALL_DESENSITIZE_RULE_KEYS.map((key) => (
            <Flex key={key} align="center" gap="2">
              <Checkbox checked={enabled.has(key)} onCheckedChange={() => toggleRule(key)} id={`rule-${key}`} />
              <Text size="2" as="label" htmlFor={`rule-${key}`} style={{ cursor: "pointer" }}>
                {ruleLabels[key]}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Card>

      <Card size="2" variant="surface">
        <Flex direction="column" gap="2">
          <Text as="label" size="2" weight="medium" htmlFor="excludeRules" color="gray">
            {t("excludeTitle")}
          </Text>
          <TextField.Root
            id="excludeRules"
            size="2"
            value={excludeRules}
            onChange={(e) => setExcludeRules(e.target.value)}
            placeholder={t("excludePlaceholder")}
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
          />
          <Text size="1" color="gray" wrap="pretty">
            {t("excludeHint")}
          </Text>
          <Flex align="center" gap="2">
            <Checkbox
              checked={excludeIgnoreCase}
              onCheckedChange={(c) => setExcludeIgnoreCase(c === true)}
              id="excludeIgnoreCase"
            />
            <Text size="2" as="label" htmlFor="excludeIgnoreCase" style={{ cursor: "pointer" }}>
              {t("excludeIgnoreCase")}
            </Text>
          </Flex>
        </Flex>
      </Card>

      <Flex direction="column" gap="2">
        <Flex justify="between" align="baseline" gap="2">
          <Text size="2" weight="medium">
            {t("inputLabel")}
          </Text>
          <Text
            size="1"
            color={inputLen >= MAX_DESENSITIZE_CHARS ? "red" : "gray"}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatCount(inputLen, numberLocale)} / {formatCount(MAX_DESENSITIZE_CHARS, numberLocale)}
          </Text>
        </Flex>
        <TextArea
          size="2"
          variant="surface"
          value={input}
          onChange={(e) => setInput(e.target.value.slice(0, MAX_DESENSITIZE_CHARS))}
          placeholder={t("inputPlaceholder")}
          spellCheck={false}
          maxLength={MAX_DESENSITIZE_CHARS}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              runDesensitize();
            }
          }}
          style={{
            minHeight: "min(16rem, 32vh)",
            maxHeight: "min(22rem, 40vh)",
            fontFamily: "var(--font-geist-mono), ui-monospace, monospace",
            fontSize: "var(--font-size-2)",
          }}
        />
      </Flex>

      <Flex gap="3" wrap="wrap" align="center">
        <Button size="2" onClick={runDesensitize}>
          {t("btnDesensitize")}
        </Button>
        <Button size="2" variant="soft" color="gray" onClick={() => void handleCopy()}>
          {t("btnCopy")}
        </Button>
        <Button size="2" variant="soft" color="gray" onClick={handleClear}>
          {t("btnClear")}
        </Button>
        {stats ? (
          <Text size="2" color="gray" style={{ marginLeft: "auto" }}>
            {t("stats", {
              matches: stats.total,
              lines: stats.changedLines,
              skipped: stats.excludedLines,
            })}
          </Text>
        ) : null}
      </Flex>

      <Flex direction="column" gap="2">
        <Flex justify="between" align="baseline" gap="2">
          <Text size="2" weight="medium">
            {t("outputLabel")}{" "}
            <Text as="span" size="1" color="gray" weight="regular">
              ({t("outputHint")})
            </Text>
          </Text>
          <Text
            size="1"
            color={outputLen >= MAX_DESENSITIZE_CHARS ? "red" : "gray"}
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            {formatCount(outputLen, numberLocale)} / {formatCount(MAX_DESENSITIZE_CHARS, numberLocale)}
          </Text>
        </Flex>
        <TextDesensitizeSplitDiff
          model={diffModel}
          placeholder={t("diffPlaceholder")}
          fileLabel={t("diffFileLabel")}
          leftColLabel={t("diffLeftCol")}
          rightColLabel={t("diffRightCol")}
        />
      </Flex>

      <Card size="3" variant="surface">
        <Heading as="h2" size="4" highContrast>
          {t("howTitle")}
        </Heading>
        <Text as="p" size="2" color="gray" mt="3" wrap="pretty">
          {t("howBody")}
        </Text>
        <Box asChild mt="3">
          <ul style={{ paddingLeft: "1.25rem", color: "var(--gray-11)", fontSize: "var(--font-size-2)" }}>
            <li>{t("ruleHelpPhone")}</li>
            <li>{t("ruleHelpIdCard")}</li>
            <li>{t("ruleHelpEmail")}</li>
            <li>{t("ruleHelpBankCard")}</li>
            <li>{t("ruleHelpDbUri")}</li>
            <li>{t("ruleHelpWebhook")}</li>
            <li>{t("ruleHelpExclude")}</li>
          </ul>
        </Box>
        <Text as="p" size="1" color="gray" mt="3" wrap="pretty">
          {t("disclaimer")}
        </Text>
      </Card>

      {toast ? (
        <Box
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: "1.5rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 50,
            background: "var(--color-panel-solid)",
            border: "1px solid var(--gray-a6)",
            padding: "0.6rem 1.2rem",
            borderRadius: "999px",
            fontSize: "var(--font-size-2)",
            boxShadow: "var(--shadow-4)",
          }}
        >
          {toast}
        </Box>
      ) : null}
    </Flex>
  );
}
