/* eslint-disable @typescript-eslint/no-explicit-any */
const mockUseInfiniteScroll = vi.hoisted(() =>
  vi.fn((..._args: any[]) => ({
    reset: vi.fn(),
    isLoading: { value: false },
  }))
);

const mockUseDanxScroll = vi.hoisted(() => vi.fn());

vi.mock("@vueuse/core", () => ({
  useInfiniteScroll: mockUseInfiniteScroll,
}));

vi.mock("../useDanxScroll", () => ({
  useDanxScroll: mockUseDanxScroll,
}));

import { mount, type VueWrapper } from "@vue/test-utils";
import { ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import DanxScroll from "../DanxScroll.vue";

function createScrollReturn(overrides: Record<string, any> = {}) {
  return {
    verticalThumbStyle: ref({}),
    horizontalThumbStyle: ref({}),
    isVerticalVisible: ref(false),
    isHorizontalVisible: ref(false),
    hasVerticalOverflow: ref(false),
    hasHorizontalOverflow: ref(false),
    onVerticalThumbMouseDown: vi.fn(),
    onHorizontalThumbMouseDown: vi.fn(),
    onVerticalTrackClick: vi.fn(),
    onHorizontalTrackClick: vi.fn(),
    onTrackMouseEnter: vi.fn(),
    onTrackMouseLeave: vi.fn(),
    ...overrides,
  };
}

describe("DanxScroll", () => {
  const mountedWrappers: VueWrapper[] = [];
  let capturedCallback: (() => void) | null = null;

  function mountComponent(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    const wrapper = mount(DanxScroll, {
      props,
      slots,
    });
    mountedWrappers.push(wrapper);
    return wrapper;
  }

  beforeEach(() => {
    vi.clearAllMocks();
    capturedCallback = null;

    mockUseDanxScroll.mockReturnValue(createScrollReturn());

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

  describe("Rendering", () => {
    it("renders a div by default", () => {
      const wrapper = mountComponent();
      expect(wrapper.element.tagName).toBe("DIV");
    });

    it("renders custom tag", () => {
      const wrapper = mountComponent({ tag: "section" });
      expect(wrapper.element.tagName).toBe("SECTION");
    });

    it("applies danx-scroll class to wrapper", () => {
      const wrapper = mountComponent();
      expect(wrapper.classes()).toContain("danx-scroll");
    });

    it("renders viewport inside wrapper", () => {
      const wrapper = mountComponent();
      expect(wrapper.find(".danx-scroll__viewport").exists()).toBe(true);
    });

    it("applies direction modifier class", () => {
      const wrapper = mountComponent({ direction: "horizontal" });
      expect(wrapper.classes()).toContain("danx-scroll--horizontal");
    });

    it("applies size modifier class", () => {
      const wrapper = mountComponent({ size: "lg" });
      expect(wrapper.classes()).toContain("danx-scroll--lg");
    });

    it("uses default direction vertical", () => {
      const wrapper = mountComponent();
      expect(wrapper.classes()).toContain("danx-scroll--vertical");
    });

    it("uses default size md", () => {
      const wrapper = mountComponent();
      expect(wrapper.classes()).toContain("danx-scroll--md");
    });

    it("renders slot content inside viewport", () => {
      const wrapper = mountComponent({}, { default: "<p>Hello</p>" });
      expect(wrapper.find(".danx-scroll__viewport p").text()).toBe("Hello");
    });
  });

  describe("Variant styles", () => {
    it("applies no inline style when variant is empty", () => {
      const wrapper = mountComponent({ variant: "" });
      expect(wrapper.attributes("style")).toBeUndefined();
    });

    it("applies variant inline styles when variant is set", () => {
      const wrapper = mountComponent({ variant: "danger" });
      const style = wrapper.attributes("style") ?? "";
      expect(style).toContain("--dx-scroll-thumb-bg");
      expect(style).toContain("danger");
    });
  });

  describe("Persistent prop forwarding", () => {
    it("passes persistent option to useDanxScroll", () => {
      mountComponent({ persistent: true });
      expect(mockUseDanxScroll).toHaveBeenCalledWith(expect.anything(), { persistent: true });
    });

    it("passes persistent=false by default", () => {
      mountComponent();
      expect(mockUseDanxScroll).toHaveBeenCalledWith(expect.anything(), { persistent: false });
    });
  });

  describe("Scrollbar tracks", () => {
    it("renders vertical track as sibling of viewport when direction=vertical and has overflow", () => {
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({ hasVerticalOverflow: ref(true), isVerticalVisible: ref(true) })
      );
      const wrapper = mountComponent({ direction: "vertical" });

      const track = wrapper.find(".danx-scroll__track--vertical");
      expect(track.exists()).toBe(true);
      // Track is outside viewport (sibling, not descendant)
      expect(wrapper.find(".danx-scroll__viewport .danx-scroll__track--vertical").exists()).toBe(
        false
      );
      expect(track.find(".danx-scroll__thumb").exists()).toBe(true);
    });

    it("does not render vertical track when no overflow", () => {
      mockUseDanxScroll.mockReturnValue(createScrollReturn({ hasVerticalOverflow: ref(false) }));
      const wrapper = mountComponent({ direction: "vertical" });

      expect(wrapper.find(".danx-scroll__track--vertical").exists()).toBe(false);
    });

    it("does not render vertical track when direction=horizontal even with vertical overflow", () => {
      mockUseDanxScroll.mockReturnValue(createScrollReturn({ hasVerticalOverflow: ref(true) }));
      const wrapper = mountComponent({ direction: "horizontal" });

      expect(wrapper.find(".danx-scroll__track--vertical").exists()).toBe(false);
    });

    it("does not render horizontal track when direction=vertical even with horizontal overflow", () => {
      mockUseDanxScroll.mockReturnValue(createScrollReturn({ hasHorizontalOverflow: ref(true) }));
      const wrapper = mountComponent({ direction: "vertical" });

      expect(wrapper.find(".danx-scroll__track--horizontal").exists()).toBe(false);
    });

    it("renders horizontal track as sibling of viewport when direction=horizontal and has overflow", () => {
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({ hasHorizontalOverflow: ref(true), isHorizontalVisible: ref(true) })
      );
      const wrapper = mountComponent({ direction: "horizontal" });

      const track = wrapper.find(".danx-scroll__track--horizontal");
      expect(track.exists()).toBe(true);
      expect(wrapper.find(".danx-scroll__viewport .danx-scroll__track--horizontal").exists()).toBe(
        false
      );
      expect(track.find(".danx-scroll__thumb").exists()).toBe(true);
    });

    it("does not render horizontal track when no overflow", () => {
      mockUseDanxScroll.mockReturnValue(createScrollReturn({ hasHorizontalOverflow: ref(false) }));
      const wrapper = mountComponent({ direction: "horizontal" });

      expect(wrapper.find(".danx-scroll__track--horizontal").exists()).toBe(false);
    });

    it("renders both tracks for direction=both when both overflow", () => {
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasVerticalOverflow: ref(true),
          hasHorizontalOverflow: ref(true),
        })
      );
      const wrapper = mountComponent({ direction: "both" });

      expect(wrapper.find(".danx-scroll__track--vertical").exists()).toBe(true);
      expect(wrapper.find(".danx-scroll__track--horizontal").exists()).toBe(true);
    });

    it("applies is-visible class when vertical scrollbar is visible", () => {
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasVerticalOverflow: ref(true),
          isVerticalVisible: ref(true),
        })
      );
      const wrapper = mountComponent({ direction: "vertical" });

      expect(wrapper.find(".danx-scroll__track--vertical").classes()).toContain("is-visible");
    });

    it("applies is-visible class when horizontal scrollbar is visible", () => {
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasHorizontalOverflow: ref(true),
          isHorizontalVisible: ref(true),
        })
      );
      const wrapper = mountComponent({ direction: "horizontal" });

      expect(wrapper.find(".danx-scroll__track--horizontal").classes()).toContain("is-visible");
    });

    it("does not apply is-visible class when scrollbar is hidden", () => {
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasVerticalOverflow: ref(true),
          isVerticalVisible: ref(false),
        })
      );
      const wrapper = mountComponent({ direction: "vertical" });

      expect(wrapper.find(".danx-scroll__track--vertical").classes()).not.toContain("is-visible");
    });

    it("applies thumb style from composable", () => {
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasVerticalOverflow: ref(true),
          verticalThumbStyle: ref({ height: "30%", transform: "translateY(0%)" }),
        })
      );
      const wrapper = mountComponent({ direction: "vertical" });

      const thumb = wrapper.find(".danx-scroll__track--vertical .danx-scroll__thumb");
      expect(thumb.attributes("style")).toContain("height: 30%");
    });

    it("wires mousedown on vertical thumb to composable handler", async () => {
      const onVerticalThumbMouseDown = vi.fn();
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasVerticalOverflow: ref(true),
          onVerticalThumbMouseDown,
        })
      );
      const wrapper = mountComponent({ direction: "vertical" });

      await wrapper.find(".danx-scroll__track--vertical .danx-scroll__thumb").trigger("mousedown");
      expect(onVerticalThumbMouseDown).toHaveBeenCalled();
    });

    it("wires mousedown on horizontal thumb to composable handler", async () => {
      const onHorizontalThumbMouseDown = vi.fn();
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasHorizontalOverflow: ref(true),
          onHorizontalThumbMouseDown,
        })
      );
      const wrapper = mountComponent({ direction: "horizontal" });

      await wrapper
        .find(".danx-scroll__track--horizontal .danx-scroll__thumb")
        .trigger("mousedown");
      expect(onHorizontalThumbMouseDown).toHaveBeenCalled();
    });

    it("wires click.self on vertical track to composable handler", async () => {
      const onVerticalTrackClick = vi.fn();
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasVerticalOverflow: ref(true),
          onVerticalTrackClick,
        })
      );
      const wrapper = mountComponent({ direction: "vertical" });

      const track = wrapper.find(".danx-scroll__track--vertical");
      await track.trigger("click");
      expect(onVerticalTrackClick).toHaveBeenCalled();
    });

    it("wires click.self on horizontal track to composable handler", async () => {
      const onHorizontalTrackClick = vi.fn();
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasHorizontalOverflow: ref(true),
          onHorizontalTrackClick,
        })
      );
      const wrapper = mountComponent({ direction: "horizontal" });

      const track = wrapper.find(".danx-scroll__track--horizontal");
      await track.trigger("click");
      expect(onHorizontalTrackClick).toHaveBeenCalled();
    });

    it("wires mouseenter/mouseleave on vertical track to composable handlers", async () => {
      const onTrackMouseEnter = vi.fn();
      const onTrackMouseLeave = vi.fn();
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasVerticalOverflow: ref(true),
          onTrackMouseEnter,
          onTrackMouseLeave,
        })
      );
      const wrapper = mountComponent({ direction: "vertical" });

      const track = wrapper.find(".danx-scroll__track--vertical");
      await track.trigger("mouseenter");
      expect(onTrackMouseEnter).toHaveBeenCalled();

      await track.trigger("mouseleave");
      expect(onTrackMouseLeave).toHaveBeenCalled();
    });

    it("wires mouseenter/mouseleave on horizontal track to composable handlers", async () => {
      const onTrackMouseEnter = vi.fn();
      const onTrackMouseLeave = vi.fn();
      mockUseDanxScroll.mockReturnValue(
        createScrollReturn({
          hasHorizontalOverflow: ref(true),
          onTrackMouseEnter,
          onTrackMouseLeave,
        })
      );
      const wrapper = mountComponent({ direction: "horizontal" });

      const track = wrapper.find(".danx-scroll__track--horizontal");
      await track.trigger("mouseenter");
      expect(onTrackMouseEnter).toHaveBeenCalledOnce();

      await track.trigger("mouseleave");
      expect(onTrackMouseLeave).toHaveBeenCalledOnce();
    });
  });

  describe("Infinite scroll disabled", () => {
    it("does not show loading indicator when infiniteScroll is false", () => {
      const wrapper = mountComponent({ loading: true });
      expect(wrapper.find(".danx-scroll__loading").exists()).toBe(false);
    });

    it("does not show done indicator when infiniteScroll is false", () => {
      const wrapper = mountComponent({ canLoadMore: false });
      expect(wrapper.find(".danx-scroll__done").exists()).toBe(false);
    });

    it("does not call useInfiniteScroll when infiniteScroll is false", () => {
      mountComponent();
      expect(mockUseInfiniteScroll).not.toHaveBeenCalled();
    });
  });

  describe("Infinite scroll enabled", () => {
    it("shows loading indicator inside viewport when loading is true", () => {
      const wrapper = mountComponent({ infiniteScroll: true, loading: true });
      expect(wrapper.find(".danx-scroll__viewport .danx-scroll__loading").exists()).toBe(true);
      expect(wrapper.find(".danx-scroll__loading span").text()).toBe("Loading...");
    });

    it("shows done indicator inside viewport when canLoadMore is false", () => {
      const wrapper = mountComponent({ infiniteScroll: true, canLoadMore: false });
      expect(wrapper.find(".danx-scroll__viewport .danx-scroll__done").exists()).toBe(true);
      expect(wrapper.find(".danx-scroll__done span").text()).toBe("No more items");
    });

    it("does not show loading when loading is false", () => {
      const wrapper = mountComponent({ infiniteScroll: true, loading: false });
      expect(wrapper.find(".danx-scroll__loading").exists()).toBe(false);
    });

    it("does not show done when canLoadMore is true", () => {
      const wrapper = mountComponent({ infiniteScroll: true, canLoadMore: true });
      expect(wrapper.find(".danx-scroll__done").exists()).toBe(false);
    });

    it("calls useInfiniteScroll when infiniteScroll is true", () => {
      mountComponent({ infiniteScroll: true });
      expect(mockUseInfiniteScroll).toHaveBeenCalled();
    });

    it("renders custom loading slot", () => {
      const wrapper = mountComponent(
        { infiniteScroll: true, loading: true },
        { loading: "<span>Custom loading</span>" }
      );
      expect(wrapper.find(".danx-scroll__loading span").text()).toBe("Custom loading");
    });

    it("renders custom done slot", () => {
      const wrapper = mountComponent(
        { infiniteScroll: true, canLoadMore: false },
        { done: "<span>All done!</span>" }
      );
      expect(wrapper.find(".danx-scroll__done span").text()).toBe("All done!");
    });
  });

  describe("Direction indicator positioning", () => {
    it("applies is-before-content class for top direction", () => {
      const wrapper = mountComponent({
        infiniteScroll: true,
        infiniteDirection: "top",
        loading: true,
        canLoadMore: false,
      });

      expect(wrapper.find(".danx-scroll__loading").classes()).toContain("is-before-content");
      expect(wrapper.find(".danx-scroll__done").classes()).toContain("is-before-content");
    });

    it("applies is-before-content class for left direction", () => {
      const wrapper = mountComponent({
        infiniteScroll: true,
        infiniteDirection: "left",
        loading: true,
      });

      expect(wrapper.find(".danx-scroll__loading").classes()).toContain("is-before-content");
    });

    it("does not apply is-before-content class for bottom direction (default)", () => {
      const wrapper = mountComponent(
        { infiniteScroll: true, loading: true },
        { default: "<div class='content'>Content</div>" }
      );

      expect(wrapper.find(".danx-scroll__loading").classes()).not.toContain("is-before-content");
    });

    it("does not apply is-before-content class for right direction", () => {
      const wrapper = mountComponent(
        { infiniteScroll: true, infiniteDirection: "right", loading: true },
        { default: "<div class='content'>Content</div>" }
      );

      expect(wrapper.find(".danx-scroll__loading").classes()).not.toContain("is-before-content");
    });
  });

  describe("Events", () => {
    it("emits loadMore when VueUse callback fires", async () => {
      const wrapper = mountComponent({ infiniteScroll: true });

      await capturedCallback!();

      expect(wrapper.emitted("loadMore")).toHaveLength(1);
    });

    it("does not emit loadMore when loading is true", async () => {
      const wrapper = mountComponent({ infiniteScroll: true, loading: true });

      await capturedCallback!();

      expect(wrapper.emitted("loadMore")).toBeUndefined();
    });
  });

  describe("Combined states", () => {
    it("shows both loading and done when both conditions met", () => {
      const wrapper = mountComponent({
        infiniteScroll: true,
        loading: true,
        canLoadMore: false,
      });

      expect(wrapper.find(".danx-scroll__loading").exists()).toBe(true);
      expect(wrapper.find(".danx-scroll__done").exists()).toBe(true);
    });
  });

  describe("Both direction", () => {
    it("applies both direction class", () => {
      const wrapper = mountComponent({ direction: "both" });
      expect(wrapper.classes()).toContain("danx-scroll--both");
    });
  });

  describe("All sizes", () => {
    for (const size of ["xs", "sm", "md", "lg", "xl"] as const) {
      it(`applies ${size} size class`, () => {
        const wrapper = mountComponent({ size });
        expect(wrapper.classes()).toContain(`danx-scroll--${size}`);
      });
    }
  });
});
