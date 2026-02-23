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
        defaultItemHeight: 40,
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
      defaultItemHeight: 40,
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

  it("renders container with totalHeight and positioned wrapper", async () => {
    const wrapper = mountVirtualScroll({
      items: Array.from({ length: 50 }, (_, i) => `item-${i}`),
    });

    mockViewportDimensions(wrapper, { clientHeight: 200 });
    wrapper.find(".danx-scroll__viewport").element.dispatchEvent(new Event("scroll"));
    await nextTick();

    // The viewport contains a container div with height=totalHeight and position:relative
    const viewport = wrapper.find(".danx-scroll__viewport");
    const container = viewport.element.children[0] as HTMLElement;
    expect(container.style.height).toMatch(/\d+px/);
    expect(container.style.position).toBe("relative");

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

  it("emits loadMore when infinite scroll triggers", async () => {
    const wrapper = mountVirtualScroll({
      items: Array.from({ length: 10 }, (_, i) => `item-${i}`),
      infiniteScroll: true,
      canLoadMore: true,
      loading: false,
    });

    // DanxScroll's loadMore should bubble through
    const danxScroll = wrapper.findComponent({ name: "DanxScroll" });
    danxScroll.vm.$emit("loadMore");
    await nextTick();

    expect(wrapper.emitted("loadMore")).toBeTruthy();
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
      template: `<DanxVirtualScroll :items="items" :key-fn="keyFn" :default-item-height="40" :overscan="0">
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

  it("passes through loading slot", () => {
    const wrapper = mountVirtualScroll(
      {
        items: ["a"],
        infiniteScroll: true,
        loading: true,
      },
      {
        loading: '<span class="custom-loader">Loading items...</span>',
      }
    );

    expect(wrapper.find(".custom-loader").exists()).toBe(true);
  });

  it("passes through done slot", () => {
    const wrapper = mountVirtualScroll(
      {
        items: ["a"],
        infiniteScroll: true,
        canLoadMore: false,
      },
      {
        done: '<span class="custom-done">All loaded!</span>',
      }
    );

    expect(wrapper.find(".custom-done").exists()).toBe(true);
  });

  it("wraps DanxScroll component", () => {
    const wrapper = mountVirtualScroll({ items: ["a"] });
    expect(wrapper.find(".danx-scroll").exists()).toBe(true);
    expect(wrapper.find(".danx-scroll__viewport").exists()).toBe(true);
  });
});
