"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { JsonCodeEditor } from "@/components/json-code-editor";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export default function JsonFormatterPage() {
  const t = useTranslations("jsonFormatter");
  const tc = useTranslations("common");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState<string | null>(null);

  const formatJson = useCallback(() => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input]);

  const minifyJson = useCallback(() => {
    setError(null);
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
    } catch (e) {
      setOutput("");
      setError(e instanceof Error ? e.message : "Invalid JSON");
    }
  }, [input]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="tool-btn" onClick={formatJson}>
          {t("format")}
        </button>
        <button type="button" className="tool-btn tool-btn-secondary" onClick={minifyJson}>
          {t("minify")}
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="block space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("input")}</span>
          <JsonCodeEditor
            value={input}
            onChange={setInput}
            placeholder={t("inputPlaceholder")}
            aria-label={t("input")}
          />
        </div>
        <div className="block space-y-2">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[var(--muted)]">{t("output")}</span>
            <CopyTextButton
              key={output}
              text={output}
              idleLabel={tc("copyOutput")}
              copiedLabel={tc("copied")}
              variant="link"
              className="!min-w-0"
            />
          </span>
          <JsonCodeEditor
            value={output}
            readOnly
            placeholder={t("outputPlaceholder")}
            aria-label={t("output")}
          />
        </div>
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
