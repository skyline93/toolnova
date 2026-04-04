"use client";

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
  const [birth, setBirth] = useState("1990-06-15");
  const [ref, setRef] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init; "today" differs SSR vs client
    setRef(new Date().toISOString().slice(0, 10));
  }, []);

  const result = useMemo(() => (ref ? ageCalendar(birth, ref) : null), [birth, ref]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">Birth date</span>
          <input
            type="date"
            className="tool-input"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">Age on (reference date)</span>
          <input
            type="date"
            className="tool-input"
            value={ref}
            onChange={(e) => setRef(e.target.value)}
          />
        </label>
      </div>
      {ref === "" ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : !result ? (
        <p className="text-sm text-[var(--danger)]">
          Choose a birth date on or before the reference date.
        </p>
      ) : (
        <div className="tool-card px-4 py-5 text-sm leading-relaxed text-[var(--muted)]">
          <p>
            Age:{" "}
            <strong className="text-[var(--foreground)]">
              {result.years} years, {result.months} months, {result.days} days
            </strong>
          </p>
        </div>
      )}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">How to use</h2>
        <p>
          Select a birth date and the day you want to measure against—defaults to
          today. The output breaks the span into whole years, months, and days without
          rolling everything into decimal years.
        </p>
      </section>
    </div>
  );
}
