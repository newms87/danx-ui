import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { mount, type VueWrapper } from "@vue/test-utils";
import DanxRangeSlider from "../DanxRangeSlider.vue";
import type { VariantType } from "../../../shared/types";

const colorVariants: VariantType[] = ["danger", "success", "warning", "info", "muted"];

let warnSpy: ReturnType<typeof vi.spyOn>;
const attachedWrappers: VueWrapper[] = [];

function mountAttached(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
  const wrapper = mount(DanxRangeSlider, { props, slots, attachTo: document.body });
  attachedWrappers.push(wrapper);
  return wrapper;
}

/**
 * Stub the track's getBoundingClientRect so pointer/click math is deterministic
 * across happy-dom (which returns 0-width rects for non-laid-out elements).
 */
function stubTrackRect(wrapper: VueWrapper, rect: Partial<DOMRect> = {}) {
  const track = wrapper.find(".danx-range-slider__track").element as HTMLElement;
  const full = {
    left: 0,
    top: 0,
    width: 200,
    height: 4,
    right: 200,
    bottom: 4,
    x: 0,
    y: 0,
    toJSON: () => "",
  };
  Object.assign(full, rect);
  vi.spyOn(track, "getBoundingClientRect").mockReturnValue(full as DOMRect);
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

describe("DanxRangeSlider", () => {
  describe("Rendering", () => {
    it("renders the role=group container with track + fill", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, ariaLabel: "Volume" },
      });

      expect(wrapper.element.tagName).toBe("DIV");
      expect(wrapper.attributes("role")).toBe("group");
      expect(wrapper.attributes("aria-label")).toBe("Volume");
      expect(wrapper.find(".danx-range-slider__track").exists()).toBe(true);
      expect(wrapper.find(".danx-range-slider__fill").exists()).toBe(true);
    });

    it("applies the base danx-range-slider class", () => {
      const wrapper = mount(DanxRangeSlider, { props: { modelValue: 0, ariaLabel: "L" } });
      expect(wrapper.classes()).toContain("danx-range-slider");
    });

    it("renders single-mode modifier class when modelValue is a number", () => {
      const wrapper = mount(DanxRangeSlider, { props: { modelValue: 50, ariaLabel: "L" } });
      expect(wrapper.classes()).toContain("danx-range-slider--single");
      expect(wrapper.classes()).not.toContain("danx-range-slider--dual");
    });

    it("renders dual-mode modifier class when modelValue is a tuple", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [20, 80], ariaLabel: "L" },
      });
      expect(wrapper.classes()).toContain("danx-range-slider--dual");
      expect(wrapper.classes()).not.toContain("danx-range-slider--single");
    });

    it("renders exactly one handle in single mode", () => {
      const wrapper = mount(DanxRangeSlider, { props: { modelValue: 50, ariaLabel: "L" } });
      expect(wrapper.findAll(".danx-range-slider__handle")).toHaveLength(1);
      expect(wrapper.find(".danx-range-slider__handle--single").exists()).toBe(true);
    });

    it("renders two handles in dual mode (--min + --max)", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [20, 80], ariaLabel: "L" },
      });
      expect(wrapper.findAll(".danx-range-slider__handle")).toHaveLength(2);
      expect(wrapper.find(".danx-range-slider__handle--min").exists()).toBe(true);
      expect(wrapper.find(".danx-range-slider__handle--max").exists()).toBe(true);
    });
  });

  describe("Single-handle mode", () => {
    it("positions the handle at percent(value)", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 25, min: 0, max: 100, ariaLabel: "L" },
      });
      const handle = wrapper.find(".danx-range-slider__handle");
      expect(handle.attributes("style")).toContain("left: 25%");
    });

    it("fill goes from 0% to percent(value) in single mode", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 40, min: 0, max: 100, ariaLabel: "L" },
      });
      const fillStyle = wrapper.find(".danx-range-slider__fill").attributes("style") ?? "";
      expect(fillStyle).toContain("left: 0%");
      expect(fillStyle).toContain("width: 40%");
    });

    it("renders the default bubble label as String(value)", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 42, ariaLabel: "L" },
      });
      expect(wrapper.find(".danx-range-slider__bubble").text()).toBe("42");
    });

    it("uses the `value` slot to override the bubble label", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 540, min: 0, max: 1440, step: 15, ariaLabel: "L" },
        slots: {
          value: '<template #default="{ value, handle }">{{ handle }}:{{ value }}</template>',
        },
      });
      expect(wrapper.find(".danx-range-slider__bubble").text()).toBe("single:540");
    });
  });

  describe("Dual-handle mode", () => {
    it("positions handles at percentMin / percentMax", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [20, 80], min: 0, max: 100, ariaLabel: "L" },
      });
      const minStyle = wrapper.find(".danx-range-slider__handle--min").attributes("style") ?? "";
      const maxStyle = wrapper.find(".danx-range-slider__handle--max").attributes("style") ?? "";
      expect(minStyle).toContain("left: 20%");
      expect(maxStyle).toContain("left: 80%");
    });

    it("fill spans percentMin → percentMax", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [20, 80], min: 0, max: 100, ariaLabel: "L" },
      });
      const fillStyle = wrapper.find(".danx-range-slider__fill").attributes("style") ?? "";
      expect(fillStyle).toContain("left: 20%");
      expect(fillStyle).toContain("width: 60%");
    });

    it("renders the default bubble for both handles", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [20, 80], ariaLabel: "L" },
      });
      const bubbles = wrapper.findAll(".danx-range-slider__bubble");
      expect(bubbles.length).toBe(2);
      expect(bubbles[0]!.text()).toBe("20");
      expect(bubbles[1]!.text()).toBe("80");
    });

    it("provides distinct `handle` values to the `value` slot", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [20, 80], ariaLabel: "L" },
        slots: {
          value: '<template #default="{ value, handle }">[{{ handle }}={{ value }}]</template>',
        },
      });
      const bubbles = wrapper.findAll(".danx-range-slider__bubble");
      expect(bubbles.length).toBe(2);
      expect(bubbles[0]!.text()).toBe("[min=20]");
      expect(bubbles[1]!.text()).toBe("[max=80]");
    });
  });

  describe("Keyboard", () => {
    it("ArrowRight steps the single handle up by `step`", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, min: 0, max: 100, step: 5, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([55]);
    });

    it("ArrowLeft steps the single handle down by `step`", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, min: 0, max: 100, step: 5, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "ArrowLeft" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([45]);
    });

    it("ArrowUp / ArrowDown also step by 1 step (matches ARIA pattern)", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, min: 0, max: 100, step: 5, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "ArrowUp" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([55]);
      // defineModel internally updates its own ref on emit (no parent setProps
      // required), so the second keydown reads 55 → ArrowDown → 50.
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "ArrowDown" });
      expect(wrapper.emitted("update:modelValue")?.[1]).toEqual([50]);
    });

    it("PageUp steps by 10×step", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, min: 0, max: 100, step: 5, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "PageUp" });
      // 50 + 10*5 = 100 (clamped to max)
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([100]);
    });

    it("PageDown steps by -10×step", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, min: 0, max: 100, step: 5, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "PageDown" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([0]);
    });

    it("Home jumps to min", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, min: 10, max: 100, step: 1, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "Home" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([10]);
    });

    it("End jumps to max", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, min: 10, max: 100, step: 1, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "End" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([100]);
    });

    it("unrecognised keys are ignored (no emit)", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, ariaLabel: "L" },
      });
      await wrapper.find(".danx-range-slider__handle").trigger("keydown", { key: "a" });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("dual-mode min handle ArrowRight cannot cross max", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [45, 50], min: 0, max: 100, step: 5, ariaLabel: "L" },
      });
      // 45 + 5 = 50 = max — touching is allowed
      await wrapper
        .find(".danx-range-slider__handle--min")
        .trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[50, 50]]);
    });

    it("dual-mode max handle ArrowLeft cannot cross min", async () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [50, 55], min: 0, max: 100, step: 5, ariaLabel: "L" },
      });
      // 55 - 5 = 50 = min — touching is allowed
      await wrapper
        .find(".danx-range-slider__handle--max")
        .trigger("keydown", { key: "ArrowLeft" });
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[50, 50]]);
    });
  });

  describe("Pointer drag (single mode)", () => {
    it("pointerdown + pointermove updates the model from clientX percent", async () => {
      const wrapper = mountAttached({ modelValue: 0, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerdown", { pointerId: 1, clientX: 0 });
      await handle.trigger("pointermove", { pointerId: 1, clientX: 100 });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([50]);
    });

    it("respects a non-zero rect.left offset (clientX - rect.left math)", async () => {
      const wrapper = mountAttached({ modelValue: 0, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 50, width: 200 });

      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerdown", { pointerId: 1, clientX: 50 });
      // clientX 150 - left 50 = 100 / width 200 = 50% → 50
      await handle.trigger("pointermove", { pointerId: 1, clientX: 150 });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([50]);
    });

    it("snaps drag value to step (SFC → composable wiring)", async () => {
      const wrapper = mountAttached({
        modelValue: 0,
        min: 0,
        max: 100,
        step: 25,
        ariaLabel: "L",
      });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerdown", { pointerId: 1, clientX: 0 });
      // clientX 60 / width 200 = 30% → roundToStep(30, step=25) = 25
      await handle.trigger("pointermove", { pointerId: 1, clientX: 60 });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([25]);
    });

    it("pointermove with mismatched pointerId is ignored", async () => {
      const wrapper = mountAttached({ modelValue: 0, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerdown", { pointerId: 1, clientX: 0 });
      await handle.trigger("pointermove", { pointerId: 99, clientX: 100 });

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("pointerup clears the active handle so subsequent moves do not write", async () => {
      const wrapper = mountAttached({ modelValue: 0, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerdown", { pointerId: 1, clientX: 0 });
      await handle.trigger("pointermove", { pointerId: 1, clientX: 100 });
      await handle.trigger("pointerup", { pointerId: 1, clientX: 100 });
      await handle.trigger("pointermove", { pointerId: 1, clientX: 150 });

      // Expect exactly one emission — the pointermove during drag; the
      // post-pointerup pointermove must NOT write.
      expect(wrapper.emitted("update:modelValue")).toHaveLength(1);
    });

    it("pointermove on a zero-width track is a no-op (no model write)", async () => {
      const wrapper = mountAttached({ modelValue: 50, min: 0, max: 100, step: 1, ariaLabel: "L" });
      // Explicit zero-width rect — percentFromClientX returns null, the
      // handler early-returns without writing the model.
      stubTrackRect(wrapper, { left: 0, width: 0 });
      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerdown", { pointerId: 1, clientX: 0 });
      await handle.trigger("pointermove", { pointerId: 1, clientX: 500 });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("pointerup without a prior pointerdown is a safe no-op", async () => {
      const wrapper = mountAttached({ modelValue: 50, ariaLabel: "L" });
      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerup", { pointerId: 1, clientX: 0 });
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("pointercancel releases the drag identically to pointerup", async () => {
      const wrapper = mountAttached({ modelValue: 0, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const handle = wrapper.find(".danx-range-slider__handle");
      await handle.trigger("pointerdown", { pointerId: 1, clientX: 0 });
      await handle.trigger("pointercancel", { pointerId: 1, clientX: 100 });
      await handle.trigger("pointermove", { pointerId: 1, clientX: 150 });

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Pointer drag (dual mode)", () => {
    it("pointerdown on the MIN handle + pointermove updates the min tuple slot", async () => {
      const wrapper = mountAttached({
        modelValue: [0, 100],
        min: 0,
        max: 100,
        step: 1,
        ariaLabel: "L",
      });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const minHandle = wrapper.find(".danx-range-slider__handle--min");
      await minHandle.trigger("pointerdown", { pointerId: 1, clientX: 0 });
      await minHandle.trigger("pointermove", { pointerId: 1, clientX: 60 });
      await minHandle.trigger("pointerup", { pointerId: 1, clientX: 60 });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[30, 100]]);
    });

    it("pointerdown on the MAX handle + pointermove updates the max tuple slot", async () => {
      const wrapper = mountAttached({
        modelValue: [0, 100],
        min: 0,
        max: 100,
        step: 1,
        ariaLabel: "L",
      });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const maxHandle = wrapper.find(".danx-range-slider__handle--max");
      await maxHandle.trigger("pointerdown", { pointerId: 1, clientX: 200 });
      await maxHandle.trigger("pointermove", { pointerId: 1, clientX: 140 });
      await maxHandle.trigger("pointerup", { pointerId: 1, clientX: 140 });

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[0, 70]]);
    });
  });

  describe("Click-to-jump on the track", () => {
    /**
     * Dispatch a real PointerEvent on the track element. We bypass
     * @vue/test-utils' `trigger` here because it forbids passing `target`,
     * but the SUT's click-to-jump branch reads `event.target` to detect
     * pointer events that originate on a handle child.
     */
    function dispatchTrackPointer(wrapper: VueWrapper, clientX: number, targetEl?: HTMLElement) {
      const track = wrapper.find(".danx-range-slider__track").element as HTMLElement;
      const evt = new Event("pointerdown", { bubbles: true, cancelable: true });
      Object.defineProperty(evt, "clientX", { value: clientX });
      Object.defineProperty(evt, "target", { value: targetEl ?? track });
      track.dispatchEvent(evt);
    }

    it("single mode: clicks move the handle to the click position", () => {
      const wrapper = mountAttached({ modelValue: 0, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      dispatchTrackPointer(wrapper, 50);

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([25]);
    });

    it("single mode click-to-jump snaps to step", () => {
      const wrapper = mountAttached({
        modelValue: 0,
        min: 0,
        max: 100,
        step: 10,
        ariaLabel: "L",
      });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      // clientX 70 / width 200 = 35% → 35 → roundToStep(35, step=10) = 40
      dispatchTrackPointer(wrapper, 70);

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([40]);
    });

    it("dual mode: clicks move the NEAREST handle", () => {
      const wrapper = mountAttached({
        modelValue: [20, 80],
        min: 0,
        max: 100,
        step: 1,
        ariaLabel: "L",
      });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      // Click at value=30 — closer to min (20) than max (80) → moves min.
      dispatchTrackPointer(wrapper, 60);

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[30, 80]]);
    });

    it("dual mode: clicks closer to max move the MAX handle", () => {
      const wrapper = mountAttached({
        modelValue: [20, 80],
        min: 0,
        max: 100,
        step: 1,
        ariaLabel: "L",
      });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      // Click at value=70 — closer to max (80) than min (20) → moves max.
      dispatchTrackPointer(wrapper, 140);

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([[20, 70]]);
    });

    it("ignores pointerdown whose target is a handle (handle owns the drag)", () => {
      const wrapper = mountAttached({ modelValue: 50, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      // Synthesise a pointerdown bubbling up from the handle. The track-level
      // listener must short-circuit because the closest-handle check matches.
      const handle = wrapper.find(".danx-range-slider__handle").element as HTMLElement;
      dispatchTrackPointer(wrapper, 100, handle);

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("click on a zero-width track is a no-op (no model write)", () => {
      const wrapper = mountAttached({ modelValue: 50, min: 0, max: 100, step: 1, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 0 });

      dispatchTrackPointer(wrapper, 100);

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Disabled", () => {
    it("applies the danx-range-slider--disabled class", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, disabled: true, ariaLabel: "L" },
      });
      expect(wrapper.classes()).toContain("danx-range-slider--disabled");
    });

    it("sets aria-disabled on the container when disabled", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, disabled: true, ariaLabel: "L" },
      });
      expect(wrapper.attributes("aria-disabled")).toBe("true");
    });

    it("omits aria-disabled when not disabled", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, ariaLabel: "L" },
      });
      expect(wrapper.attributes("aria-disabled")).toBeUndefined();
    });

    it("sets disabled on each handle button + tabindex=-1", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [20, 80], disabled: true, ariaLabel: "L" },
      });
      const handles = wrapper.findAll(".danx-range-slider__handle");
      for (const h of handles) {
        expect(h.attributes("disabled")).toBeDefined();
        expect(h.attributes("tabindex")).toBe("-1");
        expect(h.attributes("aria-disabled")).toBe("true");
      }
    });

    it("blocks keyboard updates when disabled", () => {
      // Native dispatchEvent ensures the keydown reaches the listener even
      // though the button is disabled (happy-dom suppresses some
      // @vue/test-utils trigger paths). The `if (props.disabled) return;`
      // guard is then the only thing preventing model writes.
      const wrapper = mountAttached({ modelValue: 50, disabled: true, ariaLabel: "L" });
      const handle = wrapper.find(".danx-range-slider__handle").element as HTMLElement;
      handle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
      );
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("blocks pointer drag when disabled", () => {
      const wrapper = mountAttached({ modelValue: 0, disabled: true, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });

      const handle = wrapper.find(".danx-range-slider__handle").element as HTMLElement;
      const downEvt = new Event("pointerdown", { bubbles: true, cancelable: true });
      Object.defineProperty(downEvt, "pointerId", { value: 1 });
      Object.defineProperty(downEvt, "clientX", { value: 0 });
      handle.dispatchEvent(downEvt);
      const moveEvt = new Event("pointermove", { bubbles: true, cancelable: true });
      Object.defineProperty(moveEvt, "pointerId", { value: 1 });
      Object.defineProperty(moveEvt, "clientX", { value: 100 });
      handle.dispatchEvent(moveEvt);

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("blocks keyboard updates on dual-mode handles when disabled", () => {
      // Use native dispatchEvent — happy-dom suppresses some
      // @vue/test-utils trigger paths on disabled <button>s, which would
      // make the test vacuously pass even if the guard regressed.
      const wrapper = mountAttached({
        modelValue: [20, 80],
        disabled: true,
        ariaLabel: "L",
      });
      const minHandle = wrapper.find(".danx-range-slider__handle--min").element as HTMLElement;
      const maxHandle = wrapper.find(".danx-range-slider__handle--max").element as HTMLElement;
      minHandle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true, cancelable: true })
      );
      maxHandle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true, cancelable: true })
      );
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("blocks pointerdown on dual-mode handles when disabled", () => {
      // Native dispatchEvent so the listener actually runs (matches the
      // single-mode disabled test above).
      const wrapper = mountAttached({
        modelValue: [20, 80],
        disabled: true,
        ariaLabel: "L",
      });
      stubTrackRect(wrapper, { left: 0, width: 200 });
      const minHandle = wrapper.find(".danx-range-slider__handle--min").element as HTMLElement;
      const maxHandle = wrapper.find(".danx-range-slider__handle--max").element as HTMLElement;
      const down = (el: HTMLElement, pid: number, clientX: number) => {
        const evt = new Event("pointerdown", { bubbles: true, cancelable: true });
        Object.defineProperty(evt, "pointerId", { value: pid });
        Object.defineProperty(evt, "clientX", { value: clientX });
        el.dispatchEvent(evt);
      };
      down(minHandle, 1, 0);
      down(maxHandle, 2, 200);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("blocks click-to-jump on the track when disabled", () => {
      const wrapper = mountAttached({ modelValue: 0, disabled: true, ariaLabel: "L" });
      stubTrackRect(wrapper, { left: 0, width: 200 });
      const track = wrapper.find(".danx-range-slider__track").element as HTMLElement;
      const evt = new Event("pointerdown", { bubbles: true, cancelable: true });
      Object.defineProperty(evt, "clientX", { value: 100 });
      Object.defineProperty(evt, "target", { value: track });
      track.dispatchEvent(evt);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("ARIA", () => {
    it("single-handle: role=slider with valuemin/max/now matching props", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 540, min: 0, max: 1440, step: 15, ariaLabel: "Hours" },
      });
      const handle = wrapper.find(".danx-range-slider__handle");
      expect(handle.attributes("role")).toBe("slider");
      expect(handle.attributes("aria-orientation")).toBe("horizontal");
      expect(handle.attributes("aria-valuemin")).toBe("0");
      expect(handle.attributes("aria-valuemax")).toBe("1440");
      expect(handle.attributes("aria-valuenow")).toBe("540");
    });

    it("dual-handle: each handle has its own valuenow", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: [540, 1020], min: 0, max: 1440, ariaLabel: "Hours" },
      });
      const min = wrapper.find(".danx-range-slider__handle--min");
      const max = wrapper.find(".danx-range-slider__handle--max");
      expect(min.attributes("aria-valuenow")).toBe("540");
      expect(max.attributes("aria-valuenow")).toBe("1020");
    });
  });

  describe("Variant", () => {
    it.each(colorVariants)("renders variant %s with inline style on fill + handle", (variant) => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, variant, ariaLabel: "L" },
      });
      const fillStyle = wrapper.find(".danx-range-slider__fill").attributes("style") ?? "";
      const handleStyle = wrapper.find(".danx-range-slider__handle").attributes("style") ?? "";
      expect(fillStyle).toContain("--dx-range-slider-track-fill-bg");
      expect(handleStyle).toContain("--dx-range-slider-handle-border");
      // The fallback chain goes through the shared variant token namespace.
      expect(fillStyle).toContain(`--dx-variant-${variant}`);
    });

    it("blank variant produces no variant tokens in the style", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, variant: "", ariaLabel: "L" },
      });
      const fillStyle = wrapper.find(".danx-range-slider__fill").attributes("style") ?? "";
      expect(fillStyle).not.toContain("--dx-variant-");
    });

    it("supports custom (non-built-in) variant strings via fallback chain", () => {
      const wrapper = mount(DanxRangeSlider, {
        props: { modelValue: 50, variant: "brand-x", ariaLabel: "L" },
      });
      const handleStyle = wrapper.find(".danx-range-slider__handle").attributes("style") ?? "";
      expect(handleStyle).toContain("--dx-variant-brand-x-bg");
    });
  });

  describe("Mode flipping at runtime", () => {
    it("switches from single to dual when v-model shape changes", async () => {
      const wrapper = mount(DanxRangeSlider, { props: { modelValue: 50, ariaLabel: "L" } });
      expect(wrapper.findAll(".danx-range-slider__handle")).toHaveLength(1);

      await wrapper.setProps({ modelValue: [20, 80] });

      expect(wrapper.findAll(".danx-range-slider__handle")).toHaveLength(2);
      expect(wrapper.classes()).toContain("danx-range-slider--dual");
    });
  });

  describe("Defaults", () => {
    it("renders with default min=0, max=100, step=1 when not provided", () => {
      const wrapper = mount(DanxRangeSlider, { props: { modelValue: 50, ariaLabel: "L" } });
      const handle = wrapper.find(".danx-range-slider__handle");
      expect(handle.attributes("aria-valuemin")).toBe("0");
      expect(handle.attributes("aria-valuemax")).toBe("100");
    });

    it("renders the bubble label for the default model value (0)", () => {
      const wrapper = mount(DanxRangeSlider, { props: { ariaLabel: "L" } });
      expect(wrapper.find(".danx-range-slider__bubble").text()).toBe("0");
    });
  });
});
