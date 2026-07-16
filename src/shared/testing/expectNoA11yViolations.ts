import axe from "axe-core";
import { expect } from "vitest";

/**
 * Rules disabled here don't fit component-scoped unit tests:
 * - color-contrast: happy-dom has no canvas/rendering backend, so contrast
 *   math against computed styles is unreliable there.
 * - region: flags any content outside a page landmark (<main>, <nav>, ...),
 *   which every isolated component mount trips since there's no surrounding
 *   page chrome. That's a page-layout concern, not a component one.
 */
const AXE_OPTIONS: axe.RunOptions = {
  rules: {
    "color-contrast": { enabled: false },
    region: { enabled: false },
  },
};

export async function expectNoA11yViolations(container: Element): Promise<void> {
  const results = await axe.run(container, AXE_OPTIONS);

  if (results.violations.length > 0) {
    const message = results.violations
      .map(
        (violation) =>
          `${violation.id} (${violation.impact}): ${violation.help}\n` +
          violation.nodes.map((node) => `  - ${node.target.join(" ")}`).join("\n")
      )
      .join("\n\n");

    expect.fail(`Accessibility violations found:\n\n${message}`);
  }
}
