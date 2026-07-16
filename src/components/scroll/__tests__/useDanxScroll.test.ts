import { mount, type VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick, ref, type Ref } from "vue";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useDanxScroll, type UseDanxScrollReturn } from "../useDanxScroll";

interface MockElementProps {
  scrollTop?: number;
  scrollLeft?: number;
  scrollHeight?: number;
  scrollWidth?: number;
  clientHeight?: number;
  clientWidth?: number;
}

function createMockElement(overrides: MockElementProps = {}): HTMLElement {
  const el = document.createElement("div");
  const props: Record<string, number> = {
    scrollTop: 0,
    scrollLeft: 0,
    scrollHeight: 1000,
    scrollWidth: 300,
    clientHeight: 300,
    clientWidth: 300,
    ...overrides,
  };

  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(el, key, { value, writable: true, configurable: true });
  }

  return el;
}

describe("useDanxScroll", () => {
  const mountedWrappers: VueWrapper[] = [];
  let originalResizeObserver: typeof ResizeObserver;

  // Shared ResizeObserver mock — captures the last callback for triggering in tests
  let resizeCallback: (() => void) | null = null;

  class MockResizeObserver {
    constructor(callback: () => void) {
      resizeCallback = callback;
    }
    observe() {}
    unobserve() {}
    disconnect() {}
  }

  function createComposable(
    containerEl: Ref<HTMLElement | null>,
    options: { persistent?: boolean } = {}
  ) {
    let result!: UseDanxScrollReturn;
    const wrapper = mount(
      defineComponent({
        setup() {
          result = useDanxScroll(containerEl, options);
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
    vi.useFakeTimers();
    resizeCallback = null;
    originalResizeObserver = globalThis.ResizeObserver;
    globalThis.ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  });

  afterEach(() => {
    vi.useRealTimers();
    globalThis.ResizeObserver = originalResizeObserver;
    for (const w of mountedWrappers) w.unmount();
    mountedWrappers.length = 0;
  });

  describe("Initial state", () => {
    it("starts with no overflow detected", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      expect(result.hasVerticalOverflow.value).toBe(false);
      expect(result.hasHorizontalOverflow.value).toBe(false);
    });

    it("starts with scrollbars hidden when not persistent", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      expect(result.isVerticalVisible.value).toBe(false);
      expect(result.isHorizontalVisible.value).toBe(false);
    });

    it("starts with scrollbars visible when persistent", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl, { persistent: true });

      expect(result.isVerticalVisible.value).toBe(true);
      expect(result.isHorizontalVisible.value).toBe(true);
    });

    it("starts with empty thumb styles", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      expect(result.verticalThumbStyle.value).toEqual({});
      expect(result.horizontalThumbStyle.value).toEqual({});
    });
  });

  describe("Overflow detection", () => {
    it("detects vertical overflow when content is taller than container", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      expect(result.hasVerticalOverflow.value).toBe(true);
    });

    it("detects no vertical overflow when content fits", async () => {
      const el = createMockElement({ scrollHeight: 300, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      expect(result.hasVerticalOverflow.value).toBe(false);
    });

    it("detects horizontal overflow when content is wider than container", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      expect(result.hasHorizontalOverflow.value).toBe(true);
    });
  });

  describe("Thumb geometry", () => {
    it("computes vertical thumb height as percentage of container/scroll ratio", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      // thumbHeightPct = 300/1000 * 100 = 30%
      // scrollRatio = 0 / (1000-300) = 0, maxTranslate = (70/30)*100 = 233.33%
      expect(result.verticalThumbStyle.value).toEqual({
        height: "30%",
        transform: "translateY(0%)",
      });
    });

    it("computes exact vertical thumb position when scrolled", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 350 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      // thumbHeightPct = 300/1000 * 100 = 30%
      // scrollRatio = 350 / (1000-300) = 0.5
      // maxTranslate = ((100-30)/30) * 100 = 233.333...%
      // translateY = 0.5 * 233.333... = 116.666...%
      const style = result.verticalThumbStyle.value as Record<string, string>;
      expect(style.height).toBe("30%");
      expect(style.transform).toBe("translateY(116.66666666666667%)");
    });

    it("computes horizontal thumb width as percentage", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      expect(result.horizontalThumbStyle.value).toEqual({
        width: "30%",
        transform: "translateX(0%)",
      });
    });

    it("computes exact horizontal thumb position when scrolled", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 350,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      // thumbWidthPct = 300/1000 * 100 = 30%
      // scrollRatio = 350 / (1000-300) = 0.5
      // maxTranslate = ((100-30)/30) * 100 = 233.333...%
      // translateX = 0.5 * 233.333... = 116.666...%
      const style = result.horizontalThumbStyle.value as Record<string, string>;
      expect(style.width).toBe("30%");
      expect(style.transform).toBe("translateX(116.66666666666667%)");
    });

    it("clamps vertical thumb to minimum 24px", async () => {
      // scrollHeight=100000, clientHeight=300 → raw pct = 0.3%, which is 0.9px < 24px
      const el = createMockElement({ scrollHeight: 100000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const style = result.verticalThumbStyle.value as Record<string, string>;
      // Clamped: 24/300 * 100 = 8%
      expect(style.height).toBe("8%");
    });

    it("clamps horizontal thumb to minimum 24px", async () => {
      const el = createMockElement({
        scrollWidth: 100000,
        clientWidth: 300,
        scrollLeft: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const style = result.horizontalThumbStyle.value as Record<string, string>;
      // Clamped: 24/300 * 100 = 8%
      expect(style.width).toBe("8%");
    });

    it("keeps clamped thumb within track bounds when scrolled to end", async () => {
      // scrollHeight=100000, clientHeight=300, scrollTop at max
      const maxScrollTop = 100000 - 300;
      const el = createMockElement({
        scrollHeight: 100000,
        clientHeight: 300,
        scrollTop: maxScrollTop,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const style = result.verticalThumbStyle.value as Record<string, string>;
      // scrollRatio = 1.0, thumbHeightPct = 8%
      // maxTranslate = ((100-8)/8) * 100 = 1150%
      // translateY = 1 * 1150 = 1150%
      // Thumb bottom = 8% + 8% * 1150/100 = 8% + 92% = 100% → exactly at track bottom
      expect(style.height).toBe("8%");
      expect(style.transform).toBe("translateY(1150%)");
    });
  });

  describe("Auto-hide", () => {
    it("shows scrollbar on scroll event and hides after timeout", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      // Simulate scroll
      el.dispatchEvent(new Event("scroll"));

      expect(result.isVerticalVisible.value).toBe(true);

      // Advance past auto-hide delay
      vi.advanceTimersByTime(1200);

      expect(result.isVerticalVisible.value).toBe(false);
    });

    it("resets auto-hide timer on subsequent scroll events", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      el.dispatchEvent(new Event("scroll"));
      expect(result.isVerticalVisible.value).toBe(true);

      // Advance 800ms (not yet hidden)
      vi.advanceTimersByTime(800);
      expect(result.isVerticalVisible.value).toBe(true);

      // Scroll again — resets the timer
      el.dispatchEvent(new Event("scroll"));

      // Advance another 800ms (1600ms since first scroll, 800ms since second)
      vi.advanceTimersByTime(800);
      expect(result.isVerticalVisible.value).toBe(true);

      // Advance remaining 400ms to complete the 1200ms from second scroll
      vi.advanceTimersByTime(400);
      expect(result.isVerticalVisible.value).toBe(false);
    });

    it("keeps scrollbar visible in persistent mode after timeout", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl, { persistent: true });

      containerEl.value = el;
      await nextTick();

      el.dispatchEvent(new Event("scroll"));
      vi.advanceTimersByTime(1200);

      expect(result.isVerticalVisible.value).toBe(true);
    });
  });

  describe("Track hover", () => {
    it("shows scrollbar on track mouseenter", async () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      result.onTrackMouseEnter();

      expect(result.isVerticalVisible.value).toBe(true);
    });

    it("hides scrollbar on track mouseleave", async () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      result.onTrackMouseEnter();
      expect(result.isVerticalVisible.value).toBe(true);

      result.onTrackMouseLeave();
      expect(result.isVerticalVisible.value).toBe(false);
    });
  });

  describe("Pointermove without drag is no-op", () => {
    it("does not change scrollTop when pointermove fires without prior pointerdown", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);

      await nextTick();

      // Call pointermove without starting a drag — should be a no-op
      result.onVerticalThumbPointerMove(createPointerEvent("pointermove", { clientY: 130 }));
      expect(el.scrollTop).toBe(0);
    });
  });

  describe("Vertical thumb drag", () => {
    it("updates scrollTop on vertical drag", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      startVerticalDrag(result, 100);

      // Scrollbar stays visible during drag
      expect(result.isVerticalVisible.value).toBe(true);

      // Simulate pointer move (with capture, events go to thumb directly)
      result.onVerticalThumbPointerMove(createPointerEvent("pointermove", { clientY: 130 }));

      // scrollTop = 0 + 30 * (1000/300) = 100
      expect(el.scrollTop).toBeCloseTo(100, 0);

      result.onVerticalThumbPointerUp(createPointerEvent("pointerup"));
    });
  });

  describe("Horizontal thumb drag", () => {
    it("updates scrollLeft on horizontal drag", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      startHorizontalDrag(result, 100);

      // Simulate pointer move (with capture, events go to thumb directly)
      result.onHorizontalThumbPointerMove(createPointerEvent("pointermove", { clientX: 130 }));

      // scrollLeft = 0 + 30 * (1000/300) = 100
      expect(el.scrollLeft).toBeCloseTo(100, 0);

      result.onHorizontalThumbPointerUp(createPointerEvent("pointerup"));
    });
  });

  describe("Track click", () => {
    it("jumps scroll position on vertical track click", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const track = document.createElement("div");
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
        top: 0,
        height: 300,
        left: 0,
        width: 10,
        bottom: 300,
        right: 10,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      const clickEvent = new MouseEvent("click", { clientY: 150 });
      Object.defineProperty(clickEvent, "currentTarget", { value: track });

      result.onVerticalTrackClick(clickEvent);

      // clickRatio = 150/300 = 0.5
      // scrollTop = 0.5 * 1000 - 300/2 = 350
      expect(el.scrollTop).toBe(350);
    });

    it("jumps scroll position on horizontal track click", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const track = document.createElement("div");
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
        top: 0,
        height: 10,
        left: 0,
        width: 300,
        bottom: 10,
        right: 300,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });

      const clickEvent = new MouseEvent("click", { clientX: 150 });
      Object.defineProperty(clickEvent, "currentTarget", { value: track });

      result.onHorizontalTrackClick(clickEvent);

      // clickRatio = 150/300 = 0.5
      // scrollLeft = 0.5 * 1000 - 300/2 = 350
      expect(el.scrollLeft).toBe(350);
    });
  });

  describe("Scroll percent", () => {
    it("computes vertical scroll percent", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 350 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      // 350 / (1000-300) * 100 = 50%
      expect(result.verticalScrollPercent.value).toBe(50);
    });

    it("computes horizontal scroll percent", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 350,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      expect(result.horizontalScrollPercent.value).toBe(50);
    });
  });

  describe("Viewport keyboard scroll", () => {
    it("scrolls down on ArrowDown when vertical overflow present", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const event = createKeydownEvent("ArrowDown");
      result.onViewportKeydown(event);

      expect(el.scrollTop).toBe(40);
      expect(event.preventDefault).toHaveBeenCalled();
    });

    it("scrolls up on ArrowUp when vertical overflow present", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 100 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onViewportKeydown(createKeydownEvent("ArrowUp"));

      expect(el.scrollTop).toBe(60);
    });

    it("ignores ArrowUp/ArrowDown when no vertical overflow", async () => {
      const el = createMockElement({ scrollHeight: 300, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const event = createKeydownEvent("ArrowDown");
      result.onViewportKeydown(event);

      expect(el.scrollTop).toBe(0);
      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("scrolls right on ArrowRight when horizontal overflow present", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onViewportKeydown(createKeydownEvent("ArrowRight"));

      expect(el.scrollLeft).toBe(40);
    });

    it("pages down on PageDown by clientHeight", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onViewportKeydown(createKeydownEvent("PageDown"));

      expect(el.scrollTop).toBe(300);
    });

    it("pages up on PageUp by clientHeight", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 500 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onViewportKeydown(createKeydownEvent("PageUp"));

      expect(el.scrollTop).toBe(200);
    });

    it("jumps to start on Home", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 500 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onViewportKeydown(createKeydownEvent("Home"));

      expect(el.scrollTop).toBe(0);
    });

    it("jumps to end on End", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onViewportKeydown(createKeydownEvent("End"));

      expect(el.scrollTop).toBe(1000);
    });

    it("ignores unrelated keys", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const event = createKeydownEvent("Tab");
      result.onViewportKeydown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("is a no-op when container is null", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      // Should not throw
      result.onViewportKeydown(createKeydownEvent("ArrowDown"));
    });
  });

  describe("Thumb keyboard scroll", () => {
    it("scrolls vertical thumb with ArrowUp/ArrowDown", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 100 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onVerticalThumbKeydown(createKeydownEvent("ArrowDown"));
      expect(el.scrollTop).toBe(140);

      result.onVerticalThumbKeydown(createKeydownEvent("ArrowUp"));
      expect(el.scrollTop).toBe(100);
    });

    it("jumps vertical thumb to start/end with Home/End", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 100 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onVerticalThumbKeydown(createKeydownEvent("End"));
      expect(el.scrollTop).toBe(1000);

      result.onVerticalThumbKeydown(createKeydownEvent("Home"));
      expect(el.scrollTop).toBe(0);
    });

    it("scrolls horizontal thumb with ArrowLeft/ArrowRight", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 100,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onHorizontalThumbKeydown(createKeydownEvent("ArrowRight"));
      expect(el.scrollLeft).toBe(140);

      result.onHorizontalThumbKeydown(createKeydownEvent("ArrowLeft"));
      expect(el.scrollLeft).toBe(100);
    });

    it("jumps horizontal thumb to start/end with Home/End", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 100,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onHorizontalThumbKeydown(createKeydownEvent("End"));
      expect(el.scrollLeft).toBe(1000);

      result.onHorizontalThumbKeydown(createKeydownEvent("Home"));
      expect(el.scrollLeft).toBe(0);
    });

    it("pages horizontal thumb with PageUp/PageDown by clientWidth", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 400,
        scrollHeight: 300,
        clientHeight: 300,
      });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      result.onHorizontalThumbKeydown(createKeydownEvent("PageDown"));
      expect(el.scrollLeft).toBe(700);

      result.onHorizontalThumbKeydown(createKeydownEvent("PageUp"));
      expect(el.scrollLeft).toBe(400);
    });

    it("ignores unrelated keys on thumbs and does not preventDefault", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      containerEl.value = el;
      await nextTick();

      const event = createKeydownEvent("Tab");
      result.onVerticalThumbKeydown(event);

      expect(event.preventDefault).not.toHaveBeenCalled();
    });

    it("is a no-op when container is null", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      result.onVerticalThumbKeydown(createKeydownEvent("ArrowDown"));
      result.onHorizontalThumbKeydown(createKeydownEvent("ArrowRight"));
    });
  });

  describe("Cleanup", () => {
    it("removes event listeners on unmount", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const removeEventListenerSpy = vi.spyOn(el, "removeEventListener");
      const containerEl = ref<HTMLElement | null>(el);

      const result = createComposable(containerEl);
      expect(result.hasVerticalOverflow.value).toBe(true);

      // Unmount the wrapper
      mountedWrappers[0]!.unmount();
      mountedWrappers.length = 0;

      expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    });

    it("cleans up on container element change", async () => {
      const el1 = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const el2 = createMockElement({ scrollHeight: 500, clientHeight: 300 });
      const removeEventListenerSpy = vi.spyOn(el1, "removeEventListener");
      const containerEl = ref<HTMLElement | null>(el1);

      createComposable(containerEl);

      containerEl.value = el2;
      await nextTick();

      expect(removeEventListenerSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    });
  });

  describe("Drag end and auto-hide", () => {
    it("hides scrollbar after drag ends and timeout elapses", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);

      await nextTick();

      startVerticalDrag(result, 100);
      expect(result.isVerticalVisible.value).toBe(true);

      result.onVerticalThumbPointerUp(createPointerEvent("pointerup"));
      vi.advanceTimersByTime(1200);

      expect(result.isVerticalVisible.value).toBe(false);
    });
  });

  describe("ResizeObserver", () => {
    it("updates geometry when ResizeObserver fires", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      // Add a child so firstElementChild branch is covered
      el.appendChild(document.createElement("div"));
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);

      // Resize observation is wired up via a dynamic import() inside onMounted
      // (keeps @vueuse/core out of the main barrel's eager module graph — DXUI-156).
      // vi.waitFor polls rather than assuming a fixed number of ticks, since the
      // dynamic import's resolution time depends on whether the module is already
      // warm in vite-node's cache.
      await vi.waitFor(() => expect(resizeCallback).not.toBeNull());

      // Change scroll dimensions
      Object.defineProperty(el, "scrollHeight", {
        value: 2000,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(el, "clientHeight", { value: 300, writable: true, configurable: true });

      // Trigger the ResizeObserver callback
      resizeCallback!();

      // Thumb height should reflect new ratio: 300/2000 * 100 = 15%
      const style = result.verticalThumbStyle.value as Record<string, string>;
      expect(style.height).toBe("15%");
      // scrollTop=0, scrollRatio=0, so translateY=0
      expect(style.transform).toBe("translateY(0%)");
    });
  });

  describe("No container element", () => {
    it("setupObserver is a no-op when container starts null", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      // setupObserver was called via the immediate watcher with null el — early-returned
      expect(result.hasVerticalOverflow.value).toBe(false);
      expect(result.hasHorizontalOverflow.value).toBe(false);
    });

    it("handles track click when container is null", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      // Should not throw
      const track = document.createElement("div");
      vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
        top: 0,
        height: 300,
        left: 0,
        width: 10,
        bottom: 300,
        right: 10,
        x: 0,
        y: 0,
        toJSON: vi.fn(),
      });
      const clickEvent = new MouseEvent("click", { clientY: 150 });
      Object.defineProperty(clickEvent, "currentTarget", { value: track });

      result.onVerticalTrackClick(clickEvent);
      result.onHorizontalTrackClick(clickEvent);
    });

    it("handles vertical drag move when container is null", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      startVerticalDrag(result, 100);

      // Should not throw
      result.onVerticalThumbPointerMove(createPointerEvent("pointermove", { clientY: 130 }));
      result.onVerticalThumbPointerUp(createPointerEvent("pointerup"));
    });

    it("updateGeometry handles null container after ResizeObserver setup", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      createComposable(containerEl);

      await vi.waitFor(() => expect(resizeCallback).not.toBeNull());

      // Capture the resize callback before nullifying the container
      const savedCallback = resizeCallback;
      expect(savedCallback).not.toBeNull();

      // Null the container (cleanup runs, but mock disconnect is a no-op)
      containerEl.value = null;
      await nextTick();

      // Simulate a late ResizeObserver notification — updateGeometry should early-return
      savedCallback!();
    });

    it("handles horizontal drag move when container is null", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      startHorizontalDrag(result, 100);

      // Should not throw — covers horizontal branch in onDragMove with null container
      result.onHorizontalThumbPointerMove(createPointerEvent("pointermove", { clientX: 130 }));
      result.onHorizontalThumbPointerUp(createPointerEvent("pointerup"));
    });
  });

  function createKeydownEvent(key: string): KeyboardEvent {
    const event = new KeyboardEvent("keydown", { key });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    return event;
  }

  function createPointerEvent(type: string, props: Record<string, unknown> = {}): PointerEvent {
    const event = new PointerEvent(type, { ...props, pointerId: 1 });
    Object.defineProperty(event, "preventDefault", { value: vi.fn() });
    Object.defineProperty(event, "stopPropagation", { value: vi.fn() });
    Object.defineProperty(event, "currentTarget", {
      value: { setPointerCapture: vi.fn(), releasePointerCapture: vi.fn() },
    });
    return event;
  }

  function startVerticalDrag(result: UseDanxScrollReturn, clientY: number) {
    result.onVerticalThumbPointerDown(createPointerEvent("pointerdown", { clientY }));
  }

  function startHorizontalDrag(result: UseDanxScrollReturn, clientX: number) {
    result.onHorizontalThumbPointerDown(createPointerEvent("pointerdown", { clientX }));
  }
});
