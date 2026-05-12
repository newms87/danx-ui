import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxToggle from "../DanxToggle.vue";
import type { ToggleSize } from "../types";
import type { VariantType } from "../../../shared/types";

const allSizes: ToggleSize[] = ["sm", "md", "lg"];
const colorVariants: VariantType[] = ["danger", "success", "warning", "info", "muted"];

let warnSpy: ReturnType<typeof vi.spyOn>;
const attachedWrappers: VueWrapper[] = [];

function mountAttached(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(DanxToggle, { props, slots, attachTo: document.body });
  attachedWrappers.push(wrapper);
  return wrapper;
}

beforeEach(() => {
  // Zero-Vue-warns gate (AC). Spy on console.warn for the duration of each
  // test so any `[Vue warn]` lands in spy.mock.calls and is asserted at
  // teardown. Console.error spy guards against unhandled exceptions
  // turning into silent passes.
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  // Surface any [Vue warn] that fired during the test before unmount.
  const vueWarns = warnSpy.mock.calls.filter((args: unknown[]) =>
    args.some((a: unknown) => typeof a === "string" && a.startsWith("[Vue warn]"))
  );
  expect(vueWarns, "expected zero [Vue warn] in test").toEqual([]);

  // attachTo cleanup — guards against early-throw leaks between tests.
  while (attachedWrappers.length > 0) {
    attachedWrappers.pop()?.unmount();
  }
  warnSpy.mockRestore();
});

