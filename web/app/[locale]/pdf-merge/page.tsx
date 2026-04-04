"use client";

import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

export default function PdfMergePage() {
  const t = useTranslations("pdfMerge");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const merge = useCallback(
    async (files: FileList | null) => {
      setError(null);
      if (!files || files.length === 0) {
        setError(t("errorNone"));
        return;
      }
      setBusy(true);
      try {
        const form = new FormData();
        Array.from(files).forEach((f) => form.append("files", f));
        const res = await fetch("/api/merge-pdf", {
          method: "POST",
          body: form,
        });
        if (!res.ok) {
          const data = (await res.json().catch(() => null)) as { error?: string } | null;
          setError(data?.error ?? t("errorFail"));
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "merged.pdf";
        a.click();
        URL.revokeObjectURL(url);
      } catch {
        setError(t("errorNetwork"));
      } finally {
        setBusy(false);
      }
    },
    [t],
  );

  return (
    <div className="space-y-6">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">{t("files")}</span>
        <input
          type="file"
          accept="application/pdf,.pdf"
          multiple
          className="tool-input"
          disabled={busy}
          onChange={(e) => void merge(e.target.files)}
        />
      </label>
      <p className="text-sm text-[var(--muted)]">{t("limits")}</p>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {busy ? <p className="text-sm text-[var(--muted)]">{t("merging")}</p> : null}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
