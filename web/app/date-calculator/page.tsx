"use client";

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
  const [start, setStart] = useState("2026-01-01");
  const [end, setEnd] = useState("2026-04-04");
  const [base, setBase] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init; "today" differs SSR vs client
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
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Difference between dates</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">Start date</span>
            <input
              type="date"
              className="tool-input"
              value={start}
              onChange={(e) => setStart(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">End date</span>
            <input
              type="date"
              className="tool-input"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
            />
          </label>
        </div>
        {diff === null ? (
          <p className="text-sm text-[var(--danger)]">Invalid date range.</p>
        ) : (
          <p className="tool-card px-4 py-3 text-sm text-[var(--muted)]">
            Span: <strong className="text-[var(--foreground)]">{diff}</strong> whole days
            (end minus start, UTC calendar math).
          </p>
        )}
      </section>
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">Add or subtract days</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">Base date</span>
            <input
              type="date"
              className="tool-input"
              value={base}
              onChange={(e) => setBase(e.target.value)}
            />
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium text-[var(--muted)]">Days to add (negative subtracts)</span>
            <input
              type="number"
              className="tool-input"
              value={delta}
              onChange={(e) => setDelta(Number(e.target.value))}
            />
          </label>
        </div>
        {base === "" ? (
          <p className="text-sm text-[var(--muted)]">Loading…</p>
        ) : shifted ? (
          <p className="tool-card px-4 py-3 text-sm text-[var(--muted)]">
            Result: <strong className="font-mono text-[var(--foreground)]">{shifted}</strong>
          </p>
        ) : (
          <p className="text-sm text-[var(--danger)]">Invalid base date.</p>
        )}
      </section>
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">How to use</h2>
        <p>
          Pick two dates to see how many full calendar days sit between them. In the
          second panel, nudge a base date forward or backward by any integer number of
          days—handy for SLA and trial expirations.
        </p>
      </section>
    </div>
  );
}
