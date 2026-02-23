/* eslint-disable @typescript-eslint/no-explicit-any */
const mockUseInfiniteScroll = vi.hoisted(() =>
  vi.fn((..._args: any[]) => ({
    reset: vi.fn(),
    isLoading: { value: false },
  }))
);

vi.mock("@vueuse/core", () => ({
  useInfiniteScroll: mockUseInfiniteScroll,
}));

import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useScrollInfinite, type UseScrollInfiniteOptions } from "../useScrollInfinite";

describe("useScrollInfinite", () => {
  const mountedWrappers: VueWrapper[] = [];
  let capturedCallback: (() => void) | null = null;

  function createComposable(options: Partial<UseScrollInfiniteOptions> = {}) {
    const el = ref<HTMLElement | null>(document.createElement("div"));
    const result = { value: null as ReturnType<typeof useScrollInfinite> | null };

    const wrapper = mount(
      defineComponent({
        setup() {
          result.value = useScrollInfinite(el, {
            onLoadMore: vi.fn(),
            ...options,
          });
          return {};
        },
        template: "<div />",
      })
    );
    mountedWrappers.push(wrapper);
    return { result: result.value!, el };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallback = null;

    mockUseInfiniteScroll.mockImplementation((_el: any, callback: any) => {
      capturedCallback = callback as () => void;
      return {
        reset: vi.fn(),
        isLoading: { value: false },
      };
    });
  });

  afterEach(() => {
    for (const w of mountedWrappers) w.unmount();
    mountedWrappers.length = 0;
  });

  describe("VueUse integration", () => {
    it("calls useInfiniteScroll with the element ref", () => {
      const el = ref<HTMLElement | null>(document.createElement("div"));

      const wrapper = mount(
        defineComponent({
          setup() {
            useScrollInfinite(el, { onLoadMore: vi.fn() });
            return {};
          },
          template: "<div />",
        })
      );
      mountedWrappers.push(wrapper);

      expect(mockUseInfiniteScroll).toHaveBeenCalledWith(
        el,
        expect.any(Function),
        expect.any(Object)
      );
    });

    it("passes distance and direction to VueUse options", () => {
      createComposable({ distance: 500, direction: "top" });

      const callArgs = mockUseInfiniteScroll.mock.calls[0] as any[];
      const options = callArgs[2];
      expect(options.distance).toBe(500);
      expect(options.direction).toBe("top");
    });

    it("uses default distance of 200 and direction of bottom", () => {
      createComposable();

      const callArgs = mockUseInfiniteScroll.mock.calls[0] as any[];
      const options = callArgs[2];
      expect(options.distance).toBe(200);
      expect(options.direction).toBe("bottom");
    });

    it("passes canLoadMore as a function that reads the ref", () => {
      const canLoadMore = ref(true);
      createComposable({ canLoadMore });

      const callArgs = mockUseInfiniteScroll.mock.calls[0] as any[];
      const options = callArgs[2];
      expect(options.canLoadMore()).toBe(true);

      canLoadMore.value = false;
      expect(options.canLoadMore()).toBe(false);
    });

    it("omits canLoadMore from VueUse when not provided", () => {
      createComposable();

      const callArgs = mockUseInfiniteScroll.mock.calls[0] as any[];
      const options = callArgs[2];
      expect(options.canLoadMore).toBeUndefined();
    });

    it("returns reset and isLoading from VueUse", () => {
      const mockReset = vi.fn();
      mockUseInfiniteScroll.mockReturnValue({
        reset: mockReset,
        isLoading: { value: true },
      });

      const { result } = createComposable();

      expect(result.reset).toBe(mockReset);
      expect(result.isLoading.value).toBe(true);
    });
  });

  describe("Loading guard", () => {
    it("does not call onLoadMore when loading is true", async () => {
      const loading = ref(true);
      const onLoadMore = vi.fn();
      createComposable({ loading, onLoadMore });

      await capturedCallback!();
      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it("calls onLoadMore when loading is false", async () => {
      const loading = ref(false);
      const onLoadMore = vi.fn();
      createComposable({ loading, onLoadMore });

      await capturedCallback!();
      expect(onLoadMore).toHaveBeenCalledOnce();
    });

    it("calls onLoadMore when loading ref is not provided", async () => {
      const onLoadMore = vi.fn();
      createComposable({ onLoadMore });

      await capturedCallback!();
      expect(onLoadMore).toHaveBeenCalledOnce();
    });
  });

  describe("Reset on loading complete", () => {
    it("calls reset when loading transitions from true to false", async () => {
      const mockReset = vi.fn();
      mockUseInfiniteScroll.mockImplementation((_el: any, callback: any) => {
        capturedCallback = callback as () => void;
        return { reset: mockReset, isLoading: { value: false } };
      });

      const loading = ref(true);
      createComposable({ loading });

      loading.value = false;
      await nextTick();

      expect(mockReset).toHaveBeenCalledOnce();
    });

    it("does not call reset when loading transitions from false to true", async () => {
      const mockReset = vi.fn();
      mockUseInfiniteScroll.mockImplementation((_el: any, callback: any) => {
        capturedCallback = callback as () => void;
        return { reset: mockReset, isLoading: { value: false } };
      });

      const loading = ref(false);
      createComposable({ loading });

      loading.value = true;
      await nextTick();

      expect(mockReset).not.toHaveBeenCalled();
    });

    it("does not set up watcher when loading ref is not provided", async () => {
      const mockReset = vi.fn();
      mockUseInfiniteScroll.mockImplementation((_el: any, callback: any) => {
        capturedCallback = callback as () => void;
        return { reset: mockReset, isLoading: { value: false } };
      });

      createComposable();
      await nextTick();

      expect(mockReset).not.toHaveBeenCalled();
    });
  });

  describe("Direction support", () => {
    it("supports left direction", () => {
      createComposable({ direction: "left" });

      const callArgs = mockUseInfiniteScroll.mock.calls[0] as any[];
      const options = callArgs[2];
      expect(options.direction).toBe("left");
    });

    it("supports right direction", () => {
      createComposable({ direction: "right" });

      const callArgs = mockUseInfiniteScroll.mock.calls[0] as any[];
      const options = callArgs[2];
      expect(options.direction).toBe("right");
    });
  });
});
