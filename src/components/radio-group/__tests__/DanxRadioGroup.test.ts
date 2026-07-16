import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxRadioGroup from "../DanxRadioGroup.vue";
import type { RadioGroupOption, RadioGroupSize } from "../types";
import type { VariantType } from "../../../shared/types";

const allSizes: RadioGroupSize[] = ["sm", "md", "lg"];
const colorVariants: VariantType[] = ["danger", "success", "warning", "info", "muted"];

const options: RadioGroupOption[] = [
  { value: "a", label: "Option A" },
  { value: "b", label: "Option B" },
  { value: "c", label: "Option C" },
];

let warnSpy: ReturnType<typeof vi.spyOn>;
const attachedWrappers: VueWrapper[] = [];

function mountAttached(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxRadioGroup, {
    props: { options, ...props },
    attachTo: document.body,
  });
  attachedWrappers.push(wrapper);
  return wrapper;
}

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  const vueWarns = warnSpy.mock.calls.filter((args: unknown[]) =>
    args.some((a: unknown) => typeof a === "string" && a.startsWith("[Vue warn]"))
  );
  expect(vueWarns, "expected zero [Vue warn] in test").toEqual([]);

  while (attachedWrappers.length > 0) {
    attachedWrappers.pop()?.unmount();
  }
  warnSpy.mockRestore();
});

