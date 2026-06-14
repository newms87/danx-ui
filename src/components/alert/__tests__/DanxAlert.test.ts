import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxAlert from "../DanxAlert.vue";
import type { VariantType } from "../../../shared/types";

/** Maps each semantic variant to its expected status `role`. */
const roleByVariant: Array<[VariantType, string]> = [
  ["danger", "alert"],
  ["warning", "alert"],
  ["success", "status"],
  ["info", "status"],
];

describe("DanxAlert", () => {
  describe("Rendering", () => {
    it("renders a div with the danx-alert class", () => {
      const wrapper = mount(DanxAlert);

      expect(wrapper.element.tagName).toBe("DIV");
      expect(wrapper.classes()).toContain("danx-alert");
    });

    it("renders default slot content as the body", () => {
      const wrapper = mount(DanxAlert, {
        slots: { default: "Something happened" },
      });

      expect(wrapper.find(".danx-alert__content").text()).toBe("Something happened");
    });

    it("renders the title when provided", () => {
      const wrapper = mount(DanxAlert, {
        props: { title: "Heads up" },
      });

      const title = wrapper.find(".danx-alert__title");
      expect(title.exists()).toBe(true);
      expect(title.text()).toBe("Heads up");
    });

    it("omits the title element when no title is provided", () => {
      const wrapper = mount(DanxAlert);

      expect(wrapper.find(".danx-alert__title").exists()).toBe(false);
    });

    it("renders a leading status icon", () => {
      const wrapper = mount(DanxAlert);

      expect(wrapper.find(".danx-alert__icon").exists()).toBe(true);
    });

    it("renders an icon-slot override in place of the default status icon", () => {
      const wrapper = mount(DanxAlert, {
        slots: { icon: "<span class='custom-icon'>!</span>" },
      });

      expect(wrapper.find(".danx-alert__icon .custom-icon").exists()).toBe(true);
    });
  });

  describe("Variant styling", () => {
    it("defaults to the info variant", () => {
      const wrapper = mount(DanxAlert);
      const style = wrapper.attributes("style") ?? "";

      expect(style).toContain("--dx-alert-bg");
      expect(style).toContain("var(--dx-variant-alert-info-bg, var(--dx-variant-info-bg))");
    });

    it.each(["danger", "warning", "success", "info"] as VariantType[])(
      "maps the %s variant onto the shared variant tokens via inline style",
      (variant) => {
        const wrapper = mount(DanxAlert, { props: { variant } });
        const style = wrapper.attributes("style") ?? "";

        expect(style).toContain(
          `var(--dx-variant-alert-${variant}-bg, var(--dx-variant-${variant}-bg))`
        );
        expect(style).toContain(
          `var(--dx-variant-alert-${variant}-text, var(--dx-variant-${variant}-text))`
        );
        expect(style).toContain(
          `var(--dx-variant-alert-${variant}-border, var(--dx-variant-${variant}-border))`
        );
      }
    );

    it("emits no variant inline style for the blank variant", () => {
      const wrapper = mount(DanxAlert, { props: { variant: "" } });
      const style = wrapper.attributes("style") ?? "";

      expect(style).not.toContain("--dx-alert-bg");
    });
  });

  describe("Accessibility role", () => {
    it.each(roleByVariant)("variant %s uses role=%s", (variant, expectedRole) => {
      const wrapper = mount(DanxAlert, { props: { variant } });

      expect(wrapper.attributes("role")).toBe(expectedRole);
    });

    it("falls back to role=status for a custom variant", () => {
      const wrapper = mount(DanxAlert, { props: { variant: "brand" } });

      expect(wrapper.attributes("role")).toBe("status");
    });
  });

  describe("Dismissible", () => {
    it("does not render the dismiss button by default", () => {
      const wrapper = mount(DanxAlert);

      expect(wrapper.find(".danx-alert__dismiss").exists()).toBe(false);
    });

    it("renders the dismiss button when dismissible is true", () => {
      const wrapper = mount(DanxAlert, { props: { dismissible: true } });

      const button = wrapper.find(".danx-alert__dismiss");
      expect(button.exists()).toBe(true);
      expect(button.attributes("aria-label")).toBe("Dismiss");
    });

    it("emits dismiss when the dismiss button is clicked", async () => {
      const wrapper = mount(DanxAlert, { props: { dismissible: true } });

      await wrapper.find(".danx-alert__dismiss").trigger("click");

      expect(wrapper.emitted("dismiss")).toEqual([[]]);
    });

    it("does not emit dismiss without interaction", () => {
      const wrapper = mount(DanxAlert, { props: { dismissible: true } });

      expect(wrapper.emitted("dismiss")).toBeUndefined();
    });
  });
});
