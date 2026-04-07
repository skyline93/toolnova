/** HSL in canonical form: H [0,360), S and L in [0,1]. */
export type Hsl = { h: number; s: number; l: number };

export type Rgb = { r: number; g: number; b: number };

export type HarmonyRuleId =
  | "complementary"
  | "split"
  | "triadic"
  | "tetradic"
  | "analogous"
  | "monochromatic";

/** Whether this swatch index is the “main” color aligned with the current picker (for labels). */
export function isHarmonyPrimaryIndex(rule: HarmonyRuleId, index: number): boolean {
  if (rule === "analogous" || rule === "monochromatic") return index === 2;
  return index === 0;
}

export type HarmonySwatchDelta =
  | { kind: "none" }
  | { kind: "hue"; degrees: number }
  | { kind: "light"; percent: number };

/** Delta from current primary `base` to a palette swatch (for UI hints). */
export function harmonySwatchDelta(base: Hsl, c: Hsl, rule: HarmonyRuleId): HarmonySwatchDelta {
  if (rule === "monochromatic") {
    const pct = Math.round((c.l - base.l) * 100);
    if (pct === 0) return { kind: "none" };
    return { kind: "light", percent: pct };
  }
  const raw = normalizeHue(c.h - base.h);
  const forward = raw <= 180 ? raw : raw - 360;
  if (Math.abs(forward) < 0.5) return { kind: "none" };
  return { kind: "hue", degrees: Math.round(forward) };
}

export function normalizeHue(h: number): number {
  return ((h % 360) + 360) % 360;
}

/** Shortest angular distance between two hues in degrees, in [0, 180]. */
export function circularHueDistance(h1: number, h2: number): number {
  const a = normalizeHue(h1);
  const b = normalizeHue(h2);
  const d = Math.abs(a - b);
  return Math.min(d, 360 - d);
}

export function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

function clampLuma(l: number): number {
  return Math.min(0.95, Math.max(0.05, l));
}

export function hslToRgb({ h, s, l }: Hsl): Rgb {
  const H = normalizeHue(h) / 360;
  const S = clamp01(s);
  const L = clamp01(l);
  if (S === 0) {
    const v = Math.round(L * 255);
    return { r: v, g: v, b: v };
  }
  const q = L < 0.5 ? L * (1 + S) : L + S - L * S;
  const p = 2 * L - q;
  const tR = H + 1 / 3;
  const tG = H;
  const tB = H - 1 / 3;
  return {
    r: Math.round(255 * hueToRgb(p, q, tR)),
    g: Math.round(255 * hueToRgb(p, q, tG)),
    b: Math.round(255 * hueToRgb(p, q, tB)),
  };
}

function hueToRgb(p: number, q: number, t: number): number {
  let u = t;
  if (u < 0) u += 1;
  if (u > 1) u -= 1;
  if (u < 1 / 6) return p + (q - p) * 6 * u;
  if (u < 1 / 2) return q;
  if (u < 2 / 3) return p + (q - p) * (2 / 3 - u) * 6;
  return p;
}

export function rgbToHsl({ r, g, b }: Rgb): Hsl {
  const R = clamp01(r / 255);
  const G = clamp01(g / 255);
  const B = clamp01(b / 255);
  const max = Math.max(R, G, B);
  const min = Math.min(R, G, B);
  const d = max - min;
  let h = 0;
  const l = (max + min) / 2;
  if (d === 0) {
    return { h: 0, s: 0, l };
  }
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  switch (max) {
    case R:
      h = ((G - B) / d + (G < B ? 6 : 0)) / 6;
      break;
    case G:
      h = ((B - R) / d + 2) / 6;
      break;
    default:
      h = ((R - G) / d + 4) / 6;
  }
  return { h: h * 360, s, l };
}

export function rgbToHex({ r, g, b }: Rgb): string {
  const to = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to(r)}${to(g)}${to(b)}`.toUpperCase();
}

export function hslToHex(hsl: Hsl): string {
  return rgbToHex(hslToRgb(hsl));
}

const HEX_RE = /^#?([0-9a-f]{6})$/i;

export function parseHex6(input: string): Rgb | null {
  const t = input.trim();
  const m = HEX_RE.exec(t);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function hexToHsl(hex: string): Hsl | null {
  const rgb = parseHex6(hex);
  return rgb ? rgbToHsl(rgb) : null;
}

export function formatHslCss(hsl: Hsl): string {
  const h = Math.round(normalizeHue(hsl.h));
  const s = Math.round(clamp01(hsl.s) * 100);
  const l = Math.round(clamp01(hsl.l) * 100);
  return `hsl(${h}deg ${s}% ${l}%)`;
}

export function formatRgbCss(rgb: Rgb): string {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
}

/** WCAG 2.x relative luminance (sRGB). */
export function relativeLuminance(rgb: Rgb): number {
  const lin = (c: number) => {
    const x = c / 255;
    return x <= 0.039_28 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  const r = lin(rgb.r);
  const g = lin(rgb.g);
  const b = lin(rgb.b);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function contrastRatio(rgbA: Rgb, rgbB: Rgb): number {
  const L1 = relativeLuminance(rgbA);
  const L2 = relativeLuminance(rgbB);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

const WHITE: Rgb = { r: 255, g: 255, b: 255 };
const BLACK: Rgb = { r: 0, g: 0, b: 0 };

export function contrastOnWhite(rgb: Rgb): number {
  return contrastRatio(rgb, WHITE);
}

export function contrastOnBlack(rgb: Rgb): number {
  return contrastRatio(rgb, BLACK);
}

function withHue(base: Hsl, h: number): Hsl {
  return { h: normalizeHue(h), s: base.s, l: base.l };
}

/** Harmony palettes: derived colors share S/L except monochromatic (same H/S, stepped L per spec). */
export function harmonyPalette(base: Hsl, rule: HarmonyRuleId): Hsl[] {
  const H = normalizeHue(base.h);
  switch (rule) {
    case "complementary":
      return [withHue(base, H), withHue(base, H + 180)];
    case "split":
      return [withHue(base, H), withHue(base, H + 150), withHue(base, H + 210)];
    case "triadic":
      return [withHue(base, H), withHue(base, H + 120), withHue(base, H + 240)];
    case "tetradic":
      return [
        withHue(base, H),
        withHue(base, H + 90),
        withHue(base, H + 180),
        withHue(base, H + 270),
      ];
    case "analogous":
      return [
        withHue(base, H - 60),
        withHue(base, H - 30),
        withHue(base, H),
        withHue(base, H + 30),
        withHue(base, H + 60),
      ];
    case "monochromatic":
      return [0, 1, 2, 3, 4].map((k) => ({
        h: H,
        s: base.s,
        l: clampLuma(base.l + (k - 2) * 0.15),
      }));
    default:
      return [base];
  }
}
