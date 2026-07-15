import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";

describe("package.json — @vueuse/core and luxon optional peer dependencies", () => {
  it("declares @vueuse/core and luxon under peerDependencies", () => {
    expect(packageJson.peerDependencies).toHaveProperty("@vueuse/core");
    expect(packageJson.peerDependencies).toHaveProperty("luxon");
  });

  it("marks @vueuse/core and luxon optional in peerDependenciesMeta", () => {
    expect(packageJson.peerDependenciesMeta?.["@vueuse/core"]?.optional).toBe(true);
    expect(packageJson.peerDependenciesMeta?.luxon?.optional).toBe(true);
  });

  it("does not declare a dependencies field at all", () => {
    expect("dependencies" in packageJson).toBe(false);
  });

  it("exposes the ./formatters and ./actions subpaths that carry the peer-dependent code", () => {
    expect(packageJson.exports).toHaveProperty("./formatters");
    expect(packageJson.exports).toHaveProperty("./actions");
  });
});
