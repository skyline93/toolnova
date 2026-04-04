"use client";

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
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("pattern")}</span>
          <input
            className="tool-input font-mono text-sm"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            spellCheck={false}
            autoComplete="off"
          />
        </label>
        <fieldset className="tool-card space-y-2 p-4">
          <legend className="text-sm font-medium text-[var(--muted)]">Flags</legend>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={i} onChange={(e) => setI(e.target.checked)} />
              {t("flagI")}
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={g} onChange={(e) => setG(e.target.checked)} />
              {t("flagG")}
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={m} onChange={(e) => setM(e.target.checked)} />
              {t("flagM")}
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={s} onChange={(e) => setS(e.target.checked)} />
              {t("flagS")}
            </label>
          </div>
        </fieldset>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">{t("testText")}</span>
        <textarea
          className="tool-input min-h-[160px] font-mono text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
        />
      </label>

      {!result.ok ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {t("errorInvalid")}
        </p>
      ) : (
        <div className="tool-card overflow-hidden">
          <p className="border-b border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted)]">
            {t("matches")}
          </p>
          {result.rows.length === 0 ? (
            <p className="px-4 py-6 text-sm text-[var(--muted)]">{t("noMatches")}</p>
          ) : (
            <ul className="divide-y divide-[var(--border)] font-mono text-sm">
              {result.rows.map((row, idx) => (
                <li key={`${row.index}-${idx}`} className="space-y-1 px-4 py-3">
                  <p className="text-xs text-[var(--muted)]">@{row.index}</p>
                  <p>
                    <span className="text-[var(--muted)]">{t("fullMatch")}: </span>
                    <span className="break-all text-[var(--foreground)]">{row.full}</span>
                  </p>
                  {row.groups.length > 0 ? (
                    <p className="text-[var(--muted)]">
                      {t("groups")}:{" "}
                      <span className="text-[var(--foreground)]">{row.groups.join(" | ")}</span>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
