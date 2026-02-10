import { describe, it, expect, vi, afterEach } from "vitest";
import { mount, VueWrapper } from "@vue/test-utils";
import MdeFloatingPanel from "../MdeFloatingPanel.vue";

describe("MdeFloatingPanel", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountPanel(props: Record<string, unknown> = {}, attrs: Record<string, unknown> = {}) {
    wrapper = mount(MdeFloatingPanel, {
      props,
      attrs,
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders standard overlay by default", () => {
      mountPanel();
      expect(wrapper.find(".mde-floating-overlay").exists()).toBe(true);
      expect(wrapper.find(".mde-floating-overlay--standard").exists()).toBe(true);
    });

    it("renders transparent overlay when specified", () => {
      mountPanel({ overlay: "transparent" });
      expect(wrapper.find(".mde-floating-overlay--transparent").exists()).toBe(true);
    });

    it("renders panel container", () => {
      mountPanel();
      expect(wrapper.find(".mde-floating-panel").exists()).toBe(true);
    });

    it("renders content slot", () => {
      wrapper = mount(MdeFloatingPanel, {
        slots: { default: "<p>Test content</p>" },
        attachTo: document.body,
      });
      expect(wrapper.find(".mde-floating-panel__content p").text()).toBe("Test content");
    });
  });

  describe("attrs forwarding", () => {
    it("forwards attrs to panel div, not overlay", () => {
      mountPanel({}, { class: "dx-test-class", style: "top: 100px" });
      const panel = wrapper.find(".mde-floating-panel");
      expect(panel.classes()).toContain("dx-test-class");
      expect(panel.attributes("style")).toContain("top: 100px");
      // Overlay should NOT have the class
      expect(wrapper.find(".mde-floating-overlay").classes()).not.toContain("dx-test-class");
    });
  });

  describe("header", () => {
    it("does not render header when no title", () => {
      mountPanel();
      expect(wrapper.find(".mde-floating-panel__header").exists()).toBe(false);
    });

    it("renders header with title", () => {
      mountPanel({ title: "Test Title" });
      expect(wrapper.find(".mde-floating-panel__header").exists()).toBe(true);
      expect(wrapper.find(".mde-floating-panel__header h3").text()).toBe("Test Title");
    });

    it("renders close button in header", () => {
      mountPanel({ title: "Test" });
      expect(wrapper.find(".mde-floating-panel__close-btn").exists()).toBe(true);
    });
  });

  describe("footer", () => {
    it("does not render footer when no confirmLabel", () => {
      mountPanel();
      expect(wrapper.find(".mde-floating-panel__footer").exists()).toBe(false);
    });

    it("renders footer with confirm and cancel buttons", () => {
      mountPanel({ confirmLabel: "Save" });
      expect(wrapper.find(".mde-floating-panel__footer").exists()).toBe(true);
      expect(wrapper.find(".mde-floating-panel__btn-confirm").text()).toBe("Save");
      expect(wrapper.find(".mde-floating-panel__btn-cancel").text()).toBe("Cancel");
    });

    it("uses custom cancel label", () => {
      mountPanel({ confirmLabel: "Save", cancelLabel: "Dismiss" });
      expect(wrapper.find(".mde-floating-panel__btn-cancel").text()).toBe("Dismiss");
    });
  });

  describe("cancel events", () => {
    it("emits cancel on overlay click", async () => {
      mountPanel();
      await wrapper.find(".mde-floating-overlay").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("does not emit cancel when clicking panel (not overlay)", async () => {
      mountPanel();
      await wrapper.find(".mde-floating-panel").trigger("click");
      expect(wrapper.emitted("cancel")).toBeUndefined();
    });

    it("emits cancel on Escape key", () => {
      mountPanel();
      const event = new KeyboardEvent("keydown", { key: "Escape" });
      document.dispatchEvent(event);
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel on close button click", async () => {
      mountPanel({ title: "Test" });
      await wrapper.find(".mde-floating-panel__close-btn").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });

    it("emits cancel on cancel button click", async () => {
      mountPanel({ confirmLabel: "Save" });
      await wrapper.find(".mde-floating-panel__btn-cancel").trigger("click");
      expect(wrapper.emitted("cancel")).toHaveLength(1);
    });
  });

  describe("confirm events", () => {
    it("emits confirm on confirm button click", async () => {
      mountPanel({ confirmLabel: "Save" });
      await wrapper.find(".mde-floating-panel__btn-confirm").trigger("click");
      expect(wrapper.emitted("confirm")).toHaveLength(1);
    });
  });

  describe("cleanup", () => {
    it("removes document keydown listener on unmount", () => {
      const removeSpy = vi.spyOn(document, "removeEventListener");
      mountPanel();
      wrapper.unmount();

      const keydownCalls = removeSpy.mock.calls.filter((c) => c[0] === "keydown");
      expect(keydownCalls.length).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });
  });
});
