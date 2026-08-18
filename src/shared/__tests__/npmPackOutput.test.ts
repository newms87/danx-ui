import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";
// Shared with the check:package-size prepublish script. These two enforcement
// points previously hardcoded the budget separately and had already drifted
// (1150 files there, 1100 here).
import { MAX_FILE_COUNT, MAX_UNPACKED_BYTES } from "../../../scripts/package-size-budget.mjs";

const repoRoot = resolve(__dirname, "..", "..", "..");

describe("npm pack output — package size regression (DXUI-39)", () => {
  it("ships no dist/node_modules entries, no .map files, and stays under the size budget", () => {
    if (!existsSync(resolve(repoRoot, "dist", "index.js"))) {
      execFileSync("npx", ["vite", "build"], { cwd: repoRoot, stdio: "pipe" });
    }

    const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
      cwd: repoRoot,
      encoding: "utf-8",
    });
    const [pkg] = JSON.parse(output);

    const nodeModulesEntries = pkg.files.filter((f: { path: string }) =>
      f.path.includes("dist/node_modules/")
    );
    expect(nodeModulesEntries).toHaveLength(0);

    const mapEntries = pkg.files.filter((f: { path: string }) => f.path.endsWith(".map"));
    expect(mapEntries).toHaveLength(0);

    // Consumers get no value from type declarations for our own test files.
    const testEntries = pkg.files.filter((f: { path: string }) => f.path.includes("__tests__"));
    expect(testEntries).toHaveLength(0);

    expect(pkg.unpackedSize).toBeLessThan(MAX_UNPACKED_BYTES);
    expect(pkg.entryCount).toBeLessThan(MAX_FILE_COUNT);
  }, 30_000);
});
