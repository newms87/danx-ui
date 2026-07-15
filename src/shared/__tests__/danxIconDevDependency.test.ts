import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";

describe("package.json — danx-icon devDependency-only", () => {
  it("declares danx-icon under devDependencies", () => {
    expect(packageJson.devDependencies).toHaveProperty("danx-icon");
  });

  it("does not declare danx-icon under peerDependencies", () => {
    expect(packageJson.peerDependencies).not.toHaveProperty("danx-icon");
  });

  it("does not declare a dependencies field at all", () => {
    expect("dependencies" in packageJson).toBe(false);
  });
});
