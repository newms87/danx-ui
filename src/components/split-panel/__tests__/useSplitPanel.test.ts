import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ref, nextTick } from "vue";
import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent } from "vue";
import { useSplitPanel } from "../useSplitPanel";
import type { SplitPanelConfig } from "../types";

/**
 * Test suite for useSplitPanel composable.
 *
 * Uses a mounted component wrapper for lifecycle hook support
 * (the composable uses watch which requires an active scope).
 */

// jsdom doesn't implement pointer capture — stub globally
HTMLElement.prototype.setPointerCapture = vi.fn();
HTMLElement.prototype.releasePointerCapture = vi.fn();

const TWO_PANELS: SplitPanelConfig[] = [
  { id: "sidebar", label: "Sidebar", defaultWidth: 30 },
  { id: "content", label: "Content", defaultWidth: 70 },
];

const THREE_PANELS: SplitPanelConfig[] = [
  { id: "nav", label: "Nav", defaultWidth: 1 },
  { id: "main", label: "Main", defaultWidth: 2 },
  { id: "aside", label: "Aside", defaultWidth: 1 },
];

const mountedWrappers: VueWrapper[] = [];

function createSplitPanel(
  panelsInput: SplitPanelConfig[] = TWO_PANELS,
  activeIds?: string[],
  options: { storageKey?: string; requireActive?: boolean; horizontal?: boolean } = {}
) {
  const panels = ref(panelsInput);
  const activePanelIds = ref(activeIds ?? panelsInput.map((p) => p.id));

  let result!: ReturnType<typeof useSplitPanel>;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useSplitPanel(panels, activePanelIds, options);
        return {};
      },
      template: "<div />",
    })
  );
  mountedWrappers.push(wrapper);

  return { ...result, panels, activePanelIds };
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  for (const w of mountedWrappers) w.unmount();
  mountedWrappers.length = 0;
});

