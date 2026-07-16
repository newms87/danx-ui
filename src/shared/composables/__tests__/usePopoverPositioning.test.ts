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

import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ref, effectScope, nextTick } from "vue";
import { usePopoverPositioning } from "../usePopoverPositioning";
import type { PopoverPlacement, PopoverPosition } from "../../types";

/**
 * Waits for the dynamic import() inside usePopoverPositioning's resize wiring
 * to resolve. Polls rather than assuming a fixed number of ticks, since the
 * import's resolution time depends on whether the module is already warm in
 * vite-node's cache.
 */
async function flushDynamicImport() {
  await vi.waitFor(() => expect(mockUseResizeObserver).toHaveBeenCalled());
}

/** Create a mock element with a controllable getBoundingClientRect */
function mockElement(rect: Partial<DOMRect>): HTMLElement {
  const el = document.createElement("div");
  el.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
    ...rect,
  });
  return el;
}

/** Create a mock SVG element (instanceof SVGElement, not HTMLElement) with a controllable rect */
function mockSvgElement(rect: Partial<DOMRect>): SVGElement {
  const el = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  el.getBoundingClientRect = () => ({
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => {},
    ...rect,
  });
  return el;
}

describe("usePopoverPositioning", () => {
  let scope: ReturnType<typeof effectScope>;

  beforeEach(() => {
    // Set viewport size
    Object.defineProperty(window, "innerWidth", { value: 1024, writable: true });
    Object.defineProperty(window, "innerHeight", { value: 768, writable: true });
  });

  afterEach(() => {
    scope?.stop();
  });

  it("positions panel below trigger for bottom placement", async () => {
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // bottom: top = triggerRect.bottom + 8 = 138
    // left = triggerCenterX - panelWidth/2 = (200+30) - 50 = 180
    expect(result!.style.top).toBe("138px");
    expect(result!.style.left).toBe("180px");
  });

  it("positions panel above trigger for top placement", async () => {
    const trigger = mockElement({
      top: 200,
      left: 200,
      bottom: 230,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("top");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // top: triggerRect.top - panelHeight - 8 = 200 - 50 - 8 = 142
    expect(result!.style.top).toBe("142px");
  });

  it("positions panel to the right for right placement", async () => {
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("right");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // left = triggerRect.right + 8 = 268
    // top = triggerCenterY - panelHeight/2 = (100+15) - 25 = 90
    expect(result!.style.left).toBe("268px");
    expect(result!.style.top).toBe("90px");
  });

  it("positions panel to the left for left placement", async () => {
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("left");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // left = triggerRect.left - panelWidth - 8 = 200 - 100 - 8 = 92
    expect(result!.style.left).toBe("92px");
  });

  it("auto-flips from bottom to top when overflowing viewport", async () => {
    const trigger = mockElement({
      top: 730,
      left: 200,
      bottom: 760,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // Bottom would overflow (760 + 8 + 50 = 818 > 768), flips to top
    // top: 730 - 50 - 8 = 672
    expect(result!.style.top).toBe("672px");
  });

  it("auto-flips from top to bottom when overflowing viewport", async () => {
    const trigger = mockElement({
      top: 10,
      left: 200,
      bottom: 40,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("top");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // Top would overflow (10 - 50 - 8 = -48 < 0), flips to bottom
    // top: 40 + 8 = 48
    expect(result!.style.top).toBe("48px");
  });

  it("auto-flips from right to left when overflowing viewport", async () => {
    const trigger = mockElement({
      top: 100,
      left: 930,
      bottom: 130,
      right: 990,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("right");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // Right would overflow (990 + 8 + 100 = 1098 > 1024), flips to left
    // left: 930 - 100 - 8 = 822
    expect(result!.style.left).toBe("822px");
  });

  it("auto-flips from left to right when overflowing viewport", async () => {
    const trigger = mockElement({
      top: 100,
      left: 30,
      bottom: 130,
      right: 90,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("left");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // Left would overflow (30 - 100 - 8 = -78 < 0), flips to right
    // left: 90 + 8 = 98
    expect(result!.style.left).toBe("98px");
  });

  it("registers scroll and resize listeners when open", async () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    scope.run(() => {
      usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    const scrollCalls = addSpy.mock.calls.filter((c) => c[0] === "scroll");
    const resizeCalls = addSpy.mock.calls.filter((c) => c[0] === "resize");
    expect(scrollCalls.length).toBeGreaterThan(0);
    expect(resizeCalls.length).toBeGreaterThan(0);
    addSpy.mockRestore();
  });

  it("removes scroll and resize listeners when closed", async () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    scope.run(() => {
      usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();
    isOpen.value = false;
    await nextTick();

    const scrollCalls = removeSpy.mock.calls.filter((c) => c[0] === "scroll");
    const resizeCalls = removeSpy.mock.calls.filter((c) => c[0] === "resize");
    expect(scrollCalls.length).toBeGreaterThan(0);
    expect(resizeCalls.length).toBeGreaterThan(0);
    removeSpy.mockRestore();
  });

  it("cleans up on scope disposal", async () => {
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    scope.run(() => {
      usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();
    scope.stop();

    const scrollCalls = removeSpy.mock.calls.filter((c) => c[0] === "scroll");
    expect(scrollCalls.length).toBeGreaterThan(0);
    removeSpy.mockRestore();
  });

  it("measures first child when trigger has display:contents", async () => {
    const wrapper = document.createElement("div");
    const child = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    wrapper.appendChild(child);

    // jsdom doesn't compute inline styles via getComputedStyle, so mock it
    const origGetComputedStyle = window.getComputedStyle;
    vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
      if (el === wrapper) {
        return { display: "contents" } as CSSStyleDeclaration;
      }
      return origGetComputedStyle(el);
    });

    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(wrapper);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // Should use child's rect, not the wrapper's (which has no box)
    expect(result!.style.top).toBe("138px");
    expect(result!.style.left).toBe("180px");

    vi.mocked(window.getComputedStyle).mockRestore();
  });

  it("measures SVG first child when display:contents trigger wraps an icon", async () => {
    // Regression: icon-only triggers render an SVG, which is an SVGElement but
    // NOT an HTMLElement. The old instanceof HTMLElement guard fell through to
    // the display:contents wrapper, whose getBoundingClientRect returns a zero
    // rect, pinning the panel to the viewport corner (clamped to 20px padding).
    const wrapper = document.createElement("div");
    // Wrapper itself has no box (display:contents) — zero rect is the default.
    const child = mockSvgElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    wrapper.appendChild(child);

    // jsdom doesn't compute inline styles via getComputedStyle, so mock it
    const origGetComputedStyle = window.getComputedStyle;
    vi.spyOn(window, "getComputedStyle").mockImplementation((el) => {
      if (el === wrapper) {
        return { display: "contents" } as CSSStyleDeclaration;
      }
      return origGetComputedStyle(el);
    });

    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(wrapper);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // Uses the SVG child's rect (138/180), NOT the zero-rect wrapper (clamped to 20/20)
    expect(result!.style.top).toBe("138px");
    expect(result!.style.left).toBe("180px");

    vi.mocked(window.getComputedStyle).mockRestore();
  });

  it("uses explicit position when provided", async () => {
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);
    const position = ref<PopoverPosition | undefined>({ x: 300, y: 400 });

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen, position);
    });

    await nextTick();

    // Should use explicit coordinates, ignoring trigger rect
    expect(result!.style.top).toBe("400px");
    expect(result!.style.left).toBe("300px");
  });

  it("falls back to trigger positioning when position is undefined", async () => {
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);
    const position = ref<PopoverPosition | undefined>(undefined);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen, position);
    });

    await nextTick();

    // Should use trigger-based positioning (same as bottom placement test)
    expect(result!.style.top).toBe("138px");
    expect(result!.style.left).toBe("180px");
  });

  it("positions at explicit coordinates even when trigger is null", async () => {
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(null);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);
    const position = ref<PopoverPosition | undefined>({ x: 150, y: 250 });

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen, position);
    });

    await nextTick();

    expect(result!.style.top).toBe("250px");
    expect(result!.style.left).toBe("150px");
  });

  it("does not update position when trigger is null", async () => {
    const panel = mockElement({ width: 100, height: 50 });
    const triggerRef = ref<HTMLElement | null>(null);
    const panelRef = ref<HTMLElement | null>(panel);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    // Style should remain empty when trigger is null
    expect(result!.style.top).toBeUndefined();
    expect(result!.style.left).toBeUndefined();
  });

  it("does not update position when panel is null", async () => {
    const trigger = mockElement({
      top: 100,
      left: 200,
      bottom: 130,
      right: 260,
      width: 60,
      height: 30,
    });
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(null);
    const placement = ref<PopoverPlacement>("bottom");
    const isOpen = ref(true);

    scope = effectScope();
    let result: ReturnType<typeof usePopoverPositioning>;
    scope.run(() => {
      result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
    });

    await nextTick();

    expect(result!.style.top).toBeUndefined();
  });

  describe("viewport padding clamping", () => {
    it("clamps explicit position near top-left to 20px padding", async () => {
      const panel = mockElement({ width: 100, height: 50 });
      const triggerRef = ref<HTMLElement | null>(null);
      const panelRef = ref<HTMLElement | null>(panel);
      const placement = ref<PopoverPlacement>("bottom");
      const isOpen = ref(true);
      const position = ref<PopoverPosition | undefined>({ x: 0, y: 0 });

      scope = effectScope();
      let result: ReturnType<typeof usePopoverPositioning>;
      scope.run(() => {
        result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen, position);
      });

      await nextTick();

      expect(result!.style.top).toBe("20px");
      expect(result!.style.left).toBe("20px");
    });

    it("clamps explicit position near bottom-right to 20px padding", async () => {
      const panel = mockElement({ width: 100, height: 50 });
      const triggerRef = ref<HTMLElement | null>(null);
      const panelRef = ref<HTMLElement | null>(panel);
      const placement = ref<PopoverPlacement>("bottom");
      const isOpen = ref(true);
      const position = ref<PopoverPosition | undefined>({ x: 2000, y: 2000 });

      scope = effectScope();
      let result: ReturnType<typeof usePopoverPositioning>;
      scope.run(() => {
        result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen, position);
      });

      await nextTick();

      // 1024 - 100 - 20 = 904, 768 - 50 - 20 = 698
      expect(result!.style.top).toBe("698px");
      expect(result!.style.left).toBe("904px");
    });

    it("clamps trigger-anchored position to 20px viewport padding", async () => {
      // Trigger at very top-left, panel placed above would go negative
      // After flip to bottom it would be at y=8, still within padding
      // But a panel placed left of a trigger at x=5 would go to x=-103
      // After flip to right: x = 65 + 8 = 73, within padding
      const trigger = mockElement({
        top: 5,
        left: 5,
        bottom: 35,
        right: 65,
        width: 60,
        height: 30,
      });
      const panel = mockElement({ width: 100, height: 50 });
      const triggerRef = ref<HTMLElement | null>(trigger);
      const panelRef = ref<HTMLElement | null>(panel);
      const placement = ref<PopoverPlacement>("top");
      const isOpen = ref(true);

      scope = effectScope();
      let result: ReturnType<typeof usePopoverPositioning>;
      scope.run(() => {
        result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
      });

      await nextTick();

      // Top would be -53 (5-50-8), flips to bottom: 35+8=43
      // Left would be (5+30)-50 = -15, clamped to 20
      expect(result!.style.top).toBe("43px");
      expect(result!.style.left).toBe("20px");
    });
  });

  describe("resize repositioning", () => {
    beforeEach(() => {
      mockUseResizeObserver.mockClear();
    });

    it("wires a resize observer on both trigger and panel elements", async () => {
      const trigger = mockElement({ top: 100, left: 200, bottom: 130, right: 260 });
      const panel = mockElement({ width: 100, height: 50 });
      const triggerRef = ref<HTMLElement | null>(trigger);
      const panelRef = ref<HTMLElement | null>(panel);
      const placement = ref<PopoverPlacement>("bottom");
      const isOpen = ref(true);

      scope = effectScope();
      scope.run(() => {
        usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
      });

      await flushDynamicImport();

      expect(mockUseResizeObserver).toHaveBeenCalledWith(
        triggerRef,
        expect.any(Function),
        undefined
      );
      expect(mockUseResizeObserver).toHaveBeenCalledWith(panelRef, expect.any(Function), undefined);
    });

    it("repositions when the panel resizes without a window resize event, while open", async () => {
      // Trigger near the bottom of the viewport (height 768): a small panel fits
      // below without flipping, but a panel that grows tall enough overflows and
      // must flip to "top" — proving the resize callback re-ran updatePosition.
      const trigger = mockElement({
        top: 600,
        left: 200,
        bottom: 630,
        right: 260,
        width: 60,
        height: 30,
      });
      const panel = mockElement({ width: 100, height: 50 });
      const triggerRef = ref<HTMLElement | null>(trigger);
      const panelRef = ref<HTMLElement | null>(panel);
      const placement = ref<PopoverPlacement>("bottom");
      const isOpen = ref(true);

      scope = effectScope();
      let result: ReturnType<typeof usePopoverPositioning>;
      scope.run(() => {
        result = usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
      });

      await flushDynamicImport();
      // No overflow yet: top = triggerRect.bottom + 8 = 638
      expect(result!.style.top).toBe("638px");

      // Panel grows tall enough to overflow the viewport if it stayed below —
      // simulate the resize callback vueuse would invoke on the panel target.
      panel.getBoundingClientRect = () => ({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: 100,
        height: 200,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      const panelResizeCallback = mockUseResizeObserver.mock.calls.find(
        (call) => call[0] === panelRef
      )?.[1];
      panelResizeCallback?.();

      // Flipped to top: triggerRect.top - panelHeight - 8 = 600 - 200 - 8 = 392
      expect(result!.style.top).toBe("392px");
    });

    it("does not reposition on resize while closed", async () => {
      const trigger = mockElement({ top: 100, left: 200, bottom: 130, right: 260 });
      const panel = mockElement({ width: 100, height: 50 });
      const triggerRef = ref<HTMLElement | null>(trigger);
      const panelRef = ref<HTMLElement | null>(panel);
      const placement = ref<PopoverPlacement>("bottom");
      const isOpen = ref(false);

      scope = effectScope();
      scope.run(() => {
        usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
      });

      await flushDynamicImport();

      const updatePositionSpy = vi.spyOn(panel, "getBoundingClientRect");
      const panelResizeCallback = mockUseResizeObserver.mock.calls.find(
        (call) => call[0] === panelRef
      )?.[1];
      panelResizeCallback?.();

      expect(updatePositionSpy).not.toHaveBeenCalled();
    });

    it("stops resize observers on scope disposal", async () => {
      const stopTrigger = vi.fn();
      const stopPanel = vi.fn();
      mockUseResizeObserver
        .mockImplementationOnce(() => ({ stop: stopTrigger, isSupported: { value: true } }))
        .mockImplementationOnce(() => ({ stop: stopPanel, isSupported: { value: true } }));

      const trigger = mockElement({ top: 100, left: 200, bottom: 130, right: 260 });
      const panel = mockElement({ width: 100, height: 50 });
      const triggerRef = ref<HTMLElement | null>(trigger);
      const panelRef = ref<HTMLElement | null>(panel);
      const placement = ref<PopoverPlacement>("bottom");
      const isOpen = ref(true);

      scope = effectScope();
      scope.run(() => {
        usePopoverPositioning(triggerRef, panelRef, placement, isOpen);
      });

      await flushDynamicImport();

      scope.stop();

      expect(stopTrigger).toHaveBeenCalled();
      expect(stopPanel).toHaveBeenCalled();
    });
  });
});
