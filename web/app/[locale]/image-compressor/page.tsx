"use client";

import imageCompression from "browser-image-compression";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

const MAX_BYTES = 10 * 1024 * 1024;

export default function ImageCompressorPage() {
  const t = useTranslations("imageCompressor");
  const tc = useTranslations("common");
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [beforeSize, setBeforeSize] = useState<number | null>(null);
  const [afterSize, setAfterSize] = useState<number | null>(null);
  const [url, setUrl] = useState<string | null>(null);

  const onFile = useCallback(
    async (file: File) => {
      setError(null);
      if (!file.type.startsWith("image/")) {
        setError(t("errorType"));
        return;
      }
      if (file.size > MAX_BYTES) {
        setError(t("errorSize", { mb: MAX_BYTES / (1024 * 1024) }));
        return;
      }
      setBusy(true);
      if (url) URL.revokeObjectURL(url);
      setUrl(null);
      setBeforeSize(file.size);
      setAfterSize(null);
      try {
        const compressed = await imageCompression(file, {
          maxWidthOrHeight: maxWidth,
          initialQuality: quality,
          useWebWorker: true,
        });
        setAfterSize(compressed.size);
        setUrl(URL.createObjectURL(compressed));
      } catch {
        setError(t("errorCompress"));
      } finally {
        setBusy(false);
      }
    },
    [maxWidth, quality, url, t],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("maxSize")}</span>
          <input
            type="number"
            min={320}
            max={8192}
            className="tool-input"
            value={maxWidth}
            onChange={(e) => setMaxWidth(Number(e.target.value))}
          />
        </label>
        <label className="space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">{t("quality")}</span>
          <input
            type="number"
            min={0.1}
            max={1}
            step={0.05}
            className="tool-input"
            value={quality}
            onChange={(e) => setQuality(Number(e.target.value))}
          />
        </label>
      </div>
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">{t("file")}</span>
        <input
          type="file"
          accept="image/*"
          className="tool-input"
          disabled={busy}
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void onFile(f);
          }}
        />
      </label>
      {error ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {error}
        </p>
      ) : null}
      {beforeSize !== null ? (
        <p className="text-sm text-[var(--muted)]">
          {t("sizeOriginal")} {(beforeSize / 1024).toFixed(1)} KB
          {afterSize !== null ? (
            <>
              {" "}
              → {t("sizeCompressed")} {(afterSize / 1024).toFixed(1)} KB
            </>
          ) : null}
        </p>
      ) : null}
      {url ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt={t("previewAlt")} className="tool-card max-h-96 w-auto object-contain p-2" />
          <a href={url} download="compressed.jpg" className="tool-btn inline-flex">
            {tc("downloadResult")}
          </a>
        </div>
      ) : null}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("howTitle")}</h2>
        <p>{t("howBody")}</p>
      </section>
    </div>
  );
}
