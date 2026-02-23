import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";

const { mockUseInfiniteScroll } = vi.hoisted(() => ({
  mockUseInfiniteScroll: vi.fn(),
}));
vi.mock("@vueuse/core", () => ({
  useInfiniteScroll: mockUseInfiniteScroll,
}));

import DanxInfiniteScroll from "../DanxInfiniteScroll.vue";

describe("DanxInfiniteScroll", () => {
  let capturedCallback: (() => Promise<void>) | null;

  const mountedWrappers: ReturnType<typeof mount>[] = [];

  function mountComponent(options?: Parameters<typeof mount>[1]) {
    const wrapper = mount(DanxInfiniteScroll, options);
    mountedWrappers.push(wrapper);
    return wrapper;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallback = null;

    mockUseInfiniteScroll.mockImplementation((_el: unknown, callback: () => Promise<void>) => {
      capturedCallback = callback;
      return { reset: vi.fn(), isLoading: { value: false } };
    });
  });

  afterEach(() => {
    for (const w of mountedWrappers) w.unmount();
    mountedWrappers.length = 0;
  });

  describe("Rendering", () => {
    it("renders a div with danx-infinite-scroll class by default", () => {
      const wrapper = mountComponent();

      expect(wrapper.element.tagName).toBe("DIV");
      expect(wrapper.classes()).toContain("danx-infinite-scroll");
    });

    it("renders custom tag when tag prop is set", () => {
      const wrapper = mountComponent({
        props: { tag: "section" },
      });

      expect(wrapper.element.tagName).toBe("SECTION");
    });

    it("renders default slot content", () => {
      const wrapper = mountComponent({
        slots: {
          default: '<div class="item">Test item</div>',
        },
      });

      expect(wrapper.find(".item").exists()).toBe(true);
      expect(wrapper.text()).toContain("Test item");
    });
  });

  describe("Loading state", () => {
    it("does not show loading indicator when loading is false", () => {
      const wrapper = mountComponent({
        props: { loading: false },
      });

      expect(wrapper.find(".danx-infinite-scroll__loading").exists()).toBe(false);
    });

    it("shows default loading text when loading is true", () => {
      const wrapper = mountComponent({
        props: { loading: true },
      });

      const loading = wrapper.find(".danx-infinite-scroll__loading");
      expect(loading.exists()).toBe(true);
      expect(loading.text()).toBe("Loading...");
    });

    it("renders custom loading slot content", () => {
      const wrapper = mountComponent({
        props: { loading: true },
        slots: {
          loading: '<span class="custom-spinner">Fetching...</span>',
        },
      });

      expect(wrapper.find(".custom-spinner").exists()).toBe(true);
      expect(wrapper.text()).toContain("Fetching...");
    });
  });

  describe("Done state", () => {
    it("does not show done indicator when canLoadMore is true", () => {
      const wrapper = mountComponent({
        props: { canLoadMore: true },
      });

      expect(wrapper.find(".danx-infinite-scroll__done").exists()).toBe(false);
    });

    it("shows default done text when canLoadMore is false", () => {
      const wrapper = mountComponent({
        props: { canLoadMore: false },
      });

      const done = wrapper.find(".danx-infinite-scroll__done");
      expect(done.exists()).toBe(true);
      expect(done.text()).toBe("No more items");
    });

    it("renders custom done slot content", () => {
      const wrapper = mountComponent({
        props: { canLoadMore: false },
        slots: {
          done: '<span class="custom-done">All done!</span>',
        },
      });

      expect(wrapper.find(".custom-done").exists()).toBe(true);
      expect(wrapper.text()).toContain("All done!");
    });
  });

  describe("Combined states", () => {
    it("shows both loading and done when loading is true and canLoadMore is false", () => {
      const wrapper = mountComponent({
        props: { loading: true, canLoadMore: false },
      });

      expect(wrapper.find(".danx-infinite-scroll__loading").exists()).toBe(true);
      expect(wrapper.find(".danx-infinite-scroll__done").exists()).toBe(true);
    });

    it("shows neither loading nor done in default state", () => {
      const wrapper = mountComponent();

      expect(wrapper.find(".danx-infinite-scroll__loading").exists()).toBe(false);
      expect(wrapper.find(".danx-infinite-scroll__done").exists()).toBe(false);
    });
  });

  describe("Direction slot ordering", () => {
    it("renders loading after content for direction=bottom", () => {
      const wrapper = mountComponent({
        props: { loading: true, direction: "bottom" },
        slots: { default: '<div class="content">Items</div>' },
      });

      const children = Array.from(wrapper.element.children) as Element[];
      const contentIdx = children.findIndex((el) => el.classList.contains("content"));
      const loadingIdx = children.findIndex((el) =>
        el.classList.contains("danx-infinite-scroll__loading")
      );
      expect(loadingIdx).toBeGreaterThan(contentIdx);
    });

    it("renders loading before content for direction=top", () => {
      const wrapper = mountComponent({
        props: { loading: true, direction: "top" },
        slots: { default: '<div class="content">Items</div>' },
      });

      const children = Array.from(wrapper.element.children) as Element[];
      const contentIdx = children.findIndex((el) => el.classList.contains("content"));
      const loadingIdx = children.findIndex((el) =>
        el.classList.contains("danx-infinite-scroll__loading")
      );
      expect(loadingIdx).toBeLessThan(contentIdx);
    });

    it("renders done before content for direction=top", () => {
      const wrapper = mountComponent({
        props: { canLoadMore: false, direction: "top" },
        slots: { default: '<div class="content">Items</div>' },
      });

      const children = Array.from(wrapper.element.children) as Element[];
      const contentIdx = children.findIndex((el) => el.classList.contains("content"));
      const doneIdx = children.findIndex((el) =>
        el.classList.contains("danx-infinite-scroll__done")
      );
      expect(doneIdx).toBeLessThan(contentIdx);
    });
  });

  describe("Events", () => {
    it("emits loadMore when scroll callback fires", async () => {
      mountComponent();

      expect(capturedCallback).not.toBeNull();
      await capturedCallback!();
      expect(mountedWrappers[0]!.emitted("loadMore")).toHaveLength(1);
    });

    it("does not emit loadMore when loading is true", async () => {
      const wrapper = mountComponent({
        props: { loading: true },
      });

      await capturedCallback!();
      expect(wrapper.emitted("loadMore")).toBeUndefined();
    });
  });

  describe("VueUse integration", () => {
    it("passes distance prop to useInfiniteScroll", () => {
      mountComponent({
        props: { distance: 500 },
      });

      const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
      expect(options.distance).toBe(500);
    });

    it("passes direction prop to useInfiniteScroll", () => {
      mountComponent({
        props: { direction: "top" },
      });

      const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
      expect(options.direction).toBe("top");
    });

    it("uses default distance of 200", () => {
      mountComponent();

      const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
      expect(options.distance).toBe(200);
    });

    it("uses default direction of bottom", () => {
      mountComponent();

      const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
      expect(options.direction).toBe("bottom");
    });

    it("passes canLoadMore as function to VueUse", () => {
      mountComponent({
        props: { canLoadMore: true },
      });

      const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
      expect(typeof options.canLoadMore).toBe("function");
    });
  });
});
