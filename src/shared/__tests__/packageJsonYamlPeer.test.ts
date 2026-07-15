import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";

describe("package.json — yaml optional peer dependency", () => {
  it("declares yaml under peerDependencies", () => {
    expect(packageJson.peerDependencies).toHaveProperty("yaml");
  });

  it("marks yaml optional in peerDependenciesMeta", () => {
    expect(packageJson.peerDependenciesMeta?.yaml?.optional).toBe(true);
  });

  it("does not declare a dependencies field at all", () => {
    expect("dependencies" in packageJson).toBe(false);
  });
});
