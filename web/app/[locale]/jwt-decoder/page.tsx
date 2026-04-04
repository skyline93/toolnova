"use client";

import { CopyTextButton } from "@/components/copy-text-button";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

function decodePart(part: string): string {
  const padded = part.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (padded.length % 4)) % 4;
  const base64 = padded + "=".repeat(padLen);
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const json = new TextDecoder().decode(bytes);
  const obj = JSON.parse(json);
  return JSON.stringify(obj, null, 2);
}

export default function JwtDecoderPage() {
  const t = useTranslations("jwt");
  const tc = useTranslations("common");
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    const tok = token.trim();
    if (!tok) return { kind: "empty" as const };
    const parts = tok.split(".");
    if (parts.length < 2) {
      return { kind: "error" as const, message: t("errorSegments") };
    }
    try {
      return {
        kind: "ok" as const,
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
      };
    } catch {
      return { kind: "error" as const, message: t("errorDecode") };
    }
  }, [token, t]);

  return (
    <div className="space-y-6">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">{t("label")}</span>
        <textarea
          className="tool-input min-h-[120px] font-mono text-sm"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={t("placeholder")}
          spellCheck={false}
        />
      </label>
      {result.kind === "error" ? (
        <p className="text-sm text-[var(--danger)]" role="alert">
          {result.message}
        </p>
      ) : null}
      {result.kind === "ok" ? (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-[var(--muted)]">{t("header")}</h2>
              <CopyTextButton
                key={`h:${result.header}`}
                text={result.header}
                idleLabel={tc("copy")}
                copiedLabel={tc("copied")}
                variant="link"
                className="!min-w-0"
              />
            </div>
            <pre className="tool-card overflow-x-auto p-4 font-mono text-xs leading-relaxed">
              {result.header}
            </pre>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-[var(--muted)]">{t("payload")}</h2>
              <CopyTextButton
                key={`p:${result.payload}`}
                text={result.payload}
                idleLabel={tc("copy")}
                copiedLabel={tc("copied")}
                variant="link"
                className="!min-w-0"
              />
            </div>
            <pre className="tool-card overflow-x-auto p-4 font-mono text-xs leading-relaxed">
              {result.payload}
            </pre>
          </div>
        </div>
      ) : null}
      <section className="tool-card space-y-3 p-5 text-sm leading-relaxed text-[var(--muted)]">
        <h2 className="font-semibold text-[var(--foreground)]">{t("safetyTitle")}</h2>
        <p>{t("safetyBody")}</p>
      </section>
    </div>
  );
}
