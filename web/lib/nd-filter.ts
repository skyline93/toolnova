/** Common reciprocal denominators (full stop-ish series) for matching display */
export const SHUTTER_RECIP_DENOMS: readonly number[] = [
  8000, 6400, 5000, 4000, 3200, 2500, 2000, 1600, 1250, 1000, 800, 640, 500, 400, 320, 250, 200, 160, 125,
  100, 80, 60, 50, 40, 30, 25, 20, 15, 13, 10, 8, 6, 5, 4, 3, 2, 1,
];

/** Preset exposure times in seconds (for dropdowns) */
export const BASE_SHUTTER_PRESETS: readonly number[] = [
  1 / 8000,
  1 / 4000,
  1 / 2000,
  1 / 1000,
  1 / 500,
  1 / 250,
  1 / 125,
  1 / 60,
  1 / 30,
  1 / 15,
  1 / 8,
  1 / 4,
  1 / 2,
  1,
  2,
  4,
  8,
  15,
  30,
];

export function stopsFromFactor(n: number): number {
  return Math.log2(n);
}

export function factorFromStops(stops: number): number {
  return 2 ** stops;
}

export function combineFactors(factors: readonly number[]): number {
  return factors.reduce((a, b) => a * b, 1);
}

export function combineStops(stops: readonly number[]): number {
  return stops.reduce((a, b) => a + b, 0);
}

export function applyNdToSeconds(t0Seconds: number, ndFactor: number): number {
  return t0Seconds * ndFactor;
}

/**
 * Total ND factor from a stack. Factors must be >= 1; stops must be >= 0.
 */
export function totalFactorFromStack(
  unit: "factor" | "stops",
  values: readonly number[],
): number | null {
  if (values.length === 0) return null;
  if (unit === "factor") {
    let p = 1;
    for (const v of values) {
      if (!Number.isFinite(v) || v < 1) return null;
      p *= v;
    }
    return p;
  }
  let s = 0;
  for (const v of values) {
    if (!Number.isFinite(v) || v < 0) return null;
    s += v;
  }
  return factorFromStops(s);
}

const FRAC_RE = /^(\d+(?:\.\d+)?)\s*\/\s*(\d+(?:\.\d+)?)$/;

export function parseShutterToSeconds(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const frac = FRAC_RE.exec(s);
  if (frac) {
    const a = Number(frac[1]);
    const b = Number(frac[2]);
    if (!Number.isFinite(a) || !Number.isFinite(b) || b === 0) return null;
    const t = a / b;
    return t > 0 && Number.isFinite(t) ? t : null;
  }
  const n = Number(s.replace(/,/g, ""));
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Photography-style shutter string: 1/125s or 2.5s; uses nearest standard denominator when close enough.
 */
export function formatShutterDisplay(seconds: number, reciprocalEpsilon = 0.035): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "—";

  if (seconds >= 1) {
    const rounded = Math.round(seconds * 1000) / 1000;
    if (Math.abs(rounded - Math.round(rounded)) < 1e-6) return `${Math.round(rounded)}s`;
    const t = rounded.toFixed(1);
    return t.endsWith(".0") ? `${Math.round(rounded)}s` : `${t}s`;
  }

  const inv = 1 / seconds;
  let bestD = Math.round(inv);
  let bestRel = Math.abs(inv - bestD) / inv;
  for (const d of SHUTTER_RECIP_DENOMS) {
    const rel = Math.abs(inv - d) / inv;
    if (rel < bestRel) {
      bestRel = rel;
      bestD = d;
    }
  }
  if (bestRel <= reciprocalEpsilon && bestD > 0) return `1/${bestD}s`;
  return `${seconds.toPrecision(4)}s`;
}

export function formatStopsDisplay(stops: number, maxDecimals = 2): string {
  if (!Number.isFinite(stops)) return "—";
  const rounded = Math.round(stops * 10 ** maxDecimals) / 10 ** maxDecimals;
  return String(rounded);
}

/** Sub-second readable: integer reciprocal 1/denom (no decimals). */
export function nearestReciprocalDenom(seconds: number, epsilon = 0.035): number {
  if (!Number.isFinite(seconds) || seconds <= 0) return 1;
  const inv = 1 / seconds;
  let bestD = Math.max(1, Math.round(inv));
  let bestRel = Math.abs(inv - bestD) / inv;
  for (const d of SHUTTER_RECIP_DENOMS) {
    const rel = Math.abs(inv - d) / inv;
    if (rel < bestRel) {
      bestRel = rel;
      bestD = d;
    }
  }
  if (bestRel > epsilon) bestD = Math.max(1, Math.round(inv));
  return bestD;
}

export type EquivalentReadableDisplay =
  | { type: "secOnly"; seconds: number }
  | { type: "minSec"; minutes: number; seconds: number }
  | { type: "hourMinSec"; hours: number; minutes: number; seconds: number }
  | { type: "recip"; denom: number };

/** Above this many rounded seconds (> 60 min), show hours + minutes + seconds. */
export const READABLE_HOUR_THRESHOLD_SECONDS = 60 * 60;

/**
 * Integer-only readable equivalent shutter:
 * - sub-second → 1/denom
 * - &lt; 1 min → seconds only
 * - 1 min … 60 min (inclusive) → minutes + seconds
 * - &gt; 60 min → hours + minutes + seconds
 */
export function equivalentShutterReadableParts(seconds: number): {
  roundedTotalSeconds: number;
  display: EquivalentReadableDisplay;
} | null {
  if (!Number.isFinite(seconds) || seconds <= 0) return null;
  if (seconds < 1) {
    return {
      roundedTotalSeconds: 0,
      display: { type: "recip", denom: nearestReciprocalDenom(seconds) },
    };
  }
  const roundedTotalSeconds = Math.round(seconds);

  if (roundedTotalSeconds < 60) {
    return {
      roundedTotalSeconds,
      display: { type: "secOnly", seconds: roundedTotalSeconds },
    };
  }

  if (roundedTotalSeconds <= READABLE_HOUR_THRESHOLD_SECONDS) {
    return {
      roundedTotalSeconds,
      display: {
        type: "minSec",
        minutes: Math.floor(roundedTotalSeconds / 60),
        seconds: roundedTotalSeconds % 60,
      },
    };
  }

  const h = Math.floor(roundedTotalSeconds / 3600);
  const rem = roundedTotalSeconds % 3600;
  return {
    roundedTotalSeconds,
    display: {
      type: "hourMinSec",
      hours: h,
      minutes: Math.floor(rem / 60),
      seconds: rem % 60,
    },
  };
}
