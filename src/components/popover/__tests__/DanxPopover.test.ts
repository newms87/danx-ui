import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxPopover from "../DanxPopover.vue";

/**
 * Mock native Popover API on HTMLElement.prototype since jsdom doesn't support it.
 * Tracks open state per element via a WeakMap so dynamically created elements
 * (from v-if) automatically have the API available.
 */
const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const origMatches = HTMLElement.prototype.matches;

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
    this.dispatchEvent(new Event("toggle"));
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
    this.dispatchEvent(new Event("toggle"));
  });
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ":popover-open") return popoverOpenState.get(this) ?? false;
    return origMatches.call(this, selector);
  };
});

afterEach(() => {
  HTMLElement.prototype.showPopover = undefined as unknown as () => void;
  HTMLElement.prototype.hidePopover = undefined as unknown as () => void;
  HTMLElement.prototype.matches = origMatches;
});

describe("DanxPopover", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountPopover(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
    wrapper = mount(DanxPopover, {
      props: { modelValue: true, ...props },
      attrs,
      slots: {
        trigger: '<button class="test-trigger">Open</button>',
        default: '<div class="test-content">Content</div>',
      },
      attachTo: document.body,
    });

    return wrapper;
  }

  describe("trigger slot", () => {
    it("renders trigger slot inline", () => {
      mountPopover();
      expect(wrapper.find(".test-trigger").exists()).toBe(true);
      expect(wrapper.find(".test-trigger").text()).toBe("Open");
    });

    it("wraps trigger in display:contents div", () => {
      mountPopover();
      expect(wrapper.find(".danx-popover-trigger").exists()).toBe(true);
    });
  });

  describe("panel rendering", () => {
    it("renders panel with popover attribute", () => {
      mountPopover();
      const panel = wrapper.find(".danx-popover");
      expect(panel.exists()).toBe(true);
      expect(panel.attributes("popover")).toBe("manual");
    });

    it("renders slot content when modelValue is true", () => {
      mountPopover();
      expect(wrapper.find(".test-content").exists()).toBe(true);
    });

    it("removes panel from DOM when modelValue is false", () => {
      mountPopover({ modelValue: false });
      expect(wrapper.find(".danx-popover").exists()).toBe(false);
      expect(wrapper.find(".test-content").exists()).toBe(false);
    });
  });

  describe("placement", () => {
    it("sets data-placement attribute from placement prop", () => {
      mountPopover({ placement: "top" });
      const panel = wrapper.find(".danx-popover");
      expect(panel.attributes("data-placement")).toBe("top");
    });

    it("defaults to bottom placement", () => {
      mountPopover();
      const panel = wrapper.find(".danx-popover");
      expect(panel.attributes("data-placement")).toBe("bottom");
    });
  });

  describe("attrs forwarding", () => {
    it("forwards attrs to panel, not trigger wrapper", () => {
      mountPopover({}, { class: "my-custom-popover", "data-testid": "popover" });
      const panel = wrapper.find(".danx-popover");
      expect(panel.classes()).toContain("my-custom-popover");
      expect(panel.attributes("data-testid")).toBe("popover");
      expect(wrapper.find(".danx-popover-trigger").classes()).not.toContain("my-custom-popover");
    });
  });

  describe("position prop", () => {
    it("sets inline position styles when position is provided", async () => {
      mountPopover({ position: { x: 300, y: 200 } });
      await nextTick();
      await nextTick();
      const panel = wrapper.find(".danx-popover").element as HTMLElement;
      expect(panel.style.top).toBe("200px");
      expect(panel.style.left).toBe("300px");
    });
  });

  describe("click trigger", () => {
    it("toggles panel on click", async () => {
      mountPopover({ modelValue: false, trigger: "click" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await nextTick();

      // modelValue should now be true
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
    });
  });

  describe("hover trigger", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("opens on mouseenter", async () => {
      mountPopover({ modelValue: false, trigger: "hover" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await nextTick();

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
    });

    it("closes on mouseleave after delay", async () => {
      mountPopover({ modelValue: true, trigger: "hover" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    });
  });

  describe("focus trigger", () => {
    it("opens on focusin", async () => {
      mountPopover({ modelValue: false, trigger: "focus" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      await nextTick();

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([true]);
    });
  });

  describe("escape key dismiss", () => {
    it("closes popover when Escape is pressed", async () => {
      mountPopover({ modelValue: true });
      await nextTick();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);
    });

    it("does not emit when popover is closed", async () => {
      mountPopover({ modelValue: false });
      await nextTick();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("showPopover integration", () => {
    it("calls showPopover when panel mounts", async () => {
      mountPopover({ modelValue: true });
      await nextTick();
      await nextTick();

      const panel = wrapper.find(".danx-popover").element as HTMLElement;
      expect(panel.showPopover).toHaveBeenCalled();
    });
  });

  describe("click outside dismiss", () => {
    it("closes popover when clicking outside trigger and panel", async () => {
      mountPopover({ modelValue: true });
      await nextTick();

      const outside = document.createElement("div");
      document.body.appendChild(outside);
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outside });
      document.dispatchEvent(event);
      await nextTick();

      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([false]);

      outside.remove();
    });

    it("does not close popover when clicking on trigger", async () => {
      mountPopover({ modelValue: true });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: trigger });
      document.dispatchEvent(event);
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not close popover when clicking on panel", async () => {
      mountPopover({ modelValue: true });
      await nextTick();

      const panel = wrapper.find(".danx-popover").element;
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: panel });
      document.dispatchEvent(event);
      await nextTick();

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });
});
