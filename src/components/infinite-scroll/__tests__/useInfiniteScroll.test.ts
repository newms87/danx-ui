import { afterEach, describe, it, expect, vi, beforeEach } from "vitest";
import { ref, nextTick, defineComponent } from "vue";
import { mount } from "@vue/test-utils";

const { mockUseInfiniteScroll } = vi.hoisted(() => ({
  mockUseInfiniteScroll: vi.fn(),
}));
vi.mock("@vueuse/core", () => ({
  useInfiniteScroll: mockUseInfiniteScroll,
}));

import { useDanxInfiniteScroll } from "../useInfiniteScroll";

describe("useDanxInfiniteScroll", () => {
  let capturedCallback: (() => Promise<void>) | null;
  let mockReset: ReturnType<typeof vi.fn>;
  let mockIsLoading: { value: boolean };

  const mountedWrappers: ReturnType<typeof mount>[] = [];

  function createComposable(options: Parameters<typeof useDanxInfiniteScroll>[1]) {
    const el = ref<HTMLElement | null>(document.createElement("div"));
    let result!: ReturnType<typeof useDanxInfiniteScroll>;
    const wrapper = mount(
      defineComponent({
        setup() {
          result = useDanxInfiniteScroll(el, options);
          return {};
        },
        template: "<div />",
      })
    );
    mountedWrappers.push(wrapper);
    return { result, el };
  }

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallback = null;
    mockReset = vi.fn();
    mockIsLoading = { value: false };

    mockUseInfiniteScroll.mockImplementation((_el: unknown, callback: () => Promise<void>) => {
      capturedCallback = callback;
      return { reset: mockReset, isLoading: mockIsLoading };
    });
  });

  afterEach(() => {
    for (const w of mountedWrappers) w.unmount();
    mountedWrappers.length = 0;
  });

  it("calls VueUse useInfiniteScroll with correct options", () => {
    const onLoadMore = vi.fn();

    createComposable({
      distance: 300,
      direction: "top",
      onLoadMore,
    });

    expect(mockUseInfiniteScroll).toHaveBeenCalledOnce();
    const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
    expect(options.distance).toBe(300);
    expect(options.direction).toBe("top");
  });

  it("uses default distance and direction", () => {
    createComposable({ onLoadMore: vi.fn() });

    const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
    expect(options.distance).toBe(200);
    expect(options.direction).toBe("bottom");
  });

  it("calls onLoadMore when scroll callback fires", async () => {
    const onLoadMore = vi.fn();
    createComposable({ onLoadMore });

    expect(capturedCallback).not.toBeNull();
    await capturedCallback!();
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it("does not call onLoadMore when loading is true", async () => {
    const onLoadMore = vi.fn();
    const loading = ref(true);
    createComposable({ loading, onLoadMore });

    await capturedCallback!();
    expect(onLoadMore).not.toHaveBeenCalled();
  });

  it("calls onLoadMore when loading is false", async () => {
    const onLoadMore = vi.fn();
    const loading = ref(false);
    createComposable({ loading, onLoadMore });

    await capturedCallback!();
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it("calls reset when loading transitions from true to false", async () => {
    const loading = ref(true);
    createComposable({ loading, onLoadMore: vi.fn() });

    loading.value = false;
    await nextTick();

    expect(mockReset).toHaveBeenCalledOnce();
  });

  it("does not call reset when loading transitions from false to true", async () => {
    const loading = ref(false);
    createComposable({ loading, onLoadMore: vi.fn() });

    loading.value = true;
    await nextTick();

    expect(mockReset).not.toHaveBeenCalled();
  });

  it("returns reset and isLoading from VueUse", () => {
    const { result } = createComposable({ onLoadMore: vi.fn() });

    expect(result.reset).toBe(mockReset);
    expect(result.isLoading).toBe(mockIsLoading);
  });

  it("passes canLoadMore as a function to VueUse options", () => {
    const canLoadMore = ref(true);
    createComposable({ canLoadMore, onLoadMore: vi.fn() });

    const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
    expect(typeof options.canLoadMore).toBe("function");
    expect(options.canLoadMore()).toBe(true);

    canLoadMore.value = false;
    expect(options.canLoadMore()).toBe(false);
  });

  it("does not register watch when loading ref is not provided", async () => {
    createComposable({ onLoadMore: vi.fn() });

    await nextTick();

    expect(mockReset).not.toHaveBeenCalled();
  });

  it("passes undefined canLoadMore when not provided", () => {
    createComposable({ onLoadMore: vi.fn() });

    const [, , options] = mockUseInfiniteScroll.mock.calls[0]!;
    expect(options.canLoadMore).toBeUndefined();
  });
});
