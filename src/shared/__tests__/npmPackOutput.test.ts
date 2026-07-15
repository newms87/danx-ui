import { execFileSync } from "child_process";
import { existsSync } from "fs";
import { resolve } from "path";
import { describe, expect, it } from "vitest";

const repoRoot = resolve(__dirname, "..", "..", "..");

describe("npm pack output — package size regression (DXUI-39)", () => {
  it(
    "ships no dist/node_modules entries, no .map files, and stays under the size budget",
    () => {
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

      expect(pkg.unpackedSize).toBeLessThan(1.8 * 1024 * 1024);
      expect(pkg.entryCount).toBeLessThan(1100);
    },
    30_000
  );
});
