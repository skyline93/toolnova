"use client";

import { Box, Card, Checkbox, Flex, Grid, Heading, Text, TextArea, TextField } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type MatchRow = { index: number; full: string; groups: string[] };

function runRegex(pattern: string, flags: string, text: string): { ok: true; rows: MatchRow[] } | { ok: false } {
  try {
    const re = new RegExp(pattern, flags);
    const rows: MatchRow[] = [];
    if (flags.includes("g")) {
      for (const m of text.matchAll(re)) {
        rows.push({
          index: m.index ?? 0,
          full: m[0],
          groups: m.slice(1).map(String),
        });
      }
    } else {
      const m = re.exec(text);
      if (m) {
        rows.push({
          index: m.index,
          full: m[0],
          groups: m.slice(1).map(String),
        });
      }
    }
    return { ok: true, rows };
  } catch {
    return { ok: false };
  }
}

export default function RegexTesterPage() {
  const t = useTranslations("regexTester");
  const [pattern, setPattern] = useState("\\w+");
  const [text, setText] = useState("hello regex world");
  const [i, setI] = useState(true);
  const [g, setG] = useState(true);
  const [m, setM] = useState(false);
  const [s, setS] = useState(false);

  const flags = useMemo(() => `${i ? "i" : ""}${g ? "g" : ""}${m ? "m" : ""}${s ? "s" : ""}`, [i, g, m, s]);

  const result = useMemo(() => runRegex(pattern, flags, text), [pattern, flags, text]);

  return (
    <Flex direction="column" gap="6">
      <Grid columns={{ initial: "1", lg: "2" }} gap="4">
        <Flex direction="column" gap="2">
          <Text size="2" weight="medium">
            {t("pattern")}
          </Text>
          <TextField.Root
            size="2"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            style={{ fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
          />
        </Flex>
        <Card size="2" variant="surface">
          <Text as="div" size="2" weight="medium" mb="3" color="gray">
            Flags
          </Text>
          <Flex direction="column" gap="3">
            <Flex align="center" gap="2">
              <Checkbox checked={i} onCheckedChange={(c) => setI(c === true)} />
              <Text size="2" as="label" style={{ cursor: "pointer" }} onClick={() => setI((v) => !v)}>
                {t("flagI")}
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Checkbox checked={g} onCheckedChange={(c) => setG(c === true)} />
              <Text size="2" as="label" style={{ cursor: "pointer" }} onClick={() => setG((v) => !v)}>
                {t("flagG")}
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Checkbox checked={m} onCheckedChange={(c) => setM(c === true)} />
              <Text size="2" as="label" style={{ cursor: "pointer" }} onClick={() => setM((v) => !v)}>
                {t("flagM")}
              </Text>
            </Flex>
            <Flex align="center" gap="2">
              <Checkbox checked={s} onCheckedChange={(c) => setS(c === true)} />
              <Text size="2" as="label" style={{ cursor: "pointer" }} onClick={() => setS((v) => !v)}>
                {t("flagS")}
              </Text>
            </Flex>
          </Flex>
        </Card>
      </Grid>
      <Flex direction="column" gap="2">
        <Text size="2" weight="medium">
          {t("testText")}
        </Text>
        <TextArea
          size="2"
          variant="surface"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          style={{ minHeight: "160px", fontFamily: "var(--font-geist-mono), monospace", fontSize: "var(--font-size-2)" }}
        />
      </Flex>

      {!result.ok ? (
        <Text size="2" color="red" role="alert">
          {t("errorInvalid")}
        </Text>
      ) : (
        <Card size="2" variant="surface" style={{ overflow: "hidden", padding: 0 }}>
          <Box px="4" py="2" style={{ borderBottom: "1px solid var(--gray-a6)" }}>
            <Text size="2" weight="medium" color="gray">
              {t("matches")}
            </Text>
          </Box>
          {result.rows.length === 0 ? (
            <Box px="4" py="6">
              <Text size="2" color="gray">
                {t("noMatches")}
              </Text>
            </Box>
          ) : (
            <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
              {result.rows.map((row, idx) => (
                <li key={`${row.index}-${idx}`} style={{ borderTop: idx === 0 ? undefined : "1px solid var(--gray-a6)" }}>
                  <Flex direction="column" gap="1" p="4">
                    <Text size="1" color="gray">
                      @{row.index}
                    </Text>
                    <Text size="2">
                      <Text as="span" color="gray">
                        {t("fullMatch")}:{" "}
                      </Text>
                      <Text as="span" style={{ wordBreak: "break-all", fontFamily: "var(--font-geist-mono), monospace" }} highContrast>
                        {row.full}
                      </Text>
                    </Text>
                    {row.groups.length > 0 ? (
                      <Text size="2" color="gray">
                        {t("groups")}:{" "}
                        <Text as="span" highContrast style={{ fontFamily: "var(--font-geist-mono), monospace" }}>
                          {row.groups.join(" | ")}
                        </Text>
                      </Text>
                    ) : null}
                  </Flex>
                </li>
              ))}
            </ul>
          )}
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
