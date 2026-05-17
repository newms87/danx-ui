/**
 * Pure color conversion + parsing utilities used by DanxColorPicker.
 *
 * All conversions round-trip losslessly within the precision of an 8-bit
 * RGB channel. HSV/HSL are computed in [0,1] internally and exposed as
 * `{ h: 0-360, s: 0-100, v: 0-100 }` / `{ h: 0-360, s: 0-100, l: 0-100 }`
 * to match the on-screen number inputs.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface HSV {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
  a: number;
}

export type ColorFormat = "hex" | "rgb" | "rgba" | "hsl" | "hsla";

const HEX_3 = /^#([0-9a-fA-F]{3})$/;
const HEX_4 = /^#([0-9a-fA-F]{4})$/;
const HEX_6 = /^#([0-9a-fA-F]{6})$/;
const HEX_8 = /^#([0-9a-fA-F]{8})$/;
const RGB_RE =
  /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)\s*(?:[,/ ]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i;
const HSL_RE =
  /^hsla?\(\s*(\d+(?:\.\d+)?)\s*[, ]\s*(\d+(?:\.\d+)?)%?\s*[, ]\s*(\d+(?:\.\d+)?)%?\s*(?:[,/ ]\s*(\d+(?:\.\d+)?%?))?\s*\)$/i;

export function isHex(value: string): boolean {
  return HEX_3.test(value) || HEX_4.test(value) || HEX_6.test(value) || HEX_8.test(value);
}

export function clampChannel(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(255, Math.round(n)));
}

export function clampAlpha(n: number): number {
  if (!Number.isFinite(n)) return 1;
  return Math.max(0, Math.min(1, n));
}

export function clampDegree(n: number): number {
  if (!Number.isFinite(n)) return 0;
  const m = n % 360;
  return m < 0 ? m + 360 : m;
}

export function clampPercent(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(100, n));
}

function toHexByte(n: number): string {
  return clampChannel(n).toString(16).padStart(2, "0");
}

/**
 * Parse a hex string into RGB. Accepts #rgb, #rgba, #rrggbb, #rrggbbaa.
 * Returns `null` for any unrecognized shape.
 */
export function hexToRgb(hex: string): RGB | null {
  let m: RegExpMatchArray | null;
  if ((m = hex.match(HEX_3))) {
    const [r, g, b] = m[1]!.split("").map((c) => parseInt(c + c, 16));
    return { r: r!, g: g!, b: b!, a: 1 };
  }
  if ((m = hex.match(HEX_4))) {
    const [r, g, b, a] = m[1]!.split("").map((c) => parseInt(c + c, 16));
    return { r: r!, g: g!, b: b!, a: a! / 255 };
  }
  if ((m = hex.match(HEX_6))) {
    const v = m[1]!;
    return {
      r: parseInt(v.slice(0, 2), 16),
      g: parseInt(v.slice(2, 4), 16),
      b: parseInt(v.slice(4, 6), 16),
      a: 1,
    };
  }
  if ((m = hex.match(HEX_8))) {
    const v = m[1]!;
    return {
      r: parseInt(v.slice(0, 2), 16),
      g: parseInt(v.slice(2, 4), 16),
      b: parseInt(v.slice(4, 6), 16),
      a: parseInt(v.slice(6, 8), 16) / 255,
    };
  }
  return null;
}

export function rgbToHex({ r, g, b, a }: RGB, withAlpha = false): string {
  const base = `#${toHexByte(r)}${toHexByte(g)}${toHexByte(b)}`;
  if (!withAlpha || a >= 1) return base;
  return `${base}${toHexByte(Math.round(clampAlpha(a) * 255))}`;
}

export function rgbToHsv({ r, g, b, a }: RGB): HSV {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : (d / max) * 100;
  const v = max * 100;
  return { h, s, v, a };
}

export function hsvToRgb({ h, s, v, a }: HSV): RGB {
  const hn = clampDegree(h) / 60;
  const sn = clampPercent(s) / 100;
  const vn = clampPercent(v) / 100;
  const c = vn * sn;
  const x = c * (1 - Math.abs((hn % 2) - 1));
  const m = vn - c;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hn < 1) [rp, gp, bp] = [c, x, 0];
  else if (hn < 2) [rp, gp, bp] = [x, c, 0];
  else if (hn < 3) [rp, gp, bp] = [0, c, x];
  else if (hn < 4) [rp, gp, bp] = [0, x, c];
  else if (hn < 5) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: clampChannel((rp + m) * 255),
    g: clampChannel((gp + m) * 255),
    b: clampChannel((bp + m) * 255),
    a: clampAlpha(a),
  };
}

