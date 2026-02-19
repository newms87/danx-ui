import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { defineComponent, ref, nextTick, type Ref } from "vue";
import { usePopoverTrigger } from "../usePopoverTrigger";
import type { PopoverTrigger } from "../types";

describe("usePopoverTrigger", () => {
  const mountedWrappers: VueWrapper[] = [];

  function createTrigger(
    mode: PopoverTrigger = "manual",
    delay = 200
  ): {
    triggerRef: Ref<HTMLElement | null>;
    panelRef: Ref<HTMLElement | null>;
    isOpen: Ref<boolean>;
    trigger: Ref<PopoverTrigger>;
    hoverDelay: Ref<number>;
    wrapper: VueWrapper;
  } {
    const triggerRef = ref<HTMLElement | null>(null);
    const panelRef = ref<HTMLElement | null>(null);
    const isOpen = ref(false);
    const trigger = ref<PopoverTrigger>(mode);
    const hoverDelay = ref(delay);

    const wrapper = mount(
      defineComponent({
        setup() {
          usePopoverTrigger(triggerRef, panelRef, isOpen, trigger, hoverDelay);
          return { triggerRef, panelRef, isOpen };
        },
        template: `
          <div ref="triggerRef" class="trigger">
            <button>Open</button>
          </div>
          <div v-if="isOpen" ref="panelRef" class="panel">Panel</div>
        `,
      }),
      { attachTo: document.body }
    );
    mountedWrappers.push(wrapper);
    return { triggerRef, panelRef, isOpen, trigger, hoverDelay, wrapper };
  }

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    for (const w of mountedWrappers) w.unmount();
    mountedWrappers.length = 0;
    vi.useRealTimers();
  });

  describe("manual mode", () => {
    it("does not respond to hover or focus events", async () => {
      const { triggerRef, isOpen } = createTrigger("manual");
      await nextTick();

      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(false);

      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(false);
    });
  });

  describe("hover mode", () => {
    it("opens on mouseenter on trigger", async () => {
      const { triggerRef, isOpen } = createTrigger("hover");
      await nextTick();
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);
    });

    it("starts close timer on mouseleave from trigger", async () => {
      const { triggerRef, isOpen } = createTrigger("hover", 100);
      await nextTick();
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);

      triggerRef.value!.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      // Not closed yet — timer hasn't fired
      expect(isOpen.value).toBe(true);

      vi.advanceTimersByTime(100);
      expect(isOpen.value).toBe(false);
    });

    it("cancels close timer when entering panel", async () => {
      const { triggerRef, panelRef, isOpen, wrapper } = createTrigger("hover", 100);
      await nextTick();

      // Open
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      await nextTick();

      // Leave trigger (starts timer)
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      // Enter panel (cancels timer)
      panelRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

      vi.advanceTimersByTime(200);
      expect(isOpen.value).toBe(true);
    });

    it("starts close timer on mouseleave from panel", async () => {
      const { triggerRef, panelRef, isOpen } = createTrigger("hover", 100);
      await nextTick();

      // Open and get panel
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      await nextTick();

      // Enter panel, then leave
      panelRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      panelRef.value!.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      vi.advanceTimersByTime(100);
      expect(isOpen.value).toBe(false);
    });

    it("re-entering trigger before timer cancels close", async () => {
      const { triggerRef, isOpen } = createTrigger("hover", 100);
      await nextTick();

      // Open
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);

      // Leave trigger (starts timer)
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      // Advance partially
      vi.advanceTimersByTime(50);

      // Re-enter trigger (cancels timer)
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

      vi.advanceTimersByTime(200);
      expect(isOpen.value).toBe(true);
    });

    it("handles null triggerRef gracefully", async () => {
      const triggerRef = ref<HTMLElement | null>(null);
      const panelRef = ref<HTMLElement | null>(null);
      const isOpen = ref(false);
      const trigger = ref<PopoverTrigger>("hover");
      const hoverDelay = ref(200);

      const wrapper = mount(
        defineComponent({
          setup() {
            usePopoverTrigger(triggerRef, panelRef, isOpen, trigger, hoverDelay);
            return {};
          },
          template: "<div />",
        }),
        { attachTo: document.body }
      );
      mountedWrappers.push(wrapper);
      await nextTick();

      // Should not crash — triggerRef is null so no listeners are attached
      expect(isOpen.value).toBe(false);
    });

    it("cleans up panel listeners when panel unmounts", async () => {
      const { triggerRef, panelRef, isOpen } = createTrigger("hover", 100);
      await nextTick();

      // Open (mounts panel)
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      await nextTick();
      const panelEl = panelRef.value!;
      const removeSpy = vi.spyOn(panelEl, "removeEventListener");

      // Close (unmounts panel, triggers oldPanel cleanup)
      isOpen.value = false;
      await nextTick();

      const mouseenterRemovals = removeSpy.mock.calls.filter((c) => c[0] === "mouseenter");
      const mouseleaveRemovals = removeSpy.mock.calls.filter((c) => c[0] === "mouseleave");
      expect(mouseenterRemovals.length).toBeGreaterThan(0);
      expect(mouseleaveRemovals.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });

    it("respects hoverDelay value", async () => {
      const { triggerRef, isOpen } = createTrigger("hover", 500);
      await nextTick();

      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      vi.advanceTimersByTime(400);
      expect(isOpen.value).toBe(true);

      vi.advanceTimersByTime(100);
      expect(isOpen.value).toBe(false);
    });
  });

  describe("focus mode", () => {
    it("opens on focusin on trigger", async () => {
      const { triggerRef, isOpen } = createTrigger("focus");
      await nextTick();
      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);
    });

    it("closes on focusout to outside", async () => {
      const { triggerRef, isOpen } = createTrigger("focus");
      await nextTick();

      // Open
      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);

      // Focus out with relatedTarget outside both trigger and panel
      const outside = document.createElement("div");
      document.body.appendChild(outside);
      triggerRef.value!.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: outside })
      );
      // Wait for microtask
      await Promise.resolve();
      expect(isOpen.value).toBe(false);
      outside.remove();
    });

    it("stays open when focus moves from trigger to panel", async () => {
      const { triggerRef, panelRef, isOpen } = createTrigger("focus");
      await nextTick();

      // Open
      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      await nextTick();

      // Focus out from trigger but into panel
      triggerRef.value!.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: panelRef.value })
      );
      await Promise.resolve();
      expect(isOpen.value).toBe(true);
    });

    it("closes on focusout with null relatedTarget", async () => {
      const { triggerRef, isOpen } = createTrigger("focus");
      await nextTick();

      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);

      // relatedTarget is null (e.g., focus leaves browser window)
      triggerRef.value!.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: null })
      );
      await Promise.resolve();
      expect(isOpen.value).toBe(false);
    });

    it("handles null triggerRef gracefully in focus mode", async () => {
      const triggerRef = ref<HTMLElement | null>(null);
      const panelRef = ref<HTMLElement | null>(null);
      const isOpen = ref(false);
      const trigger = ref<PopoverTrigger>("focus");
      const hoverDelay = ref(200);

      const wrapper = mount(
        defineComponent({
          setup() {
            usePopoverTrigger(triggerRef, panelRef, isOpen, trigger, hoverDelay);
            return {};
          },
          template: "<div />",
        }),
        { attachTo: document.body }
      );
      mountedWrappers.push(wrapper);
      await nextTick();
      expect(isOpen.value).toBe(false);
    });

    it("cleans up panel listeners when panel unmounts in focus mode", async () => {
      const { triggerRef, panelRef, isOpen } = createTrigger("focus");
      await nextTick();

      // Open (mounts panel)
      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      await nextTick();
      const panelEl = panelRef.value!;
      const removeSpy = vi.spyOn(panelEl, "removeEventListener");

      // Close (unmounts panel, triggers oldPanel cleanup)
      isOpen.value = false;
      await nextTick();

      const focusinRemovals = removeSpy.mock.calls.filter((c) => c[0] === "focusin");
      const focusoutRemovals = removeSpy.mock.calls.filter((c) => c[0] === "focusout");
      expect(focusinRemovals.length).toBeGreaterThan(0);
      expect(focusoutRemovals.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });

    it("closes when focus leaves panel to outside", async () => {
      const { triggerRef, panelRef, isOpen } = createTrigger("focus");
      await nextTick();

      // Open
      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      await nextTick();

      // Focus into panel
      panelRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));

      // Focus out from panel to outside
      const outside = document.createElement("div");
      document.body.appendChild(outside);
      panelRef.value!.dispatchEvent(
        new FocusEvent("focusout", { bubbles: true, relatedTarget: outside })
      );
      await Promise.resolve();
      expect(isOpen.value).toBe(false);
      outside.remove();
    });
  });

  describe("cleanup", () => {
    it("removes hover listeners on dispose", async () => {
      const { triggerRef, isOpen, wrapper } = createTrigger("hover");
      await nextTick();

      // Capture element before unmount
      const el = triggerRef.value!;
      wrapper.unmount();
      mountedWrappers.length = 0;

      el.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(false);
    });

    it("removes focus listeners on dispose", async () => {
      const { triggerRef, isOpen, wrapper } = createTrigger("focus");
      await nextTick();

      const el = triggerRef.value!;
      wrapper.unmount();
      mountedWrappers.length = 0;

      el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(false);
    });

    it("does not write to isOpen after disposal in focus mode", async () => {
      const { triggerRef, isOpen, wrapper } = createTrigger("focus");
      await nextTick();

      // Open
      const el = triggerRef.value!;
      el.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);

      // Dispatch focusout, then immediately unmount before microtask resolves
      el.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: null }));
      wrapper.unmount();
      mountedWrappers.length = 0;

      // Microtask should be guarded by disposed flag
      await Promise.resolve();
      expect(isOpen.value).toBe(true);
    });
  });

  describe("mode switching", () => {
    it("tears down old listeners and sets up new ones", async () => {
      const { triggerRef, isOpen, trigger: mode } = createTrigger("hover");
      await nextTick();

      // Hover mode works
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      isOpen.value = false;

      // Switch to focus mode
      mode.value = "focus";
      await nextTick();

      // Hover should no longer work
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(false);

      // Focus should work
      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(true);
    });

    it("switching to manual removes all listeners", async () => {
      const { triggerRef, isOpen, trigger: mode } = createTrigger("hover");
      await nextTick();

      // Hover mode works
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(true);
      isOpen.value = false;

      // Switch to manual
      mode.value = "manual";
      await nextTick();

      // Neither hover nor focus should work
      triggerRef.value!.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      expect(isOpen.value).toBe(false);
      triggerRef.value!.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      expect(isOpen.value).toBe(false);
    });
  });
});
