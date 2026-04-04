"use client";

import { CronExpressionParser } from "cron-parser";
import { CopyTextButton } from "@/components/copy-text-button";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function buildExpr(m: string, h: string, dom: string, mon: string, dow: string) {
  return [m, h, dom, mon, dow].join(" ").replace(/\s+/g, " ").trim();
}

function nextRuns(expr: string, count: number): string[] {
  try {
    const interval = CronExpressionParser.parse(expr, { currentDate: new Date() });
    return interval.take(count).map((d) => d.toString());
  } catch {
    return [];
  }
}

export default function CronExpressionGeneratorPage() {
  const t = useTranslations("cronGenerator");
  const tc = useTranslations("common");
  const [minute, setMinute] = useState("0");
  const [hour, setHour] = useState("*");
  const [dom, setDom] = useState("*");
  const [month, setMonth] = useState("*");
  const [dow, setDow] = useState("*");

  const expression = useMemo(
    () => buildExpr(minute, hour, dom, month, dow),
    [minute, hour, dom, month, dow],
  );

  const runs = useMemo(() => nextRuns(expression, 8), [expression]);

  const cronError = useMemo(() => {
    try {
      CronExpressionParser.parse(expression, { currentDate: new Date() });
      return null;
    } catch {
      return t("errorCron");
    }
  }, [expression, t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="tool-btn tool-btn-secondary"
          onClick={() => {
            setMinute("0");
            setHour("*");
            setDom("*");
            setMonth("*");
            setDow("*");
          }}
        >
          {t("presetEveryHour")}
        </button>
        <button
          type="button"
          className="tool-btn tool-btn-secondary"
          onClick={() => {
            setMinute("0");
            setHour("0");
            setDom("*");
            setMonth("*");
            setDow("*");
          }}
        >
          {t("presetMidnight")}
        </button>
        <button
          type="button"
          className="tool-btn tool-btn-secondary"
          onClick={() => {
            setMinute("0");
            setHour("9");
            setDom("*");
            setMonth("*");
            setDow("1-5");
          }}
        >
          {t("presetDailyNine")}
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <label className="space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">{t("minute")}</span>
          <input className="tool-input font-mono text-sm" value={minute} onChange={(e) => setMinute(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">{t("hour")}</span>
          <input className="tool-input font-mono text-sm" value={hour} onChange={(e) => setHour(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">{t("dayOfMonth")}</span>
          <input className="tool-input font-mono text-sm" value={dom} onChange={(e) => setDom(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">{t("month")}</span>
          <input className="tool-input font-mono text-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-medium text-[var(--muted)]">{t("dayOfWeek")}</span>
          <input className="tool-input font-mono text-sm" value={dow} onChange={(e) => setDow(e.target.value)} />
        </label>
      </div>

      <div className="tool-card space-y-3 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("expression")}</span>
          <CopyTextButton
            text={expression}
            idleLabel={tc("copy")}
            copiedLabel={tc("copied")}
            variant="secondary"
          />
        </div>
        <p className="font-mono text-sm break-all text-[var(--foreground)]">{expression}</p>
        <p className="text-xs text-[var(--muted)]">{t("copyHint")}</p>
      </div>

      {cronError ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {cronError}
        </p>
      ) : (
        <div className="tool-card space-y-2 p-4">
          <p className="text-sm font-medium text-[var(--muted)]">{t("nextRuns")}</p>
          <ul className="font-mono text-sm text-[var(--foreground)]">
            {runs.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
