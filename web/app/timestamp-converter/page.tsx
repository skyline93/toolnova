"use client";

import { useLayoutEffect, useMemo, useState } from "react";
import { CopyTextButton } from "@/components/copy-text-button";

function parseInput(raw: string): Date | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^\d{10}$/.test(t)) return new Date(Number(t) * 1000);
  if (/^\d{13}$/.test(t)) return new Date(Number(t));
  const d = new Date(t);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimestampConverterPage() {
  const [raw, setRaw] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init; Date.now differs SSR vs client
    setRaw(String(Math.floor(Date.now() / 1000)));
  }, []);

  const date = useMemo(() => parseInput(raw), [raw]);

  const rows = useMemo(() => {
    if (!date) return null;
    return {
      iso: date.toISOString(),
      utc: date.toUTCString(),
      local: date.toString(),
      seconds: Math.floor(date.getTime() / 1000),
      millis: date.getTime(),
    };
  }, [date]);

  return (
    <div className="space-y-6">
      <label className="block max-w-xl space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">
          Unix seconds, Unix ms, or ISO-8601
        </span>
        <input
          className="tool-input font-mono"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
        />
      </label>
      {raw === "" ? (
        <p className="text-sm text-[var(--muted)]">Loading…</p>
      ) : !date ? (
        <p className="text-sm text-[var(--danger)]">Could not parse that value.</p>
      ) : (
        <dl className="tool-card divide-y divide-[var(--border)] text-sm">
          {(
            [
              ["ISO 8601 (UTC)", rows!.iso],
              ["UTC string", rows!.utc],
              ["Local string", rows!.local],
              ["Unix seconds", String(rows!.seconds)],
              ["Unix milliseconds", String(rows!.millis)],
            ] as const
          ).map(([k, v]) => (
            <div
              key={k}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <dt className="shrink-0 font-medium text-[var(--muted)]">{k}</dt>
              <dd className="flex min-w-0 flex-1 items-start justify-end gap-2 sm:max-w-[70%]">
                <span className="break-all text-right font-mono text-[var(--foreground)]">{v}</span>
                <CopyTextButton
                  key={`${k}:${v}`}
                  text={v}
                  idleLabel="Copy"
                  copiedLabel="Copied!"
                  variant="link"
                  className="!min-w-0 shrink-0 pt-0.5"
                />
              </dd>
            </div>
          ))}
        </dl>
      )}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">How to use</h2>
        <p>
          Paste a 10-digit Unix time in seconds, a 13-digit millisecond value, or a
          full ISO string such as <code className="font-mono text-[var(--foreground)]">2026-04-04T12:00:00Z</code>.
          The table updates instantly with equivalent representations.
        </p>
      </section>
    </div>
  );
}
