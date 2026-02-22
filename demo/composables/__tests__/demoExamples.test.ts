import { describe, expect, it } from "vitest";
import { buildSetup, extractScript, extractStyle, extractTemplate } from "../useLivePreview";

/**
 * Validates that every demo example file compiles successfully through the
 * live preview pipeline. These files are loaded as raw strings at runtime
 * and bypass Vite's module resolution — imports are resolved from a flat
 * AVAILABLE_VALUES registry. A missing import (e.g. `ref` without
 * `import { ref } from "vue"`) silently fails with ReferenceError.
 *
 * This test catches those errors at build time.
 */

const exampleModules = import.meta.glob("../../pages/*-examples/*.vue", {
  query: "?raw",
  eager: true,
}) as Record<string, { default: string }>;

const examples = Object.entries(exampleModules).map(([path, mod]) => {
  // Shorten path for test names: "../../pages/dialog-examples/BasicDialog.vue" → "dialog-examples/BasicDialog.vue"
  const shortPath = path.replace("../../pages/", "");
  return { shortPath, source: mod.default };
});

describe("demo examples compile through useLivePreview", () => {
  it("glob matched at least one example file", () => {
    expect(examples.length).toBeGreaterThan(0);
  });

  it.each(examples)("$shortPath has a valid template", ({ source }) => {
    const template = extractTemplate(source);
    expect(template.length).toBeGreaterThan(0);
  });

  const examplesWithScript = examples.filter(({ source }) => extractScript(source) !== null);

  it.each(examplesWithScript)("$shortPath script compiles via buildSetup", ({ source }) => {
    const script = extractScript(source)!;
    const setup = buildSetup(script);
    expect(setup).not.toBeNull();
  });

  it.each(examplesWithScript)(
    "$shortPath setup function executes without throwing",
    ({ source }) => {
      const script = extractScript(source)!;
      const setup = buildSetup(script)!;
      expect(() => setup()).not.toThrow();
    }
  );

  const examplesWithStyle = examples.filter(({ source }) => extractStyle(source) !== null);

  if (examplesWithStyle.length > 0) {
    it.each(examplesWithStyle)("$shortPath style block extracts successfully", ({ source }) => {
      const style = extractStyle(source);
      expect(style).not.toBeNull();
      expect(style!.length).toBeGreaterThan(0);
    });
  }
});
