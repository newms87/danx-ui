import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { defineComponent, ref, type Ref } from "vue";
import { mount } from "@vue/test-utils";
import { useZoomable, type UseZoomableReturn } from "../useZoomable";
import type { Pan } from "../types";

// happy-dom's WheelEvent / MouseEvent constructors do not propagate ctrlKey /
// metaKey from the init dict, so we set them via Object.defineProperty.
function makeWheel(
  init: { deltaY?: number; ctrlKey?: boolean; metaKey?: boolean } = {}
): WheelEvent {
  const evt = new WheelEvent("wheel", {
    deltaY: init.deltaY ?? 0,
    bubbles: true,
    cancelable: true,
  });
  if (init.ctrlKey) Object.defineProperty(evt, "ctrlKey", { value: true });
  if (init.metaKey) Object.defineProperty(evt, "metaKey", { value: true });
  return evt;
}

interface HarnessResult {
  api: UseZoomableReturn;
  zoom: Ref<number>;
  pan: Ref<Pan>;
  rootRef: Ref<HTMLElement | null>;
  panDisabled: Ref<boolean>;
  wheelDisabled: Ref<boolean>;
  keyboardDisabled: Ref<boolean>;
}

const mountedWrappers: ReturnType<typeof mount>[] = [];
let warnSpy: ReturnType<typeof vi.spyOn>;

function makeHarness(
  initial: {
    zoom?: number;
    pan?: Pan;
    min?: number;
    max?: number;
    step?: number;
    panDisabled?: boolean;
    wheelDisabled?: boolean;
    keyboardDisabled?: boolean;
  } = {}
): HarnessResult {
  let captured!: HarnessResult;
  const wrapper = mount(
    defineComponent({
      setup() {
        const zoom = ref(initial.zoom ?? 100);
        const pan = ref<Pan>(initial.pan ?? { x: 0, y: 0 });
        const rootRef = ref<HTMLElement | null>(null);
        const min = ref(initial.min ?? 25);
        const max = ref(initial.max ?? 400);
        const step = ref(initial.step ?? 10);
        const panDisabled = ref(initial.panDisabled ?? false);
        const wheelDisabled = ref(initial.wheelDisabled ?? false);
        const keyboardDisabled = ref(initial.keyboardDisabled ?? false);

        const api = useZoomable({
          zoom,
          pan,
          rootRef,
          min,
          max,
          step,
          panDisabled,
          wheelDisabled,
          keyboardDisabled,
        });
        captured = { api, zoom, pan, rootRef, panDisabled, wheelDisabled, keyboardDisabled };
        return { rootRef };
      },
      template: `<div ref="rootRef" tabindex="0" />`,
    }),
    { attachTo: document.body }
  );
  mountedWrappers.push(wrapper);
  return captured;
}

beforeEach(() => {
  warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
  const vueWarns = warnSpy.mock.calls.filter((args: unknown[]) =>
    args.some((a: unknown) => typeof a === "string" && a.startsWith("[Vue warn]"))
  );
  expect(vueWarns, "expected zero [Vue warn] in test").toEqual([]);
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
  warnSpy.mockRestore();
});

