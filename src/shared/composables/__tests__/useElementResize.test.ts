/* eslint-disable @typescript-eslint/no-explicit-any */
const mockUseResizeObserver = vi.hoisted(() =>
  vi.fn((..._args: any[]) => ({
    stop: vi.fn(),
    isSupported: { value: true },
  }))
);

vi.mock("@vueuse/core", () => ({
  useResizeObserver: mockUseResizeObserver,
}));

import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useElementResize } from "../useElementResize";

describe("useElementResize", () => {
  const mountedWrappers: VueWrapper[] = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    for (const w of mountedWrappers) w.unmount();
    mountedWrappers.length = 0;
  });

  it("delegates to VueUse's useResizeObserver with a single target", () => {
    const el = ref<HTMLElement | null>(document.createElement("div"));
    const callback = vi.fn();

    const wrapper = mount(
      defineComponent({
        setup() {
          useElementResize(el, callback);
          return {};
        },
        template: "<div />",
      })
    );
    mountedWrappers.push(wrapper);

    expect(mockUseResizeObserver).toHaveBeenCalledWith(el, callback, undefined);
  });

  it("delegates to VueUse's useResizeObserver with multiple targets and options", () => {
    const elA = ref<HTMLElement | null>(document.createElement("div"));
    const elB = ref<HTMLElement | null>(document.createElement("div"));
    const callback = vi.fn();
    const options = { box: "border-box" as const };

    const wrapper = mount(
      defineComponent({
        setup() {
          useElementResize([elA, elB], callback, options);
          return {};
        },
        template: "<div />",
      })
    );
    mountedWrappers.push(wrapper);

    expect(mockUseResizeObserver).toHaveBeenCalledWith([elA, elB], callback, options);
  });

  it("returns the stop/isSupported handle from VueUse", () => {
    const el = ref<HTMLElement | null>(document.createElement("div"));
    let result!: ReturnType<typeof useElementResize>;

    const wrapper = mount(
      defineComponent({
        setup() {
          result = useElementResize(el, vi.fn());
          return {};
        },
        template: "<div />",
      })
    );
    mountedWrappers.push(wrapper);

    expect(result.isSupported.value).toBe(true);
    expect(typeof result.stop).toBe("function");
  });
});
