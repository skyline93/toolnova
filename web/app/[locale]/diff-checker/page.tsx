"use client";

import { diffLines } from "diff";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

export default function DiffCheckerPage() {
  const t = useTranslations("diffChecker");
  const [left, setLeft] = useState("line one\nline two\nline three");
  const [right, setRight] = useState("line one\nline two edited\nline three\nline four");

  const parts = useMemo(() => diffLines(left, right), [left, right]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("left")}</span>
          <textarea
            className="tool-input min-h-[220px] font-mono text-sm"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("right")}</span>
          <textarea
            className="tool-input min-h-[220px] font-mono text-sm"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
          />
        </label>
      </div>

      <div className="flex flex-wrap gap-4 text-xs text-[var(--muted)]">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-6 rounded-sm bg-[color-mix(in_srgb,var(--danger)_18%,transparent)]" />
          {t("legendRemoved")}
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-6 rounded-sm bg-[color-mix(in_srgb,var(--accent)_16%,transparent)]" />
          {t("legendAdded")}
        </span>
      </div>

      <div
        className="tool-card max-h-[min(70vh,520px)] overflow-auto p-4 font-mono text-sm leading-relaxed"
        aria-live="polite"
      >
        <pre className="whitespace-pre-wrap break-words">
          {parts.map((part, i) => {
            if (part.added) {
              return (
                <span
                  key={i}
                  className="bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[var(--foreground)]"
                >
                  {part.value}
                </span>
              );
            }
            if (part.removed) {
              return (
                <span
                  key={i}
                  className="bg-[color-mix(in_srgb,var(--danger)_18%,transparent)] text-[var(--foreground)] line-through decoration-[var(--danger)]/50"
                >
                  {part.value}
                </span>
              );
            }
            return (
              <span key={i} className="text-[var(--foreground)]">
                {part.value}
              </span>
            );
          })}
        </pre>
      </div>

      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
