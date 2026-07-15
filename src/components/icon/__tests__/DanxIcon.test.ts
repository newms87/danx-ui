import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent, markRaw } from "vue";
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
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "custom-icon" }, "X");
          },
        })
      );

      const wrapper = mount(DanxIcon, {
        props: { icon: CustomIcon },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });
  });

  describe("Fallback string sanitization", () => {
    it("neutralizes a <script> element embedded in the fallback string", () => {
      const malicious = '<svg viewBox="0 0 24 24"><script>alert(1)</script><circle r="10"/></svg>';
      const wrapper = mount(DanxIcon, {
        props: { icon: malicious },
      });

      expect(wrapper.html()).not.toContain("<script");
    });

    it("neutralizes a javascript: URI in an href attribute", () => {
      const malicious =
        '<svg viewBox="0 0 24 24"><a href="javascript:alert(1)"><circle r="10"/></a></svg>';
      const wrapper = mount(DanxIcon, {
        props: { icon: malicious },
      });

      expect(wrapper.html()).not.toContain("javascript:");
    });

    it("does not render arbitrary non-SVG HTML as raw markup", () => {
      const malicious = '<img src=x onerror="alert(1)">';
      const wrapper = mount(DanxIcon, {
        props: { icon: malicious },
      });

      expect(wrapper.html()).not.toContain("<img");
      expect(wrapper.html()).not.toContain("onerror");
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
