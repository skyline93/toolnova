"use client";

import { useCallback, useState } from "react";
import { CopyTextButton } from "@/components/copy-text-button";

export default function JsonFormatterPage() {
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
          Format
        </button>
        <button type="button" className="tool-btn tool-btn-secondary" onClick={minifyJson}>
          Minify
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-[var(--muted)]">Input</span>
          <textarea
            className="tool-input min-h-[280px] font-mono text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='{"hello":"world"}'
            spellCheck={false}
          />
        </label>
        <label className="block space-y-2">
          <span className="flex items-center justify-between gap-2">
            <span className="text-sm font-medium text-[var(--muted)]">Output</span>
            <CopyTextButton
              key={output}
              text={output}
              idleLabel="Copy output"
              copiedLabel="Copied!"
              variant="link"
              className="!min-w-0"
            />
          </span>
          <textarea
            className="tool-input min-h-[280px] font-mono text-sm"
            value={output}
            readOnly
            placeholder="Formatted JSON appears here"
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
          Paste raw JSON and press <strong>Format</strong> for readable indentation or{" "}
          <strong>Minify</strong> to remove whitespace. Invalid documents surface a
          parser error so you can fix typos quickly.
        </p>
      </section>
    </div>
  );
}
