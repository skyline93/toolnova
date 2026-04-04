"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function escapeCsvCell(v: string): string {
  if (/[",\n\r]/.test(v)) {
    return `"${v.replace(/"/g, '""')}"`;
  }
  return v;
}

function jsonToCsvString(raw: string): string {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error("parse");
  }

  const rows: Record<string, unknown>[] = [];
  if (Array.isArray(data)) {
    for (const item of data) {
      if (item && typeof item === "object" && !Array.isArray(item)) {
        rows.push(item as Record<string, unknown>);
      }
    }
    if (rows.length === 0 && data.length > 0) {
      throw new Error("shape");
    }
  } else if (data && typeof data === "object" && !Array.isArray(data)) {
    rows.push(data as Record<string, unknown>);
  } else {
    throw new Error("shape");
  }

  if (rows.length === 0) {
    throw new Error("empty");
  }

  const keySet = new Set<string>();
  for (const row of rows) {
    Object.keys(row).forEach((k) => keySet.add(k));
  }
  const headers = Array.from(keySet);
  const lines = [headers.map((h) => escapeCsvCell(h)).join(",")];
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(String(row[h] ?? ""))).join(","));
  }
  return lines.join("\n");
}

export default function JsonToCsvPage() {
  const t = useTranslations("jsonToCsv");
  const [input, setInput] = useState('[{"name":"Ada","score":10},{"name":"Bob","score":8}]');
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const convert = useCallback(() => {
    setError(null);
    try {
      setOutput(jsonToCsvString(input));
    } catch (e) {
      setOutput("");
      if (e instanceof Error) {
        if (e.message === "parse") setError(t("errorParse"));
        else if (e.message === "shape") setError(t("errorShape"));
        else if (e.message === "empty") setError(t("errorEmpty"));
        else setError(t("errorParse"));
      }
    }
  }, [input, t]);

  const download = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "export.csv";
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="tool-btn" onClick={convert}>
          {t("convert")}
        </button>
        <button type="button" className="tool-btn tool-btn-secondary" onClick={download} disabled={!output}>
          {t("download")}
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("input")}</span>
          <textarea
            className="tool-input min-h-[280px] font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("output")}</span>
          <textarea
            className="tool-input min-h-[280px] font-mono text-sm"
            value={output}
            readOnly
            placeholder="CSV…"
            spellCheck={false}
          />
        </label>
      </div>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
