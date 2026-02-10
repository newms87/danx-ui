import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import DanxPopover from "../DanxPopover.vue";

describe("DanxPopover", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountPopover(props: Record<string, unknown> = {}, slotContent = "Test content") {
    wrapper = mount(DanxPopover, {
      props,
      slots: { default: slotContent },
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders overlay with standard variant by default", () => {
      mountPopover();
      const overlay = wrapper.find(".dx-popover-overlay");
      expect(overlay.exists()).toBe(true);
      expect(overlay.classes()).toContain("dx-popover-overlay--standard");
    });

    it("renders transparent overlay variant", () => {
      mountPopover({ overlay: "transparent" });
      expect(wrapper.find(".dx-popover-overlay--transparent").exists()).toBe(true);
    });

    it("renders centered overlay variant", () => {
      mountPopover({ overlay: "centered" });
      expect(wrapper.find(".dx-popover-overlay--centered").exists()).toBe(true);
    });

    it("renders slot content inside popover-content", () => {
      mountPopover({}, "Hello World");
      expect(wrapper.find(".popover-content").text()).toBe("Hello World");
    });

    it("renders header when title is provided", () => {
      mountPopover({ title: "My Title" });
      expect(wrapper.find(".popover-header h3").text()).toBe("My Title");
      expect(wrapper.find(".close-btn").exists()).toBe(true);
    });

    it("does not render header when no title", () => {
      mountPopover();
      expect(wrapper.find(".popover-header").exists()).toBe(false);
    });

    it("renders footer when confirmLabel is provided", () => {
      mountPopover({ confirmLabel: "Submit" });
      expect(wrapper.find(".popover-footer").exists()).toBe(true);
      expect(wrapper.find(".btn-insert").text()).toBe("Submit");
      expect(wrapper.find(".btn-cancel").text()).toBe("Cancel");
    });

    it("renders custom cancelLabel", () => {
      mountPopover({ confirmLabel: "OK", cancelLabel: "Dismiss" });
      expect(wrapper.find(".btn-cancel").text()).toBe("Dismiss");
    });

    it("does not render footer when no confirmLabel", () => {
      mountPopover();
      expect(wrapper.find(".popover-footer").exists()).toBe(false);
    });

    it("sets tabindex on centered overlay", () => {
      mountPopover({ overlay: "centered" });
      expect(wrapper.find(".dx-popover-overlay").attributes("tabindex")).toBe("-1");
    });

    it("does not set tabindex on non-centered overlay", () => {
      mountPopover({ overlay: "standard" });
      expect(wrapper.find(".dx-popover-overlay").attributes("tabindex")).toBeUndefined();
    });
  });

  describe("attrs forwarding", () => {
    it("forwards class to container, not overlay", () => {
      wrapper = mount(DanxPopover, {
        props: {},
        attrs: { class: "my-custom-class", style: "width: 300px" },
        slots: { default: "Content" },
        attachTo: document.body,
      });
      const container = wrapper.find(".dx-mde-popover");
      expect(container.classes()).toContain("my-custom-class");
      expect(container.attributes("style")).toContain("width: 300px");
      // Overlay should NOT have the custom class
      expect(wrapper.find(".dx-popover-overlay").classes()).not.toContain("my-custom-class");
    });
  });

  describe("events", () => {
    it("emits cancel on overlay click", async () => {
      mountPopover();
      await wrapper.find(".dx-popover-overlay").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("does not emit cancel when clicking inside container", async () => {
      mountPopover();
      await wrapper.find(".dx-mde-popover").trigger("click");
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });

    it("emits cancel on close button click", async () => {
      mountPopover({ title: "Test" });
      await wrapper.find(".close-btn").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel on cancel button click", async () => {
      mountPopover({ confirmLabel: "OK" });
      await wrapper.find(".btn-cancel").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits confirm on confirm button click", async () => {
      mountPopover({ confirmLabel: "OK" });
      await wrapper.find(".btn-insert").trigger("click");
      expect(wrapper.emitted("confirm")).toHaveLength(1);
    });

    it("emits cancel on Escape key", () => {
      mountPopover();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });
  });

  describe("centered overlay focus", () => {
    it("focuses overlay on mount for centered variant", async () => {
      const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");
      mountPopover({ overlay: "centered" });
      expect(focusSpy).toHaveBeenCalled();
      focusSpy.mockRestore();
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
});