describe("useSplitPanel", () => {
  describe("Initial State", () => {
    it("starts with all panels active and proportional widths", () => {
      const { panelStates } = createSplitPanel();

      expect(panelStates.value).toHaveLength(2);
      expect(panelStates.value[0]!.id).toBe("sidebar");
      expect(panelStates.value[1]!.id).toBe("content");
      // 30/(30+70)=30%, 70/(30+70)=70%
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(30);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(70);
    });

    it("computes proportional widths for equal weights", () => {
      const equalPanels: SplitPanelConfig[] = [
        { id: "a", label: "A", defaultWidth: 1 },
        { id: "b", label: "B", defaultWidth: 1 },
        { id: "c", label: "C", defaultWidth: 1 },
      ];
      const { panelStates } = createSplitPanel(equalPanels);

      expect(panelStates.value).toHaveLength(3);
      for (const state of panelStates.value) {
        expect(state.computedWidth).toBeCloseTo(100 / 3);
      }
    });

    it("computes proportional widths from weight ratios (not percentages)", () => {
      const { panelStates } = createSplitPanel(THREE_PANELS);

      // Weights: 1, 2, 1. Total: 4. Expected: 25%, 50%, 25%
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(25);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(50);
      expect(panelStates.value[2]!.computedWidth).toBeCloseTo(25);
    });

    it("returns empty array when no panels are active", () => {
      const { panelStates } = createSplitPanel(TWO_PANELS, []);

      expect(panelStates.value).toHaveLength(0);
    });

    it("handles subset of active panels with redistribution", () => {
      const { panelStates } = createSplitPanel(TWO_PANELS, ["content"]);

      expect(panelStates.value).toHaveLength(1);
      expect(panelStates.value[0]!.id).toBe("content");
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(100);
    });
  });

  describe("isActive", () => {
    it("returns true for active panels", () => {
      const { isActive } = createSplitPanel();

      expect(isActive("sidebar")).toBe(true);
      expect(isActive("content")).toBe(true);
    });

    it("returns false for inactive panels", () => {
      const { isActive } = createSplitPanel(TWO_PANELS, ["sidebar"]);

      expect(isActive("content")).toBe(false);
    });

    it("returns false for non-existent panel IDs", () => {
      const { isActive } = createSplitPanel();

      expect(isActive("nonexistent")).toBe(false);
    });
  });

  describe("togglePanel", () => {
    it("toggles off an active panel", () => {
      const { togglePanel, panelStates, activePanelIds } = createSplitPanel();

      togglePanel("sidebar");

      expect(activePanelIds.value).toEqual(["content"]);
      expect(panelStates.value).toHaveLength(1);
      expect(panelStates.value[0]!.id).toBe("content");
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(100);
    });

    it("toggles on an inactive panel in declaration order", () => {
      const { togglePanel, activePanelIds } = createSplitPanel(THREE_PANELS, ["aside"]);

      // Toggle on "nav" — should be inserted before "aside" (declaration order)
      togglePanel("nav");

      expect(activePanelIds.value).toEqual(["nav", "aside"]);
    });

    it("maintains declaration order when toggling on middle panel", () => {
      const { togglePanel, activePanelIds } = createSplitPanel(THREE_PANELS, ["nav", "aside"]);

      togglePanel("main");

      expect(activePanelIds.value).toEqual(["nav", "main", "aside"]);
    });

    it("clears customWidth on toggle-off so panel reverts to default on re-open", () => {
      const { togglePanel, panelStates } = createSplitPanel(THREE_PANELS);

      // First check initial state: 25%, 50%, 25%
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(25);

      // Toggle off "nav", then back on
      togglePanel("nav");
      expect(panelStates.value).toHaveLength(2);

      togglePanel("nav");
      expect(panelStates.value).toHaveLength(3);
      // Should revert to original proportions
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(25);
    });

    it("ignores toggle for non-existent panel IDs", () => {
      const { togglePanel, activePanelIds } = createSplitPanel();

      togglePanel("nonexistent");

      expect(activePanelIds.value).toEqual(["sidebar", "content"]);
    });
  });

  describe("requireActive", () => {
    it("prevents deactivating the last panel when requireActive is true", () => {
      const { togglePanel, activePanelIds } = createSplitPanel(TWO_PANELS, ["sidebar"], {
        requireActive: true,
      });

      togglePanel("sidebar");

      // Should still be active — can't deactivate the last one
      expect(activePanelIds.value).toEqual(["sidebar"]);
    });

    it("allows deactivating when more than one panel is active", () => {
      const { togglePanel, activePanelIds } = createSplitPanel(TWO_PANELS, undefined, {
        requireActive: true,
      });

      togglePanel("sidebar");

      expect(activePanelIds.value).toEqual(["content"]);
    });

    it("allows deactivating the last panel when requireActive is false", () => {
      const { togglePanel, activePanelIds } = createSplitPanel(TWO_PANELS, ["sidebar"], {
        requireActive: false,
      });

      togglePanel("sidebar");

      expect(activePanelIds.value).toEqual([]);
    });
  });

  describe("localStorage Persistence", () => {
    const STORAGE_KEY = "test-split-panel";

    it("saves state to localStorage after toggle", () => {
      const { togglePanel } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      togglePanel("sidebar");

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.activePanelIds).toEqual(["content"]);
    });

    it("restores active panels from localStorage on init", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePanelIds: ["content"],
          customWidths: {},
        })
      );

      const { activePanelIds, panelStates } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      expect(activePanelIds.value).toEqual(["content"]);
      expect(panelStates.value).toHaveLength(1);
    });

    it("restores custom widths from localStorage on init", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePanelIds: ["sidebar", "content"],
          customWidths: { sidebar: 50, content: 50 },
        })
      );

      const { panelStates } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(50);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(50);
    });

    it("discards stale panel IDs not in current config", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePanelIds: ["sidebar", "deleted-panel"],
          customWidths: { "deleted-panel": 50 },
        })
      );

      const { activePanelIds, panelStates } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      expect(activePanelIds.value).toEqual(["sidebar"]);
      expect(panelStates.value).toHaveLength(1);
    });

    it("ignores invalid JSON in localStorage", () => {
      localStorage.setItem(STORAGE_KEY, "not-valid-json{{{");

      const { activePanelIds } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      // Should fall back to all panels active
      expect(activePanelIds.value).toEqual(["sidebar", "content"]);
    });

    it("does not interact with localStorage when storageKey is omitted", () => {
      const spy = vi.spyOn(Storage.prototype, "setItem");

      const { togglePanel } = createSplitPanel();
      togglePanel("sidebar");

      expect(spy).not.toHaveBeenCalled();
      spy.mockRestore();
    });

    it("saves state when activePanelIds changes externally", async () => {
      const { activePanelIds } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      activePanelIds.value = ["sidebar"];
      await nextTick();

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.activePanelIds).toEqual(["sidebar"]);
    });

    it("discards custom widths with non-positive values", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePanelIds: ["sidebar", "content"],
          customWidths: { sidebar: -10, content: 0 },
        })
      );

      const { panelStates } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      // Should use defaults since stored widths are invalid
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(30);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(70);
    });

    it("handles stored object without customWidths key", () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activePanelIds: ["sidebar"] }));

      const { activePanelIds, panelStates } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      expect(activePanelIds.value).toEqual(["sidebar"]);
      // Should use defaults since no custom widths
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(100);
    });

    it("discards custom widths with non-number types", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePanelIds: ["sidebar", "content"],
          customWidths: { sidebar: "bad", content: true },
        })
      );

      const { panelStates } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      // Should use defaults since stored widths are non-numbers
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(30);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(70);
    });

    it("falls back to all active when all stored IDs are stale", () => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          activePanelIds: ["deleted-1", "deleted-2"],
          customWidths: {},
        })
      );

      const { activePanelIds } = createSplitPanel(TWO_PANELS, undefined, {
        storageKey: STORAGE_KEY,
      });

      // No valid IDs found — should keep the default (all active)
      expect(activePanelIds.value).toEqual(["sidebar", "content"]);
    });
  });

  describe("Width Redistribution", () => {
    it("always sums to 100%", () => {
      const { panelStates } = createSplitPanel(THREE_PANELS);

      const total = panelStates.value.reduce((sum, s) => sum + s.computedWidth, 0);
      expect(total).toBeCloseTo(100);
    });

    it("redistributes when a panel is toggled off", () => {
      const { togglePanel, panelStates } = createSplitPanel(THREE_PANELS);

      togglePanel("nav");

      // Remaining: main(2) + aside(1) = 3 total
      expect(panelStates.value).toHaveLength(2);
      expect(panelStates.value[0]!.id).toBe("main");
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(200 / 3);
      expect(panelStates.value[1]!.id).toBe("aside");
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(100 / 3);

      const total = panelStates.value.reduce((sum, s) => sum + s.computedWidth, 0);
      expect(total).toBeCloseTo(100);
    });

    it("handles single active panel as 100%", () => {
      const { panelStates } = createSplitPanel(THREE_PANELS, ["main"]);

      expect(panelStates.value).toHaveLength(1);
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(100);
    });
  });

  describe("Resize", () => {
    function createWithContainer(horizontal = false) {
      const panels = ref(TWO_PANELS);
      const activePanelIds = ref(["sidebar", "content"]);
      const containerRef = ref<HTMLElement | null>(null);

      let result!: ReturnType<typeof useSplitPanel>;
      const wrapper = mount(
        defineComponent({
          setup() {
            result = useSplitPanel(panels, activePanelIds, {
              containerRef,
              horizontal,
            });
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      // Create a mock container element with pointer capture stubs
      const mockContainer = document.createElement("div");
      vi.spyOn(mockContainer, "getBoundingClientRect").mockReturnValue({
        width: 1000,
        height: 500,
        top: 0,
        left: 0,
        right: 1000,
        bottom: 500,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      containerRef.value = mockContainer;

      return { ...result, panels, activePanelIds, containerRef };
    }

    it("does nothing when containerRef is not set", () => {
      const { startResize, panelStates } = createSplitPanel();

      const event = new PointerEvent("pointerdown", { clientX: 300 });
      startResize(0, event);

      // Widths should be unchanged
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(30);
    });

    it("does nothing for invalid handle index", () => {
      const { startResize, panelStates } = createWithContainer();

      const event = new PointerEvent("pointerdown", { clientX: 300 });
      startResize(5, event);

      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(30);
    });

    it("does nothing for negative handle index", () => {
      const { startResize, panelStates } = createWithContainer();

      const event = new PointerEvent("pointerdown", { clientX: 300 });
      startResize(-1, event);

      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(30);
    });

    it("sets isResizing to true during drag", () => {
      const { startResize, isResizing } = createWithContainer();

      const target = document.createElement("div");
      const event = new PointerEvent("pointerdown", {
        clientX: 300,
      });
      Object.defineProperty(event, "target", { value: target });

      startResize(0, event);
      expect(isResizing.value).toBe(true);
    });

    it("updates widths on pointermove", () => {
      const { startResize, panelStates } = createWithContainer();

      const target = document.createElement("div");
      const downEvent = new PointerEvent("pointerdown", {
        clientX: 300,
      });
      Object.defineProperty(downEvent, "target", { value: target });

      startResize(0, downEvent);

      // Simulate move +100px (10% of 1000px container)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 400,
      });
      target.dispatchEvent(moveEvent);

      // sidebar: 30% + 10% = 40%, content: 70% - 10% = 60%
      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(40);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(60);
    });

    it("clamps to minimum 5% on left panel", () => {
      const { startResize, panelStates } = createWithContainer();

      const target = document.createElement("div");
      const downEvent = new PointerEvent("pointerdown", {
        clientX: 300,
      });
      Object.defineProperty(downEvent, "target", { value: target });

      startResize(0, downEvent);

      // Move far left: -300px = -30% (sidebar would go to 0%)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 0,
      });
      target.dispatchEvent(moveEvent);

      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(5);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(95);
    });

    it("clamps to minimum 5% on right panel", () => {
      const { startResize, panelStates } = createWithContainer();

      const target = document.createElement("div");
      const downEvent = new PointerEvent("pointerdown", {
        clientX: 300,
      });
      Object.defineProperty(downEvent, "target", { value: target });

      startResize(0, downEvent);

      // Move far right: +700px = +70% (content would go to 0%)
      const moveEvent = new PointerEvent("pointermove", {
        clientX: 1000,
      });
      target.dispatchEvent(moveEvent);

      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(95);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(5);
    });

    it("sets isResizing to false on pointerup", () => {
      const { startResize, isResizing } = createWithContainer();

      const target = document.createElement("div");
      const downEvent = new PointerEvent("pointerdown", {
        clientX: 300,
      });
      Object.defineProperty(downEvent, "target", { value: target });

      startResize(0, downEvent);
      expect(isResizing.value).toBe(true);

      const upEvent = new PointerEvent("pointerup");
      target.dispatchEvent(upEvent);

      expect(isResizing.value).toBe(false);
    });

    it("uses clientY for horizontal orientation", () => {
      const { startResize, panelStates } = createWithContainer(true);

      const target = document.createElement("div");
      const downEvent = new PointerEvent("pointerdown", {
        clientY: 150,
      });
      Object.defineProperty(downEvent, "target", { value: target });

      startResize(0, downEvent);

      // Container height = 500. Move down +50px = +10%
      const moveEvent = new PointerEvent("pointermove", {
        clientY: 200,
      });
      target.dispatchEvent(moveEvent);

      expect(panelStates.value[0]!.computedWidth).toBeCloseTo(40);
      expect(panelStates.value[1]!.computedWidth).toBeCloseTo(60);
    });

    it("persists custom widths to localStorage after resize", () => {
      const STORAGE_KEY = "resize-test";
      const panels = ref(TWO_PANELS);
      const activePanelIds = ref(["sidebar", "content"]);
      const containerRef = ref<HTMLElement | null>(null);

      let result!: ReturnType<typeof useSplitPanel>;
      const wrapper = mount(
        defineComponent({
          setup() {
            result = useSplitPanel(panels, activePanelIds, {
              containerRef,
              storageKey: STORAGE_KEY,
            });
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      const mockContainer = document.createElement("div");
      vi.spyOn(mockContainer, "getBoundingClientRect").mockReturnValue({
        width: 1000,
        height: 500,
        top: 0,
        left: 0,
        right: 1000,
        bottom: 500,
        x: 0,
        y: 0,
        toJSON: () => ({}),
      });
      containerRef.value = mockContainer;

      const target = document.createElement("div");
      const downEvent = new PointerEvent("pointerdown", { clientX: 300 });
      Object.defineProperty(downEvent, "target", { value: target });

      result.startResize(0, downEvent);

      // Move
      const moveEvent = new PointerEvent("pointermove", { clientX: 400 });
      target.dispatchEvent(moveEvent);

      // Release
      const upEvent = new PointerEvent("pointerup");
      target.dispatchEvent(upEvent);

      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
      expect(stored.customWidths).toBeDefined();
      expect(stored.customWidths.sidebar).toBeDefined();
      expect(stored.customWidths.content).toBeDefined();
    });
  });
});
