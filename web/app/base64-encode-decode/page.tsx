"use client";

import { useCallback, useState } from "react";
import { CopyTextButton } from "@/components/copy-text-button";

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
  const [text, setText] = useState("");
  const [b64, setB64] = useState("");
  const [error, setError] = useState<string | null>(null);

  const encode = useCallback(() => {
    setError(null);
    try {
      setB64(utf8ToBase64(text));
    } catch {
      setError("Could not encode to Base64.");
    }
  }, [text]);

  const decode = useCallback(() => {
    setError(null);
    try {
      setText(base64ToUtf8(b64.trim()));
    } catch {
      setError("Invalid Base64 input.");
    }
  }, [b64]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="tool-btn" onClick={encode}>
          Encode text → Base64
        </button>
        <button type="button" className="tool-btn tool-btn-secondary" onClick={decode}>
          Decode Base64 → text
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[var(--muted)]">Plain text</span>
            <CopyTextButton
              key={text}
              text={text}
              idleLabel="Copy text"
              copiedLabel="Copied!"
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
            <span className="text-sm font-medium text-[var(--muted)]">Base64</span>
            <CopyTextButton
              key={b64}
              text={b64}
              idleLabel="Copy Base64"
              copiedLabel="Copied!"
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
        <h2 className="font-semibold text-[var(--foreground)]">How to use</h2>
        <p>
          Type or paste on the left and encode, or paste Base64 on the right and
          decode. The helper uses UTF-8 so emoji and non-Latin scripts round-trip
          correctly.
        </p>
      </section>
    </div>
  );
}
