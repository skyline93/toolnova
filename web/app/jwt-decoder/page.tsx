"use client";

import { useMemo, useState } from "react";
import { CopyTextButton } from "@/components/copy-text-button";

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
  const [token, setToken] = useState("");

  const result = useMemo(() => {
    const t = token.trim();
    if (!t) return { kind: "empty" as const };
    const parts = t.split(".");
    if (parts.length < 2) {
      return { kind: "error" as const, message: "A JWT needs at least header and payload segments." };
    }
    try {
      return {
        kind: "ok" as const,
        header: decodePart(parts[0]),
        payload: decodePart(parts[1]),
      };
    } catch {
      return { kind: "error" as const, message: "Could not decode JWT segments." };
    }
  }, [token]);

  return (
    <div className="space-y-6">
      <label className="block space-y-2">
        <span className="text-sm font-medium text-[var(--muted)]">JWT string</span>
        <textarea
          className="tool-input min-h-[120px] font-mono text-sm"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
              <h2 className="text-sm font-medium text-[var(--muted)]">Header</h2>
              <CopyTextButton
                key={`h:${result.header}`}
                text={result.header}
                idleLabel="Copy"
                copiedLabel="Copied!"
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
              <h2 className="text-sm font-medium text-[var(--muted)]">Payload</h2>
              <CopyTextButton
                key={`p:${result.payload}`}
                text={result.payload}
                idleLabel="Copy"
                copiedLabel="Copied!"
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
        <h2 className="font-semibold text-[var(--foreground)]">Safety note</h2>
        <p>
          This page decodes Base64URL JSON only. It does <strong>not</strong> check
          signatures, expiration, or issuer claims. Combine it with your framework&apos;s
          verifier before trusting a token in production.
        </p>
      </section>
    </div>
  );
}
