import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const tokensDir = join(import.meta.dirname, "..", "tokens");
const componentsDir = join(import.meta.dirname, "..", "..", "components");

function reducedMotionBlockOf(cssPath: string): string {
  const css = readFileSync(cssPath, "utf-8");
  const [, block] = css.split("@media (prefers-reduced-motion: reduce) {");
  if (!block) throw new Error(`prefers-reduced-motion block not found in ${cssPath}`);
  return block;
}

describe("prefers-reduced-motion: reduce", () => {
  it("neutralizes decorative transitions and animations globally when styles.css is imported", () => {
    const block = reducedMotionBlockOf(join(tokensDir, "reduced-motion.css"));
    expect(block).toMatch(/animation-duration:\s*0\.01ms\s*!important/);
    expect(block).toMatch(/transition-duration:\s*0\.01ms\s*!important/);
  });

  it("is wired into the token entry point so it ships library-wide", () => {
    const indexCss = readFileSync(join(tokensDir, "index.css"), "utf-8");
    expect(indexCss).toMatch(/@import\s+"\.\/reduced-motion\.css";/);
  });

  it("degrades the skeleton pulse and wave loops to a static state", () => {
    const block = reducedMotionBlockOf(join(componentsDir, "skeleton", "skeleton.css"));
    expect(block).toMatch(/\.danx-skeleton--pulse[^}]*animation:\s*none/s);
    expect(block).toMatch(/\.danx-skeleton--wave::after[^}]*animation:\s*none/s);
  });

  it("degrades the progress-bar indeterminate sweep to a static state", () => {
    const block = reducedMotionBlockOf(join(componentsDir, "progress-bar", "progress-bar.css"));
    expect(block).toMatch(/\.danx-progress-bar__indeterminate\s*{[^}]*animation:\s*none/s);
  });

  it("degrades the button spinner to a static state", () => {
    const block = reducedMotionBlockOf(join(componentsDir, "button", "button.css"));
    expect(block).toMatch(/\.danx-button__spinner\s*{[^}]*animation:\s*none/s);
  });

  it("degrades the editable-div spinner to a static state", () => {
    const block = reducedMotionBlockOf(join(componentsDir, "editable-div", "editable-div.css"));
    expect(block).toMatch(/\.danx-editable-div__spinner\s*{[^}]*animation:\s*none/s);
  });
});
