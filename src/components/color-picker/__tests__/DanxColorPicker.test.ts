import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxColorPicker from "../DanxColorPicker.vue";

/**
 * happy-dom does not implement the native Popover API. DanxPopover calls
 * `el.showPopover()` and checks `el.matches(':popover-open')` — polyfill
 * both so the panel mounts cleanly in tests.
 */
const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const origMatches = HTMLElement.prototype.matches;

function openPanel(wrapper: ReturnType<typeof mount>) {
  return wrapper.get('[data-test="x-swatch"]').trigger("click");
}

describe("DanxColorPicker", () => {
  beforeEach(() => {
    window.localStorage.clear();
    HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
      popoverOpenState.set(this, true);
    });
    HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
      popoverOpenState.set(this, false);
    });
    HTMLElement.prototype.matches = function (selector: string) {
      if (selector === ":popover-open") return popoverOpenState.get(this) ?? false;
      return origMatches.call(this, selector);
    };
  });
  afterEach(() => {
    HTMLElement.prototype.matches = origMatches;
    HTMLElement.prototype.showPopover = undefined as unknown as () => void;
    HTMLElement.prototype.hidePopover = undefined as unknown as () => void;
  });

  describe("Trigger row rendering", () => {
    it("renders the bound color in the text input + swatch fill style", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      expect((wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value).toBe(
        "#3b82f6"
      );
      const swatch = wrapper.get('[data-test="x-swatch"]').element as HTMLElement;
      expect(swatch.style.getPropertyValue("--dx-color-picker-swatch-color")).toBe("#3b82f6");
    });

    it("renders transparent swatch for unparseable values", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "garbage", testId: "x" },
      });
      const swatch = wrapper.get('[data-test="x-swatch"]').element as HTMLElement;
      expect(swatch.style.getPropertyValue("--dx-color-picker-swatch-color")).toBe("transparent");
    });

    it("expands short-form hex (#abc) into the swatch fill", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#abc", testId: "x" },
      });
      const swatch = wrapper.get('[data-test="x-swatch"]').element as HTMLElement;
      // Short form parses through hexToRgb -> formatted long form via rgbToHex
      expect(swatch.style.getPropertyValue("--dx-color-picker-swatch-color")).toBe("#aabbcc");
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
      expect(wrapper.get('[data-test="x-input"]').attributes("placeholder")).toBe("pick one");
    });
  });

  describe("Text input commit semantics", () => {
    it("emits update:modelValue on blur when the text input holds a valid hex", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.setValue("#deadbe");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toEqual([["#deadbe"]]);
    });

    it("does NOT emit on blur when the text input holds an invalid color (renders inline error)", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.setValue("notahex");
      await input.trigger("blur");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.get('[data-test="x-error"]').text()).toMatch(/valid color/i);
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
      expect((wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value).toBe(
        "#deadbe"
      );
      expect(wrapper.emitted("update:modelValue")).toEqual([["#deadbe"]]);
    });

    it("ignores other keys", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.trigger("keydown", { key: "a" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not emit redundant updates", async () => {
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
    it("re-seeds when NOT focused", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await wrapper.setProps({ modelValue: "#abcdef" });
      expect((wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value).toBe(
        "#abcdef"
      );
    });
    it("does NOT clobber an active draft when focused", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      await input.trigger("focus");
      await input.setValue("#deadbe");
      await wrapper.setProps({ modelValue: "#abcdef" });
      expect((wrapper.get('[data-test="x-input"]').element as HTMLInputElement).value).toBe(
        "#deadbe"
      );
    });
  });

  describe("States", () => {
    it("disabled blocks both controls", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", disabled: true, testId: "x" },
      });
      expect((wrapper.get('[data-test="x-input"]').element as HTMLInputElement).disabled).toBe(
        true
      );
      expect((wrapper.get('[data-test="x-swatch"]').element as HTMLButtonElement).disabled).toBe(
        true
      );
      expect(wrapper.find(".danx-color-picker--disabled").exists()).toBe(true);
    });

    it("aria-invalid set when draft fails validation", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      const input = wrapper.get('[data-test="x-input"]');
      expect(input.attributes("aria-invalid")).toBeUndefined();
      await input.setValue("notahex");
      expect(input.attributes("aria-invalid")).toBe("true");
    });

    it("error class added on invalid draft", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      expect(wrapper.find(".danx-color-picker--error").exists()).toBe(false);
      await wrapper.get('[data-test="x-input"]').setValue("notahex");
      expect(wrapper.find(".danx-color-picker--error").exists()).toBe(true);
    });

    it("panelDisabled blocks swatch button activation", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", panelDisabled: true, testId: "x" },
      });
      await openPanel(wrapper);
      expect(wrapper.find('[data-test="x-panel"]').exists()).toBe(false);
    });
  });

  describe("Popover panel", () => {
    it("opens + closes via swatch click + emits open/close", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await openPanel(wrapper);
      await nextTick();
      expect(wrapper.find('[data-test="x-panel"]').exists()).toBe(true);
      expect(wrapper.emitted("open")).toBeTruthy();
      await openPanel(wrapper);
      expect(wrapper.find('[data-test="x-panel"]').exists()).toBe(false);
      expect(wrapper.emitted("close")).toBeTruthy();
    });

    it("Escape on document closes via DanxPopover v-model update", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
        attachTo: document.body,
      });
      await openPanel(wrapper);
      await nextTick();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();
      expect(wrapper.find('[data-test="x-panel"]').exists()).toBe(false);
      wrapper.unmount();
    });

    it("palette click commits a swatch + adds to recents", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: {
          modelValue: "#3b82f6",
          swatches: ["#111111", "#222222"],
          paletteCols: 2,
          testId: "x",
          storageKey: "palette-test",
        },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-palette-1"]').trigger("click");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]).toEqual(["#222222"]);
      expect(window.localStorage.getItem("danx-color-picker:recent:palette-test")).toContain(
        "#222222"
      );
    });

    it("palette keyboard nav: ArrowRight moves focus", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: {
          modelValue: "#3b82f6",
          swatches: ["#111111", "#222222", "#333333"],
          paletteCols: 3,
          testId: "x",
        },
        attachTo: document.body,
      });
      await openPanel(wrapper);
      const first = wrapper.get('[data-test="x-palette-0"]').element as HTMLElement;
      first.focus();
      await wrapper.get('[data-test="x-palette-0"]').trigger("keydown", { key: "ArrowRight" });
      await nextTick();
      expect(document.activeElement).toBe(
        wrapper.get('[data-test="x-palette-1"]').element as HTMLElement
      );
      wrapper.unmount();
    });

    it("palette Enter activates the focused swatch", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: {
          modelValue: "#3b82f6",
          swatches: ["#aaaaaa"],
          testId: "x",
        },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-palette-0"]').trigger("keydown.enter");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]).toEqual(["#aaaaaa"]);
    });

    it("HEX input commits a typed value through the panel", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await openPanel(wrapper);
      const hexInput = wrapper.get('[data-test="x-hex-input"]');
      await hexInput.setValue("#abcdef");
      await hexInput.trigger("change");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]).toEqual(["#abcdef"]);
    });

    it("HEX input rejects invalid drafts (no commit, reverts on next sync)", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await openPanel(wrapper);
      const hexInput = wrapper.get('[data-test="x-hex-input"]');
      await hexInput.setValue("not-a-color");
      await hexInput.trigger("change");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("RGB tab live-updates HEX and emits", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#000000", testId: "x" },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-tab-rgb"]').trigger("click");
      await nextTick();
      const rInput = wrapper.get('[data-test="x-rgb-r"]');
      await rInput.setValue("255");
      await nextTick();
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted.length).toBeGreaterThan(0);
      expect(emitted[emitted.length - 1]?.[0]).toMatch(/^#ff/);
    });

    it("HSL tab emits", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#000000", testId: "x", output: "hsl" },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-tab-hsl"]').trigger("click");
      await nextTick();
      const hInput = wrapper.get('[data-test="x-hsl-h"]');
      await hInput.setValue("120");
      await nextTick();
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted.length).toBeGreaterThan(0);
      expect(emitted[emitted.length - 1]?.[0]).toMatch(/^hsl\(/);
    });

    it("output format prop changes emitted shape", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x", output: "rgb" },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-palette-0"]').trigger("click");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]?.[0]).toMatch(/^rgb\(/);
    });

    it("alpha=true renders the alpha strip + alpha input in RGB tab", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", alpha: true, output: "rgba", testId: "x" },
      });
      await openPanel(wrapper);
      expect(wrapper.find('[data-test="x-alpha"]').exists()).toBe(true);
      await wrapper.get('[data-test="x-tab-rgb"]').trigger("click");
      expect(wrapper.find('[data-test="x-rgb-a"]').exists()).toBe(true);
      const a = wrapper.get('[data-test="x-rgb-a"]');
      await a.setValue("0.5");
      await a.trigger("input");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]?.[0]).toMatch(/^rgba\(/);
    });

    it("alpha=false hides the alpha strip", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", alpha: false, testId: "x" },
      });
      await openPanel(wrapper);
      expect(wrapper.find('[data-test="x-alpha"]').exists()).toBe(false);
    });

    it("HSL tab alpha input also emits", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", alpha: true, testId: "x" },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-tab-hsl"]').trigger("click");
      expect(wrapper.find('[data-test="x-hsl-a"]').exists()).toBe(true);
      const a = wrapper.get('[data-test="x-hsl-a"]');
      await a.setValue("0.25");
      await a.trigger("input");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]?.[0]).toBeTruthy();
    });

    it("recent strip click commits", async () => {
      window.localStorage.setItem(
        "danx-color-picker:recent:r1",
        JSON.stringify(["#abcdef", "#123456"])
      );
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x", storageKey: "r1" },
      });
      await openPanel(wrapper);
      expect(wrapper.find('[data-test="x-recents"]').exists()).toBe(true);
      await wrapper.get('[data-test="x-recent-1"]').trigger("click");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]).toEqual(["#123456"]);
    });

    it("clearable renders Clear and emits clearValue", async () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", clearable: true, clearValue: "", testId: "x" },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-clear"]').trigger("click");
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]).toEqual([""]);
    });
  });

  describe("Eyedropper", () => {
    it("hides eyedropper when API is missing", async () => {
      const original = (window as unknown as { EyeDropper?: unknown }).EyeDropper;
      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await openPanel(wrapper);
      expect(wrapper.find('[data-test="x-eyedropper"]').exists()).toBe(false);
      if (original) (window as unknown as { EyeDropper?: unknown }).EyeDropper = original;
    });

    it("shows + invokes eyedropper on success commits the color", async () => {
      const open = vi.fn(async () => ({ sRGBHex: "#112233" }));
      class FakeEyeDropper {
        open = open;
      }
      (window as unknown as { EyeDropper: typeof FakeEyeDropper }).EyeDropper = FakeEyeDropper;

      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-eyedropper"]').trigger("click");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await nextTick();
      expect(open).toHaveBeenCalled();
      const emitted = wrapper.emitted("update:modelValue") ?? [];
      expect(emitted[emitted.length - 1]).toEqual(["#112233"]);

      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
    });

    it("surfaces eyedropper AbortError inline without crashing", async () => {
      class AbortDropper {
        open = vi.fn(async () => {
          throw new Error("aborted");
        });
      }
      (window as unknown as { EyeDropper: typeof AbortDropper }).EyeDropper = AbortDropper;

      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", testId: "x" },
      });
      await openPanel(wrapper);
      await wrapper.get('[data-test="x-eyedropper"]').trigger("click");
      await new Promise((resolve) => setTimeout(resolve, 0));
      await nextTick();
      expect(wrapper.find('[data-test="x-eyedropper-error"]').exists()).toBe(true);

      delete (window as unknown as { EyeDropper?: unknown }).EyeDropper;
    });
  });

  describe("Variant prop", () => {
    it("applies variant style on the container", () => {
      const wrapper = mount(DanxColorPicker, {
        props: { modelValue: "#3b82f6", variant: "danger" },
      });
      const el = wrapper.get(".danx-color-picker").element as HTMLElement;
      expect(el.style.getPropertyValue("--dx-color-picker-tab-active-bar")).toContain("var(");
    });
  });
});
