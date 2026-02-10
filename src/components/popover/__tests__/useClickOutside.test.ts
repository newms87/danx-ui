import { describe, it, expect, vi, afterEach } from "vitest";
import { ref, effectScope } from "vue";
import { useClickOutside } from "../useClickOutside";

describe("useClickOutside", () => {
  let scope: ReturnType<typeof effectScope>;

  afterEach(() => {
    scope?.stop();
  });

  function createElements() {
    const trigger = document.createElement("div");
    const panel = document.createElement("div");
    document.body.appendChild(trigger);
    document.body.appendChild(panel);
    return { trigger, panel };
  }

  function simulateMousedown(target: EventTarget): void {
    const event = new MouseEvent("mousedown", { bubbles: true });
    Object.defineProperty(event, "target", { value: target });
    document.dispatchEvent(event);
  }

  it("fires callback when clicking outside both elements", () => {
    const { trigger, panel } = createElements();
    const callback = vi.fn();
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => {
      useClickOutside(triggerRef, panelRef, callback, isActive);
    });

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    simulateMousedown(outside);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("does not fire callback when clicking on trigger", () => {
    const { trigger, panel } = createElements();
    const callback = vi.fn();
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => {
      useClickOutside(triggerRef, panelRef, callback, isActive);
    });

    simulateMousedown(trigger);
    expect(callback).not.toHaveBeenCalled();
  });

  it("does not fire callback when clicking on panel", () => {
    const { trigger, panel } = createElements();
    const callback = vi.fn();
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => {
      useClickOutside(triggerRef, panelRef, callback, isActive);
    });

    simulateMousedown(panel);
    expect(callback).not.toHaveBeenCalled();
  });

  it("does not fire callback when inactive", () => {
    const { trigger, panel } = createElements();
    const callback = vi.fn();
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const isActive = ref(false);

    scope = effectScope();
    scope.run(() => {
      useClickOutside(triggerRef, panelRef, callback, isActive);
    });

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    simulateMousedown(outside);
    expect(callback).not.toHaveBeenCalled();
  });

  it("adds listener when isActive becomes true", () => {
    const { trigger, panel } = createElements();
    const callback = vi.fn();
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const isActive = ref(false);

    scope = effectScope();
    scope.run(() => {
      useClickOutside(triggerRef, panelRef, callback, isActive);
    });

    const outside = document.createElement("div");
    document.body.appendChild(outside);

    // Should not fire while inactive
    simulateMousedown(outside);
    expect(callback).not.toHaveBeenCalled();

    // Activate and try again
    isActive.value = true;
    simulateMousedown(outside);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("removes listener when isActive becomes false", () => {
    const { trigger, panel } = createElements();
    const callback = vi.fn();
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => {
      useClickOutside(triggerRef, panelRef, callback, isActive);
    });

    const outside = document.createElement("div");
    document.body.appendChild(outside);

    simulateMousedown(outside);
    expect(callback).toHaveBeenCalledTimes(1);

    isActive.value = false;
    simulateMousedown(outside);
    expect(callback).toHaveBeenCalledTimes(1); // Not called again
  });

  it("cleans up listener on scope disposal", () => {
    const { trigger, panel } = createElements();
    const callback = vi.fn();
    const triggerRef = ref<HTMLElement | null>(trigger);
    const panelRef = ref<HTMLElement | null>(panel);
    const isActive = ref(true);

    scope = effectScope();
    scope.run(() => {
      useClickOutside(triggerRef, panelRef, callback, isActive);
    });

    scope.stop();

    const outside = document.createElement("div");
    document.body.appendChild(outside);
    simulateMousedown(outside);
    expect(callback).not.toHaveBeenCalled();
  });
});
