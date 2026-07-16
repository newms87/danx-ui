import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxCheckbox from "../DanxCheckbox.vue";
import type { CheckboxSize } from "../types";
import type { VariantType } from "../../../shared/types";

const allSizes: CheckboxSize[] = ["sm", "md", "lg"];
const colorVariants: VariantType[] = ["danger", "success", "warning", "info", "muted"];

let warnSpy: ReturnType<typeof vi.spyOn>;
const attachedWrappers: VueWrapper[] = [];

function mountAttached(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(DanxCheckbox, { props, slots, attachTo: document.body });
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

describe("DanxCheckbox", () => {
  describe("Rendering", () => {
    it("renders the visually-hidden checkbox + styled box", () => {
      const wrapper = mount(DanxCheckbox);

      expect(wrapper.find("input.danx-checkbox__input").exists()).toBe(true);
      expect(wrapper.find("input").attributes("type")).toBe("checkbox");
      expect(wrapper.find(".danx-checkbox__box").exists()).toBe(true);
    });

    it("has the base danx-checkbox class", () => {
      const wrapper = mount(DanxCheckbox);

      expect(wrapper.find(".danx-checkbox").exists()).toBe(true);
    });

    it("does not render slot content when no default slot is provided", () => {
      const wrapper = mount(DanxCheckbox);

      expect(wrapper.text()).toBe("");
    });

    it("renders default slot content next to the box", () => {
      const wrapper = mount(DanxCheckbox, {
        slots: { default: "Accept terms" },
      });

      expect(wrapper.text()).toContain("Accept terms");
    });

    it("clicking the slot label toggles the model via native label-for-input semantics", async () => {
      const wrapper = mountAttached(
        { modelValue: false },
        { default: '<span class="label-text">Click me</span>' }
      );

      await wrapper.find(".label-text").trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
    });

    it("aria-hidden=true on the visual box keeps the AT tree single-control", () => {
      const wrapper = mount(DanxCheckbox);

      expect(wrapper.find(".danx-checkbox__box").attributes("aria-hidden")).toBe("true");
    });

    it("renders a checkmark svg when not indeterminate", () => {
      const wrapper = mount(DanxCheckbox);

      expect(wrapper.find(".danx-checkbox__check").exists()).toBe(true);
      expect(wrapper.find(".danx-checkbox__dash").exists()).toBe(false);
    });
  });

  describe("v-model", () => {
    it("defaults to false when no modelValue is provided", () => {
      const wrapper = mount(DanxCheckbox);

      const input = wrapper.find<HTMLInputElement>("input.danx-checkbox__input");
      expect(input.element.checked).toBe(false);
      expect(wrapper.find(".danx-checkbox").classes()).not.toContain("danx-checkbox--on");
    });

    it("reflects modelValue=true via checked + on class", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { modelValue: true },
      });

      const input = wrapper.find<HTMLInputElement>("input.danx-checkbox__input");
      expect(input.element.checked).toBe(true);
      expect(wrapper.find(".danx-checkbox").classes()).toContain("danx-checkbox--on");
    });

    it("emits update:modelValue when the checkbox flips on", async () => {
      const wrapper = mount(DanxCheckbox, {
        props: { modelValue: false },
      });

      await wrapper.find("input").setValue(true);

      expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
    });

    it("emits update:modelValue when the checkbox flips off", async () => {
      const wrapper = mount(DanxCheckbox, {
        props: { modelValue: true },
      });

      await wrapper.find("input").setValue(false);

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("updates classes reactively after modelValue changes", async () => {
      const wrapper = mount(DanxCheckbox, {
        props: { modelValue: false },
      });

      expect(wrapper.find(".danx-checkbox").classes()).not.toContain("danx-checkbox--on");

      await wrapper.setProps({ modelValue: true });

      expect(wrapper.find(".danx-checkbox").classes()).toContain("danx-checkbox--on");
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with the matching BEM modifier class", (size) => {
      const wrapper = mount(DanxCheckbox, {
        props: { size },
      });

      expect(wrapper.find(".danx-checkbox").classes()).toContain(`danx-checkbox--${size}`);
    });

    it("defaults to size md when not specified", () => {
      const wrapper = mount(DanxCheckbox);

      expect(wrapper.find(".danx-checkbox").classes()).toContain("danx-checkbox--md");
    });
  });

  describe("Disabled", () => {
    it("sets disabled on the native checkbox when prop is true", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { disabled: true },
      });

      const input = wrapper.find<HTMLInputElement>("input.danx-checkbox__input");
      expect(input.element.disabled).toBe(true);
    });

    it("applies the danx-checkbox--disabled class when disabled", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { disabled: true },
      });

      expect(wrapper.find(".danx-checkbox").classes()).toContain("danx-checkbox--disabled");
    });

    it("native checkbox is not disabled by default", () => {
      const wrapper = mount(DanxCheckbox);

      const input = wrapper.find<HTMLInputElement>("input.danx-checkbox__input");
      expect(input.element.disabled).toBe(false);
      expect(wrapper.find(".danx-checkbox").classes()).not.toContain("danx-checkbox--disabled");
    });

    it("does not emit update:modelValue when the disabled checkbox is clicked", async () => {
      const wrapper = mount(DanxCheckbox, {
        props: { modelValue: false, disabled: true },
      });

      await wrapper.find("input").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Readonly", () => {
    it("does not emit update:modelValue when readonly and the value is changed", async () => {
      const wrapper = mountAttached({ modelValue: false, readonly: true });

      await wrapper.find("input").setValue(true);

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("reverts the native checked state back to modelValue when readonly", async () => {
      const wrapper = mountAttached({ modelValue: false, readonly: true });

      const input = wrapper.find<HTMLInputElement>("input");
      await input.setValue(true);

      expect(input.element.checked).toBe(false);
    });
  });

  describe("Indeterminate", () => {
    it("sets the native .indeterminate DOM property", async () => {
      const wrapper = mount(DanxCheckbox, {
        props: { indeterminate: true },
      });
      await nextTick();

      const input = wrapper.find<HTMLInputElement>("input.danx-checkbox__input");
      expect(input.element.indeterminate).toBe(true);
    });

    it("clears the native .indeterminate DOM property when prop becomes false", async () => {
      const wrapper = mount(DanxCheckbox, {
        props: { indeterminate: true },
      });

      await wrapper.setProps({ indeterminate: false });

      const input = wrapper.find<HTMLInputElement>("input.danx-checkbox__input");
      expect(input.element.indeterminate).toBe(false);
    });

    it("renders a dash instead of a checkmark when indeterminate", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { indeterminate: true },
      });

      expect(wrapper.find(".danx-checkbox__dash").exists()).toBe(true);
      expect(wrapper.find(".danx-checkbox__check").exists()).toBe(false);
    });

    it("applies the danx-checkbox--indeterminate class", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { indeterminate: true },
      });

      expect(wrapper.find(".danx-checkbox").classes()).toContain("danx-checkbox--indeterminate");
    });

    it("sets aria-checked to mixed when indeterminate, regardless of modelValue", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { indeterminate: true, modelValue: false },
      });

      expect(wrapper.find("input.danx-checkbox__input").attributes("aria-checked")).toBe("mixed");
    });
  });

  describe("ARIA", () => {
    it("mirrors modelValue=false as aria-checked='false' on the input", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { modelValue: false },
      });

      expect(wrapper.find("input.danx-checkbox__input").attributes("aria-checked")).toBe("false");
    });

    it("mirrors modelValue=true as aria-checked='true' on the input", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { modelValue: true },
      });

      expect(wrapper.find("input.danx-checkbox__input").attributes("aria-checked")).toBe("true");
    });

    it("sets aria-disabled on the input when disabled", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { disabled: true },
      });

      expect(wrapper.find("input.danx-checkbox__input").attributes("aria-disabled")).toBe("true");
    });

    it("omits aria-disabled when not disabled (no false-string in DOM)", () => {
      const wrapper = mount(DanxCheckbox);

      expect(
        wrapper.find("input.danx-checkbox__input").attributes("aria-disabled")
      ).toBeUndefined();
    });

    it("uses aria-label on the underlying checkbox when provided", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { ariaLabel: "Subscribe" },
      });

      expect(wrapper.find("input").attributes("aria-label")).toBe("Subscribe");
    });
  });

  describe("Variant", () => {
    it.each(colorVariants)("renders variant %s with inline style on the box", (variant) => {
      const wrapper = mount(DanxCheckbox, {
        props: { variant },
      });

      const boxStyle = wrapper.find(".danx-checkbox__box").attributes("style") ?? "";
      expect(boxStyle).toContain("--dx-checkbox-box-bg-on");
      expect(boxStyle).toContain(`--dx-variant-${variant}`);
    });

    it("blank variant produces no inline style on the box", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { variant: "" },
      });

      expect(wrapper.find(".danx-checkbox__box").attributes("style")).toBeUndefined();
    });

    it("supports custom (non-built-in) variant strings via fallback chain", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { variant: "brand-x" },
      });

      const boxStyle = wrapper.find(".danx-checkbox__box").attributes("style") ?? "";
      expect(boxStyle).toContain("--dx-variant-brand-x-bg");
    });
  });

  describe("DanxFieldWrapper integration", () => {
    it("renders with label via DanxFieldWrapper", () => {
      const wrapper = mount(DanxCheckbox, { props: { label: "Accept terms" } });

      expect(wrapper.find(".danx-field-wrapper").exists()).toBe(true);
      expect(wrapper.find(".danx-field-wrapper__label").text()).toContain("Accept terms");
    });

    it("wires the label for attribute to the checkbox id", () => {
      const wrapper = mount(DanxCheckbox, { props: { label: "Accept terms", id: "my-checkbox" } });

      const fieldLabel = wrapper.find(".danx-field-wrapper__label");
      expect(fieldLabel.attributes("for")).toBe("my-checkbox");
      expect(wrapper.find("input.danx-checkbox__input").attributes("id")).toBe("my-checkbox");
    });

    it("renders required asterisk when required is true", () => {
      const wrapper = mount(DanxCheckbox, { props: { label: "Accept terms", required: true } });

      expect(wrapper.find(".danx-field-wrapper__required").exists()).toBe(true);
    });

    it("renders error message when error is a string", () => {
      const wrapper = mount(DanxCheckbox, { props: { error: "Required" } });

      const message = wrapper.find(".danx-field-wrapper__message--error");
      expect(message.exists()).toBe(true);
      expect(message.text()).toBe("Required");
    });

    it("renders error styling without message when error is true", () => {
      const wrapper = mount(DanxCheckbox, { props: { error: true } });

      expect(wrapper.find(".danx-field-wrapper__message--error").exists()).toBe(false);
    });

    it("renders helper text when provided and no error", () => {
      const wrapper = mount(DanxCheckbox, { props: { helperText: "Optional" } });

      const message = wrapper.find(".danx-field-wrapper__message--helper");
      expect(message.exists()).toBe(true);
      expect(message.text()).toBe("Optional");
    });

    it("hides helper text when error is present", () => {
      const wrapper = mount(DanxCheckbox, {
        props: { helperText: "Optional", error: "Required" },
      });

      expect(wrapper.find(".danx-field-wrapper__message--helper").exists()).toBe(false);
    });

    it("renders with no field wrapper chrome when no label/error/helperText is given", () => {
      const wrapper = mount(DanxCheckbox);

      expect(wrapper.find(".danx-field-wrapper__label").exists()).toBe(false);
      expect(wrapper.find(".danx-field-wrapper__message").exists()).toBe(false);
    });
  });

  describe("Keyboard", () => {
    it("Space key on the checkbox toggles the model (native semantics)", async () => {
      const wrapper = mountAttached({ modelValue: false });

      const input = wrapper.find<HTMLInputElement>("input");
      input.element.focus();
      await input.trigger("keydown", { key: " " });
      await input.trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
    });
  });
});
