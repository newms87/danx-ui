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
    // Plus overscan of 3 items below (120px buffer) = items 0 through ~10
    expect(result.startIndex.value).toBe(0);
    // endIndex depends on viewport + overscan buffer
    expect(result.endIndex.value).toBeGreaterThanOrEqual(7);
    expect(result.topSpacerHeight.value).toBe(0);
    expect(result.bottomSpacerHeight.value).toBeGreaterThan(0);
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
    expect(result.topSpacerHeight.value).toBe(400); // 10 items * 40px
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
    expect(result.topSpacerHeight.value).toBe(160);
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
    expect(result.bottomSpacerHeight.value).toBeGreaterThan(0);
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
    expect(result.topSpacerHeight.value).toBe(0);
    expect(result.bottomSpacerHeight.value).toBe(0);
    expect(result.totalHeight.value).toBe(0);
  });

  it("handles null viewport element", () => {
    const viewportEl = ref<HTMLElement | null>(null);
    const items = ref(["a", "b", "c"]);

    const result = createComposable(viewportEl, items);

    // Should not crash — startIndex and endIndex default to 0,
    // so visibleItems returns items.slice(0, 1) as a safe default
    expect(result.startIndex.value).toBe(0);
    expect(result.endIndex.value).toBe(0);
    expect(result.visibleItems.value).toEqual(["a"]);
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

  it("uses default keyFn (index) when none provided", () => {
    const el = createMockViewport({ clientHeight: 200 });
    const viewportEl = ref<HTMLElement | null>(el);
    const items = ref(["a", "b", "c"]);

    const result = createComposable(viewportEl, items, { defaultItemHeight: 40 });

    // Measure by index key
    const mockEl = document.createElement("div");
    Object.defineProperty(mockEl, "offsetHeight", { value: 80, configurable: true });
    result.measureItem(0, mockEl);

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

  it("unmount with null viewport does not throw", () => {
    const viewportEl = ref<HTMLElement | null>(null);
    const items = ref(["a"]);

    createComposable(viewportEl, items);

    // Unmount when currentEl is already null — should not throw
    const wrapper = mountedWrappers.pop()!;
    wrapper.unmount();
  });
});
