import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxRating from "../DanxRating.vue";
import type { VariantType } from "../../../shared/types";

const colorVariants: VariantType[] = ["danger", "success", "warning", "info", "muted"];

let warnSpy: ReturnType<typeof vi.spyOn>;
const attachedWrappers: VueWrapper[] = [];

function mountAttached(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxRating, { props, attachTo: document.body });
  attachedWrappers.push(wrapper);
  return wrapper;
}

/**
 * Stub a star button's getBoundingClientRect so pointer/click math is
 * deterministic across happy-dom (which returns 0-width rects for
 * non-laid-out elements). Each star is a fixed-width `width`-px box.
 */
function stubStarRect(wrapper: VueWrapper, starIndex: number, width = 20) {
  const stars = wrapper.findAll(".danx-rating__star");
  const el = stars[starIndex - 1]!.element as HTMLElement;
  const left = (starIndex - 1) * width;
  const rect = {
    left,
    top: 0,
    width,
    height: width,
    right: left + width,
    bottom: width,
    x: left,
    y: 0,
    toJSON: () => "",
  };
  vi.spyOn(el, "getBoundingClientRect").mockReturnValue(rect as DOMRect);
  return { left, width };
}

beforeEach(() => {
  // Zero-Vue-warns gate (AC). Any `[Vue warn]` lands in spy.mock.calls and is
  // asserted at teardown.
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

describe("DanxRating", () => {
  describe("Rendering / props", () => {
    it("renders the role=slider container with aria attributes", () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 3, ariaLabel: "Rating" },
      });

      expect(wrapper.attributes("role")).toBe("slider");
      expect(wrapper.attributes("aria-label")).toBe("Rating");
      expect(wrapper.attributes("aria-valuemin")).toBe("0");
      expect(wrapper.attributes("aria-valuemax")).toBe("5");
      expect(wrapper.attributes("aria-valuenow")).toBe("3");
    });

    it("applies the base danx-rating class", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 0, ariaLabel: "L" } });
      expect(wrapper.classes()).toContain("danx-rating");
    });

    it("defaults max to 5 stars", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 0, ariaLabel: "L" } });
      expect(wrapper.findAll(".danx-rating__star")).toHaveLength(5);
    });

    it("renders `max` stars when overridden", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 0, max: 10, ariaLabel: "L" } });
      expect(wrapper.findAll(".danx-rating__star")).toHaveLength(10);
    });

    it("renders two DanxIcon layers (empty + filled) per star, using the default star icon", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 0, max: 1, ariaLabel: "L" } });
      const star = wrapper.find(".danx-rating__star");
      expect(star.find(".danx-rating__star-layer--empty").exists()).toBe(true);
      expect(star.find(".danx-rating__star-layer--filled").exists()).toBe(true);
      expect(star.findAll(".danx-icon")).toHaveLength(2);
    });

    it("passes a custom `icon` prop through to DanxIcon", () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 0, max: 1, icon: "confirm", ariaLabel: "L" },
      });
      // The confirm icon SVG differs from the star SVG — presence of any svg confirms render.
      expect(wrapper.find(".danx-icon svg").exists()).toBe(true);
    });

    it("applies danx-rating--disabled + aria-disabled when disabled", () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 0, disabled: true, ariaLabel: "L" },
      });
      expect(wrapper.classes()).toContain("danx-rating--disabled");
      expect(wrapper.attributes("aria-disabled")).toBe("true");
      expect(wrapper.attributes("tabindex")).toBe("-1");
    });

    it("applies danx-rating--readonly + aria-readonly when readonly", () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 0, readonly: true, ariaLabel: "L" },
      });
      expect(wrapper.classes()).toContain("danx-rating--readonly");
      expect(wrapper.attributes("aria-readonly")).toBe("true");
      expect(wrapper.attributes("tabindex")).toBe("-1");
    });

    it("is focusable (tabindex=0) when neither disabled nor readonly", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 0, ariaLabel: "L" } });
      expect(wrapper.attributes("tabindex")).toBe("0");
    });

    it.each(colorVariants)("applies the %s variant style to the filled layer", (variant) => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 3, max: 5, variant, ariaLabel: "L" },
      });
      const filled = wrapper.find(".danx-rating__star-layer--filled");
      expect(filled.attributes("style")).toContain(
        `var(--dx-variant-rating-${variant}-bg, var(--dx-variant-${variant}-bg))`
      );
    });

    it("applies no variant inline style when variant is blank", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 3, ariaLabel: "L" } });
      const filled = wrapper.find(".danx-rating__star-layer--filled");
      expect(filled.attributes("style") ?? "").not.toContain("--dx-variant");
    });
  });

  describe("Fill percent", () => {
    it("fully fills stars at or below the value", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 3, max: 5, ariaLabel: "L" } });
      const layers = wrapper.findAll(".danx-rating__star-layer--filled");
      expect(layers[0]!.attributes("style")).toContain("0%");
      expect(layers[2]!.attributes("style")).toContain("0%");
    });

    it("leaves stars above the value fully clipped (100% inset-right)", () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 3, max: 5, ariaLabel: "L" } });
      const layers = wrapper.findAll(".danx-rating__star-layer--filled");
      expect(layers[3]!.attributes("style")).toContain("100%");
      expect(layers[4]!.attributes("style")).toContain("100%");
    });

    it("half-fills the star at a fractional value", () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 2.5, max: 5, allowHalf: true, ariaLabel: "L" },
      });
      const layers = wrapper.findAll(".danx-rating__star-layer--filled");
      // Star 3 (index 2) is 50% filled → 50% clipped from the right.
      expect(layers[2]!.attributes("style")).toContain("50%");
    });
  });

  describe("Click / v-model", () => {
    it("clicking the right half of a star (allowHalf=false) sets the whole value", async () => {
      const wrapper = mountAttached({ modelValue: 0, max: 5, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 3, 20);
      const star = wrapper.findAll(".danx-rating__star")[2]!;
      await star.trigger("click", { clientX: left + 15 });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
    });

    it("clicking the left half of a star (allowHalf=true) sets a half value", async () => {
      const wrapper = mountAttached({ modelValue: 0, max: 5, allowHalf: true, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 3, 20);
      const star = wrapper.findAll(".danx-rating__star")[2]!;
      await star.trigger("click", { clientX: left + 4 }); // fraction 0.2 → left half
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([2.5]);
    });

    it("clicking the right half of a star (allowHalf=true) sets the whole value", async () => {
      const wrapper = mountAttached({ modelValue: 0, max: 5, allowHalf: true, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 3, 20);
      const star = wrapper.findAll(".danx-rating__star")[2]!;
      await star.trigger("click", { clientX: left + 16 }); // fraction 0.8 → right half
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
    });

    it("does not emit on click when disabled", async () => {
      const wrapper = mountAttached({ modelValue: 0, max: 5, disabled: true, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 3, 20);
      const star = wrapper.findAll(".danx-rating__star")[2]!;
      await star.trigger("click", { clientX: left + 15 });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not emit on click when readonly", async () => {
      const wrapper = mountAttached({ modelValue: 0, max: 5, readonly: true, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 3, 20);
      const star = wrapper.findAll(".danx-rating__star")[2]!;
      await star.trigger("click", { clientX: left + 15 });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Hover-preview", () => {
    it("previews the value on pointermove without emitting update:modelValue", async () => {
      const wrapper = mountAttached({ modelValue: 1, max: 5, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 4, 20);
      const star = wrapper.findAll(".danx-rating__star")[3]!;
      await star.trigger("pointermove", { clientX: left + 15 });

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      const layers = wrapper.findAll(".danx-rating__star-layer--filled");
      // Preview shows star 4 filled (0%) though modelValue is still 1.
      expect(layers[3]!.attributes("style")).toContain("0%");
      expect(wrapper.attributes("aria-valuenow")).toBe("1");
    });

    it("restores the committed value on pointerleave", async () => {
      const wrapper = mountAttached({ modelValue: 1, max: 5, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 4, 20);
      const star = wrapper.findAll(".danx-rating__star")[3]!;
      await star.trigger("pointermove", { clientX: left + 15 });
      await wrapper.trigger("pointerleave");

      const layers = wrapper.findAll(".danx-rating__star-layer--filled");
      // Back to modelValue=1: only star 1 filled, star 4 fully clipped.
      expect(layers[0]!.attributes("style")).toContain("0%");
      expect(layers[3]!.attributes("style")).toContain("100%");
    });

    it("does not preview when disabled", async () => {
      const wrapper = mountAttached({ modelValue: 1, max: 5, disabled: true, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 4, 20);
      const star = wrapper.findAll(".danx-rating__star")[3]!;
      await star.trigger("pointermove", { clientX: left + 15 });

      const layers = wrapper.findAll(".danx-rating__star-layer--filled");
      expect(layers[3]!.attributes("style")).toContain("100%");
    });

    it("does not preview when readonly", async () => {
      const wrapper = mountAttached({ modelValue: 1, max: 5, readonly: true, ariaLabel: "L" });
      const { left } = stubStarRect(wrapper, 4, 20);
      const star = wrapper.findAll(".danx-rating__star")[3]!;
      await star.trigger("pointermove", { clientX: left + 15 });

      const layers = wrapper.findAll(".danx-rating__star-layer--filled");
      expect(layers[3]!.attributes("style")).toContain("100%");
    });
  });

  describe("Keyboard", () => {
    it("ArrowRight increases by step (whole)", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 2, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
    });

    it("ArrowLeft decreases by step (whole)", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 2, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "ArrowLeft" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([1]);
    });

    it("ArrowUp / ArrowDown match ArrowRight / ArrowLeft", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 2, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "ArrowUp" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([3]);
      await wrapper.trigger("keydown", { key: "ArrowDown" });
      expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([2]);
    });

    it("steps by 0.5 when allowHalf is true", async () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 2, max: 5, allowHalf: true, ariaLabel: "L" },
      });
      await wrapper.trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([2.5]);
    });

    it("Home jumps to 0", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 3, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "Home" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([0]);
    });

    it("End jumps to max", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 3, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "End" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([5]);
    });

    it("clamps ArrowRight at max (value unchanged, defineModel skips the no-op emit)", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 5, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.attributes("aria-valuenow")).toBe("5");
    });

    it("clamps ArrowLeft at 0 (value unchanged, defineModel skips the no-op emit)", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 0, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "ArrowLeft" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.attributes("aria-valuenow")).toBe("0");
    });

    it("unrecognised keys are ignored (no emit)", async () => {
      const wrapper = mount(DanxRating, { props: { modelValue: 2, max: 5, ariaLabel: "L" } });
      await wrapper.trigger("keydown", { key: "a" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not emit on keydown when disabled", async () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 2, max: 5, disabled: true, ariaLabel: "L" },
      });
      await wrapper.trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not emit on keydown when readonly", async () => {
      const wrapper = mount(DanxRating, {
        props: { modelValue: 2, max: 5, readonly: true, ariaLabel: "L" },
      });
      await wrapper.trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });
});
