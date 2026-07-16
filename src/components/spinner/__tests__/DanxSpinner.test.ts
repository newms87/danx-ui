import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxSpinner from "../DanxSpinner.vue";
import type { SpinnerSize } from "../types";
import type { VariantType } from "../../../shared/types";

// All semantic spinner variants (excluding blank default)
const colorVariants: VariantType[] = ["danger", "success", "warning", "info", "muted"];

// All spinner sizes
const allSizes: SpinnerSize[] = ["sm", "md", "lg"];

describe("DanxSpinner", () => {
  describe("Rendering", () => {
    it("renders a span with danx-spinner class", () => {
      const wrapper = mount(DanxSpinner);

      expect(wrapper.element.tagName).toBe("SPAN");
      expect(wrapper.classes()).toContain("danx-spinner");
    });

    it("defaults to md size", () => {
      const wrapper = mount(DanxSpinner);

      expect(wrapper.classes()).toContain("danx-spinner--md");
    });

    it("defaults to no variant style", () => {
      const wrapper = mount(DanxSpinner);

      expect(wrapper.attributes("style")).toBeFalsy();
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("applies danx-spinner--%s class", (size) => {
      const wrapper = mount(DanxSpinner, { props: { size } });

      expect(wrapper.classes()).toContain(`danx-spinner--${size}`);
    });
  });

  describe("Variants", () => {
    it.each(colorVariants)("applies variant style for %s", (variant) => {
      const wrapper = mount(DanxSpinner, { props: { variant } });

      const styleAttr = wrapper.attributes("style");
      expect(styleAttr).toContain("--dx-spinner-color:");
      expect(styleAttr).toContain(`--dx-variant-spinner-${variant}-text`);
      expect(styleAttr).toContain(`--dx-variant-${variant}-text`);
    });
  });

  describe("Accessibility", () => {
    it("has role=status by default", () => {
      const wrapper = mount(DanxSpinner);

      expect(wrapper.attributes("role")).toBe("status");
    });

    it("has default aria-label of Loading", () => {
      const wrapper = mount(DanxSpinner);

      expect(wrapper.attributes("aria-label")).toBe("Loading");
    });

    it("uses a custom aria-label when provided", () => {
      const wrapper = mount(DanxSpinner, {
        props: { ariaLabel: "Saving changes" },
      });

      expect(wrapper.attributes("aria-label")).toBe("Saving changes");
    });
  });

  describe("Fallthrough attributes", () => {
    it("merges an extra class passed by a parent", () => {
      const wrapper = mount(DanxSpinner, {
        attrs: { class: "danx-button__spinner" },
      });

      expect(wrapper.classes()).toContain("danx-spinner");
      expect(wrapper.classes()).toContain("danx-button__spinner");
    });

    it("merges an extra inline style passed by a parent", () => {
      const wrapper = mount(DanxSpinner, {
        attrs: { style: { "--dx-spinner-md-size": "1lh" } },
      });

      expect(wrapper.attributes("style")).toContain("--dx-spinner-md-size: 1lh");
    });
  });
});
