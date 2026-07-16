import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxLoadingOverlay from "../DanxLoadingOverlay.vue";

describe("DanxLoadingOverlay", () => {
  describe("Rendering and defaults", () => {
    it("does not render the overlay when show is false (default)", () => {
      const wrapper = mount(DanxLoadingOverlay);

      expect(wrapper.find(".danx-loading-overlay").exists()).toBe(false);
    });

    it("renders the overlay when show is true", () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: true } });

      expect(wrapper.find(".danx-loading-overlay").exists()).toBe(true);
    });

    it("renders the default spinner markup", () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: true } });

      expect(wrapper.find(".danx-loading-overlay__spinner").exists()).toBe(true);
    });
  });

  describe("Message", () => {
    it("does not render a message element when no message is given", () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: true } });

      expect(wrapper.find(".danx-loading-overlay__message").exists()).toBe(false);
    });

    it("renders the message prop text", () => {
      const wrapper = mount(DanxLoadingOverlay, {
        props: { show: true, message: "Saving..." },
      });

      expect(wrapper.find(".danx-loading-overlay__message").text()).toBe("Saving...");
    });

    it("renders the message slot, overriding the message prop", () => {
      const wrapper = mount(DanxLoadingOverlay, {
        props: { show: true, message: "Saving..." },
        slots: { message: "Custom message" },
      });

      expect(wrapper.find(".danx-loading-overlay__message").text()).toBe("Custom message");
    });
  });

  describe("Spinner slot", () => {
    it("renders the spinner slot, overriding the default spinner", () => {
      const wrapper = mount(DanxLoadingOverlay, {
        props: { show: true },
        slots: { spinner: '<span class="custom-spinner">Loading</span>' },
      });

      expect(wrapper.find(".danx-loading-overlay__spinner").exists()).toBe(false);
      expect(wrapper.find(".custom-spinner").exists()).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it("has role=status and aria-live=polite on the overlay", () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: true } });

      const overlay = wrapper.find(".danx-loading-overlay");
      expect(overlay.attributes("role")).toBe("status");
      expect(overlay.attributes("aria-live")).toBe("polite");
    });

    it("sets aria-busy=true while shown", () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: true } });

      expect(wrapper.find(".danx-loading-overlay").attributes("aria-busy")).toBe("true");
    });

    it("defaults ariaLabel to Loading...", () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: true } });

      expect(wrapper.find(".danx-loading-overlay__sr-only").text()).toBe("Loading...");
    });

    it("renders a custom ariaLabel", () => {
      const wrapper = mount(DanxLoadingOverlay, {
        props: { show: true, ariaLabel: "Saving changes" },
      });

      expect(wrapper.find(".danx-loading-overlay__sr-only").text()).toBe("Saving changes");
    });

    it("marks the visible content as aria-hidden to avoid duplicate SR narration", () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: true } });

      expect(wrapper.find(".danx-loading-overlay__content").attributes("aria-hidden")).toBe("true");
    });
  });

  describe("v-model:show toggling", () => {
    it("toggles visibility reactively when show prop changes", async () => {
      const wrapper = mount(DanxLoadingOverlay, { props: { show: false } });

      expect(wrapper.find(".danx-loading-overlay").exists()).toBe(false);

      await wrapper.setProps({ show: true });
      expect(wrapper.find(".danx-loading-overlay").exists()).toBe(true);

      await wrapper.setProps({ show: false });
      expect(wrapper.find(".danx-loading-overlay").exists()).toBe(false);
    });
  });
});
