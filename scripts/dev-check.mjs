#!/usr/bin/env node
// DXUI-85: derive the dev server port from vite.config.ts so dev:check can't drift from it
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
import { spawnSync } from "child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const viteConfigPath = resolve(__dirname, "../vite.config.ts");
const viteConfig = readFileSync(viteConfigPath, "utf-8");

const match = viteConfig.match(/server:\s*{\s*port:\s*(\d+)/);
if (!match) {
  console.error(`Could not find server.port in ${viteConfigPath}`);
  process.exit(1);
}
const port = match[1];

const curl = spawnSync("curl", ["-s", "-o", "/dev/null", "-w", "%{http_code}", `http://localhost:${port}`], {
  stdio: "inherit",
});
if (curl.status !== 0) {
  console.error(`\nDev server not reachable on port ${port}`);
  process.exit(curl.status ?? 1);
}

const tsc = spawnSync("vue-tsc", ["--noEmit"], { stdio: "inherit" });
process.exit(tsc.status ?? 1);
