import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";

// DXUI-143: guards against the exports map drifting from src/components/*
// again — run `npm run generate:exports` (or `npm run check:exports-drift`
// in CI) if this fails.
const componentsDir = join(__dirname, "../../components");

function kebabCase(name: string) {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

describe("package.json — exports map matches src/components/*", () => {
  const componentNames = readdirSync(componentsDir).filter((name) =>
    statSync(join(componentsDir, name)).isDirectory()
  );

  it.each(componentNames)("%s has a ./components/<name> subpath if it ships index.ts", (name) => {
    const hasIndex = existsSync(join(componentsDir, name, "index.ts"));
    if (!hasIndex) return;
    expect(packageJson.exports).toHaveProperty(`./components/${name}`);
  });

  it.each(componentNames)(
    "%s has a ./components/<name>/styles subpath if it ships a matching css file",
    (name) => {
      const cssFile = `${kebabCase(name)}.css`;
      const hasCss = existsSync(join(componentsDir, name, cssFile));
      if (!hasCss) return;
      expect(packageJson.exports).toHaveProperty(`./components/${name}/styles`);
    }
  );

  it("does not list a ./components/<name> subpath for a directory that no longer exists", () => {
    const generatedKeys = Object.keys(packageJson.exports).filter((key) =>
      /^\.\/components\/[^/]+$/.test(key)
    );
    for (const key of generatedKeys) {
      const name = key.replace("./components/", "");
      expect(componentNames).toContain(name);
    }
  });
});
