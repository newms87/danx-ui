import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick, ref, type Ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollWindow } from "../useScrollWindow";
import type { ScrollWindowReturn } from "../virtual-scroll-types";

function createMockViewport(overrides: Record<string, number> = {}): HTMLElement {
  const el = document.createElement("div");
  const props: Record<string, number> = {
    scrollTop: 0,
    clientHeight: 400,
    scrollHeight: 4000,
    ...overrides,
  };

  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(el, key, { value, writable: true, configurable: true });
  }

  return el;
}

describe("useScrollWindow", () => {
  const mountedWrappers: VueWrapper[] = [];

  function createComposable(
    viewportEl: Ref<HTMLElement | null>,
    items: Ref<string[]>,
    options: {
      defaultItemHeight?: number;
      overscan?: number;
      keyFn?: (item: string, i: number) => string | number;
      totalItems?: number;
    } = {}
  ) {
    let result!: ScrollWindowReturn<string>;
    const wrapper = mount(
      defineComponent({
        setup() {
          result = useScrollWindow<string>(viewportEl, {
            items,
            ...options,
          });
          return {};
        },
        template: "<div />",
      })
    );
    mountedWrappers.push(wrapper);
    return result;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      cb(0);
      return 0;
    });
  });

  afterEach(() => {
    for (const w of mountedWrappers) w.unmount();
    mountedWrappers.length = 0;
  });

  it("computes initial range with no scroll", () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 100 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 3 });

    // Viewport is 200px, items are 40px each = 5 visible items
    // Plus overscan of 3 items (120px buffer) below = 200+120=320px / 40px = 8 items (0-7)
    expect(result.startIndex.value).toBe(0);
    expect(result.endIndex.value).toBe(7);
    expect(result.startOffset.value).toBe(0);
  });

  it("shifts range on scroll down", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 100 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // Scroll down to 400px (items 10-14 visible at 40px each)
    Object.defineProperty(el, "scrollTop", { value: 400, writable: true, configurable: true });
    el.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(result.startIndex.value).toBe(10);
    expect(result.startOffset.value).toBe(400); // 10 items * 40px
  });

  it("uses cached heights after measureItem", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 50 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // Measure first 5 items as 60px each instead of 40px default
    for (let i = 0; i < 5; i++) {
      const mockEl = document.createElement("div");
      Object.defineProperty(mockEl, "offsetHeight", { value: 60, configurable: true });
      result.measureItem(i, mockEl);
    }

    // Trigger recalculation
    el.dispatchEvent(new Event("scroll"));
    await nextTick();

    // With 60px items, first 5 items take 300px > 200px viewport
    // So fewer items should be visible
    expect(result.totalHeight.value).toBe(5 * 60 + 45 * 40); // 5 measured + 45 default
  });

  it("handles mixed cached and uncached heights in spacers", async () => {
    const el = createMockViewport({ clientHeight: 100, scrollTop: 200 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // Measure items 0-2 as 80px each
    for (let i = 0; i < 3; i++) {
      const mockEl = document.createElement("div");
      Object.defineProperty(mockEl, "offsetHeight", { value: 80, configurable: true });
      result.measureItem(i, mockEl);
    }

    // Re-trigger with scroll
    el.dispatchEvent(new Event("scroll"));
    await nextTick();

    // First 3 items = 240px (cached at 80px), rest = 40px default
    // scrollTop=200: items 0-1 = 160px before viewport, item 2 starts at 160px
    // startIndex=2, so topSpacer = items 0+1 = 160px
    expect(result.startOffset.value).toBe(160);
    expect(result.totalHeight.value).toBe(3 * 80 + 17 * 40);
  });

  it("updates when items array grows", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 10 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    const initialTotal = result.totalHeight.value;
    expect(initialTotal).toBe(400); // 10 * 40

    // Append items (simulating remote load)
    items.value = [...items.value, ...Array.from({ length: 10 }, (_, i) => `item-${10 + i}`)];
    await nextTick();

    expect(result.totalHeight.value).toBe(800); // 20 * 40
  });

  it("respects overscan count", () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 400 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 100 }, (_, i) => `item-${i}`));

    const withOverscan = createComposable(viewportEl, items, {
      defaultItemHeight: 40,
      overscan: 5,
    });
    const startWithOverscan = withOverscan.startIndex.value;
    const endWithOverscan = withOverscan.endIndex.value;

    const viewportEl2 = ref<HTMLElement | null>(
      createMockViewport({ clientHeight: 200, scrollTop: 400 })
    );
    const withoutOverscan = createComposable(viewportEl2, items, {
      defaultItemHeight: 40,
      overscan: 0,
    });
    const startWithout = withoutOverscan.startIndex.value;
    const endWithout = withoutOverscan.endIndex.value;

    // With overscan, range should be wider
    expect(startWithOverscan).toBeLessThanOrEqual(startWithout);
    expect(endWithOverscan).toBeGreaterThanOrEqual(endWithout);
  });

  it("scrollToIndex sets viewport scrollTop", () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 50 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40 });

    result.scrollToIndex(10);
    expect(el.scrollTop).toBe(400); // 10 * 40px
  });

  it("caches heights by key and survives reordering", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a", "b", "c", "d", "e"]);

    const keyFn = (item: string) => item;
    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, keyFn });

    // Measure "b" as 100px
    const mockEl = document.createElement("div");
    Object.defineProperty(mockEl, "offsetHeight", { value: 100, configurable: true });
    result.measureItem("b", mockEl);

    // Reorder: move "b" to end
    items.value = ["a", "c", "d", "e", "b"];
    await nextTick();

    // Total should still reflect "b" at 100px, others at 40px default
    expect(result.totalHeight.value).toBe(4 * 40 + 100);
  });

  it("removes scroll listener on unmount", () => {
    const el = createMockViewport();
    const removeEventListenerSpy = vi.spyOn(el, "removeEventListener");
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a", "b"]);

    createComposable(viewportEl, items);

    // Unmount last wrapper
    mountedWrappers[mountedWrappers.length - 1]!.unmount();
    mountedWrappers.pop();

    expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("handles empty items array", () => {
    const el = createMockViewport();
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref<string[]>([]);

    const result = createComposable(viewportEl, items);

    expect(result.visibleItems.value).toEqual([]);
    expect(result.startIndex.value).toBe(0);
    expect(result.endIndex.value).toBe(0);
    expect(result.startOffset.value).toBe(0);
    expect(result.totalHeight.value).toBe(0);
  });

  it("handles null viewport element", () => {
    const viewportEl = ref<HTMLElement | null>(null);
    const items = ref(["a", "b", "c"]);

    const result = createComposable(viewportEl, items);

    // With no viewport, visibleItems returns empty (no rendering without a viewport)
    expect(result.startIndex.value).toBe(0);
    expect(result.endIndex.value).toBe(0);
    expect(result.visibleItems.value).toEqual([]);
  });

  it("reattaches listener when viewport element changes", async () => {
    const el1 = createMockViewport({ clientHeight: 200 });
    const el2 = createMockViewport({ clientHeight: 300 });
    const removeSpy1 = vi.spyOn(el1, "removeEventListener");
    const addSpy2 = vi.spyOn(el2, "addEventListener");

    const viewportEl = ref<HTMLElement | null>(el1);
    const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

    createComposable(viewportEl, items, { defaultItemHeight: 40 });

    // Change viewport element
    viewportEl.value = el2;
    await nextTick();

    expect(removeSpy1).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(addSpy2).toHaveBeenCalledWith("scroll", expect.any(Function), { passive: true });
  });

  it("measureItem ignores null elements", () => {
    const el = createMockViewport();
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a"]);

    const result = createComposable(viewportEl, items);

    // Should not throw
    result.measureItem("key", null);
    expect(result.totalHeight.value).toBe(40); // Still uses default
  });

  it("measureItem triggers recalculate when height changes", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // Initial: 200px / 40px = 5 items (0-4), endIndex=4
    expect(result.visibleItems.value.length).toBe(5);
    expect(result.endIndex.value).toBe(4);

    // Measure first 5 items as 80px each (double the default)
    for (let i = 0; i < 5; i++) {
      const mockEl = document.createElement("div");
      Object.defineProperty(mockEl, "offsetHeight", { value: 80, configurable: true });
      result.measureItem(i, mockEl);
    }

    // Measurement batches via microtask — flush it
    await nextTick();

    // With 80px items, only ~2-3 fit in 200px viewport (endIndex should decrease)
    expect(result.endIndex.value).toBeLessThan(4);
    expect(result.visibleItems.value.length).toBeLessThanOrEqual(3);
  });

  it("measureItem does not recalculate when height is unchanged", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 10 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // Measure item 0 at 60px (different from default)
    const mockEl = document.createElement("div");
    Object.defineProperty(mockEl, "offsetHeight", { value: 60, configurable: true });
    result.measureItem(0, mockEl);
    await nextTick();

    const totalAfterFirst = result.totalHeight.value;
    expect(totalAfterFirst).toBe(60 + 9 * 40); // 420

    // Measure same item at same height — should not trigger recalculate
    result.measureItem(0, mockEl);
    await nextTick();
    expect(result.totalHeight.value).toBe(totalAfterFirst);
  });

  it("measureItem ignores zero-height elements", () => {
    const el = createMockViewport();
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a"]);

    const result = createComposable(viewportEl, items);

    const mockEl = document.createElement("div");
    Object.defineProperty(mockEl, "offsetHeight", { value: 0, configurable: true });
    result.measureItem("key", mockEl);

    expect(result.totalHeight.value).toBe(40); // Still uses default
  });

  it("scrollToIndex does nothing with null viewport", () => {
    const viewportEl = ref<HTMLElement | null>(null);
    const items = ref(["a", "b"]);

    const result = createComposable(viewportEl, items);

    // Should not throw
    result.scrollToIndex(0);
  });

  it("scrollToIndex clamps to items length", () => {
    const el = createMockViewport();
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 5 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40 });

    result.scrollToIndex(100); // Way beyond items
    expect(el.scrollTop).toBe(200); // 5 * 40px (capped at all items)
  });

  it("uses default keyFn (index) when none provided", async () => {
    const el = createMockViewport({ clientHeight: 200 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a", "b", "c"]);

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40 });

    // Measure by index key
    const mockEl = document.createElement("div");
    Object.defineProperty(mockEl, "offsetHeight", { value: 80, configurable: true });
    result.measureItem(0, mockEl);
    await nextTick(); // flush microtask-batched recalculate

    expect(result.totalHeight.value).toBe(80 + 40 + 40); // first measured, rest default
  });

  it("visibleItems returns correct slice", () => {
    const el = createMockViewport({ clientHeight: 120, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"]);

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // 120px viewport / 40px items = 3 visible items
    expect(result.visibleItems.value.length).toBe(3);
    expect(result.visibleItems.value).toEqual(["a", "b", "c"]);
  });

  it("rAF throttles scroll handler", async () => {
    // Override the beforeEach rAF mock to store callback instead of executing immediately
    let rafCallback: FrameRequestCallback | null = null;
    vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
      rafCallback = cb;
      return 1;
    });

    const el = createMockViewport({ clientHeight: 200 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 50 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // Initial calculation happened in attachListener, reset to check throttling
    const initialStart = result.startIndex.value;

    // Fire multiple scroll events
    Object.defineProperty(el, "scrollTop", { value: 400, writable: true, configurable: true });
    el.dispatchEvent(new Event("scroll"));
    el.dispatchEvent(new Event("scroll"));
    el.dispatchEvent(new Event("scroll"));

    // Not yet updated (rAF pending)
    expect(result.startIndex.value).toBe(initialStart);

    // Fire rAF
    rafCallback!(0);
    expect(result.startIndex.value).toBe(10);
  });

  it("handles scroll past all items (!foundStart branch)", () => {
    // 5 items at 40px = 200px total, scroll far past end
    const el = createMockViewport({ clientHeight: 200, scrollTop: 1000 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 5 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // When scrolled past all items, both indices point to the last item
    expect(result.startIndex.value).toBe(4);
    expect(result.endIndex.value).toBe(4);
  });

  it("removes listener when viewport changes to null", async () => {
    const el = createMockViewport({ clientHeight: 200 });
    const removeSpy = vi.spyOn(el, "removeEventListener");
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a", "b"]);

    createComposable(viewportEl, items);

    // Change viewport to null
    viewportEl.value = null;
    await nextTick();

    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });

  it("scrollToIndex uses cached measured heights", () => {
    const el = createMockViewport({ clientHeight: 200 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 10 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40 });

    // Measure first 3 items at 60px each
    for (let i = 0; i < 3; i++) {
      const mockEl = document.createElement("div");
      Object.defineProperty(mockEl, "offsetHeight", { value: 60, configurable: true });
      result.measureItem(i, mockEl);
    }

    // scrollToIndex(5) should sum: 3*60 + 2*40 = 260
    result.scrollToIndex(5);
    expect(el.scrollTop).toBe(260);
  });

  it("adjusts when items array shrinks", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    expect(result.visibleItems.value.length).toBe(5); // 200/40 = 5
    expect(result.totalHeight.value).toBe(800); // 20 * 40

    // Shrink to 3 items
    items.value = ["item-0", "item-1", "item-2"];
    await nextTick();

    expect(result.visibleItems.value.length).toBe(3);
    expect(result.totalHeight.value).toBe(120); // 3 * 40
  });

  it("resets to start when scrolling back to top", async () => {
    const el = createMockViewport({ clientHeight: 200, scrollTop: 400 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(Array.from({ length: 50 }, (_, i) => `item-${i}`));

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40, overscan: 0 });

    // Initially scrolled down
    expect(result.startIndex.value).toBe(10);
    expect(result.startOffset.value).toBe(400);

    // Scroll back to top
    Object.defineProperty(el, "scrollTop", { value: 0, writable: true, configurable: true });
    el.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(result.startIndex.value).toBe(0);
    expect(result.startOffset.value).toBe(0);
  });

  describe("totalItems", () => {
    it("uses fixed totalHeight when totalItems is provided", () => {
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 10 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      // totalHeight = 500 * 40 = 20000, regardless of loaded items count
      expect(result.totalHeight.value).toBe(20000);
    });

    it("totalHeight stays fixed even after height measurements", async () => {
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 10 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      // Measure some items at different heights
      for (let i = 0; i < 5; i++) {
        const mockEl = document.createElement("div");
        Object.defineProperty(mockEl, "offsetHeight", { value: 80, configurable: true });
        result.measureItem(i, mockEl);
      }
      await nextTick();

      // totalHeight should still be fixed at totalItems * defaultItemHeight
      expect(result.totalHeight.value).toBe(20000);
    });

    it("totalHeight stays fixed when items grow", async () => {
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 10 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      expect(result.totalHeight.value).toBe(20000);

      // Add more items
      items.value = [...items.value, ...Array.from({ length: 20 }, (_, i) => `item-${10 + i}`)];
      await nextTick();

      // Still fixed
      expect(result.totalHeight.value).toBe(20000);
    });

    it("empty items with totalItems still produces fixed totalHeight", () => {
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref<string[]>([]);

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 100,
      });

      expect(result.totalHeight.value).toBe(4000);
    });

    it("visible range still uses measured heights even with totalItems", async () => {
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1000,
      });

      // Measure first 5 items as 80px
      for (let i = 0; i < 5; i++) {
        const mockEl = document.createElement("div");
        Object.defineProperty(mockEl, "offsetHeight", { value: 80, configurable: true });
        result.measureItem(i, mockEl);
      }
      await nextTick();

      // With 80px items, only ~2-3 fit in 200px viewport
      expect(result.endIndex.value).toBeLessThan(4);
      // But totalHeight is still fixed
      expect(result.totalHeight.value).toBe(40000);
    });

    it("scrolling to 50% shows items at the midpoint of totalItems", () => {
      // 1000 total items at 40px = 40000px total, viewport 400px
      // scrollTop = 20000 → targetIndex = floor(20000/40) = 500
      const totalItemsCount = 1000;
      const el = createMockViewport({ clientHeight: 400, scrollTop: 20000 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: totalItemsCount }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: totalItemsCount,
      });

      expect(result.startIndex.value).toBe(500);
    });

    it("proportional mapping clamps at scrollTop=0", () => {
      const el = createMockViewport({ clientHeight: 400, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 100 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      expect(result.startIndex.value).toBe(0);
      expect(result.startOffset.value).toBe(0);
    });

    it("proportional mapping clamps at scrollTop=max", () => {
      // 500 items * 40px = 20000, viewport 400px, maxScroll = 19600
      // scrollTop = 19600 → targetIndex = floor(19600/40) = 490
      const el = createMockViewport({ clientHeight: 400, scrollTop: 19600 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 500 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      expect(result.startIndex.value).toBe(490);
      // endIndex fills viewport: 400px / 40px = 10 items → endIndex = 499
      expect(result.endIndex.value).toBe(499);
    });

    it("startOffset uses proportional defaultItemHeight-based positioning", () => {
      // Scroll to item 122: scrollTop = 4900, floor(4900/40) = 122
      const el = createMockViewport({ clientHeight: 400, scrollTop: 4900 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 500 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      // offset = startIndex * defaultItemHeight (proportional positioning)
      expect(result.startOffset.value).toBe(result.startIndex.value * 40);
    });

    it("overscan pushes startIndex earlier in proportional mode", () => {
      // 500 items * 40px = 20000, viewport 400
      // scrollTop = 10000 → targetIndex = floor(10000/40) = 250
      // overscan = 5 → newStart = 250 - 5 = 245
      const el = createMockViewport({ clientHeight: 400, scrollTop: 10000 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 500 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 5,
        totalItems: 500,
      });

      expect(result.startIndex.value).toBe(245);
      // endIndex should extend beyond 250 to fill viewport + overscan
      expect(result.endIndex.value).toBeGreaterThan(250);
    });

    it("clamps startIndex to 0 when overscan exceeds targetIndex", () => {
      // scrollTop = 80, defaultItemHeight = 40 → targetIndex = floor(80/40) = 2
      // overscan = 5 → newStart = max(0, 2 - 5) = 0
      const el = createMockViewport({ clientHeight: 400, scrollTop: 80 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 500 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 5,
        totalItems: 500,
      });

      expect(result.startIndex.value).toBe(0);
    });

    it("clamps startIndex when totalItems exceeds loaded items", () => {
      // totalItems=1000 but only 20 items loaded
      // scrollTop puts targetIndex well beyond loaded range
      // 1000 * 40 = 40000, viewport 400, maxScroll = 39600
      // scrollTop = 19800 → ratio = 0.5 → targetIndex = 499
      // But only 20 items loaded → newStart clamped to 19
      const el = createMockViewport({ clientHeight: 400, scrollTop: 19800 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1000,
      });

      expect(result.startIndex.value).toBe(19);
      expect(result.endIndex.value).toBe(19);
    });

    it("handles totalItems smaller than loaded items count", () => {
      // totalItems=5 but 20 items loaded
      // 5 * 40 = 200, viewport 200, maxScroll = max(1, 0) = 1
      // scrollTop=0 → ratio = 0 → targetIndex = 0
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 5,
      });

      expect(result.startIndex.value).toBe(0);
      expect(result.totalHeight.value).toBe(200);
    });

    it("scrollToIndex uses proportional mapping with totalItems", () => {
      // scrollToIndex(250) → 250 * 40 = 10000
      const el = createMockViewport({ clientHeight: 400, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 500 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      result.scrollToIndex(250);
      // Direct conversion: index * defaultItemHeight
      expect(el.scrollTop).toBe(10000);
    });

    it("scrollToIndex with totalItems=1 sets scrollTop to 0", () => {
      const el = createMockViewport({ clientHeight: 400, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(["only-item"]);

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        totalItems: 1,
      });

      result.scrollToIndex(0);
      expect(el.scrollTop).toBe(0);
    });

    it("clamps scrollRatio when scrollTop exceeds maxScroll", () => {
      // 100 items * 40px = 4000, viewport 400, maxScroll = 3600
      // scrollTop = 5000 (beyond max) → ratio clamped to 1.0 → targetIndex = 99
      const el = createMockViewport({ clientHeight: 400, scrollTop: 5000 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 100 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 100,
      });

      expect(result.startIndex.value).toBe(99);
    });

    it("totalItems=1 always shows first item regardless of scroll", () => {
      // 1 * 40 = 40, viewport 400, maxScroll = max(1, -360) = 1
      // Any scrollTop → ratio clamped, targetIndex = floor(ratio * 0) = 0
      const el = createMockViewport({ clientHeight: 400, scrollTop: 100 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(["only"]);

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1,
      });

      expect(result.startIndex.value).toBe(0);
      expect(result.endIndex.value).toBe(0);
    });

    it("placeholdersAfter is zero when all visible items are loaded", () => {
      const el = createMockViewport({ clientHeight: 400, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 500 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 500,
      });

      expect(result.placeholdersAfter.value).toBe(0);
    });

    it("placeholdersAfter is exact when scrolled past loaded items", () => {
      // 1000 total items, only 20 loaded
      // scrollTop=19960, defaultItemHeight=40 → targetIndex = floor(19960/40) = 499
      // fullStart=499, walk fills 400px: 400/40 = 10 items → fullEnd=508
      // placeholdersAfter = 508 - max(0, 19) = 489
      const el = createMockViewport({ clientHeight: 400, scrollTop: 19960 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1000,
      });

      expect(result.placeholdersAfter.value).toBe(489);
    });

    it("placeholdersAfter grows as user scrolls further past loaded items", () => {
      const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

      // scrollTop=800 → targetIndex=20, fullStart=20
      // Walk fills 400px: 10 items → fullEnd=29
      // placeholdersAfter = 29 - 19 = 10
      const viewportEl1 = ref<HTMLElement | null>(
        createMockViewport({ clientHeight: 400, scrollTop: 800 })
      );
      const result1 = createComposable(viewportEl1, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1000,
      });

      // scrollTop=2000 → targetIndex=50, fullStart=50
      // Walk fills 400px: 10 items → fullEnd=59
      // placeholdersAfter = 59 - 19 = 40
      const viewportEl2 = ref<HTMLElement | null>(
        createMockViewport({ clientHeight: 400, scrollTop: 2000 })
      );
      const result2 = createComposable(viewportEl2, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1000,
      });

      expect(result1.placeholdersAfter.value).toBe(10);
      expect(result2.placeholdersAfter.value).toBe(40);
      expect(result2.placeholdersAfter.value).toBeGreaterThan(result1.placeholdersAfter.value);
    });

    it("placeholdersAfter is zero when not using totalItems", () => {
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 10 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
      });

      expect(result.placeholdersAfter.value).toBe(0);
    });

    it("empty items with totalItems has zero placeholders", () => {
      const el = createMockViewport({ clientHeight: 200, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref<string[]>([]);

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        totalItems: 100,
      });

      // Empty items hits the early return — no placeholders
      expect(result.placeholdersAfter.value).toBe(0);
    });

    it("placeholdersAfter transitions from zero to positive at loaded boundary", () => {
      const items = ref(Array.from({ length: 20 }, (_, i) => `item-${i}`));

      // scrollTop=760 → targetIndex = floor(760/40) = 19 (last loaded item)
      // fullStart=19, walk fills 400px: 10 items → fullEnd=28
      // placeholdersAfter = 28 - 19 = 9
      const elPast = createMockViewport({ clientHeight: 400, scrollTop: 760 });
      const viewportPast = ref<HTMLElement | null>(elPast);
      const resultPast = createComposable(viewportPast, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1000,
      });

      // scrollTop=400 → targetIndex = 10, well within loaded range
      // fullStart=10, walk fills 400px: 10 items → fullEnd=19 (all loaded)
      // placeholdersAfter = max(0, 19 - 19) = 0
      const elWithin = createMockViewport({ clientHeight: 400, scrollTop: 400 });
      const viewportWithin = ref<HTMLElement | null>(elWithin);
      const resultWithin = createComposable(viewportWithin, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 1000,
      });

      expect(resultWithin.placeholdersAfter.value).toBe(0);
      expect(resultPast.placeholdersAfter.value).toBe(9);
    });

    it("measured heights affect visible range but not scroll mapping", async () => {
      // 100 total items at 40px = 4000, viewport 400, maxScroll = 3600
      // scrollTop=0 → targetIndex=0
      const el = createMockViewport({ clientHeight: 400, scrollTop: 0 });
      const viewportEl = ref<HTMLElement | null>(el);
      const items = ref(Array.from({ length: 100 }, (_, i) => `item-${i}`));

      const result = createComposable(viewportEl, items, {
        defaultItemHeight: 40,
        overscan: 0,
        totalItems: 100,
      });

      // At scrollTop=0, should show items starting at 0 filling 400px viewport
      // Default: 400/40 = 10 items (0-9)
      expect(result.endIndex.value).toBe(9);

      // Measure items 0-4 as 100px each → only 4 fit in 400px
      for (let i = 0; i < 5; i++) {
        const mockEl = document.createElement("div");
        Object.defineProperty(mockEl, "offsetHeight", { value: 100, configurable: true });
        result.measureItem(i, mockEl);
      }
      await nextTick();

      // Fewer items visible due to taller measured heights
      expect(result.endIndex.value).toBeLessThan(9);
      // totalHeight unchanged
      expect(result.totalHeight.value).toBe(4000);
      // startIndex still 0 (scroll position didn't change)
      expect(result.startIndex.value).toBe(0);
    });
  });

  it("unmount with null viewport does not throw", () => {
    const viewportEl = ref<HTMLElement | null>(null);
    const items = ref(["a"]);

    createComposable(viewportEl, items);

    // Unmount when currentEl is already null — should not throw
    const wrapper = mountedWrappers.pop()!;
    wrapper.unmount();
  });
});
