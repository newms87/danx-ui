import { describe, it, expect } from "vitest";
import { expectNoA11yViolations } from "../expectNoA11yViolations";

describe("expectNoA11yViolations", () => {
  it("resolves without throwing when the container has no violations", async () => {
    const container = document.createElement("div");
    container.innerHTML = `<button type="button">Click me</button>`;
    document.body.appendChild(container);

    await expect(expectNoA11yViolations(container)).resolves.toBeUndefined();

    document.body.removeChild(container);
  });

  it("fails with a descriptive message when violations are found", async () => {
    const container = document.createElement("div");
    container.innerHTML = `<img src="test.png" />`;
    document.body.appendChild(container);

    await expect(expectNoA11yViolations(container)).rejects.toThrow(
      /Accessibility violations found/
    );

    document.body.removeChild(container);
  });
});
