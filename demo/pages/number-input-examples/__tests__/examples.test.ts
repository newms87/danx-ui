import { describe, expect, it } from "vitest";
import { defineComponent } from "vue";
import { mount } from "@vue/test-utils";
import {
  REGISTERED_COMPONENTS,
  buildSetup,
  extractScript,
  extractTemplate,
} from "../../../composables/useLivePreview";

import basicUsage from "../BasicUsage.vue?raw";
import minMaxClamping from "../MinMaxClamping.vue?raw";
import decimalSteps from "../DecimalSteps.vue?raw";
import holdToRepeat from "../HoldToRepeat.vue?raw";
import sizesAndStates from "../SizesAndStates.vue?raw";
import theming from "../Theming.vue?raw";

const EXAMPLES = [
  ["BasicUsage", basicUsage],
  ["MinMaxClamping", minMaxClamping],
  ["DecimalSteps", decimalSteps],
  ["HoldToRepeat", holdToRepeat],
  ["SizesAndStates", sizesAndStates],
  ["Theming", theming],
] as const;

/**
 * Compile a demo example exactly the way the live preview does, then MOUNT it.
 * The shared demoExamples smoke test only evaluates each script; it never
 * renders, so these mounts are the end-to-end proof the page actually works.
 */
function compileAndMount(source: string) {
  const setup = buildSetup(extractScript(source)!);
  expect(setup).not.toBeNull();
  return mount(
    defineComponent({
      template: extractTemplate(source),
      components: REGISTERED_COMPONENTS,
      setup: setup!,
    })
  );
}

describe("number-input demo examples render", () => {
  it.each(EXAMPLES)("%s mounts with a working field", (_name, source) => {
    const w = compileAndMount(source);
    expect(w.find(".danx-number-input__native").exists()).toBe(true);
    w.unmount();
  });
});

describe("number-input demo examples behave", () => {
  it("BasicUsage steps the bound value and reports null for an empty field", async () => {
    const w = compileAndMount(basicUsage);

    await w.find(".danx-number-input__stepper--increment").trigger("mousedown");

    expect(w.text()).toContain("Quantity: 2");
    // The second field starts empty, which must read as null and never 0.
    expect(w.text()).toContain("null (empty)");
    w.unmount();
  });

  it("MinMaxClamping disables the stepper at the ceiling", async () => {
    const w = compileAndMount(minMaxClamping);
    const increment = w.findAll(".danx-number-input__stepper--increment")[0]!;

    // 4 → 8 is the max; the next press must be refused by a disabled button.
    for (let i = 0; i < 4; i++) await increment.trigger("mousedown");

    expect(w.text()).toContain("Seats: 8");
    expect((increment.element as HTMLButtonElement).disabled).toBe(true);
    w.unmount();
  });

  it("MinMaxClamping settles an out-of-range typed value on blur, not mid-keystroke", async () => {
    const w = compileAndMount(minMaxClamping);
    const input = w.findAll(".danx-number-input__native")[0]!;

    await input.setValue("99");
    expect(w.text()).toContain("Seats: 99");

    await input.trigger("blur");

    expect(w.text()).toContain("Seats: 8");
    w.unmount();
  });

  it("DecimalSteps adds 0.1 to 0.2 without float drift", async () => {
    const w = compileAndMount(decimalSteps);

    await w.findAll(".danx-number-input__stepper--increment")[0]!.trigger("mousedown");

    expect(w.text()).toContain("Price: 0.3");
    expect(w.text()).not.toContain("0.30000000000000004");
    w.unmount();
  });

  it("SizesAndStates renders every size and leaves the disabled field inert", async () => {
    const w = compileAndMount(sizesAndStates);
    const inputs = w.findAll(".danx-number-input__native");

    expect(inputs.length).toBe(6);
    const disabled = inputs[5]!.element as HTMLInputElement;
    expect(disabled.disabled).toBe(true);
    w.unmount();
  });

  it("Theming scopes its token overrides to a wrapper", () => {
    const w = compileAndMount(theming);
    expect(w.find(".number-input-branded").exists()).toBe(true);
    w.unmount();
  });
});
