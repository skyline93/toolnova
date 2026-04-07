"use client";

import { Button } from "@radix-ui/themes";
import { useCallback, useEffect, useRef, useState } from "react";

type CopyStatus = "idle" | "copied" | "error";

/**
 * Clipboard API only works in a [secure context](https://developer.mozilla.org/en-US/docs/Web/API/Clipboard_API)
 * (HTTPS or http://localhost). Fall back to execCommand so LAN IP / plain HTTP dev URLs can still copy.
 */
async function copyTextToClipboard(value: string): Promise<void> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch {
      /* e.g. permission denied — use fallback */
    }
  }
  const ta = document.createElement("textarea");
  ta.value = value;
  ta.setAttribute("readonly", "");
  ta.style.position = "fixed";
  ta.style.left = "-9999px";
  ta.style.top = "0";
  document.body.appendChild(ta);
  ta.focus();
  ta.select();
  try {
    const ok = document.execCommand("copy");
    if (!ok) throw new Error("execCommand copy returned false");
  } finally {
    document.body.removeChild(ta);
  }
}

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
      await copyTextToClipboard(text);
      setStatus("copied");
      timerRef.current = setTimeout(() => setStatus("idle"), 2000);
    } catch {
      setStatus("error");
      timerRef.current = setTimeout(() => setStatus("idle"), 2800);
    }
  }, [text, disabledProp]);

  const visibleLabel =
    status === "copied" ? copiedLabel : status === "error" ? errorLabel : idleLabel;

  const toneStyle =
    status === "copied"
      ? ({ color: "var(--green-11)" } as const)
      : status === "error"
        ? ({ color: "var(--red-11)" } as const)
        : undefined;

  if (variant === "secondary") {
    return (
      <Button
        type="button"
        size="2"
        variant="outline"
        color="gray"
        disabled={cannotCopy}
        aria-live="polite"
        className={className}
        style={{ minHeight: "2.5rem", minWidth: "7rem", ...toneStyle }}
        onClick={handleClick}
      >
        {visibleLabel}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      size="1"
      variant="ghost"
      color="gray"
      disabled={cannotCopy}
      aria-live="polite"
      className={className}
      style={{
        minWidth: "5rem",
        color: toneStyle?.color ?? "var(--accent-11)",
        textDecoration: status === "idle" ? "underline" : "none",
        textUnderlineOffset: "2px",
      }}
      onClick={handleClick}
    >
      {visibleLabel}
    </Button>
  );
}
