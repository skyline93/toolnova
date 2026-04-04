"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function RoiCalculatorPage() {
  const t = useTranslations("roiCalculator");
  const [start, setStart] = useState("1000");
  const [end, setEnd] = useState("1250");

  const result = useMemo(() => {
    const s = Number(start.replace(/,/g, ""));
    const e = Number(end.replace(/,/g, ""));
    if (!Number.isFinite(s) || !Number.isFinite(e) || s <= 0) return null;
    const gain = e - s;
    const roi = (gain / s) * 100;
    return { gain, roi };
  }, [start, end]);

  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    [],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("start")}</span>
          <input
            className="tool-input"
            inputMode="decimal"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("end")}</span>
          <input className="tool-input" inputMode="decimal" value={end} onChange={(e) => setEnd(e.target.value)} />
        </label>
      </div>

      {result ? (
        <dl className="tool-card grid gap-4 p-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-[var(--muted)]">{t("gain")}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
              {fmt.format(result.gain)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted)]">{t("roi")}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
              {fmt.format(result.roi)}%
            </dd>
          </div>
        </dl>
      ) : (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {t("invalid")}
        </p>
      )}

      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
