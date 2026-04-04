"use client";

import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

function parseYmdUtcDays(s: string): number | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const t = Date.UTC(y, mo - 1, d);
  if (Number.isNaN(t)) return null;
  return Math.floor(t / 86400000);
}

function addDaysYmd(ymd: string, days: number): string | null {
  const base = parseYmdUtcDays(ymd);
  if (base === null) return null;
  const ms = (base + days) * 86400000;
  return new Date(ms).toISOString().slice(0, 10);
}

export default function DateCalculatorPage() {
  const t = useTranslations("dateCalculator");
  const tc = useTranslations("common");
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-04-04");
  const [base, setBase] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init
    setBase(new Date().toISOString().slice(0, 10));
  }, []);

  const [delta, setDelta] = useState(30);

  const diff = useMemo(() => {
    const a = parseYmdUtcDays(start);
    const b = parseYmdUtcDays(end);
    if (a === null || b === null) return null;
    return b - a;
  }, [start, end]);

  const shifted = useMemo(
    () => (base ? addDaysYmd(base, delta) : null),
    [base, delta],
  );

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("diffTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">{t("start")}</span>
            <input
              type="date"
              className="tool-input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">{t("end")}</span>
            <input
              type="date"
              className="tool-input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        {diff === null ? (
          <p className="text-sm text-[var(--danger)]">{t("invalidRange")}</p>
        ) : (
          <p className="tool-card px-4 py-3 text-sm text-[var(--muted)]">
            {t("span", { days: diff })}
          </p>
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">{t("addTitle")}</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">{t("base")}</span>
            <input
              type="date"
              className="tool-input"
              value={base}
              onChange={(e) => setBase(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">{t("delta")}</span>
            <input
              type="number"
              className="tool-input"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
            />
          </label>
        </div>
        {base === "" ? (
          <p className="text-sm text-[var(--muted)]">{tc("loading")}</p>
        ) : shifted ? (
          <p className="tool-card px-4 py-3 text-sm text-[var(--muted)]">
            {t("result")}{" "}
            <strong className="font-mono text-[var(--foreground)]">{shifted}</strong>
          </p>
        ) : (
          <p className="text-sm text-[var(--danger)]">{t("invalidBase")}</p>
        )}
      </section>
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