describe("useZoomable", () => {
  describe("initial state", () => {
    it("starts with isDragging=false, panInputActive=false", () => {
      const h = makeHarness();
      expect(h.api.isDragging.value).toBe(false);
      expect(h.api.panInputActive.value).toBe(false);
    });

    it("exposes a Ctrl or ⌘ label depending on platform", () => {
      const h = makeHarness();
      expect(["Ctrl", "⌘"]).toContain(h.api.modifierKeyLabel.value);
    });
  });

  describe("clampZoom", () => {
    it("clamps below min", () => {
      const h = makeHarness({ min: 25, max: 200 });
      expect(h.api.clampZoom(10)).toBe(25);
    });
    it("clamps above max", () => {
      const h = makeHarness({ min: 25, max: 200 });
      expect(h.api.clampZoom(500)).toBe(200);
    });
    it("passes in-range values through", () => {
      const h = makeHarness({ min: 25, max: 200 });
      expect(h.api.clampZoom(120)).toBe(120);
    });
  });

  describe("resetZoom / resetPan / resetAll", () => {
    it("resetZoom sets zoom to 100", () => {
      const h = makeHarness({ zoom: 250 });
      h.api.resetZoom();
      expect(h.zoom.value).toBe(100);
    });
    it("resetPan zeros pan", () => {
      const h = makeHarness({ pan: { x: 50, y: -30 } });
      h.api.resetPan();
      expect(h.pan.value).toEqual({ x: 0, y: 0 });
    });
    it("resetPan no-op when already zero (no needless mutation)", () => {
      const h = makeHarness();
      const orig = h.pan.value;
      h.api.resetPan();
      expect(h.pan.value).toBe(orig);
    });
    it("resetAll resets both", () => {
      const h = makeHarness({ zoom: 250, pan: { x: 10, y: 20 } });
      h.api.resetAll();
      expect(h.zoom.value).toBe(100);
      expect(h.pan.value).toEqual({ x: 0, y: 0 });
    });
  });

  describe("wheel zoom", () => {
    it("Ctrl+wheel zooms in on negative deltaY", () => {
      const h = makeHarness({ zoom: 100 });
      h.rootRef.value!.dispatchEvent(makeWheel({ deltaY: -50, ctrlKey: true }));
      expect(h.zoom.value).toBe(110);
    });
    it("Ctrl+wheel zooms out on positive deltaY", () => {
      const h = makeHarness({ zoom: 100 });
      h.rootRef.value!.dispatchEvent(makeWheel({ deltaY: 50, ctrlKey: true }));
      expect(h.zoom.value).toBe(90);
    });
    it("plain wheel does nothing", () => {
      const h = makeHarness({ zoom: 100 });
      h.rootRef.value!.dispatchEvent(makeWheel({ deltaY: -50 }));
      expect(h.zoom.value).toBe(100);
    });
    it("respects wheelDisabled flag", () => {
      const h = makeHarness({ zoom: 100, wheelDisabled: true });
      h.rootRef.value!.dispatchEvent(makeWheel({ deltaY: -50, ctrlKey: true }));
      expect(h.zoom.value).toBe(100);
    });
    it("clamps at min/max bounds", () => {
      const h = makeHarness({ zoom: 25, min: 25, max: 200 });
      h.rootRef.value!.dispatchEvent(makeWheel({ deltaY: 50, ctrlKey: true }));
      expect(h.zoom.value).toBe(25);
    });
    it("metaKey (Mac) also triggers zoom", () => {
      const h = makeHarness({ zoom: 100 });
      h.rootRef.value!.dispatchEvent(makeWheel({ deltaY: -50, metaKey: true }));
      expect(h.zoom.value).toBe(110);
    });
  });

  describe("keyboard zoom", () => {
    function focusRoot(h: HarnessResult) {
      h.rootRef.value!.focus();
    }
    function fireKey(key: string, opts: Partial<KeyboardEventInit> = {}) {
      window.dispatchEvent(new KeyboardEvent("keydown", { key, ctrlKey: true, ...opts }));
    }

    it("Ctrl+= zooms in", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      fireKey("=");
      expect(h.zoom.value).toBe(110);
    });
    it("Ctrl++ zooms in (literal +)", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      fireKey("+");
      expect(h.zoom.value).toBe(110);
    });
    it("Ctrl+= no-op when zoom is already at max (no zoom.value mutation)", () => {
      const h = makeHarness({ zoom: 400, max: 400 });
      focusRoot(h);
      fireKey("=");
      expect(h.zoom.value).toBe(400);
    });
    it("Ctrl+- zooms out", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      fireKey("-");
      expect(h.zoom.value).toBe(90);
    });
    it("Ctrl+_ zooms out (shift+- alias)", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "_", ctrlKey: true }));
      expect(h.zoom.value).toBe(90);
    });
    it("Ctrl+0 resets to 100", () => {
      const h = makeHarness({ zoom: 250 });
      focusRoot(h);
      fireKey("0");
      expect(h.zoom.value).toBe(100);
    });
    it("Ctrl+Shift+= still zooms in (US keyboard `+`)", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      fireKey("=", { shiftKey: true });
      expect(h.zoom.value).toBe(110);
    });
    it("Ctrl+Shift+other (non-+/=) is ignored", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      fireKey("0", { shiftKey: true });
      expect(h.zoom.value).toBe(100);
    });
    it("Alt modifier blocks zoom keys", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      fireKey("=", { altKey: true });
      expect(h.zoom.value).toBe(100);
    });
    it("does nothing when focus is outside root", () => {
      const h = makeHarness({ zoom: 100 });
      // do NOT focus root → document.activeElement = body
      fireKey("=");
      expect(h.zoom.value).toBe(100);
    });
    it("ignores unknown keys", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      fireKey("a");
      expect(h.zoom.value).toBe(100);
    });
    it("plain `=` (no modifier) does nothing", () => {
      const h = makeHarness({ zoom: 100 });
      focusRoot(h);
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "=" }));
      expect(h.zoom.value).toBe(100);
    });
    it("respects keyboardDisabled flag", () => {
      const h = makeHarness({ zoom: 100, keyboardDisabled: true });
      focusRoot(h);
      fireKey("=");
      expect(h.zoom.value).toBe(100);
    });
  });

  describe("pan drag", () => {
    it("Ctrl+mousedown starts drag, mousemove updates pan, mouseup ends", () => {
      const h = makeHarness();
      h.api.onDragStart(
        new MouseEvent("mousedown", { button: 0, ctrlKey: true, clientX: 10, clientY: 20 })
      );
      expect(h.api.isDragging.value).toBe(true);
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 60, clientY: 70 }));
      expect(h.pan.value).toEqual({ x: 50, y: 50 });
      window.dispatchEvent(new MouseEvent("mouseup"));
      expect(h.api.isDragging.value).toBe(false);
    });

    it("Ctrl+drag pans at low zoom (45%) — delta is zoom-independent", () => {
      const h = makeHarness({ zoom: 45 });
      h.api.onDragStart(
        new MouseEvent("mousedown", { button: 0, ctrlKey: true, clientX: 10, clientY: 20 })
      );
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 60, clientY: 70 }));
      expect(h.pan.value).toEqual({ x: 50, y: 50 });
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    it("Ctrl+drag pans at high zoom (150%) — delta is zoom-independent", () => {
      const h = makeHarness({ zoom: 150 });
      h.api.onDragStart(
        new MouseEvent("mousedown", { button: 0, ctrlKey: true, clientX: 10, clientY: 20 })
      );
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 40, clientY: 5 }));
      expect(h.pan.value).toEqual({ x: 30, y: -15 });
      window.dispatchEvent(new MouseEvent("mouseup"));
    });

    it("plain mousedown (no modifier) does not start drag", () => {
      const h = makeHarness();
      h.api.onDragStart(new MouseEvent("mousedown", { button: 0, clientX: 10, clientY: 20 }));
      expect(h.api.isDragging.value).toBe(false);
    });

    it("right-click does not start drag", () => {
      const h = makeHarness();
      h.api.onDragStart(
        new MouseEvent("mousedown", { button: 2, ctrlKey: true, clientX: 10, clientY: 20 })
      );
      expect(h.api.isDragging.value).toBe(false);
    });

    it("respects panDisabled flag", () => {
      const h = makeHarness({ panDisabled: true });
      h.api.onDragStart(
        new MouseEvent("mousedown", { button: 0, ctrlKey: true, clientX: 10, clientY: 20 })
      );
      expect(h.api.isDragging.value).toBe(false);
    });

    it("mousemove without active drag is a no-op", () => {
      const h = makeHarness();
      // dispatch a stray mousemove (no addEventListener happened — listener is only
      // attached on drag start, so this never reaches onDragMove)
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 100, clientY: 100 }));
      expect(h.pan.value).toEqual({ x: 0, y: 0 });
    });

    it("preserves prior pan offset across multiple drags", () => {
      const h = makeHarness({ pan: { x: 5, y: 5 } });
      h.api.onDragStart(
        new MouseEvent("mousedown", { button: 0, ctrlKey: true, clientX: 0, clientY: 0 })
      );
      window.dispatchEvent(new MouseEvent("mousemove", { clientX: 10, clientY: 10 }));
      window.dispatchEvent(new MouseEvent("mouseup"));
      expect(h.pan.value).toEqual({ x: 15, y: 15 });
    });
  });

  describe("modifier-key tracking", () => {
    it("ctrl keydown sets panInputActive=true", () => {
      const h = makeHarness();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }));
      expect(h.api.panInputActive.value).toBe(true);
    });
    it("ctrl keyup clears panInputActive", () => {
      const h = makeHarness();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }));
      window.dispatchEvent(new KeyboardEvent("keyup", { key: "Control", ctrlKey: false }));
      expect(h.api.panInputActive.value).toBe(false);
    });
    it("window blur clears panInputActive", () => {
      const h = makeHarness();
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }));
      window.dispatchEvent(new Event("blur"));
      expect(h.api.panInputActive.value).toBe(false);
    });
    it("panDisabled keeps panInputActive false even when modifier held", () => {
      const h = makeHarness({ panDisabled: true });
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "Control", ctrlKey: true }));
      expect(h.api.panInputActive.value).toBe(false);
    });
  });

  describe("dblclick reset", () => {
    it("resets zoom + pan and fires onReset callback", () => {
      const onReset = vi.fn();
      const zoom = ref(250);
      const pan = ref<Pan>({ x: 50, y: 50 });
      const rootRef = ref<HTMLElement | null>(null);
      let api!: UseZoomableReturn;
      const wrapper = mount(
        defineComponent({
          setup() {
            api = useZoomable({ zoom, pan, rootRef, onReset });
            return { rootRef };
          },
          template: `<div ref="rootRef" />`,
        }),
        { attachTo: document.body }
      );
      mountedWrappers.push(wrapper);
      api.onDblClick();
      expect(zoom.value).toBe(100);
      expect(pan.value).toEqual({ x: 0, y: 0 });
      expect(onReset).toHaveBeenCalledOnce();
    });
  });

  describe("cleanup", () => {
    it("removes all window listeners on unmount", () => {
      const h = makeHarness({ zoom: 100 });
      h.rootRef.value!.focus();
      mountedWrappers.pop()!.unmount();
      // After unmount, keydown should not affect zoom
      window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true }));
      expect(h.zoom.value).toBe(100);
    });

    it("tolerates rootRef being null at mount/unmount time", () => {
      // Component whose rootRef never resolves — useZoomable must not throw.
      let zoom!: Ref<number>;
      let pan!: Ref<Pan>;
      const wrapper = mount(
        defineComponent({
          setup() {
            zoom = ref(100);
            pan = ref<Pan>({ x: 0, y: 0 });
            const rootRef = ref<HTMLElement | null>(null);
            useZoomable({ zoom, pan, rootRef });
            return {};
          },
          template: `<div />`,
        }),
        { attachTo: document.body }
      );
      mountedWrappers.push(wrapper);
      // wheel cannot dispatch on a missing root; just confirm no crash.
      expect(zoom.value).toBe(100);
      wrapper.unmount();
      expect(() => {
        window.dispatchEvent(new KeyboardEvent("keydown", { key: "=", ctrlKey: true }));
      }).not.toThrow();
    });
  });
});
