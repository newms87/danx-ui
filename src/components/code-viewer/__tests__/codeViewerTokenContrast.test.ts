import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const cssPath = join(import.meta.dirname, "..", "code-viewer-tokens.css");
const css = readFileSync(cssPath, "utf-8");

function tokenValue(block: string, name: string): string {
  const match = block.match(new RegExp(`--${name}:\\s*([^;]+);`));
  if (!match?.[1]) throw new Error(`Token --${name} not found`);
  return match[1].trim();
}

function hexToLuminance(hex: string): number {
  const value = hex.replace("#", "");
  const r = parseInt(value.substring(0, 2), 16) / 255;
  const g = parseInt(value.substring(2, 4), 16) / 255;
  const b = parseInt(value.substring(4, 6), 16) / 255;
  const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(hexA: string, hexB: string): number {
  const lumA = hexToLuminance(hexA);
  const lumB = hexToLuminance(hexB);
  const lighter = Math.max(lumA, lumB);
  const darker = Math.min(lumA, lumB);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("code-viewer light theme text token contrast", () => {
  const [, lightBlock] = css.split(".dx-code-viewer.theme-light {");
  if (!lightBlock) throw new Error("Light theme block not found in code-viewer-tokens.css");

  it("footer text is legible against the light footer background", () => {
    const text = tokenValue(lightBlock, "dx-code-viewer-footer-text");
    const bg = tokenValue(lightBlock, "dx-code-viewer-footer-bg");
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("footer error text is legible against the light footer background", () => {
    const text = tokenValue(lightBlock, "dx-code-viewer-footer-error-text");
    const bg = tokenValue(lightBlock, "dx-code-viewer-footer-bg");
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it("collapse toggle text is legible against the light collapsed background", () => {
    const text = tokenValue(lightBlock, "dx-code-viewer-collapse-toggle-text");
    const bg = tokenValue(lightBlock, "dx-code-viewer-collapsed-bg");
    expect(contrastRatio(text, bg)).toBeGreaterThanOrEqual(3);
  });
});
