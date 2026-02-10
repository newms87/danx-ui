import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { ref, effectScope, nextTick } from "vue";
import { usePopoverPositioning } from "../usePopoverPositioning";
import type { PopoverPlacement } from "../types";

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
});
