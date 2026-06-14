import { describe, expect, it } from "vitest";
import type { Ref } from "vue";
import { buildSetup, extractScript } from "../../../composables/useLivePreview";
import sharedIdentityRaw from "../SharedIdentity.vue?raw";
import rapidEditCausalityRaw from "../RapidEditCausality.vue?raw";

/**
 * Smoke test: the live-preview pipeline must be able to resolve every import in
 * these demo examples (from AVAILABLE_VALUES) and eval their scripts. `dev:check`
 * does NOT catch live-preview eval errors, so this guards them.
 */
describe("reactive-store demo examples", () => {
  it("SharedIdentity compiles and exposes its bindings", () => {
    const setup = buildSetup(extractScript(sharedIdentityRaw)!);
    expect(setup).not.toBeNull();
    const ctx = setup!();
    expect(ctx.renameFromElsewhere).toBeTypeOf("function");
    // Both views resolve to the one shared store instance.
    expect((ctx.viewA as Ref).value).toBe((ctx.viewB as Ref).value);
  });

  it("RapidEditCausality compiles and the user's latest edit survives a stale response", () => {
    const setup = buildSetup(extractScript(rapidEditCausalityRaw)!);
    expect(setup).not.toBeNull();
    const ctx = setup!();
    (ctx.rapidEdits as () => void)();
    const log = (ctx.log as Ref<string[]>).value;
    expect(log).toHaveLength(2);
    expect(log[0]).toContain("Second edit (latest)");
    expect(log[1]).toContain("Second edit (latest)");
  });
});
