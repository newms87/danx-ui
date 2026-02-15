import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent } from "vue";
import DanxIcon from "../DanxIcon.vue";
import { saveIcon } from "../icons";

describe("DanxIcon", () => {
  describe("Rendering", () => {
    it("renders a span with danx-icon class", () => {
      const wrapper = mount(DanxIcon, {
        props: { icon: saveIcon },
      });

      expect(wrapper.element.tagName).toBe("SPAN");
      expect(wrapper.classes()).toContain("danx-icon");
    });
  });

  describe("Icon resolution", () => {
    it("resolves built-in icon by name string", () => {
      const wrapper = mount(DanxIcon, {
        props: { icon: "save" },
      });

      expect(wrapper.html()).toContain("<svg");
    });

    it("renders raw SVG string directly", () => {
      const wrapper = mount(DanxIcon, {
        props: { icon: saveIcon },
      });

      expect(wrapper.html()).toContain("<svg");
    });

    it("falls back to raw SVG for unrecognized string", () => {
      const rawSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const wrapper = mount(DanxIcon, {
        props: { icon: rawSvg },
      });

      expect(wrapper.html()).toContain("<circle");
    });

    it("renders Vue component via :is", () => {
      const CustomIcon = defineComponent({
        render() {
          return h("span", { class: "custom-icon" }, "X");
        },
      });

      const wrapper = mount(DanxIcon, {
        props: { icon: CustomIcon },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });
  });

  describe("CSS structure", () => {
    it("wraps SVG string content in a span", () => {
      const wrapper = mount(DanxIcon, {
        props: { icon: "trash" },
      });

      // The rendered structure is: span.danx-icon > span (from h()) > svg
      const innerSpan = wrapper.find(".danx-icon > span");
      expect(innerSpan.exists()).toBe(true);
      expect(innerSpan.html()).toContain("<svg");
    });
  });
});
