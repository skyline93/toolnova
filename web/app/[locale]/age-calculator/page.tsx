"use client";

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
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("birth")}</span>
          <input
            type="date"
            className="tool-input"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("ref")}</span>
          <input
            type="date"
            className="tool-input"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </label>
      </div>
      {ref === "" ? (
        <p className="text-sm text-[var(--muted)]">{tc("loading")}</p>
      ) : !result ? (
        <p className="text-sm text-[var(--danger)]">{t("error")}</p>
      ) : (
        <div className="tool-card px-4 py-5 text-sm leading-relaxed text-[var(--muted)]">
          <p className="text-[var(--foreground)]">
            {t("result", {
              years: result.years,
              months: result.months,
              days: result.days,
            })}
          </p>
        </div>
      )}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
