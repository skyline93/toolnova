"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { useTranslations } from "next-intl";
import { useLayoutEffect, useMemo, useState } from "react";

function parseInput(raw: string): Date | null {
  const s = raw.trim();
  if (!s) return null;
  if (/^\d{10}$/.test(s)) return new Date(Number(s) * 1000);
  if (/^\d{13}$/.test(s)) return new Date(Number(s));
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export default function TimestampConverterPage() {
  const t = useTranslations("timestamp");
  const tc = useTranslations("common");
  const [raw, setRaw] = useState("");

  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init
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

  const rowDefs = useMemo(() => {
    if (!rows) return [];
    return [
      ["rowIso", rows.iso],
      ["rowUtc", rows.utc],
      ["rowLocal", rows.local],
      ["rowSeconds", String(rows.seconds)],
      ["rowMillis", String(rows.millis)],
    ] as const;
  }, [rows]);

  return (
    <div className="space-y-6">
      <label className="block max-w-xl space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">{t("label")}</span>
        <input
          className="tool-input font-mono"
          value={raw}
          onChange={(e) => setRaw(e.target.value)}
          spellCheck={false}
        />
      </label>
      {raw === "" ? (
        <p className="text-sm text-[var(--muted)]">{tc("loading")}</p>
      ) : !date ? (
        <p className="text-sm text-[var(--danger)]">{t("parseError")}</p>
      ) : (
        <dl className="tool-card divide-y divide-[var(--border)] text-sm">
          {rowDefs.map(([key, v]) => (
            <div
              key={key}
              className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4"
            >
              <dt className="shrink-0 font-medium text-[var(--muted)]">{t(key)}</dt>
              <dd className="flex min-w-0 flex-1 items-start justify-end gap-2 sm:max-w-[70%]">
                <span className="break-all text-right font-mono text-[var(--foreground)]">{v}</span>
                <CopyTextButton
                  key={`${key}:${v}`}
                  text={v}
                  idleLabel={tc("copy")}
                  copiedLabel={tc("copied")}
                  variant="link"
                  className="!min-w-0 shrink-0 pt-0.5"
                />
              </dd>
            </div>
          ))}
        </dl>
      )}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
