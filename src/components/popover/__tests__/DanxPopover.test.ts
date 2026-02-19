import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import { nextTick } from "vue";
import DanxPopover from "../DanxPopover.vue";

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

  describe("panel visibility", () => {
    it("renders panel when modelValue is true", () => {
      mountPopover();
      expect(document.body.querySelector(".danx-popover")).not.toBeNull();
    });

    it("does not render panel when modelValue is false", () => {
      mountPopover({ modelValue: false });
      expect(document.body.querySelector(".danx-popover")).toBeNull();
    });

    it("renders panel content", () => {
      mountPopover();
      const panel = document.body.querySelector(".danx-popover");
      expect(panel?.querySelector(".test-content")?.textContent).toBe("Content");
    });
  });

  describe("teleport", () => {
    it("teleports panel to body", () => {
      mountPopover();
      // Panel should be a direct child of body (via Teleport)
      const panel = document.body.querySelector(".danx-popover");
      expect(panel).not.toBeNull();
    });
  });

  describe("attrs forwarding", () => {
    it("forwards attrs to panel, not trigger wrapper", () => {
      mountPopover({}, { class: "my-custom-popover", "data-testid": "popover" });
      const panel = document.body.querySelector(".danx-popover");
      expect(panel?.classList.contains("my-custom-popover")).toBe(true);
      expect(panel?.getAttribute("data-testid")).toBe("popover");
      // Trigger wrapper should NOT have the attrs
      expect(wrapper.find(".danx-popover-trigger").classes()).not.toContain("my-custom-popover");
    });
  });

  describe("close on click outside", () => {
    it("emits update:modelValue false when clicking outside", async () => {
      mountPopover();
      const outside = document.createElement("div");
      document.body.appendChild(outside);

      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outside });
      document.dispatchEvent(event);

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      outside.remove();
    });

    it("does not close when clicking on trigger", async () => {
      mountPopover();
      const trigger = wrapper.find(".test-trigger").element;

      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: trigger });
      document.dispatchEvent(event);

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not close when clicking on panel", async () => {
      mountPopover();
      const panel = document.body.querySelector(".danx-popover")!;

      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: panel });
      document.dispatchEvent(event);

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("close on Escape", () => {
    it("emits update:modelValue false on Escape key", () => {
      mountPopover();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });

    it("does not close on non-Escape keys", () => {
      mountPopover();
      const event = new KeyboardEvent("keydown", { key: "Enter" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("does not close on Escape when already closed", () => {
      mountPopover({ modelValue: false });
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("position prop", () => {
    it("positions panel at explicit coordinates when position is set", async () => {
      mountPopover({ position: { x: 300, y: 200 } });
      await wrapper.vm.$nextTick();
      const panel = document.body.querySelector(".danx-popover") as HTMLElement;
      expect(panel.style.top).toBe("200px");
      expect(panel.style.left).toBe("300px");
    });

    it("still closes on click outside when position is set", () => {
      mountPopover({ position: { x: 100, y: 100 } });
      const outside = document.createElement("div");
      document.body.appendChild(outside);

      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outside });
      document.dispatchEvent(event);

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      outside.remove();
    });
  });

  describe("cleanup", () => {
    it("removes document keydown listener on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      mountPopover();
      wrapper.unmount();

      const keydownCalls = removeSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });
  });

  describe("click trigger", () => {
    it("toggles panel on click", async () => {
      mountPopover({ modelValue: false, trigger: "click" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await nextTick();

      expect(document.body.querySelector(".danx-popover")).not.toBeNull();

      trigger.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      await nextTick();

      expect(document.body.querySelector(".danx-popover")).toBeNull();
    });

    it("click-outside still works in click mode", async () => {
      mountPopover({ modelValue: true, trigger: "click" });
      await nextTick();

      const outside = document.createElement("div");
      document.body.appendChild(outside);
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outside });
      document.dispatchEvent(event);

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      outside.remove();
    });

    it("Escape still works in click mode", async () => {
      mountPopover({ modelValue: true, trigger: "click" });
      await nextTick();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });
  });

  describe("hover trigger", () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("opens on mouseenter and closes on mouseleave", async () => {
      mountPopover({ modelValue: false, trigger: "hover" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await nextTick();

      expect(document.body.querySelector(".danx-popover")).not.toBeNull();

      trigger.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
      vi.advanceTimersByTime(200);
      await nextTick();

      expect(document.body.querySelector(".danx-popover")).toBeNull();
    });

    it("respects hoverDelay prop", async () => {
      mountPopover({ modelValue: false, trigger: "hover", hoverDelay: 500 });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await nextTick();
      trigger.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      vi.advanceTimersByTime(400);
      await nextTick();
      expect(document.body.querySelector(".danx-popover")).not.toBeNull();

      vi.advanceTimersByTime(100);
      await nextTick();
      expect(document.body.querySelector(".danx-popover")).toBeNull();
    });

    it("panel hover keeps popover open", async () => {
      mountPopover({ modelValue: false, trigger: "hover", hoverDelay: 100 });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));
      await nextTick();
      expect(document.body.querySelector(".danx-popover")).not.toBeNull();

      // Leave trigger (starts timer)
      trigger.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));

      // Enter panel (cancels timer)
      const panel = document.body.querySelector(".danx-popover")!;
      panel.dispatchEvent(new MouseEvent("mouseenter", { bubbles: true }));

      vi.advanceTimersByTime(200);
      await nextTick();
      expect(document.body.querySelector(".danx-popover")).not.toBeNull();
    });

    it("click-outside still works in hover mode", async () => {
      mountPopover({ modelValue: true, trigger: "hover" });
      await nextTick();

      const outside = document.createElement("div");
      document.body.appendChild(outside);
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outside });
      document.dispatchEvent(event);

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      outside.remove();
    });

    it("Escape still works in hover mode", async () => {
      mountPopover({ modelValue: true, trigger: "hover" });
      await nextTick();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });
  });

  describe("focus trigger", () => {
    it("opens on focusin and closes on focusout", async () => {
      mountPopover({ modelValue: false, trigger: "focus" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      await nextTick();

      expect(document.body.querySelector(".danx-popover")).not.toBeNull();

      const outside = document.createElement("div");
      document.body.appendChild(outside);
      trigger.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: outside }));
      await Promise.resolve();
      await nextTick();

      expect(document.body.querySelector(".danx-popover")).toBeNull();
      outside.remove();
    });

    it("stays open when focus moves from trigger to panel", async () => {
      mountPopover({ modelValue: false, trigger: "focus" });
      await nextTick();

      const trigger = wrapper.find(".danx-popover-trigger").element;
      trigger.dispatchEvent(new FocusEvent("focusin", { bubbles: true }));
      await nextTick();

      const panel = document.body.querySelector(".danx-popover")!;
      trigger.dispatchEvent(new FocusEvent("focusout", { bubbles: true, relatedTarget: panel }));
      await Promise.resolve();
      await nextTick();

      expect(document.body.querySelector(".danx-popover")).not.toBeNull();
    });

    it("click-outside still works in focus mode", async () => {
      mountPopover({ modelValue: true, trigger: "focus" });
      await nextTick();

      const outside = document.createElement("div");
      document.body.appendChild(outside);
      const event = new MouseEvent("mousedown", { bubbles: true });
      Object.defineProperty(event, "target", { value: outside });
      document.dispatchEvent(event);

      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
      outside.remove();
    });

    it("Escape still works in focus mode", async () => {
      mountPopover({ modelValue: true, trigger: "focus" });
      await nextTick();

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      expect(wrapper.emitted("update:modelValue")).toEqual([[false]]);
    });
  });
});
