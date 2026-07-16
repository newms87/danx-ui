import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxDivider from "../DanxDivider.vue";

describe("DanxDivider", () => {
  describe("Rendering", () => {
    it("renders a div with danx-divider class", () => {
      const wrapper = mount(DanxDivider);

      expect(wrapper.element.tagName).toBe("DIV");
      expect(wrapper.classes()).toContain("danx-divider");
    });

    it("has role=separator", () => {
      const wrapper = mount(DanxDivider);

      expect(wrapper.attributes("role")).toBe("separator");
    });
  });

  describe("Orientation", () => {
    it("defaults to horizontal", () => {
      const wrapper = mount(DanxDivider);

      expect(wrapper.classes()).toContain("danx-divider--horizontal");
      expect(wrapper.attributes("aria-orientation")).toBe("horizontal");
    });

    it("applies vertical orientation", () => {
      const wrapper = mount(DanxDivider, {
        props: { orientation: "vertical" },
      });

      expect(wrapper.classes()).toContain("danx-divider--vertical");
      expect(wrapper.attributes("aria-orientation")).toBe("vertical");
    });
  });

  describe("Inset", () => {
    it("does not apply inset class by default", () => {
      const wrapper = mount(DanxDivider);

      expect(wrapper.classes()).not.toContain("danx-divider--inset");
    });

    it("applies inset class when inset is true", () => {
      const wrapper = mount(DanxDivider, {
        props: { inset: true },
      });

      expect(wrapper.classes()).toContain("danx-divider--inset");
    });
  });

  describe("Label", () => {
    it("does not render label markup without slot content", () => {
      const wrapper = mount(DanxDivider);

      expect(wrapper.find(".danx-divider__label").exists()).toBe(false);
      expect(wrapper.classes()).not.toContain("danx-divider--with-label");
    });

    it("renders label content when default slot is provided (horizontal)", () => {
      const wrapper = mount(DanxDivider, {
        slots: { default: "OR" },
      });

      expect(wrapper.classes()).toContain("danx-divider--with-label");
      expect(wrapper.find(".danx-divider__label").text()).toBe("OR");
      expect(wrapper.findAll(".danx-divider__line")).toHaveLength(2);
    });

    it("ignores slot content when orientation is vertical", () => {
      const wrapper = mount(DanxDivider, {
        props: { orientation: "vertical" },
        slots: { default: "OR" },
      });

      expect(wrapper.classes()).not.toContain("danx-divider--with-label");
      expect(wrapper.find(".danx-divider__label").exists()).toBe(false);
    });
  });
});
