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

      // Simulate mouse move
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 130 }));

      // scrollTop = 0 + 30 * (1000/300) = 100
      expect(el.scrollTop).toBeCloseTo(100, 0);

      document.dispatchEvent(new MouseEvent("mouseup"));
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

      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 130 }));

      // scrollLeft = 0 + 30 * (1000/300) = 100
      expect(el.scrollLeft).toBeCloseTo(100, 0);

      document.dispatchEvent(new MouseEvent("mouseup"));
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

      document.dispatchEvent(new MouseEvent("mouseup"));
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

      await nextTick();

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
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 130 }));
      document.dispatchEvent(new MouseEvent("mouseup"));
    });

    it("handles horizontal drag move when container is null", () => {
      const containerEl = ref<HTMLElement | null>(null);
      const result = createComposable(containerEl);

      startHorizontalDrag(result, 100);

      // Should not throw — covers horizontal branch in onDragMove with null container
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 130 }));
      document.dispatchEvent(new MouseEvent("mouseup"));
    });
  });

  function startVerticalDrag(result: UseDanxScrollReturn, clientY: number) {
    const mousedownEvent = new MouseEvent("mousedown", { clientY });
    Object.defineProperty(mousedownEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(mousedownEvent, "stopPropagation", { value: vi.fn() });
    result.onVerticalThumbMouseDown(mousedownEvent);
  }

  function startHorizontalDrag(result: UseDanxScrollReturn, clientX: number) {
    const mousedownEvent = new MouseEvent("mousedown", { clientX });
    Object.defineProperty(mousedownEvent, "preventDefault", { value: vi.fn() });
    Object.defineProperty(mousedownEvent, "stopPropagation", { value: vi.fn() });
    result.onHorizontalThumbMouseDown(mousedownEvent);
  }

  function mockBoundingRect(el: HTMLElement, rect: Partial<DOMRect>) {
    vi.spyOn(el, "getBoundingClientRect").mockReturnValue({
      top: 0,
      bottom: 300,
      left: 0,
      right: 300,
      height: 300,
      width: 300,
      x: 0,
      y: 0,
      toJSON: vi.fn(),
      ...rect,
    });
  }

  describe("Auto-scroll on drag beyond bounds", () => {
    it("auto-scrolls down when cursor is below container during vertical drag", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let tickCount = 0;
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        if (tickCount++ === 0) cb(0);
        return tickCount;
      });

      startVerticalDrag(result, 150);

      // Move cursor 50px below the container bottom (300)
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));

      // rAF should have been called and scrollTop should have increased
      expect(rafSpy).toHaveBeenCalled();
      // overshoot = 350 - 300 = 50, scrollDelta = 50 * 0.15 = 7.5
      expect(el.scrollTop).toBeGreaterThan(0);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("auto-scrolls up when cursor is above container during vertical drag", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 500 });
      mockBoundingRect(el, { top: 100, bottom: 400 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let tickCount = 0;
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        if (tickCount++ === 0) cb(0);
        return tickCount;
      });

      startVerticalDrag(result, 200);

      // Move cursor 50px above container top (100)
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 50 }));

      expect(rafSpy).toHaveBeenCalled();
      // overshoot = 50 - 100 = -50, scrollDelta = -50 * 0.15 = -7.5
      expect(el.scrollTop).toBeLessThan(500);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("speed scales with overshoot distance", async () => {
      const el = createMockElement({ scrollHeight: 2000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let tickCount = 0;
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        // Only run first tick to measure delta
        if (tickCount === 0) {
          tickCount++;
          cb(0);
        }
        return tickCount;
      });

      startVerticalDrag(result, 150);

      // Small overshoot: 20px
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 320 }));
      const scrollAfterSmall = el.scrollTop;

      // Reset
      Object.defineProperty(el, "scrollTop", { value: 0, writable: true, configurable: true });
      tickCount = 0;

      // Large overshoot: 200px
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 500 }));
      const scrollAfterLarge = el.scrollTop;

      expect(scrollAfterLarge).toBeGreaterThan(scrollAfterSmall);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("stops auto-scroll when cursor returns to bounds", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let rafCallbacks: FrameRequestCallback[] = [];
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });

      startVerticalDrag(result, 150);

      // Move beyond bounds
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));
      expect(rafCallbacks.length).toBe(1);

      // Execute the first tick — it should schedule another because cursor is still beyond
      rafCallbacks[0]!(0);
      expect(rafCallbacks.length).toBe(2);

      // Move cursor back within bounds
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 200 }));

      // Execute the second tick — it should NOT schedule another (overshoot is 0)
      rafCallbacks[1]!(0);
      expect(rafCallbacks.length).toBe(2); // No new rAF scheduled

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("stops auto-scroll on mouseup (cancelAnimationFrame called)", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
      vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);

      startVerticalDrag(result, 150);
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));

      // mouseup should cancel the animation frame
      document.dispatchEvent(new MouseEvent("mouseup"));
      expect(cancelSpy).toHaveBeenCalledWith(42);

      cancelSpy.mockRestore();
    });

    it("horizontal auto-scroll works (cursor beyond right edge)", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      mockBoundingRect(el, { left: 0, right: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let tickCount = 0;
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        if (tickCount++ === 0) cb(0);
        return tickCount;
      });

      startHorizontalDrag(result, 150);
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 350 }));

      expect(rafSpy).toHaveBeenCalled();
      // overshoot = 350 - 300 = 50, scrollDelta = 50 * 0.15 = 7.5
      expect(el.scrollLeft).toBeGreaterThan(0);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("horizontal auto-scroll works (cursor beyond left edge)", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 500,
        scrollHeight: 300,
        clientHeight: 300,
      });
      mockBoundingRect(el, { left: 100, right: 400 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let tickCount = 0;
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        if (tickCount++ === 0) cb(0);
        return tickCount;
      });

      startHorizontalDrag(result, 200);
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 50 }));

      expect(rafSpy).toHaveBeenCalled();
      expect(el.scrollLeft).toBeLessThan(500);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("rebases drag origin so no jarring jump when returning to bounds", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let tickCount = 0;
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        if (tickCount++ === 0) cb(0);
        return tickCount;
      });

      startVerticalDrag(result, 150);

      // Move beyond bounds — auto-scroll runs one tick and rebases drag origin
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));
      const scrollAfterAutoScroll = el.scrollTop;
      expect(scrollAfterAutoScroll).toBeGreaterThan(0);

      // Now move back to where we started (within bounds)
      // Without rebase, this would cause scrollTop to jump back toward 0
      // With rebase, scrollTop should stay approximately where auto-scroll left it
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 150 }));

      // After rebase: dragStartPos = 350 (currentMouseY), dragStartScroll = scrollAfterAutoScroll
      // Moving to 150: delta = 150 - 350 = -200, ratio = 1000/300 ≈ 3.33
      // scrollTop = scrollAfterAutoScroll + (-200 * 3.33)
      const expectedScroll = scrollAfterAutoScroll + -200 * (1000 / 300);
      expect(el.scrollTop).toBeCloseTo(expectedScroll, 0);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("does not start auto-scroll when cursor is within bounds", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      const rafSpy = vi.spyOn(window, "requestAnimationFrame");

      startVerticalDrag(result, 150);

      // Move cursor within bounds — no auto-scroll should start
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 200 }));

      expect(rafSpy).not.toHaveBeenCalled();

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("does not start auto-scroll for horizontal drag within bounds", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      mockBoundingRect(el, { left: 0, right: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      const rafSpy = vi.spyOn(window, "requestAnimationFrame");

      startHorizontalDrag(result, 150);

      // Move cursor within bounds — no auto-scroll should start
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 200 }));

      expect(rafSpy).not.toHaveBeenCalled();

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("autoScrollTick exits early when isDragging is false", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      const rafCallbacks: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });

      startVerticalDrag(result, 150);
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));
      expect(rafCallbacks.length).toBe(1);

      // End drag (sets isDragging = false) — cancelAutoScroll is called but
      // simulate the race where the callback was already queued
      document.dispatchEvent(new MouseEvent("mouseup"));

      // Manually invoke the queued callback after drag ended
      const scrollBefore = el.scrollTop;
      rafCallbacks[0]!(0);

      // Should not scroll further and should not schedule another rAF
      expect(el.scrollTop).toBe(scrollBefore);
      expect(rafCallbacks.length).toBe(1);
    });

    it("rapid mousemove events do not double-schedule rAF", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockReturnValue(42);

      startVerticalDrag(result, 150);

      // Two rapid mousemove events beyond bounds without rAF executing between them
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 400 }));

      // Should only schedule one rAF (guard: autoScrollRafId !== null)
      expect(rafSpy).toHaveBeenCalledTimes(1);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("horizontal auto-scroll rebases drag origin correctly", async () => {
      const el = createMockElement({
        scrollWidth: 1000,
        clientWidth: 300,
        scrollLeft: 0,
        scrollHeight: 300,
        clientHeight: 300,
      });
      mockBoundingRect(el, { left: 0, right: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let tickCount = 0;
      const rafSpy = vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        if (tickCount++ === 0) cb(0);
        return tickCount;
      });

      startHorizontalDrag(result, 150);

      // Move beyond right edge — auto-scroll one tick
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 350 }));
      const scrollAfterAutoScroll = el.scrollLeft;
      expect(scrollAfterAutoScroll).toBeGreaterThan(0);

      // Return within bounds — rebase prevents jarring jump
      document.dispatchEvent(new MouseEvent("mousemove", { clientX: 150 }));

      // After rebase: dragStartPos = 350, dragStartScroll = scrollAfterAutoScroll
      // delta = 150 - 350 = -200, ratio = 1000/300
      const expectedScroll = scrollAfterAutoScroll + -200 * (1000 / 300);
      expect(el.scrollLeft).toBeCloseTo(expectedScroll, 0);

      document.dispatchEvent(new MouseEvent("mouseup"));
      rafSpy.mockRestore();
    });

    it("unmount during active auto-scroll cancels rAF", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      const cancelSpy = vi.spyOn(window, "cancelAnimationFrame");
      vi.spyOn(window, "requestAnimationFrame").mockReturnValue(99);

      startVerticalDrag(result, 150);
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));

      // Unmount the component while auto-scroll is active
      mountedWrappers[0]!.unmount();
      mountedWrappers.length = 0;

      expect(cancelSpy).toHaveBeenCalledWith(99);
      cancelSpy.mockRestore();
    });

    it("handles null container during active auto-scroll tick", async () => {
      const el = createMockElement({ scrollHeight: 1000, clientHeight: 300, scrollTop: 0 });
      mockBoundingRect(el, { top: 0, bottom: 300 });
      const containerEl = ref<HTMLElement | null>(el);
      const result = createComposable(containerEl);
      await nextTick();

      let rafCallbacks: FrameRequestCallback[] = [];
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        rafCallbacks.push(cb);
        return rafCallbacks.length;
      });

      startVerticalDrag(result, 150);
      document.dispatchEvent(new MouseEvent("mousemove", { clientY: 350 }));

      expect(rafCallbacks.length).toBe(1);

      // Set container to null before rAF tick fires
      containerEl.value = null;
      await nextTick();

      // Should not throw
      rafCallbacks[0]!(0);

      // No new rAF should be scheduled
      expect(rafCallbacks.length).toBe(1);

      document.dispatchEvent(new MouseEvent("mouseup"));
    });
  });
});
