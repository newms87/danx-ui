import { describe, it, expect } from "vitest";
import {
  DEFAULT_SWATCHES,
  clampAlpha,
  clampChannel,
  clampDegree,
  clampPercent,
  formatColor,
  hexToRgb,
  hslToRgb,
  hsvToRgb,
  isHex,
  parseColor,
  rgbToHex,
  rgbToHsl,
  rgbToHsv,
} from "../color-utils";

describe("color-utils", () => {
  describe("isHex", () => {
    it("accepts 3/4/6/8 digit hex", () => {
      expect(isHex("#abc")).toBe(true);
      expect(isHex("#abcd")).toBe(true);
      expect(isHex("#aabbcc")).toBe(true);
      expect(isHex("#aabbccdd")).toBe(true);
    });
    it("rejects garbage", () => {
      expect(isHex("abc")).toBe(false);
      expect(isHex("#zzz")).toBe(false);
      expect(isHex("")).toBe(false);
    });
  });

  describe("clamps", () => {
    it("channel clamps to [0, 255] integer", () => {
      expect(clampChannel(-1)).toBe(0);
      expect(clampChannel(999)).toBe(255);
      expect(clampChannel(127.6)).toBe(128);
      expect(clampChannel(Number.NaN)).toBe(0);
    });
    it("alpha clamps to [0, 1]", () => {
      expect(clampAlpha(-1)).toBe(0);
      expect(clampAlpha(2)).toBe(1);
      expect(clampAlpha(0.5)).toBe(0.5);
      expect(clampAlpha(Number.NaN)).toBe(1);
    });
    it("degree wraps to [0, 360)", () => {
      expect(clampDegree(-45)).toBe(315);
      expect(clampDegree(400)).toBe(40);
      expect(clampDegree(0)).toBe(0);
      expect(clampDegree(Number.NaN)).toBe(0);
    });
    it("percent clamps to [0, 100]", () => {
      expect(clampPercent(-5)).toBe(0);
      expect(clampPercent(150)).toBe(100);
      expect(clampPercent(50)).toBe(50);
      expect(clampPercent(Number.NaN)).toBe(0);
    });
  });

  describe("hex parse / format", () => {
    it("expands 3-digit", () => {
      expect(hexToRgb("#abc")).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    });
    it("expands 4-digit (alpha)", () => {
      const out = hexToRgb("#abcf");
      expect(out).toEqual({ r: 170, g: 187, b: 204, a: 1 });
    });
    it("parses 6-digit", () => {
      expect(hexToRgb("#3b82f6")).toEqual({ r: 59, g: 130, b: 246, a: 1 });
    });
    it("parses 8-digit (alpha)", () => {
      const out = hexToRgb("#3b82f680");
      expect(out!.r).toBe(59);
      expect(out!.a).toBeCloseTo(128 / 255, 2);
    });
    it("returns null for non-hex", () => {
      expect(hexToRgb("nope")).toBeNull();
    });
    it("formats hex without alpha by default", () => {
      expect(rgbToHex({ r: 59, g: 130, b: 246, a: 1 })).toBe("#3b82f6");
    });
    it("formats hex with alpha when requested", () => {
      expect(rgbToHex({ r: 0, g: 0, b: 0, a: 0.5 }, true)).toMatch(/^#00000080$/);
    });
  });

  describe("round-trips", () => {
    const samples = ["#000000", "#ffffff", "#3b82f6", "#ef4444", "#22c55e", "#7c3aed"];
    it("RGB -> HSV -> RGB", () => {
      for (const hex of samples) {
        const rgb = hexToRgb(hex)!;
        const back = hsvToRgb(rgbToHsv(rgb));
        expect(back.r).toBe(rgb.r);
        expect(back.g).toBe(rgb.g);
        expect(back.b).toBe(rgb.b);
      }
    });
    it("RGB -> HSL -> RGB", () => {
      for (const hex of samples) {
        const rgb = hexToRgb(hex)!;
        const back = hslToRgb(rgbToHsl(rgb));
        expect(back.r).toBe(rgb.r);
        expect(back.g).toBe(rgb.g);
        expect(back.b).toBe(rgb.b);
      }
    });
  });

  describe("rgbToHsv / rgbToHsl edge cases", () => {
    it("returns hue 0 for grayscale", () => {
      const hsv = rgbToHsv({ r: 128, g: 128, b: 128, a: 1 });
      expect(hsv.h).toBe(0);
      expect(hsv.s).toBe(0);
      const hsl = rgbToHsl({ r: 128, g: 128, b: 128, a: 1 });
      expect(hsl.h).toBe(0);
      expect(hsl.s).toBe(0);
    });
    it("max=green branch", () => {
      const hsv = rgbToHsv({ r: 0, g: 255, b: 0, a: 1 });
      expect(Math.round(hsv.h)).toBe(120);
    });
    it("max=blue branch", () => {
      const hsv = rgbToHsv({ r: 0, g: 0, b: 255, a: 1 });
      expect(Math.round(hsv.h)).toBe(240);
    });
    it("HSL max=red branch", () => {
      const hsl = rgbToHsl({ r: 255, g: 0, b: 0, a: 1 });
      expect(Math.round(hsl.h)).toBe(0);
    });
    it("HSL max=green branch", () => {
      const hsl = rgbToHsl({ r: 0, g: 255, b: 0, a: 1 });
      expect(Math.round(hsl.h)).toBe(120);
    });
    it("HSL max=blue branch", () => {
      const hsl = rgbToHsl({ r: 0, g: 0, b: 255, a: 1 });
      expect(Math.round(hsl.h)).toBe(240);
    });
    it("HSV wraps negative hue (red dominant, blue > green)", () => {
      const hsv = rgbToHsv({ r: 255, g: 0, b: 64, a: 1 });
      expect(hsv.h).toBeGreaterThanOrEqual(0);
      expect(hsv.h).toBeLessThan(360);
    });
    it("HSL wraps negative hue (red dominant, blue > green)", () => {
      const hsl = rgbToHsl({ r: 255, g: 0, b: 64, a: 1 });
      expect(hsl.h).toBeGreaterThanOrEqual(0);
      expect(hsl.h).toBeLessThan(360);
    });
  });

  describe("hsvToRgb / hslToRgb sector coverage", () => {
    const hues = [0, 45, 90, 135, 180, 225, 270, 315];
    it("hsvToRgb covers every sector", () => {
      for (const h of hues) {
        const rgb = hsvToRgb({ h, s: 80, v: 80, a: 1 });
        expect(rgb.r).toBeGreaterThanOrEqual(0);
      }
    });
    it("hslToRgb covers every sector", () => {
      for (const h of hues) {
        const rgb = hslToRgb({ h, s: 80, l: 50, a: 1 });
        expect(rgb.r).toBeGreaterThanOrEqual(0);
      }
    });
  });

  describe("parseColor", () => {
    it("returns null for empty / unknown", () => {
      expect(parseColor("")).toBeNull();
      expect(parseColor("nothing-real")).toBeNull();
    });
    it("parses hex", () => {
      expect(parseColor("#3b82f6")).toEqual({ r: 59, g: 130, b: 246, a: 1 });
    });
    it("parses rgb()", () => {
      expect(parseColor("rgb(10, 20, 30)")).toEqual({ r: 10, g: 20, b: 30, a: 1 });
    });
    it("parses rgba() with float alpha", () => {
      expect(parseColor("rgba(10, 20, 30, 0.5)")).toEqual({ r: 10, g: 20, b: 30, a: 0.5 });
    });
    it("parses rgba() with percent alpha", () => {
      const out = parseColor("rgba(10, 20, 30, 50%)");
      expect(out!.a).toBeCloseTo(0.5, 3);
    });
    it("parses hsl() + hsla()", () => {
      const rgb = parseColor("hsl(0, 100%, 50%)");
      expect(rgb!.r).toBe(255);
      const rgba = parseColor("hsla(0, 100%, 50%, 0.25)");
      expect(rgba!.a).toBe(0.25);
    });
  });

  describe("formatColor", () => {
    const rgb = { r: 59, g: 130, b: 246, a: 1 };
    it("hex", () => {
      expect(formatColor(rgb, "hex")).toBe("#3b82f6");
    });
    it("hex carries alpha when a<1", () => {
      expect(formatColor({ ...rgb, a: 0.5 }, "hex")).toMatch(/^#3b82f680$/);
    });
    it("rgb()", () => {
      expect(formatColor(rgb, "rgb")).toBe("rgb(59, 130, 246)");
    });
    it("rgba()", () => {
      expect(formatColor({ ...rgb, a: 0.4 }, "rgba")).toBe("rgba(59, 130, 246, 0.4)");
    });
    it("hsl()", () => {
      expect(formatColor({ r: 255, g: 0, b: 0, a: 1 }, "hsl")).toMatch(/^hsl\(0, 100%, 50%\)$/);
    });
    it("hsla()", () => {
      expect(formatColor({ r: 255, g: 0, b: 0, a: 0.5 }, "hsla")).toMatch(
        /^hsla\(0, 100%, 50%, 0\.5\)$/
      );
    });
  });

  describe("DEFAULT_SWATCHES", () => {
    it("ships a non-empty curated set", () => {
      expect(DEFAULT_SWATCHES.length).toBeGreaterThan(0);
      for (const c of DEFAULT_SWATCHES) {
        expect(parseColor(c)).not.toBeNull();
      }
    });
  });
});
