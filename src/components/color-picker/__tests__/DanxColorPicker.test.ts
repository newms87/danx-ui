import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxColorPicker from "../DanxColorPicker.vue";

describe("DanxColorPicker", () => {
  describe("Rendering", () => {
    it("renders the bound color in both swatch and text input", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      expect(
        (wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value,
      ).toBe("#3b82f6");
      expect(
        (wrapper.get('[data-test="x-swatch"]').element as HTMLInputElement).value,
      ).toBe("#3b82f6");
    });

    it("expands short-form hex (#abc) for the swatch", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#abc", testId: "x" },
      });
      expect(
        (wrapper.get('[data-test="x-swatch"]').element as HTMLInputElement).value,
      ).toBe("#aabbcc");
    });

    it("falls back to #000000 for an invalid initial swatch value", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "garbage", testId: "x" },
      });
      expect(
        (wrapper.get('[data-test="x-swatch"]').element as HTMLInputElement).value,
      ).toBe("#000000");
    });

    it("renders the optional label", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", label: "Brand" },
      });
      expect(wrapper.find(".danx-color-picker__label").text()).toBe("Brand");
    });

    it("renders the suffix slot when provided", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6" },
        slots: { suffix: '<button class="test-suffix">x</button>' },
      });
      expect(wrapper.find(".danx-color-picker__suffix").exists()).toBe(true);
      expect(wrapper.find(".test-suffix").exists()).toBe(true);
    });

    it("omits container data-test when testId is not provided", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6" },
      });
      expect(wrapper.find(".danx-color-picker").attributes("data-test")).toBeUndefined();
    });

    it("uses a custom placeholder when supplied", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "", placeholder: "pick one", testId: "x" },
      });
      expect(
        wrapper.get('[data-test="x-input"]').attributes("placeholder"),
      ).toBe("pick one");
    });
  });

  describe("Commit semantics", () => {
    it("emits update:modelValue on blur when the text input holds a valid hex", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.setValue("#deadbe");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toEqual([["#deadbe"]]);
    });

    it("does NOT emit on blur when the text input holds an invalid hex (renders inline error)", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.setValue("notahex");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.get('[data-test="x-error"]').text()).toMatch(/hex color/i);
    });

    it("emits on Enter and reverts on Escape", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');

      await input.setValue("#deadbe");
      await input.trigger("keydown", { key: "Enter" });
      expect(wrapper.emitted("update:modelValue")).toEqual([["#deadbe"]]);

      await wrapper.setProps({ modelValue: "#deadbe" });
      await input.setValue("notahex");
      await input.trigger("keydown", { key: "Escape" });
      expect(
        (wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value,
      ).toBe("#deadbe");
      expect(wrapper.emitted("update:modelValue")).toEqual([["#deadbe"]]);
    });

    it("does not emit a redundant update when the committed value matches the bound value", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.setValue("#3b82f6");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Focus-gated re-seed", () => {
    it("re-seeds the draft from a parent patch when NOT focused", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await wrapper.setProps({ modelValue: "#abcdef" });
      expect(
        (wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value,
      ).toBe("#abcdef");
    });

    it("does NOT clobber an active draft when focused", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.trigger("focus");
      await input.setValue("#deadbe");
      await wrapper.setProps({ modelValue: "#abcdef" });
      expect(
        (wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value,
      ).toBe("#deadbe");
    });
  });

  describe("Swatch", () => {
    it("emits on every swatch input event (live drag)", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const swatch = wrapper.get('[data-test="x-swatch"]');
      await swatch.setValue("#abcdef");
      expect(wrapper.emitted("update:modelValue")?.at(-1)).toEqual(["#abcdef"]);
    });

    it("does not emit when the swatch reports the already-bound value", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const swatch = wrapper.get('[data-test="x-swatch"]');
      await swatch.setValue("#3b82f6");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("States", () => {
    it("respects disabled prop on both controls", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", disabled: true, testId: "x" },
      });
      expect(
        (wrapper.get('[data-test="x-input"]').element as HTMLInputElement).disabled,
      ).toBe(true);
      expect(
        (wrapper.get('[data-test="x-swatch"]').element as HTMLInputElement).disabled,
      ).toBe(true);
      expect(wrapper.find(".danx-color-picker--disabled").exists()).toBe(true);
    });

    it("sets aria-invalid only when the draft fails validation", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      expect(input.attributes("aria-invalid")).toBeUndefined();
      await input.setValue("notahex");
      expect(input.attributes("aria-invalid")).toBe("true");
    });

    it("adds the error modifier class when the draft is invalid", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      expect(wrapper.find(".danx-color-picker--error").exists()).toBe(false);
      await wrapper.get('[data-test="x-input"]').setValue("notahex");
      expect(wrapper.find(".danx-color-picker--error").exists()).toBe(true);
    });
  });
});
