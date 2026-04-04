"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { useTranslations } from "next-intl";
import { useCallback, useState } from "react";

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return btoa(binary);
}

function base64ToUtf8(b64: string): string {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

export default function Base64Page() {
  const t = useTranslations("base64");
  const tc = useTranslations("common");
  const [text, setText] = useState("");
  const [b64, setB64] = useState("");
  const [error, setError] = useState<string | null>(null);

  const encode = useCallback(() => {
    setError(null);
    try {
      setB64(utf8ToBase64(text));
    } catch {
      setError(t("encodeError"));
    }
  }, [text, t]);

  const decode = useCallback(() => {
    setError(null);
    try {
      setText(base64ToUtf8(b64.trim()));
    } catch {
      setError(t("decodeError"));
    }
  }, [b64, t]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="tool-btn" onClick={encode}>
          {t("encode")}
        </button>
        <button type="button" className="tool-btn tool-btn-secondary" onClick={decode}>
          {t("decode")}
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[var(--muted)]">{t("plain")}</span>
            <CopyTextButton
              key={text}
              text={text}
              idleLabel={tc("copyText")}
              copiedLabel={tc("copied")}
              variant="link"
              className="!min-w-0"
            />
          </span>
          <textarea
            className="tool-input min-h-[220px] font-mono text-sm"
            value={text}
            onChange={(e) => setText(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="block space-y-2">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[var(--muted)]">{t("b64")}</span>
            <CopyTextButton
              key={b64}
              text={b64}
              idleLabel={tc("copyBase64")}
              copiedLabel={tc("copied")}
              variant="link"
              className="!min-w-0"
            />
          </span>
          <textarea
            className="tool-input min-h-[220px] font-mono text-sm"
            value={b64}
            onChange={(e) => setB64(e.target.value)}
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
