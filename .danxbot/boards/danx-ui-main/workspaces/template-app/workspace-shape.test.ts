/**
 * Regression test for the template-app workspace inject source
 * (DX-790 → renamed DX-887).
 *
 * The workspace is the danxbot-owned, consumer-free entry point that
 * 3rd-party consumers target via
 * `POST /api/launch { workspace: "template-app" }` to build one or more
 * Vue SFC apps. Pinning the shape here catches drift before the inject
 * mirror propagates a broken workspace into every connected repo's
 * `<repo>/.danxbot/workspaces/template-app/`.
 *
 * Invariants:
 *
 *   1. `workspace.yml` declares the placeholder contract dispatch core
 *      relies on. After DX-887 there is NO caller-supplied placeholder —
 *      template ids ride in the task prompt text, not the overlay.
 *      `DANXBOT_STOP_URL` + `DANXBOT_WORKER_PORT` are the only entries and
 *      are auto-injected by dispatch core. The retired `ACTIVE_TEMPLATE_ID`
 *      key MUST NOT reappear: nothing injects it into the overlay anymore
 *      (DX-883 stripped the launch-time scaffold trigger), so listing it
 *      would throw `PlaceholderError` at resolve time and break every
 *      template-app dispatch.
 *
 *   2. The `load_template_app` / `save_template_app` tool endpoints are NOT
 *      workspace placeholders — they travel as env vars on the MCP server
 *      (`mcp-registry.ts`), injected only when the dispatch's repo has
 *      `template_app` configured. Listing either as required would throw
 *      `PlaceholderError`; listing as optional would resolve to "" and
 *      silently misconfigure the server.
 *
 *   3. `.claude/settings.json` enables the `danxbot@newms-plugins` plugin
 *      (carries `autonomous-mode`, `halt-flag`, etc. — the
 *      no-interactive-prompt discipline every dispatched agent needs).
 *      Exposes `DANXBOT_WORKER_PORT` in the `env` block so the dispatched
 *      agent's bash sees it; does NOT expose the retired
 *      `ACTIVE_TEMPLATE_ID`.
 *
 *   4. `skills/template-app-build/SKILL.md` exists, forbids editing the
 *      three scaffold-infra files (`main.ts`, `package.json`, `index.html`),
 *      and drives the loop with the per-id `load_template_app` +
 *      `save_template_app` tools. The build pipeline downstream
 *      (`src/template-app/` — `hmr/` + `build/`) relies on the three infra
 *      files matching the scaffold contract; loosening that in the skill
 *      body would silently produce broken bundles. The legacy
 *      whole-dispatch save tool + the `ACTIVE_TEMPLATE_ID` / `app_url`
 *      launch fields are all retired (DX-885 / DX-883) and MUST NOT appear.
 *
 *   5. `CLAUDE.md` exists and names the workspace.
 *
 *   6. `mcp.template.json` ships as `{mcpServers: {}}` — presence required by the
 *      resolver, empty object keeps a future agent from copy-pasting another
 *      workspace's MCP servers wholesale.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";

const HERE = dirname(fileURLToPath(import.meta.url));

describe("template-app workspace shape (DX-887)", () => {
  it("workspace.yml declares the placeholder contract dispatch core expects", () => {
    const manifest = parseYaml(
      readFileSync(resolve(HERE, "workspace.yml"), "utf-8"),
    ) as {
      name?: string;
      "required-placeholders"?: string[];
      "optional-placeholders"?: string[];
      "required-gates"?: string[];
      "staging-paths"?: string[];
    };
    expect(manifest.name).toBe("template-app");
    expect([...(manifest["required-placeholders"] ?? [])].sort()).toEqual(
      ["DANXBOT_STOP_URL", "DANXBOT_WORKER_PORT"].sort(),
    );
    expect(manifest["optional-placeholders"] ?? []).toEqual([]);
    expect(manifest["required-gates"] ?? []).toEqual([]);
    expect(manifest["staging-paths"] ?? []).toEqual([]);
  });

  it("workspace.yml does NOT list the retired ACTIVE_TEMPLATE_ID placeholder (DX-887)", () => {
    // DX-887 retired `ACTIVE_TEMPLATE_ID`: template ids now ride in the
    // task prompt text. DX-883 already stripped the launch-time scaffold
    // trigger that used to inject the overlay key, so nothing supplies it
    // anymore — listing it as required would throw `PlaceholderError` at
    // resolve time and break every template-app dispatch.
    const manifest = parseYaml(
      readFileSync(resolve(HERE, "workspace.yml"), "utf-8"),
    ) as {
      "required-placeholders"?: string[];
      "optional-placeholders"?: string[];
    };
    const all = [
      ...(manifest["required-placeholders"] ?? []),
      ...(manifest["optional-placeholders"] ?? []),
    ];
    expect(all).not.toContain("ACTIVE_TEMPLATE_ID");
  });

  it("workspace.yml does NOT list the per-id template-app tool endpoints as placeholders", () => {
    // `DANXBOT_TEMPLATE_APP_LOAD_URL` / `DANXBOT_TEMPLATE_APP_SAVE_URL` are
    // set on the MCP server process via `src/agent/mcp-registry.ts` when the
    // dispatch's repo has `template_app` configured. They are never present
    // in the workspace overlay. Listing either as required would throw
    // `PlaceholderError` at resolve time; listing as optional would resolve
    // to "" and silently produce a misconfigured server.
    const manifest = parseYaml(
      readFileSync(resolve(HERE, "workspace.yml"), "utf-8"),
    ) as {
      "required-placeholders"?: string[];
      "optional-placeholders"?: string[];
    };
    const all = [
      ...(manifest["required-placeholders"] ?? []),
      ...(manifest["optional-placeholders"] ?? []),
    ];
    expect(all).not.toContain("DANXBOT_TEMPLATE_APP_LOAD_URL");
    expect(all).not.toContain("DANXBOT_TEMPLATE_APP_SAVE_URL");
  });

  it(".claude/settings.json enables the danxbot plugin", () => {
    const settings = JSON.parse(
      readFileSync(resolve(HERE, ".claude/settings.json"), "utf-8"),
    ) as { enabledPlugins?: Record<string, boolean> };
    expect(settings.enabledPlugins?.["danxbot@newms-plugins"]).toBe(true);
  });

  it(".claude/settings.json env block exposes DANXBOT_WORKER_PORT and NOT the retired ACTIVE_TEMPLATE_ID", () => {
    const settings = JSON.parse(
      readFileSync(resolve(HERE, ".claude/settings.json"), "utf-8"),
    ) as { env?: Record<string, string> };
    expect(settings.env?.DANXBOT_WORKER_PORT).toBe("${DANXBOT_WORKER_PORT}");
    expect(settings.env ?? {}).not.toHaveProperty("ACTIVE_TEMPLATE_ID");
  });

  it("skills/template-app-build/SKILL.md drives the per-id load+save loop and forbids editing scaffold-infra files", () => {
    const path = resolve(HERE, "skills/template-app-build/SKILL.md");
    const body = readFileSync(path, "utf-8");
    // The three scaffold-infra files MUST be named in a "do not edit"
    // context. The downstream build pipeline (`src/template-app/` —
    // `hmr/` + `build/`) relies on each matching the scaffold contract.
    expect(body).toMatch(/main\.ts/);
    expect(body).toMatch(/package\.json/);
    expect(body).toMatch(/index\.html/);
    // The skill MUST reference the canonical per-id tools (DX-884 / DX-885).
    expect(body).toMatch(/load_template_app/);
    expect(body).toMatch(/save_template_app/);
    // The retired whole-dispatch save tool, the `ACTIVE_TEMPLATE_ID`
    // overlay key, and the launch-time `app_url` field MUST NOT appear —
    // they were all hard-cut by DX-883 / DX-885 / DX-887. The legacy save
    // tool name is built at runtime so this test file itself does not
    // contain the literal token a verification grep polices.
    const LEGACY_SAVE = ["danxbot", "template", "save"].join("_");
    expect(body).not.toContain(LEGACY_SAVE);
    expect(body).not.toContain("ACTIVE_TEMPLATE_ID");
    expect(body).not.toContain("app_url");
  });

  it("CLAUDE.md exists and names the workspace", () => {
    const body = readFileSync(resolve(HERE, "CLAUDE.md"), "utf-8");
    expect(body).toMatch(/template-app/);
  });

  it("mcp.template.json ships as `{mcpServers: {}}` — no extra MCP servers, presence required", () => {
    // DX-828: `src/workspace/resolve.ts#writeMcpSettings` unconditionally
    // requires `mcp.template.json` on every dispatched workspace — a missing file
    // throws `WorkspaceFileMissingError` at spawn time. Generic consumers
    // still do not need playwright / danx-issue / Slack MCP; the danxbot
    // infra server (carrying `load_template_app` / `save_template_app` +
    // `danxbot_complete`) is injected at dispatch time by core.ts. So
    // template-app ships an empty `mcpServers` block — presence satisfies
    // the resolver; the empty object keeps a future agent from copy-pasting
    // `issue-worker`'s MCP servers wholesale.
    const path = resolve(HERE, "mcp.template.json");
    const parsed = JSON.parse(readFileSync(path, "utf-8")) as {
      mcpServers?: Record<string, unknown>;
    };
    expect(parsed.mcpServers).toEqual({});
  });
});