export function rgbToHsl({ r, g, b, a }: RGB): HSL {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / d) % 6;
    else if (max === gn) h = (bn - rn) / d + 2;
    else h = (rn - gn) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: s * 100, l: l * 100, a };
}

export function hslToRgb({ h, s, l, a }: HSL): RGB {
  const hn = clampDegree(h) / 60;
  const sn = clampPercent(s) / 100;
  const ln = clampPercent(l) / 100;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs((hn % 2) - 1));
  const m = ln - c / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (hn < 1) [rp, gp, bp] = [c, x, 0];
  else if (hn < 2) [rp, gp, bp] = [x, c, 0];
  else if (hn < 3) [rp, gp, bp] = [0, c, x];
  else if (hn < 4) [rp, gp, bp] = [0, x, c];
  else if (hn < 5) [rp, gp, bp] = [x, 0, c];
  else [rp, gp, bp] = [c, 0, x];
  return {
    r: clampChannel((rp + m) * 255),
    g: clampChannel((gp + m) * 255),
    b: clampChannel((bp + m) * 255),
    a: clampAlpha(a),
  };
}

/**
 * Parse any supported color string into RGB. Returns `null` when nothing matches.
 * Accepts hex (3/4/6/8 digit), `rgb()`, `rgba()`, `hsl()`, `hsla()`.
 */
export function parseColor(raw: string): RGB | null {
  if (!raw) return null;
  const v = raw.trim();
  const fromHex = hexToRgb(v);
  if (fromHex) return fromHex;

  const rgbMatch = v.match(RGB_RE);
  if (rgbMatch) {
    const [, r, g, b, alpha] = rgbMatch;
    return {
      r: clampChannel(parseFloat(r!)),
      g: clampChannel(parseFloat(g!)),
      b: clampChannel(parseFloat(b!)),
      a: parseAlphaToken(alpha),
    };
  }
  const hslMatch = v.match(HSL_RE);
  if (hslMatch) {
    const [, h, s, l, alpha] = hslMatch;
    return hslToRgb({
      h: parseFloat(h!),
      s: parseFloat(s!),
      l: parseFloat(l!),
      a: parseAlphaToken(alpha),
    });
  }
  return null;
}

function parseAlphaToken(raw: string | undefined): number {
  if (raw === undefined) return 1;
  if (raw.endsWith("%")) return clampAlpha(parseFloat(raw) / 100);
  return clampAlpha(parseFloat(raw));
}

/**
 * Format an RGB value into the requested output format. Hex output keeps the
 * alpha channel only when `a < 1` (8-digit hex); other formats explicitly use
 * their `a`-suffix variant when `alpha` is enabled OR `a < 1`.
 */
export function formatColor(rgb: RGB, format: ColorFormat): string {
  const a = clampAlpha(rgb.a);
  switch (format) {
    case "hex":
      return rgbToHex(rgb, a < 1);
    case "rgb":
      return `rgb(${clampChannel(rgb.r)}, ${clampChannel(rgb.g)}, ${clampChannel(rgb.b)})`;
    case "rgba":
      return `rgba(${clampChannel(rgb.r)}, ${clampChannel(rgb.g)}, ${clampChannel(rgb.b)}, ${roundAlpha(a)})`;
    case "hsl": {
      const hsl = rgbToHsl(rgb);
      return `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`;
    }
    case "hsla": {
      const hsl = rgbToHsl(rgb);
      return `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${roundAlpha(a)})`;
    }
  }
}

function roundAlpha(a: number): string {
  return (Math.round(a * 1000) / 1000).toString();
}

/**
 * Curated default swatch palette. Eight columns × three rows covering grays,
 * status colors, and a Tailwind-leaning hue ladder. Designed to scan well in
 * both light and dark themes and to give operators a sensible starting set
 * without having to author one.
 */
export const DEFAULT_SWATCHES: string[] = [
  "#000000",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#f3f4f6",
  "#ffffff",
  "#f43f5e",
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#eab308",
  "#84cc16",
  "#22c55e",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#0ea5e9",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#a855f7",
  "#d946ef",
  "#ec4899",
];
