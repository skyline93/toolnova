"use client";

import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function monthlyPayment(principal: number, annualAprPercent: number, years: number) {
  const n = Math.round(years * 12);
  if (!Number.isFinite(principal) || !Number.isFinite(annualAprPercent) || !Number.isFinite(years)) {
    return null;
  }
  if (principal <= 0 || years <= 0 || n <= 0) return null;
  if (annualAprPercent < 0) return null;
  const r = annualAprPercent / 100 / 12;
  if (r === 0) {
    return { monthly: principal / n, total: principal, interest: 0 };
  }
  const monthly = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const total = monthly * n;
  const interest = total - principal;
  return { monthly, total, interest };
}

export default function LoanCalculatorPage() {
  const t = useTranslations("loanCalculator");
  const [principal, setPrincipal] = useState("100000");
  const [apr, setApr] = useState("6.5");
  const [years, setYears] = useState("30");

  const result = useMemo(() => {
    const p = Number(principal.replace(/,/g, ""));
    const a = Number(apr);
    const y = Number(years);
    return monthlyPayment(p, a, y);
  }, [principal, apr, years]);

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
      <div className="grid gap-4 sm:grid-cols-3">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("principal")}</span>
          <input
            className="tool-input"
            inputMode="decimal"
            value={principal}
            onChange={(e) => setPrincipal(e.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("apr")}</span>
          <input className="tool-input" inputMode="decimal" value={apr} onChange={(e) => setApr(e.target.value)} />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("years")}</span>
          <input
            className="tool-input"
            inputMode="decimal"
            value={years}
            onChange={(e) => setYears(e.target.value)}
          />
        </label>
      </div>

      {result ? (
        <dl className="tool-card grid gap-4 p-5 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-[var(--muted)]">{t("monthly")}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
              {fmt.format(result.monthly)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted)]">{t("totalPaid")}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
              {fmt.format(result.total)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-[var(--muted)]">{t("totalInterest")}</dt>
            <dd className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
              {fmt.format(result.interest)}
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
