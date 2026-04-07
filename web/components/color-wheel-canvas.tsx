"use client";

import { normalizeHue } from "@/lib/color-harmony";
import { useCallback, useEffect, useRef } from "react";

const SEGMENTS = 120;
const HIT_EPS = 3;

const EMPTY_HARMONY_HUES: readonly number[] = [];

function hueToCanvasAngleRad(h: number): number {
  return (normalizeHue(h) / 180) * Math.PI - Math.PI / 2;
}

/** Pointer (canvas coords, y down) → hue; red at top, clockwise increase (matches CSS H). */
export function pointerToHue(dx: number, dy: number): number {
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  return (deg + 90 + 360) % 360;
}

type CacheKey = { cssW: number; cssH: number; dpr: number; R: number; r: number };

function drawHueRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  R: number,
  r: number,
): void {
  for (let i = 0; i < SEGMENTS; i++) {
    const H0 = (i / SEGMENTS) * 360;
    const H1 = ((i + 1) / SEGMENTS) * 360;
    const Hmid = (H0 + H1) / 2;
    const a0 = hueToCanvasAngleRad(H0);
    const a1 = hueToCanvasAngleRad(H1);
    ctx.fillStyle = `hsl(${Hmid} 100% 50%)`;
    ctx.beginPath();
    ctx.arc(cx, cy, R, a0, a1, false);
    ctx.arc(cx, cy, r, a1, a0, true);
    ctx.closePath();
    ctx.fill();
  }
}

/** Harmony / secondary hues on the ring: smaller, drawn under the primary handle. */
function drawHarmonyMarker(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, r: number, hue: number): void {
  const mid = (R + r) / 2;
  const angle = hueToCanvasAngleRad(hue);
  const x = cx + mid * Math.cos(angle);
  const y = cy + mid * Math.sin(angle);
  ctx.save();
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.strokeStyle = "rgba(0,0,0,0.42)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

function drawPrimaryMarker(ctx: CanvasRenderingContext2D, cx: number, cy: number, R: number, r: number, hue: number): void {
  const mid = (R + r) / 2;
  const angle = hueToCanvasAngleRad(hue);
  const x = cx + mid * Math.cos(angle);
  const y = cy + mid * Math.sin(angle);
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.45)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export function ColorWheelCanvas({
  hue,
  harmonyHues = EMPTY_HARMONY_HUES,
  onHueChange,
  size = 280,
  ariaLabel,
}: {
  hue: number;
  /** Other hues from the current harmony palette (ring only); not separately draggable. */
  harmonyHues?: readonly number[];
  onHueChange: (h: number) => void;
  size?: number;
  ariaLabel: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cacheRef = useRef<{ canvas: HTMLCanvasElement; key: string } | null>(null);

  const R = size * 0.42;
  const r = size * 0.26;
  const cx = size / 2;
  const cy = size / 2;

  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const cssW = size;
    const cssH = size;
    canvas.width = Math.floor(cssW * dpr);
    canvas.height = Math.floor(cssH * dpr);
    canvas.style.width = `${cssW}px`;
    canvas.style.height = `${cssH}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const key: CacheKey = { cssW, cssH, dpr, R, r };
    const keyStr = JSON.stringify(key);
    let off = cacheRef.current;
    if (!off || off.key !== keyStr) {
      const oc = document.createElement("canvas");
      oc.width = canvas.width;
      oc.height = canvas.height;
      const octx = oc.getContext("2d");
      if (octx) {
        octx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawHueRing(octx, cx, cy, R, r);
      }
      cacheRef.current = { canvas: oc, key: keyStr };
      off = cacheRef.current;
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(off!.canvas, 0, 0, canvas.width, canvas.height);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (const hh of harmonyHues) {
      drawHarmonyMarker(ctx, cx, cy, R, r, hh);
    }
    drawPrimaryMarker(ctx, cx, cy, R, r, hue);
  }, [size, R, r, cx, cy, hue, harmonyHues]);

  useEffect(() => {
    paint();
  }, [paint]);

  const updateFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const px = clientX - rect.left;
      const py = clientY - rect.top;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < r - HIT_EPS || dist > R + HIT_EPS) return;
      onHueChange(pointerToHue(dx, dy));
    },
    [cx, cy, r, R, onHueChange],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onDown = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const dx = px - cx;
      const dy = py - cy;
      const dist = Math.hypot(dx, dy);
      if (dist < r - HIT_EPS || dist > R + HIT_EPS) return;
      canvas.setPointerCapture(e.pointerId);
      onHueChange(pointerToHue(dx, dy));
    };
    const onMove = (e: PointerEvent) => {
      if (!canvas.hasPointerCapture(e.pointerId)) return;
      updateFromEvent(e.clientX, e.clientY);
    };
    const onUp = (e: PointerEvent) => {
      if (canvas.hasPointerCapture(e.pointerId)) {
        canvas.releasePointerCapture(e.pointerId);
      }
    };

    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);
    return () => {
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
    };
  }, [updateFromEvent, cx, cy, r, R, onHueChange]);

  return (
    <canvas
      ref={canvasRef}
      role="img"
      aria-label={ariaLabel}
      style={{
        display: "block",
        touchAction: "none",
        borderRadius: "var(--radius-3)",
        maxWidth: "100%",
        height: "auto",
      }}
    />
  );
}