describe("DanxRadioGroup", () => {
  describe("Rendering", () => {
    it("renders role=radiogroup on the container", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      expect(wrapper.find("[role='radiogroup']").exists()).toBe(true);
    });

    it("renders one native radio input per option", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      const inputs = wrapper.findAll("input[type='radio']");
      expect(inputs).toHaveLength(3);
    });

    it("renders default label text for each option", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      expect(wrapper.text()).toContain("Option A");
      expect(wrapper.text()).toContain("Option B");
      expect(wrapper.text()).toContain("Option C");
    });

    it("shares one name attribute across all radio inputs", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      const names = wrapper.findAll("input[type='radio']").map((i) => i.attributes("name"));
      expect(new Set(names).size).toBe(1);
      expect(names[0]).toBeTruthy();
    });

    it("uses the name prop when provided instead of auto-generating one", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, name: "plan" } });

      const names = wrapper.findAll("input[type='radio']").map((i) => i.attributes("name"));
      expect(names.every((n) => n === "plan")).toBe(true);
    });

    it("renders vertical orientation by default", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      expect(wrapper.find(".danx-radio-group").classes()).toContain("danx-radio-group--vertical");
    });

    it("renders horizontal orientation when specified", () => {
      const wrapper = mount(DanxRadioGroup, {
        props: { options, orientation: "horizontal" },
      });

      expect(wrapper.find(".danx-radio-group").classes()).toContain("danx-radio-group--horizontal");
    });

    it("aria-hidden=true on the visual dot keeps the AT tree single-control", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      expect(wrapper.find(".danx-radio__dot").attributes("aria-hidden")).toBe("true");
    });
  });

  describe("Edge cases", () => {
    it("renders no radio inputs for an empty options array", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options: [] } });

      expect(wrapper.findAll("input[type='radio']")).toHaveLength(0);
      expect(wrapper.find("[role='radiogroup']").exists()).toBe(true);
    });

    it("does not throw when navigating keyboard on an empty options array", async () => {
      const wrapper = mount(DanxRadioGroup, { props: { options: [] } });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not emit or move focus when every option is disabled", async () => {
      const allDisabled = options.map((o) => ({ ...o, disabled: true }));
      const wrapper = mountAttached({ options: allDisabled, modelValue: "a" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("marks every radio input disabled when every option is disabled", () => {
      const allDisabled = options.map((o) => ({ ...o, disabled: true }));
      const wrapper = mount(DanxRadioGroup, { props: { options: allDisabled } });

      const inputs = wrapper.findAll<HTMLInputElement>("input[type='radio']");
      expect(inputs.every((i) => i.element.disabled)).toBe(true);
    });
  });

  describe("v-model", () => {
    it("defaults to null when no modelValue is provided", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      const inputs = wrapper.findAll<HTMLInputElement>("input[type='radio']");
      expect(inputs.every((i) => i.element.checked === false)).toBe(true);
    });

    it("checks the radio matching modelValue", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, modelValue: "b" } });

      const inputs = wrapper.findAll<HTMLInputElement>("input[type='radio']");
      expect(inputs[0]?.element.checked).toBe(false);
      expect(inputs[1]?.element.checked).toBe(true);
      expect(inputs[2]?.element.checked).toBe(false);
    });

    it("emits update:modelValue with the option's value when a radio is selected", async () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, modelValue: "a" } });

      await wrapper.findAll("input[type='radio']")[1]?.trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([["b"]]);
    });

    it("supports numeric option values", async () => {
      const numericOptions: RadioGroupOption[] = [
        { value: 1, label: "One" },
        { value: 2, label: "Two" },
      ];
      const wrapper = mount(DanxRadioGroup, {
        props: { options: numericOptions, modelValue: 1 },
      });

      await wrapper.findAll("input[type='radio']")[1]?.trigger("change");

      expect(wrapper.emitted("update:modelValue")).toEqual([[2]]);
    });

    it("does not emit when a disabled option's radio is changed", async () => {
      const withDisabled = [options[0]!, { ...options[1]!, disabled: true }, options[2]!];
      const wrapper = mount(DanxRadioGroup, { props: { options: withDisabled, modelValue: "a" } });

      const disabledInput = wrapper.findAll<HTMLInputElement>("input[type='radio']")[1]!;
      expect(disabledInput.element.disabled).toBe(true);

      // Force a change event through even though the browser blocks user
      // interaction on disabled elements — selectOption() must still guard.
      disabledInput.element.dispatchEvent(new Event("change"));
      await wrapper.vm.$nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not emit when the group is disabled and a change event fires", async () => {
      const wrapper = mount(DanxRadioGroup, {
        props: { options, modelValue: "a", disabled: true },
      });

      // Even if a change event were forced through, selectOption() guards on
      // isOptionDisabled() (group-level disabled included).
      await wrapper.findAll("input[type='radio']")[1]!.trigger("change");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with the matching BEM modifier class", (size) => {
      const wrapper = mount(DanxRadioGroup, { props: { options, size } });

      expect(wrapper.find(".danx-radio-group").classes()).toContain(`danx-radio-group--${size}`);
    });

    it("defaults to size md when not specified", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      expect(wrapper.find(".danx-radio-group").classes()).toContain("danx-radio-group--md");
    });
  });

  describe("Disabled", () => {
    it("applies danx-radio-group--disabled when the group is disabled", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, disabled: true } });

      expect(wrapper.find(".danx-radio-group").classes()).toContain("danx-radio-group--disabled");
    });

    it("disables every radio input when the group is disabled", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, disabled: true } });

      const inputs = wrapper.findAll<HTMLInputElement>("input[type='radio']");
      expect(inputs.every((i) => i.element.disabled)).toBe(true);
    });

    it("disables only the individually-disabled option", () => {
      const withDisabled = [options[0]!, { ...options[1]!, disabled: true }, options[2]!];
      const wrapper = mount(DanxRadioGroup, { props: { options: withDisabled } });

      const inputs = wrapper.findAll<HTMLInputElement>("input[type='radio']");
      expect(inputs[0]?.element.disabled).toBe(false);
      expect(inputs[1]?.element.disabled).toBe(true);
      expect(inputs[2]?.element.disabled).toBe(false);
    });

    it("applies danx-radio--disabled class on the disabled option's label", () => {
      const withDisabled = [options[0]!, { ...options[1]!, disabled: true }, options[2]!];
      const wrapper = mount(DanxRadioGroup, { props: { options: withDisabled } });

      const labels = wrapper.findAll(".danx-radio");
      expect(labels[1]?.classes()).toContain("danx-radio--disabled");
      expect(labels[0]?.classes()).not.toContain("danx-radio--disabled");
    });
  });

  describe("Keyboard navigation", () => {
    it("ArrowDown selects the next option and moves focus to it", async () => {
      const wrapper = mountAttached({ modelValue: "a" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    });

    it("ArrowRight behaves the same as ArrowDown", async () => {
      const wrapper = mountAttached({ modelValue: "a" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowRight" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["b"]);
    });

    it("ArrowUp selects the previous option", async () => {
      const wrapper = mountAttached({ modelValue: "b" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowUp" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"]);
    });

    it("ArrowLeft behaves the same as ArrowUp", async () => {
      const wrapper = mountAttached({ modelValue: "b" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowLeft" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"]);
    });

    it("ArrowDown wraps from the last option to the first", async () => {
      const wrapper = mountAttached({ modelValue: "c" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"]);
    });

    it("ArrowUp wraps from the first option to the last", async () => {
      const wrapper = mountAttached({ modelValue: "a" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowUp" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["c"]);
    });

    it("ArrowDown with no current selection selects the first option", async () => {
      const wrapper = mountAttached({ modelValue: null });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["a"]);
    });

    it("ArrowDown skips a disabled option", async () => {
      const withDisabled = [options[0]!, { ...options[1]!, disabled: true }, options[2]!];
      const wrapper = mountAttached({ options: withDisabled, modelValue: "a" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["c"]);
    });

    it("moves focus to the newly selected radio input", async () => {
      const wrapper = mountAttached({ modelValue: "a" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "ArrowDown" });

      const inputs = wrapper.findAll<HTMLInputElement>("input[type='radio']");
      expect(document.activeElement).toBe(inputs[1]?.element);
    });

    it("ignores non-arrow keys", async () => {
      const wrapper = mountAttached({ modelValue: "a" });

      await wrapper.find("[role='radiogroup']").trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Variant", () => {
    it.each(colorVariants)("renders variant %s with inline style on the dot", (variant) => {
      const wrapper = mount(DanxRadioGroup, { props: { options, variant } });

      const dotStyle = wrapper.find(".danx-radio__dot").attributes("style") ?? "";
      expect(dotStyle).toContain("--dx-radio-dot-bg-on");
      expect(dotStyle).toContain(`--dx-variant-${variant}`);
    });

    it("blank variant produces no inline style on the dot", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, variant: "" } });

      expect(wrapper.find(".danx-radio__dot").attributes("style")).toBeUndefined();
    });
  });

  describe("Option slot", () => {
    it("renders custom content via the option scoped slot", () => {
      const wrapper = mount(DanxRadioGroup, {
        props: { options, modelValue: "a" },
        slots: {
          option: `<template #option="{ option, checked }"><span class="custom-opt">{{ option.label }}-{{ checked }}</span></template>`,
        },
      });

      const customOpts = wrapper.findAll(".custom-opt");
      expect(customOpts).toHaveLength(3);
      expect(customOpts[0]?.text()).toBe("Option A-true");
      expect(customOpts[1]?.text()).toBe("Option B-false");
    });

    it("falls back to default label text when no option slot is provided", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      expect(wrapper.find(".danx-radio__label").exists()).toBe(true);
      expect(wrapper.find(".danx-radio__label").text()).toBe("Option A");
    });
  });

  describe("DanxFieldWrapper integration", () => {
    it("renders with label via DanxFieldWrapper", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, label: "Plan" } });

      expect(wrapper.find(".danx-field-wrapper").exists()).toBe(true);
      expect(wrapper.find(".danx-field-wrapper__label").text()).toContain("Plan");
    });

    it("renders required asterisk when required is true", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, label: "Plan", required: true } });

      expect(wrapper.find(".danx-field-wrapper__required").exists()).toBe(true);
    });

    it("renders error message when error is a string", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, error: "Required" } });

      const message = wrapper.find(".danx-field-wrapper__message--error");
      expect(message.exists()).toBe(true);
      expect(message.text()).toBe("Required");
    });

    it("renders helper text when provided and no error", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, helperText: "Pick one" } });

      const message = wrapper.find(".danx-field-wrapper__message--helper");
      expect(message.exists()).toBe(true);
      expect(message.text()).toBe("Pick one");
    });

    it("hides helper text when error is present", () => {
      const wrapper = mount(DanxRadioGroup, {
        props: { options, helperText: "Pick one", error: "Required" },
      });

      expect(wrapper.find(".danx-field-wrapper__message--helper").exists()).toBe(false);
    });

    it("renders with no field wrapper chrome when no label/error/helperText is given", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options } });

      expect(wrapper.find(".danx-field-wrapper__label").exists()).toBe(false);
      expect(wrapper.find(".danx-field-wrapper__message").exists()).toBe(false);
    });

    it("uses the label prop as the radiogroup's accessible name", () => {
      const wrapper = mount(DanxRadioGroup, { props: { options, label: "Plan" } });

      expect(wrapper.find("[role='radiogroup']").attributes("aria-label")).toBe("Plan");
    });
  });
});
