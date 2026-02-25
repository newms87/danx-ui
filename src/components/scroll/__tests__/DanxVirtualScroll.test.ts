import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DanxVirtualScroll from "../DanxVirtualScroll.vue";

/**
 * Helper to mock viewport dimensions on the .danx-scroll__viewport element.
 * Must be called after mount since the element is created during mount.
 */
function mockViewportDimensions(
  wrapper: VueWrapper,
  overrides: Record<string, number> = {}
): HTMLElement {
  const viewport = wrapper.find(".danx-scroll__viewport").element as HTMLElement;
  const defaults: Record<string, number> = {
    scrollTop: 0,
    scrollHeight: 4000,
    clientHeight: 200,
    clientWidth: 300,
    scrollWidth: 300,
    ...overrides,
  };

  for (const [key, value] of Object.entries(defaults)) {
    Object.defineProperty(viewport, key, { value, writable: true, configurable: true });
  }

  return viewport;
}

describe("DanxVirtualScroll", () => {
  const mountedWrappers: VueWrapper[] = [];

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

  function mountVirtualScroll(
    props: Record<string, unknown> = {},
    slots: Record<string, unknown> = {}
  ) {
    const items = (props.items as string[]) ?? Array.from({ length: 100 }, (_, i) => `item-${i}`);
    const wrapper = mount(DanxVirtualScroll, {
      props: {
        items,
        defaultItemSize: 40,
        overscan: 0,
        ...props,
      },
      slots: {
        item: `<template #item="{ item, index }"><span class="test-item">{{ index }}: {{ item }}</span></template>`,
        ...slots,
      },
    });
    mountedWrappers.push(wrapper);
    return wrapper;
  }

  it("renders only visible items, not all items", async () => {
    const wrapper = mountVirtualScroll({
      items: Array.from({ length: 1000 }, (_, i) => `item-${i}`),
    });

    mockViewportDimensions(wrapper, { clientHeight: 200 });

    // Trigger recalculation via scroll event
    const viewport = wrapper.find(".danx-scroll__viewport").element;
    viewport.dispatchEvent(new Event("scroll"));
    await nextTick();

    const renderedItems = wrapper.findAll(".test-item");
    // 200px viewport / 40px items = exactly 5 visible items (overscan=0)
    expect(renderedItems.length).toBe(5);
  });

  it("scoped slot receives correct item and index", async () => {
    const items = ["alpha", "beta", "gamma", "delta", "epsilon"];
    const wrapper = mountVirtualScroll({
      items,
      defaultItemSize: 40,
      overscan: 0,
    });

    mockViewportDimensions(wrapper, { clientHeight: 200 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    const renderedItems = wrapper.findAll(".test-item");
    expect(renderedItems.length).toBe(5);
    expect(renderedItems[0]!.text()).toBe("0: alpha");
    expect(renderedItems[1]!.text()).toBe("1: beta");
    expect(renderedItems[4]!.text()).toBe("4: epsilon");
  });

  it("renders container with totalSize and positioned wrapper", async () => {
    const wrapper = mountVirtualScroll({
      items: Array.from({ length: 50 }, (_, i) => `item-${i}`),
    });

    mockViewportDimensions(wrapper, { clientHeight: 200 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    // The viewport contains a container div with height=totalSize and position:relative
    const viewport = wrapper.find(".danx-scroll__viewport");
    const container = viewport.element.children[0] as HTMLElement;
    expect(container.style.height).toMatch(/\d+px/);
    expect(container.style.position).toBe("relative");
    expect(container.style.flexShrink).toBe("0");

    // Inside the container is a wrapper div with position:absolute and top offset
    const positionedWrapper = container.children[0] as HTMLElement;
    expect(positionedWrapper.style.position).toBe("absolute");
    expect(positionedWrapper.style.top).toMatch(/\d+px/);
    expect(positionedWrapper.style.width).toBe("100%");
  });

  it("passes through DanxScroll props", () => {
    const wrapper = mountVirtualScroll({
      items: ["a"],
      size: "lg",
      variant: "danger",
      persistent: true,
      direction: "vertical",
    });

    const scrollWrapper = wrapper.find(".danx-scroll");
    expect(scrollWrapper.classes()).toContain("danx-scroll--lg");
  });

  it("does not pass infinite scroll props to DanxScroll", () => {
    const wrapper = mountVirtualScroll({
      items: Array.from({ length: 10 }, (_, i) => `item-${i}`),
      infiniteScroll: true,
      canLoadMore: true,
      loading: false,
    });

    // DanxScroll should not receive infinite scroll props
    const danxScroll = wrapper.findComponent({ name: "DanxScroll" });
    // DanxScroll should receive its default (false), not the true we passed to DanxVirtualScroll
    expect(danxScroll.props("infiniteScroll")).toBe(false);
  });

  it("does not show indicators when infiniteScroll is false", async () => {
    const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll({
      items,
      infiniteScroll: false,
      loading: true,
      canLoadMore: false,
      defaultItemSize: 40,
      overscan: 0,
    });

    mockViewportDimensions(wrapper, { clientHeight: 400 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    // No indicators even though loading=true and canLoadMore=false
    expect(wrapper.find(".danx-scroll__loading").exists()).toBe(false);
    expect(wrapper.find(".danx-scroll__done").exists()).toBe(false);
  });

  it("updates when items array changes reactively", async () => {
    const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll({ items });

    mockViewportDimensions(wrapper, { clientHeight: 400 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    const initialCount = wrapper.findAll(".test-item").length;
    expect(initialCount).toBe(5);

    // Update items
    const newItems = Array.from({ length: 10 }, (_, i) => `item-${i}`);
    await wrapper.setProps({ items: newItems });
    await nextTick();

    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    const updatedCount = wrapper.findAll(".test-item").length;
    expect(updatedCount).toBe(10);
  });

  it("forwards keyFn prop to composable", async () => {
    interface NamedItem {
      id: string;
      name: string;
    }

    const items: NamedItem[] = [
      { id: "a1", name: "Alpha" },
      { id: "b2", name: "Beta" },
    ];

    const ItemComponent = defineComponent({
      template: `<DanxVirtualScroll :items="items" :key-fn="keyFn" :default-item-size="40" :overscan="0">
        <template #item="{ item }"><span class="keyed-item">{{ item.name }}</span></template>
      </DanxVirtualScroll>`,
      components: { DanxVirtualScroll },
      setup() {
        const keyFn = (item: NamedItem) => item.id;
        return { items, keyFn };
      },
    });

    const wrapper = mount(ItemComponent);
    mountedWrappers.push(wrapper);

    mockViewportDimensions(wrapper, { clientHeight: 200 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    const renderedItems = wrapper.findAll(".keyed-item");
    expect(renderedItems.length).toBe(2);
    expect(renderedItems[0]!.text()).toBe("Alpha");
  });

  it("renders loading indicator at end of visible items", async () => {
    const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll(
      {
        items,
        infiniteScroll: true,
        loading: true,
        defaultItemSize: 40,
        overscan: 0,
      },
      {
        loading: '<span class="custom-loader">Loading items...</span>',
      }
    );

    // Mock viewport so all items are visible (endIndex >= items.length - 1)
    mockViewportDimensions(wrapper, { clientHeight: 400 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".custom-loader").exists()).toBe(true);
  });

  it("renders done indicator at end of visible items", async () => {
    const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll(
      {
        items,
        infiniteScroll: true,
        canLoadMore: false,
        defaultItemSize: 40,
        overscan: 0,
      },
      {
        done: '<span class="custom-done">All loaded!</span>',
      }
    );

    mockViewportDimensions(wrapper, { clientHeight: 400 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".custom-done").exists()).toBe(true);
  });

  it("hides indicators when not scrolled to end of loaded items", async () => {
    const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll(
      {
        items,
        infiniteScroll: true,
        loading: true,
        defaultItemSize: 40,
        overscan: 0,
      },
      {
        loading: '<span class="custom-loader">Loading items...</span>',
      }
    );

    // Small viewport — only first few items visible, not at end
    mockViewportDimensions(wrapper, { clientHeight: 200 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".custom-loader").exists()).toBe(false);
  });

  it("renders default loading text when no loading slot provided", async () => {
    const items = Array.from({ length: 3 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll({
      items,
      infiniteScroll: true,
      loading: true,
      defaultItemSize: 40,
      overscan: 0,
    });

    mockViewportDimensions(wrapper, { clientHeight: 400 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".danx-scroll__loading").exists()).toBe(true);
    expect(wrapper.find(".danx-scroll__loading").text()).toBe("Loading...");
  });

  it("renders default done text when no done slot provided", async () => {
    const items = Array.from({ length: 3 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll({
      items,
      infiniteScroll: true,
      canLoadMore: false,
      defaultItemSize: 40,
      overscan: 0,
    });

    mockViewportDimensions(wrapper, { clientHeight: 400 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    expect(wrapper.find(".danx-scroll__done").exists()).toBe(true);
    expect(wrapper.find(".danx-scroll__done").text()).toBe("No more items");
  });

  it("totalItems prop produces stable totalSize in container", async () => {
    const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
    const wrapper = mountVirtualScroll({
      items,
      defaultItemSize: 40,
      totalItems: 500,
      overscan: 0,
    });

    mockViewportDimensions(wrapper, { clientHeight: 200 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    // Container height should be totalItems * defaultItemSize = 20000px
    const viewport = wrapper.find(".danx-scroll__viewport");
    const container = viewport.element.children[0] as HTMLElement;
    expect(container.style.height).toBe("20000px");
  });

  it("wraps DanxScroll component", () => {
    const wrapper = mountVirtualScroll({ items: ["a"] });
    expect(wrapper.find(".danx-scroll").exists()).toBe(true);
    expect(wrapper.find(".danx-scroll__viewport").exists()).toBe(true);
  });

  describe("placeholder rendering", () => {
    it("renders exact number of placeholder skeletons when scrolled past loaded items", async () => {
      const items = Array.from({ length: 20 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        totalItems: 1000,
        overscan: 0,
      });

      // scrollTop=800 → targetIndex=20, fullStart=20, fill 200px = 5 items → fullEnd=24
      // placeholdersAfter = 24 - 19 = 5
      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 800 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const placeholders = wrapper.findAll(".danx-virtual-scroll__placeholder");
      expect(placeholders.length).toBe(5);
    });

    it("does not render placeholders when all visible items are loaded", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        totalItems: 100,
        overscan: 0,
      });

      mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });
      wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.findAll(".danx-virtual-scroll__placeholder").length).toBe(0);
    });

    it("does not render placeholders without totalItems", async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
      });

      mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });
      wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.findAll(".danx-virtual-scroll__placeholder").length).toBe(0);
    });

    it("renders default skeleton content in placeholder", async () => {
      const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        totalItems: 1000,
        overscan: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 200 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const skeletons = wrapper.findAll(".danx-skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it("renders custom placeholder slot with correct index values", async () => {
      const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll(
        {
          items,
          defaultItemSize: 40,
          totalItems: 1000,
          overscan: 0,
        },
        {
          placeholder:
            '<template #placeholder="{ index }"><span class="custom-placeholder">Loading {{ index }}</span></template>',
        }
      );

      // scrollTop=200 → targetIndex=5, fullStart=5, fill 200px = 5 items → fullEnd=9
      // endIndex clamped to 4, placeholdersAfter = 9 - 4 = 5
      // Placeholder indices: endIndex + 1..5 = 5,6,7,8,9
      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 200 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const customPlaceholders = wrapper.findAll(".custom-placeholder");
      expect(customPlaceholders.length).toBe(5);
      // Verify index prop values: endIndex(4) + p(1..5) = 5,6,7,8,9
      expect(customPlaceholders[0]!.text()).toBe("Loading 5");
      expect(customPlaceholders[4]!.text()).toBe("Loading 9");
      // Should not have default skeletons
      expect(wrapper.findAll(".danx-skeleton").length).toBe(0);
    });

    it("placeholder height matches defaultItemSize", async () => {
      const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 50,
        totalItems: 1000,
        overscan: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 200 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const placeholders = wrapper.findAll(".danx-virtual-scroll__placeholder");
      expect(placeholders.length).toBeGreaterThan(0);
      expect(placeholders[0]!.attributes("style")).toContain("height: 50px");
    });
  });

  describe("scrollPosition model", () => {
    it("emits update:scrollPosition with startIndex on scroll", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 400 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      // scrollTop 400 / 40px per item = startIndex 10 (walk-from-zero mode)
      const emitted = wrapper.emitted("update:scrollPosition");
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual([10]);
    });

    it("does not emit when startIndex stays at 0 (no change)", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      // startIndex stays 0 → watch doesn't fire → no emission
      expect(wrapper.emitted("update:scrollPosition")).toBeUndefined();
    });

    it("scrolls viewport when scrollPosition prop changes", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
        scrollPosition: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });

      // Change scrollPosition to index 10
      await wrapper.setProps({ scrollPosition: 10 });
      await nextTick();

      // scrollToIndex(10) should set scrollTop = 10 * 40 = 400 (walk-from-zero mode)
      expect(viewport.scrollTop).toBe(400);
    });

    it("works with totalItems proportional mode", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        totalItems: 1000,
        overscan: 0,
        scrollPosition: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });

      // Jump to index 50
      await wrapper.setProps({ scrollPosition: 50 });
      await nextTick();

      // Proportional mode: scrollTop = index * defaultItemSize = 50 * 40 = 2000
      expect(viewport.scrollTop).toBe(2000);
    });

    it("defaults to 0 and emits on first scroll away", async () => {
      const items = Array.from({ length: 50 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });

      // No emission at initial position (startIndex stays 0)
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();
      expect(wrapper.emitted("update:scrollPosition")).toBeUndefined();

      // Scroll to a different position — now it emits
      Object.defineProperty(viewport, "scrollTop", {
        value: 200,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const emitted = wrapper.emitted("update:scrollPosition");
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual([5]);
    });

    it("does not re-emit when parent sets scrollPosition (circular guard)", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
        scrollPosition: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });

      // Parent sets scrollPosition to 10 — this triggers scrollToIndex which fires
      // a scroll event and recalculate. The guard should prevent re-emission.
      await wrapper.setProps({ scrollPosition: 10 });
      await nextTick();

      // Simulate the scroll event that scrollToIndex causes
      Object.defineProperty(viewport, "scrollTop", {
        value: 400,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      // Should NOT have emitted update:scrollPosition back (guard is active)
      expect(wrapper.emitted("update:scrollPosition")).toBeUndefined();
    });

    it("does not scroll when scrollPosition matches current startIndex (no-op)", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
        scrollPosition: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 400 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      // startIndex is now 10, scrollTop is 400
      // Set scrollPosition to 10 (same as startIndex) — should be a no-op
      await wrapper.setProps({ scrollPosition: 10 });
      await nextTick();

      // scrollTop should remain 400 (scrollToIndex was not called)
      expect(viewport.scrollTop).toBe(400);
    });

    it("debug prop logs scroll-to-model sync", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
        scrollPosition: 0,
        debug: true,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });

      // Scroll to trigger startIndex change → [scroll→model] log
      Object.defineProperty(viewport, "scrollTop", {
        value: 400,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const logMessages = consoleSpy.mock.calls.map((c) => c[0]);
      expect(logMessages.some((m: string) => m.includes("[scroll"))).toBe(true);

      consoleSpy.mockRestore();
    });

    it("debug prop logs model-to-scroll sync and fromScrollEvent skip", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
        scrollPosition: 0,
        debug: true,
      });

      mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });

      // Set scrollPosition from parent → [model→scroll] log
      consoleSpy.mockClear();
      await wrapper.setProps({ scrollPosition: 10 });
      await nextTick();

      const modelLogs = consoleSpy.mock.calls.map((c) => c[0]);
      expect(modelLogs.some((m: string) => m.includes("[model"))).toBe(true);

      consoleSpy.mockRestore();
    });

    it("re-enables scroll-driven emissions after guard clears", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
        scrollPosition: 0,
      });

      const viewport = mockViewportDimensions(wrapper, { clientHeight: 200, scrollTop: 0 });

      // Parent sets scrollPosition (guard activates)
      await wrapper.setProps({ scrollPosition: 10 });
      await nextTick();

      // Guard clears after rAF (mocked to fire synchronously)
      // Now a user-initiated scroll should emit normally
      Object.defineProperty(viewport, "scrollTop", {
        value: 800,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const emitted = wrapper.emitted("update:scrollPosition");
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual([20]);
    });
  });

  describe("infiniteScroll with totalItems", () => {
    it("emits loadMore when endIndex reaches loaded items boundary", async () => {
      // 10 loaded items, totalItems=100, so there are unloaded items beyond
      const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        totalItems: 100,
        overscan: 0,
        infiniteScroll: true,
        canLoadMore: true,
        loading: false,
      });

      const viewport = mockViewportDimensions(wrapper, {
        clientHeight: 200,
        scrollTop: 0,
        scrollHeight: 4000,
      });

      // Scroll to end of loaded items (item 9 is the last at index 9)
      // scrollTop = 9 * 40 = 360 should put endIndex at or past 9
      Object.defineProperty(viewport, "scrollTop", {
        value: 360,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.emitted("loadMore")).toBeTruthy();
    });

    it("does not emit loadMore when loading is true", async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        totalItems: 100,
        overscan: 0,
        infiniteScroll: true,
        canLoadMore: true,
        loading: true,
      });

      const viewport = mockViewportDimensions(wrapper, {
        clientHeight: 200,
        scrollTop: 0,
        scrollHeight: 4000,
      });

      Object.defineProperty(viewport, "scrollTop", {
        value: 360,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.emitted("loadMore")).toBeUndefined();
    });

    it("does not emit loadMore when canLoadMore is false", async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        totalItems: 100,
        overscan: 0,
        infiniteScroll: true,
        canLoadMore: false,
        loading: false,
      });

      const viewport = mockViewportDimensions(wrapper, {
        clientHeight: 200,
        scrollTop: 0,
        scrollHeight: 4000,
      });

      Object.defineProperty(viewport, "scrollTop", {
        value: 360,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      expect(wrapper.emitted("loadMore")).toBeUndefined();
    });

    it("uses setupScrollInfinite when infiniteScroll is true but totalItems is not set", async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        defaultItemSize: 40,
        overscan: 0,
        infiniteScroll: true,
        canLoadMore: true,
        loading: false,
      });

      // Without totalItems, the endIndex watcher is NOT used — setupScrollInfinite handles it.
      // This test just verifies no crash and the component renders correctly.
      expect(wrapper.find(".danx-scroll__viewport").exists()).toBe(true);
    });
  });

  describe("horizontal mode", () => {
    function mockHorizontalViewport(
      wrapper: VueWrapper,
      overrides: Record<string, number> = {}
    ): HTMLElement {
      const viewport = wrapper.find(".danx-scroll__viewport").element as HTMLElement;
      const defaults: Record<string, number> = {
        scrollLeft: 0,
        scrollWidth: 4000,
        clientWidth: 300,
        clientHeight: 200,
        scrollTop: 0,
        scrollHeight: 200,
        ...overrides,
      };

      for (const [key, value] of Object.entries(defaults)) {
        Object.defineProperty(viewport, key, { value, writable: true, configurable: true });
      }

      return viewport;
    }

    it("renders only visible items horizontally", async () => {
      const wrapper = mountVirtualScroll({
        items: Array.from({ length: 1000 }, (_, i) => `item-${i}`),
        direction: "horizontal",
        defaultItemSize: 100,
      });

      mockHorizontalViewport(wrapper, { clientWidth: 300 });

      const viewport = wrapper.find(".danx-scroll__viewport").element;
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const renderedItems = wrapper.findAll(".test-item");
      // 300px viewport / 100px items = 3 visible items (overscan=0)
      expect(renderedItems.length).toBe(3);
    });

    it("container uses width instead of height", async () => {
      const wrapper = mountVirtualScroll({
        items: Array.from({ length: 50 }, (_, i) => `item-${i}`),
        direction: "horizontal",
        defaultItemSize: 100,
      });

      mockHorizontalViewport(wrapper, { clientWidth: 300 });
      wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
      await nextTick();

      const viewport = wrapper.find(".danx-scroll__viewport");
      const container = viewport.element.children[0] as HTMLElement;
      // Container should have width (total content size) and height: 100%
      expect(container.style.width).toMatch(/\d+px/);
      expect(container.style.height).toBe("100%");
      expect(container.style.position).toBe("relative");
    });

    it("wrapper uses left instead of top and flex row layout", async () => {
      const wrapper = mountVirtualScroll({
        items: Array.from({ length: 50 }, (_, i) => `item-${i}`),
        direction: "horizontal",
        defaultItemSize: 100,
      });

      mockHorizontalViewport(wrapper, { clientWidth: 300 });
      wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
      await nextTick();

      const viewport = wrapper.find(".danx-scroll__viewport");
      const container = viewport.element.children[0] as HTMLElement;
      const positionedWrapper = container.children[0] as HTMLElement;
      expect(positionedWrapper.style.position).toBe("absolute");
      expect(positionedWrapper.style.left).toMatch(/\d+px/);
      expect(positionedWrapper.style.height).toBe("100%");
      expect(positionedWrapper.style.display).toBe("flex");
      expect(positionedWrapper.style.flexDirection).toBe("row");
    });

    it("scrollPosition works in horizontal mode", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        direction: "horizontal",
        defaultItemSize: 100,
        scrollPosition: 0,
      });

      const viewport = mockHorizontalViewport(wrapper, { clientWidth: 300, scrollLeft: 0 });

      // Change scrollPosition to index 10
      await wrapper.setProps({ scrollPosition: 10 });
      await nextTick();

      // scrollToIndex(10) should set scrollLeft = 10 * 100 = 1000
      expect(viewport.scrollLeft).toBe(1000);
    });

    it("placeholder sizing uses width when horizontal", async () => {
      const items = Array.from({ length: 5 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        direction: "horizontal",
        defaultItemSize: 120,
        totalItems: 1000,
      });

      const viewport = mockHorizontalViewport(wrapper, { clientWidth: 300, scrollLeft: 600 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const placeholders = wrapper.findAll(".danx-virtual-scroll__placeholder");
      expect(placeholders.length).toBeGreaterThan(0);
      expect(placeholders[0]!.attributes("style")).toContain("width: 120px");
    });

    it("emits update:scrollPosition on horizontal scroll", async () => {
      const items = Array.from({ length: 100 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        direction: "horizontal",
        defaultItemSize: 100,
      });

      const viewport = mockHorizontalViewport(wrapper, { clientWidth: 300, scrollLeft: 500 });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      // scrollLeft 500 / 100px per item = startIndex 5
      const emitted = wrapper.emitted("update:scrollPosition");
      expect(emitted).toBeTruthy();
      expect(emitted![emitted!.length - 1]).toEqual([5]);
    });

    it("infiniteScroll with totalItems emits loadMore in horizontal mode", async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        direction: "horizontal",
        defaultItemSize: 100,
        totalItems: 100,
        overscan: 0,
        infiniteScroll: true,
        canLoadMore: true,
        loading: false,
      });

      const viewport = mockHorizontalViewport(wrapper, { clientWidth: 300, scrollLeft: 0 });

      // Scroll to end of loaded items (index 9 is last loaded)
      // scrollLeft = 900 → targetIndex = floor(900/100) = 9
      Object.defineProperty(viewport, "scrollLeft", {
        value: 900,
        writable: true,
        configurable: true,
      });
      viewport.dispatchEvent(new Event("scroll"));
      await nextTick();

      const loadMoreEmits = wrapper.emitted("loadMore");
      expect(loadMoreEmits).toBeTruthy();
    });

    it("totalItems with horizontal direction uses width for container", async () => {
      const items = Array.from({ length: 10 }, (_, i) => `item-${i}`);
      const wrapper = mountVirtualScroll({
        items,
        direction: "horizontal",
        defaultItemSize: 100,
        totalItems: 500,
      });

      mockHorizontalViewport(wrapper, { clientWidth: 300 });
      wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
      await nextTick();

      const viewport = wrapper.find(".danx-scroll__viewport");
      const container = viewport.element.children[0] as HTMLElement;
      // Container width should be totalItems * defaultItemSize = 50000px
      expect(container.style.width).toBe("50000px");
    });
  });
});
