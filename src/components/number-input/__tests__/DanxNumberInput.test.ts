import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, h, ref } from "vue";
import DanxNumberInput from "../DanxNumberInput.vue";
import type { InputSize } from "../../../shared/form-types";
import { expectNoA11yViolations } from "../../../shared/testing/expectNoA11yViolations";

/**
 * Helper: mounts DanxNumberInput inside a parent that wires v-model properly.
 * Uses h() render function to avoid needing the runtime template compiler.
 */
function mountWithModel(initialValue: number | null, inputProps: Record<string, unknown> = {}) {
  const model = ref<number | null>(initialValue);
  const Parent = defineComponent({
    setup() {
      return () =>
        h(DanxNumberInput, {
          ...inputProps,
          modelValue: model.value,
          "onUpdate:modelValue": (v: number | null | undefined) => {
            model.value = v ?? null;
          },
        });
    },
  });

  return { wrapper: mount(Parent), model };
}

const allSizes: InputSize[] = ["sm", "md", "lg"];

describe("DanxNumberInput", () => {
  describe("Rendering", () => {
    it("renders the container with default md size", () => {
      const wrapper = mount(DanxNumberInput);

      expect(wrapper.find(".danx-number-input").exists()).toBe(true);
      expect(wrapper.find(".danx-number-input--md").exists()).toBe(true);
    });

    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxNumberInput, { props: { size } });

      expect(wrapper.find(`.danx-number-input--${size}`).exists()).toBe(true);
    });

    it("renders a native number input element", () => {
      const wrapper = mount(DanxNumberInput);

      const input = wrapper.find("input.danx-number-input__native");
      expect(input.exists()).toBe(true);
      expect(input.attributes("type")).toBe("number");
    });

    it("renders increment and decrement stepper buttons", () => {
      const wrapper = mount(DanxNumberInput);

      expect(wrapper.find(".danx-number-input__stepper--increment").exists()).toBe(true);
      expect(wrapper.find(".danx-number-input__stepper--decrement").exists()).toBe(true);
      expect(wrapper.find(".danx-number-input__stepper--increment").attributes("aria-label")).toBe(
        "Increment"
      );
      expect(wrapper.find(".danx-number-input__stepper--decrement").attributes("aria-label")).toBe(
        "Decrement"
      );
    });

    it("renders with label via DanxFieldWrapper", () => {
      const wrapper = mount(DanxNumberInput, { props: { label: "Quantity" } });

      const label = wrapper.find("label");
      expect(label.exists()).toBe(true);
      expect(label.text()).toContain("Quantity");
    });

    it("renders error message via DanxFieldWrapper", () => {
      const wrapper = mount(DanxNumberInput, { props: { error: "Required" } });

      expect(wrapper.find(".danx-field-wrapper__message--error").text()).toBe("Required");
    });

    it("renders helper text via DanxFieldWrapper", () => {
      const wrapper = mount(DanxNumberInput, { props: { helperText: "Enter a quantity" } });

      expect(wrapper.find(".danx-field-wrapper__message--helper").text()).toBe(
        "Enter a quantity"
      );
    });
  });

  describe("v-model", () => {
    it("renders the model value in the input", () => {
      const wrapper = mount(DanxNumberInput, { props: { modelValue: 5 } });

      expect(wrapper.find("input").element.value).toBe("5");
    });

    it("handles a null model value as an empty input", () => {
      const wrapper = mount(DanxNumberInput, { props: { modelValue: null } });

      expect(wrapper.find("input").element.value).toBe("");
    });

    it("emits update:modelValue with a number when the input changes", async () => {
      const wrapper = mount(DanxNumberInput, { props: { modelValue: null } });

      await wrapper.find("input").setValue("42");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([42]);
    });

    it("emits null when the input is cleared to empty", async () => {
      const wrapper = mount(DanxNumberInput, { props: { modelValue: 5 } });

      await wrapper.find("input").setValue("");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([null]);
    });
  });

  describe("Stepper buttons", () => {
    it("increments the value by 1 (default step) on increment click", async () => {
      const { wrapper, model } = mountWithModel(5);

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      expect(model.value).toBe(6);
    });

    it("decrements the value by 1 (default step) on decrement click", async () => {
      const { wrapper, model } = mountWithModel(5);

      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mouseup");

      expect(model.value).toBe(4);
    });

    it("increments by the custom step amount", async () => {
      const { wrapper, model } = mountWithModel(5, { step: 5 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      expect(model.value).toBe(10);
    });

    it("steps from a null value using min as the base", async () => {
      const { wrapper, model } = mountWithModel(null, { min: 2 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      expect(model.value).toBe(3);
    });

    it("steps from a null value using 0 as the base when no min is set", async () => {
      const { wrapper, model } = mountWithModel(null);

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      expect(model.value).toBe(1);
    });
  });

  describe("Clamping", () => {
    it("clamps to max on step when incrementing past the ceiling", async () => {
      const { wrapper, model } = mountWithModel(9, { max: 10 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      expect(model.value).toBe(10);
    });

    it("clamps to min on step when decrementing past the floor", async () => {
      const { wrapper, model } = mountWithModel(1, { min: 0 });

      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mouseup");
      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mouseup");

      expect(model.value).toBe(0);
    });

    it("clamps an out-of-range value to max on blur", async () => {
      const { wrapper, model } = mountWithModel(50, { max: 10 });

      await wrapper.find("input").trigger("blur");

      expect(model.value).toBe(10);
    });

    it("clamps an out-of-range value to min on blur", async () => {
      const { wrapper, model } = mountWithModel(-50, { min: 0 });

      await wrapper.find("input").trigger("blur");

      expect(model.value).toBe(0);
    });

    it("leaves an in-range value untouched on blur", async () => {
      const { wrapper, model } = mountWithModel(5, { min: 0, max: 10 });

      await wrapper.find("input").trigger("blur");

      expect(model.value).toBe(5);
    });

    it("leaves a null value untouched on blur", async () => {
      const { wrapper, model } = mountWithModel(null, { min: 0, max: 10 });

      await wrapper.find("input").trigger("blur");

      expect(model.value).toBeNull();
    });

    it("disables the increment button once the value reaches max", () => {
      const wrapper = mount(DanxNumberInput, { props: { modelValue: 10, max: 10 } });

      expect(wrapper.find(".danx-number-input__stepper--increment").attributes("disabled")).toBeDefined();
    });

    it("disables the decrement button once the value reaches min", () => {
      const wrapper = mount(DanxNumberInput, { props: { modelValue: 0, min: 0 } });

      expect(wrapper.find(".danx-number-input__stepper--decrement").attributes("disabled")).toBeDefined();
    });

    it("does not disable steppers when min/max are unset", () => {
      const wrapper = mount(DanxNumberInput, { props: { modelValue: 5 } });

      expect(wrapper.find(".danx-number-input__stepper--increment").attributes("disabled")).toBeUndefined();
      expect(wrapper.find(".danx-number-input__stepper--decrement").attributes("disabled")).toBeUndefined();
    });
  });

  describe("Decimal stepping", () => {
    it("steps by a decimal amount without float drift", async () => {
      const { wrapper, model } = mountWithModel(0.1, { step: 0.1 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      // Naive 0.1 + 0.1 float math would yield 0.2000000000000000018 style drift
      expect(model.value).toBe(0.2);
    });

    it("rounds a blurred value to the step's decimal precision", async () => {
      const { wrapper, model } = mountWithModel(1.23456, { step: 0.01 });

      await wrapper.find("input").trigger("blur");

      expect(model.value).toBe(1.23);
    });

    it("steps down by a decimal amount without float drift", async () => {
      const { wrapper, model } = mountWithModel(0.3, { step: 0.1 });

      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--decrement").trigger("mouseup");

      expect(model.value).toBe(0.2);
    });

    it("steps by a decimal amount via keyboard without float drift", async () => {
      const { wrapper, model } = mountWithModel(0.1, { step: 0.1 });

      await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });

      expect(model.value).toBe(0.2);
    });

    it("rounds a very small step precisely (three decimal places)", async () => {
      const { wrapper, model } = mountWithModel(0.001, { step: 0.001 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      expect(model.value).toBe(0.002);
    });
  });

  describe("Keyboard stepping", () => {
    it("increments on ArrowUp", async () => {
      const { wrapper, model } = mountWithModel(5);

      await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });

      expect(model.value).toBe(6);
    });

    it("decrements on ArrowDown", async () => {
      const { wrapper, model } = mountWithModel(5);

      await wrapper.find("input").trigger("keydown", { key: "ArrowDown" });

      expect(model.value).toBe(4);
    });

    it("clamps ArrowUp stepping at max", async () => {
      const { wrapper, model } = mountWithModel(10, { max: 10 });

      await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });

      expect(model.value).toBe(10);
    });
  });

  describe("Hold-to-repeat", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("steps once immediately on mousedown", async () => {
      const { wrapper, model } = mountWithModel(0);

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");

      expect(model.value).toBe(1);
    });

    it("repeats stepping after the hold delay elapses", async () => {
      const { wrapper, model } = mountWithModel(0, { holdDelay: 400, holdInterval: 80 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      expect(model.value).toBe(1);

      // Hold-delay elapses: the repeat interval is armed, but hasn't fired yet.
      await vi.advanceTimersByTimeAsync(400);
      expect(model.value).toBe(1);

      await vi.advanceTimersByTimeAsync(80);
      expect(model.value).toBe(2);

      await vi.advanceTimersByTimeAsync(80);
      expect(model.value).toBe(3);
    });

    it("stops repeating on mouseup", async () => {
      const { wrapper, model } = mountWithModel(0, { holdDelay: 400, holdInterval: 80 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseup");

      await vi.advanceTimersByTimeAsync(1000);
      expect(model.value).toBe(1);
    });

    it("stops repeating on mouseleave", async () => {
      const { wrapper, model } = mountWithModel(0, { holdDelay: 400, holdInterval: 80 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await wrapper.find(".danx-number-input__stepper--increment").trigger("mouseleave");

      await vi.advanceTimersByTimeAsync(1000);
      expect(model.value).toBe(1);
    });

    it("stops repeating once max is reached", async () => {
      const { wrapper, model } = mountWithModel(8, { max: 10, holdDelay: 100, holdInterval: 50 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await vi.advanceTimersByTimeAsync(500);

      expect(model.value).toBe(10);
    });

    it("clears pending timers on unmount", async () => {
      const { wrapper, model } = mountWithModel(0, { holdDelay: 100, holdInterval: 50 });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      wrapper.unmount();

      await vi.advanceTimersByTimeAsync(500);
      expect(model.value).toBe(1);
    });

    it("keeps decimal precision across repeated hold-to-repeat steps", async () => {
      const { wrapper, model } = mountWithModel(0, {
        step: 0.1,
        holdDelay: 100,
        holdInterval: 50,
      });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");
      await vi.advanceTimersByTimeAsync(100 + 50 + 50);

      expect(model.value).toBe(0.3);
    });
  });

  describe("Disabled and readonly", () => {
    it("disables the native input when disabled", () => {
      const wrapper = mount(DanxNumberInput, { props: { disabled: true } });

      expect(wrapper.find("input").attributes("disabled")).toBeDefined();
    });

    it("marks the native input readonly", () => {
      const wrapper = mount(DanxNumberInput, { props: { readonly: true } });

      expect(wrapper.find("input").element.readOnly).toBe(true);
    });

    it("disables both stepper buttons when disabled", () => {
      const wrapper = mount(DanxNumberInput, { props: { disabled: true } });

      expect(wrapper.find(".danx-number-input__stepper--increment").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-number-input__stepper--decrement").attributes("disabled")).toBeDefined();
    });

    it("disables both stepper buttons when readonly", () => {
      const wrapper = mount(DanxNumberInput, { props: { readonly: true } });

      expect(wrapper.find(".danx-number-input__stepper--increment").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-number-input__stepper--decrement").attributes("disabled")).toBeDefined();
    });

    it("ignores stepper mousedown when disabled", async () => {
      const { wrapper, model } = mountWithModel(5, { disabled: true });

      await wrapper.find(".danx-number-input__stepper--increment").trigger("mousedown");

      expect(model.value).toBe(5);
    });

    it("ignores ArrowUp/ArrowDown keyboard stepping when disabled", async () => {
      const { wrapper, model } = mountWithModel(5, { disabled: true });

      await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
      await wrapper.find("input").trigger("keydown", { key: "ArrowDown" });

      expect(model.value).toBe(5);
    });

    it("ignores ArrowUp/ArrowDown keyboard stepping when readonly", async () => {
      const { wrapper, model } = mountWithModel(5, { readonly: true });

      await wrapper.find("input").trigger("keydown", { key: "ArrowUp" });
      await wrapper.find("input").trigger("keydown", { key: "ArrowDown" });

      expect(model.value).toBe(5);
    });

    it("keeps the native input focusable (not disabled) when only readonly", () => {
      const wrapper = mount(DanxNumberInput, { props: { readonly: true } });

      expect(wrapper.find("input").attributes("disabled")).toBeUndefined();
      expect(wrapper.find("input").element.readOnly).toBe(true);
    });

    it("applies disabled state class", () => {
      const wrapper = mount(DanxNumberInput, { props: { disabled: true } });

      expect(wrapper.find(".danx-number-input--disabled").exists()).toBe(true);
    });

    it("applies readonly state class", () => {
      const wrapper = mount(DanxNumberInput, { props: { readonly: true } });

      expect(wrapper.find(".danx-number-input--readonly").exists()).toBe(true);
    });
  });

  describe("States", () => {
    it("applies error state border class", () => {
      const wrapper = mount(DanxNumberInput, { props: { error: "Bad" } });

      expect(wrapper.find(".danx-number-input--error").exists()).toBe(true);
    });

    it("applies focused state on focus", async () => {
      const wrapper = mount(DanxNumberInput);

      await wrapper.find("input").trigger("focus");
      expect(wrapper.find(".danx-number-input--focused").exists()).toBe(true);
    });

    it("removes focused state on blur", async () => {
      const wrapper = mount(DanxNumberInput);

      await wrapper.find("input").trigger("focus");
      await wrapper.find("input").trigger("blur");
      expect(wrapper.find(".danx-number-input--focused").exists()).toBe(false);
    });
  });

  describe("Events", () => {
    it("emits focus on input focus", async () => {
      const wrapper = mount(DanxNumberInput);

      await wrapper.find("input").trigger("focus");
      expect(wrapper.emitted("focus")).toBeTruthy();
    });

    it("emits blur on input blur", async () => {
      const wrapper = mount(DanxNumberInput);

      await wrapper.find("input").trigger("blur");
      expect(wrapper.emitted("blur")).toBeTruthy();
    });
  });

  describe("Native attributes", () => {
    it("passes placeholder to native input", () => {
      const wrapper = mount(DanxNumberInput, { props: { placeholder: "0" } });

      expect(wrapper.find("input").attributes("placeholder")).toBe("0");
    });

    it("passes name to native input", () => {
      const wrapper = mount(DanxNumberInput, { props: { name: "quantity" } });

      expect(wrapper.find("input").attributes("name")).toBe("quantity");
    });

    it("passes min/max/step to native input", () => {
      const wrapper = mount(DanxNumberInput, { props: { min: 0, max: 100, step: 5 } });

      const input = wrapper.find("input");
      expect(input.attributes("min")).toBe("0");
      expect(input.attributes("max")).toBe("100");
      expect(input.attributes("step")).toBe("5");
    });

    it("passes autocomplete to native input", () => {
      const wrapper = mount(DanxNumberInput, { props: { autocomplete: "off" } });

      expect(wrapper.find("input").attributes("autocomplete")).toBe("off");
    });
  });

  describe("Accessibility", () => {
    it("sets aria-invalid when in error state", () => {
      const wrapper = mount(DanxNumberInput, { props: { error: "Bad" } });

      expect(wrapper.find("input").attributes("aria-invalid")).toBe("true");
    });

    it("label for attribute matches input id", () => {
      const wrapper = mount(DanxNumberInput, { props: { label: "Quantity", id: "qty-input" } });

      const label = wrapper.find("label");
      expect(label.attributes("for")).toBe("qty-input");
      expect(wrapper.find("input").attributes("id")).toBe("qty-input");
    });

    it("has no axe violations", async () => {
      const { wrapper } = mountWithModel(5, { label: "Quantity" });
      document.body.appendChild(wrapper.element);

      await expectNoA11yViolations(wrapper.element);
      wrapper.unmount();
    });
  });
});