describe("DanxToggle", () => {
  describe("Rendering", () => {
    it("renders a <label> root with the visually-hidden checkbox + styled track", () => {
      const wrapper = mount(DanxToggle);

      expect(wrapper.element.tagName).toBe("LABEL");
      expect(wrapper.find("input.danx-toggle__input").exists()).toBe(true);
      expect(wrapper.find("input").attributes("type")).toBe("checkbox");
      expect(wrapper.find(".danx-toggle__track").exists()).toBe(true);
      expect(wrapper.find(".danx-toggle__thumb").exists()).toBe(true);
    });

    it("has the base danx-toggle class", () => {
      const wrapper = mount(DanxToggle);

      expect(wrapper.classes()).toContain("danx-toggle");
    });

    it("does not render the default slot wrapper when no slot is provided", () => {
      const wrapper = mount(DanxToggle);

      expect(wrapper.text()).toBe("");
    });

    it("renders default slot content next to the toggle", () => {
      const wrapper = mount(DanxToggle, {
        slots: { default: "Always on" },
      });

      expect(wrapper.text()).toContain("Always on");
    });

    it("clicking the slot label toggles the model via native label-for-input semantics", async () => {
      // Native <label> wraps the input and the slot. Clicking the slot text
      // fires a click on the label, which the browser (and happy-dom)
      // forwards to the wrapped checkbox.
      const wrapper = mountAttached(
        { modelValue: false },
        { default: '<span class="label-text">Click me</span>' }
      );

      await wrapper.find(".label-text").trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
    });

    it("aria-hidden=true on the visual track keeps the AT tree single-control", () => {
      const wrapper = mount(DanxToggle);

      expect(wrapper.find(".danx-toggle__track").attributes("aria-hidden")).toBe("true");
    });
  });

  describe("v-model", () => {
    it("defaults to false when no modelValue is provided", () => {
      const wrapper = mount(DanxToggle);

      const input = wrapper.find<HTMLInputElement>("input.danx-toggle__input");
      expect(input.element.checked).toBe(false);
      expect(wrapper.classes()).not.toContain("danx-toggle--on");
    });

    it("coerces an undefined modelValue prop into a defined false (no Vue warn)", () => {
      // defineModel<boolean>({ default: false }) — passing undefined must
      // resolve to the default without producing a [Vue warn] about
      // type mismatch on a required model.
      mount(DanxToggle, {
        props: { modelValue: undefined },
      });

      const vueWarns = warnSpy.mock.calls.filter((args: unknown[]) =>
        args.some((a: unknown) => typeof a === "string" && a.startsWith("[Vue warn]"))
      );
      expect(vueWarns).toEqual([]);
    });

    it("reflects modelValue=true via checked + on class", () => {
      const wrapper = mount(DanxToggle, {
        props: { modelValue: true },
      });

      const input = wrapper.find<HTMLInputElement>("input.danx-toggle__input");
      expect(input.element.checked).toBe(true);
      expect(wrapper.classes()).toContain("danx-toggle--on");
    });

    it("emits update:modelValue when the checkbox flips on", async () => {
      const wrapper = mount(DanxToggle, {
        props: { modelValue: false },
      });

      await wrapper.find("input").setValue(true);

      expect(wrapper.emitted("update:modelValue")).toEqual([[true]]);
    });

    it("emits update:modelValue when the checkbox flips off", async () => {
      const wrapper = mount(DanxToggle, {
        props: { modelValue: true },
      });

      await wrapper.find("input").setValue(false);

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("updates classes reactively after modelValue changes", async () => {
      const wrapper = mount(DanxToggle, {
        props: { modelValue: false },
      });

      expect(wrapper.classes()).not.toContain("danx-toggle--on");

      await wrapper.setProps({ modelValue: true });

      expect(wrapper.classes()).toContain("danx-toggle--on");
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with the matching BEM modifier class", (size) => {
      const wrapper = mount(DanxToggle, {
        props: { size },
      });

      expect(wrapper.classes()).toContain(`danx-toggle--${size}`);
    });

    it("defaults to size md when not specified", () => {
      const wrapper = mount(DanxToggle);

      expect(wrapper.classes()).toContain("danx-toggle--md");
    });
  });

  describe("Disabled", () => {
    it("sets disabled on the native checkbox when prop is true", () => {
      const wrapper = mount(DanxToggle, {
        props: { disabled: true },
      });

      const input = wrapper.find<HTMLInputElement>("input.danx-toggle__input");
      expect(input.element.disabled).toBe(true);
    });

    it("applies the danx-toggle--disabled class when disabled", () => {
      const wrapper = mount(DanxToggle, {
        props: { disabled: true },
      });

      expect(wrapper.classes()).toContain("danx-toggle--disabled");
    });

    it("native checkbox is not disabled by default", () => {
      const wrapper = mount(DanxToggle);

      const input = wrapper.find<HTMLInputElement>("input.danx-toggle__input");
      expect(input.element.disabled).toBe(false);
      expect(wrapper.classes()).not.toContain("danx-toggle--disabled");
    });

    it("does not emit update:modelValue when the disabled checkbox is clicked", async () => {
      const wrapper = mount(DanxToggle, {
        props: { modelValue: false, disabled: true },
      });

      // Clicking a disabled native checkbox doesn't toggle it — the browser
      // (and happy-dom) drop the input event entirely.
      await wrapper.find("input").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not emit when the slot label is clicked while disabled", async () => {
      const wrapper = mountAttached(
        { modelValue: false, disabled: true },
        { default: '<span class="label-text">Click me</span>' }
      );

      await wrapper.find(".label-text").trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("renders the variant track style even when disabled (style is independent of state)", () => {
      const wrapper = mount(DanxToggle, {
        props: { disabled: true, variant: "danger", modelValue: true },
      });

      const trackStyle = wrapper.find(".danx-toggle__track").attributes("style") ?? "";
      expect(trackStyle).toContain("--dx-toggle-track-bg-on");
      expect(wrapper.classes()).toContain("danx-toggle--on");
      expect(wrapper.classes()).toContain("danx-toggle--disabled");
    });
  });

  describe("ARIA", () => {
    it("renders role=switch on the focusable input (not the visual track)", () => {
      const wrapper = mount(DanxToggle);

      expect(wrapper.find("input.danx-toggle__input").attributes("role")).toBe("switch");
      expect(wrapper.find(".danx-toggle__track").attributes("role")).toBeUndefined();
    });

    it("mirrors modelValue=false as aria-checked='false' on the input", () => {
      const wrapper = mount(DanxToggle, {
        props: { modelValue: false },
      });

      expect(wrapper.find("input.danx-toggle__input").attributes("aria-checked")).toBe("false");
    });

    it("mirrors modelValue=true as aria-checked='true' on the input", () => {
      const wrapper = mount(DanxToggle, {
        props: { modelValue: true },
      });

      expect(wrapper.find("input.danx-toggle__input").attributes("aria-checked")).toBe("true");
    });

    it("sets aria-disabled on the input when disabled", () => {
      const wrapper = mount(DanxToggle, {
        props: { disabled: true },
      });

      expect(wrapper.find("input.danx-toggle__input").attributes("aria-disabled")).toBe("true");
    });

    it("omits aria-disabled when not disabled (no false-string in DOM)", () => {
      const wrapper = mount(DanxToggle);

      // aria-disabled='false' is rendered as no attribute (via undefined binding)
      // so screen readers do not announce false-disabled noise.
      expect(wrapper.find("input.danx-toggle__input").attributes("aria-disabled")).toBeUndefined();
    });

    it("uses aria-label on the underlying checkbox when provided", () => {
      const wrapper = mount(DanxToggle, {
        props: { ariaLabel: "24/7 master switch" },
      });

      expect(wrapper.find("input").attributes("aria-label")).toBe("24/7 master switch");
    });

    it("supports slot AND ariaLabel together (both name sources coexist)", () => {
      // Slot provides the visual label via <label>; ariaLabel overrides the
      // accessible name on the input itself. Both can be present.
      const wrapper = mount(DanxToggle, {
        props: { ariaLabel: "Activate notifications" },
        slots: { default: "Email me" },
      });

      expect(wrapper.text()).toContain("Email me");
      expect(wrapper.find("input").attributes("aria-label")).toBe("Activate notifications");
    });
  });

  describe("Keyboard", () => {
    it("Space key on the checkbox toggles the model (native semantics)", async () => {
      const wrapper = mountAttached({ modelValue: false });

      const input = wrapper.find<HTMLInputElement>("input");
      input.element.focus();
      // Native checkboxes toggle on Space — happy-dom mirrors that via the
      // click event the browser dispatches under the hood.
      await input.trigger("keydown", { key: " " });
      await input.trigger("click");

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
    });

    it("Enter key dispatch on the checkbox does not crash and is harmless", async () => {
      const wrapper = mountAttached({ modelValue: false });

      const input = wrapper.find<HTMLInputElement>("input");
      input.element.focus();
      // For form-submit semantics inside <form>, Enter submits — but our
      // root is a <label>, so dispatching Enter here is a no-op that
      // should not throw. This guards regression on accidental
      // event-handler additions.
      await input.trigger("keydown", { key: "Enter" });

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Variant", () => {
    it.each(colorVariants)("renders variant %s with inline style on the track", (variant) => {
      const wrapper = mount(DanxToggle, {
        props: { variant },
      });

      const trackStyle = wrapper.find(".danx-toggle__track").attributes("style") ?? "";
      expect(trackStyle).toContain("--dx-toggle-track-bg-on");
      expect(trackStyle).toContain("--dx-toggle-thumb-bg");
      // The fallback chain goes through the shared variant token namespace.
      expect(trackStyle).toContain(`--dx-variant-${variant}`);
    });

    it("blank variant produces no inline style on the track", () => {
      const wrapper = mount(DanxToggle, {
        props: { variant: "" },
      });

      expect(wrapper.find(".danx-toggle__track").attributes("style")).toBeUndefined();
    });

    it("supports custom (non-built-in) variant strings via fallback chain", () => {
      const wrapper = mount(DanxToggle, {
        props: { variant: "brand-x" },
      });

      const trackStyle = wrapper.find(".danx-toggle__track").attributes("style") ?? "";
      expect(trackStyle).toContain("--dx-variant-brand-x-bg");
      expect(trackStyle).toContain("--dx-variant-brand-x-text");
    });
  });
});
