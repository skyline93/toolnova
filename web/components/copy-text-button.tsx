"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CopyStatus = "idle" | "copied" | "error";

export function CopyTextButton({
  text,
  idleLabel,
  copiedLabel = "Copied!",
  errorLabel = "Copy failed",
  className = "",
  variant = "link",
  disabled: disabledProp = false,
}: {
  text: string;
  idleLabel: string;
  copiedLabel?: string;
  errorLabel?: string;
  className?: string;
  variant?: "link" | "secondary";
  /** When true, never copies (e.g. parent-controlled). Empty `text` also disables. */
  disabled?: boolean;
}) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    },
    [],
  );

  const cannotCopy = text.length === 0 || disabledProp;

  const handleClick = useCallback(async () => {
    if (text.length === 0 || disabledProp) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    try {
      await navigator.clipboard.writeText(text);
      setStatus("copied");
      timerRef.current = setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      timerRef.current = setTimeout(() => setStatus("idle"), 2800);
    }
  }, [text, disabledProp]);

  const visibleLabel =
    status === "copied" ? copiedLabel : status === "error" ? errorLabel : idleLabel;

  const base =
    variant === "secondary"
      ? "tool-btn tool-btn-secondary inline-flex min-h-[2.5rem] min-w-[7rem] justify-center"
      : "inline-flex min-w-[5rem] shrink-0 justify-end text-xs font-semibold text-[var(--accent)] hover:underline";

  const stateClass =
    status === "copied"
      ? " text-emerald-700 no-underline dark:text-emerald-400"
      : status === "error"
        ? " text-[var(--danger)] no-underline"
        : "";

  return (
    <button
      type="button"
      className={`${base}${stateClass} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline ${className}`.trim()}
      onClick={handleClick}
      disabled={cannotCopy}
      aria-live="polite"
    >
      {visibleLabel}
    </button>
  );
}
