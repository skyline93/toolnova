"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { useTranslations } from "next-intl";
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";

function makeUuid(): string {
  return crypto.randomUUID();
}

export default function UuidGeneratorPage() {
  const t = useTranslations("uuidGenerator");
  const tc = useTranslations("common");
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const initialBatchSize = useRef<number | null>(null);
  if (initialBatchSize.current === null) {
    initialBatchSize.current = Math.min(100, Math.max(1, Math.floor(count)));
  }

  const safeCount = useMemo(() => Math.min(100, Math.max(1, Math.floor(count))), [count]);

  useLayoutEffect(() => {
    const n = initialBatchSize.current ?? 1;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- post-mount init only
    setUuids(Array.from({ length: n }, () => makeUuid()));
  }, []);

  const regenerate = useCallback(() => {
    const next: string[] = [];
    for (let i = 0; i < safeCount; i += 1) next.push(makeUuid());
    setUuids(next);
  }, [safeCount]);

  const allText = useMemo(() => uuids.join("\n"), [uuids]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end gap-4">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("quantity")}</span>
          <input
            type="number"
            min={1}
            max={100}
            className="tool-input w-28"
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
          />
        </label>
        <button type="button" className="tool-btn" onClick={regenerate}>
          {tc("generate")}
        </button>
        <CopyTextButton
          key={allText}
          text={allText}
          idleLabel={tc("copyAll")}
          copiedLabel={tc("allCopied")}
          variant="secondary"
        />
      </div>
      <ul className="tool-card divide-y divide-[var(--border)] font-mono text-sm">
        {uuids.length === 0 ? (
          <li className="px-4 py-6 text-sm text-[var(--muted)]">{tc("loading")}</li>
        ) : (
          uuids.map((u) => (
            <li key={u} className="flex items-center justify-between gap-3 px-4 py-3">
              <span className="break-all">{u}</span>
              <CopyTextButton
                key={u}
                text={u}
                idleLabel={tc("copy")}
                copiedLabel={tc("copied")}
                variant="link"
              />
            </li>
          ))
        )}
      </ul>
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
