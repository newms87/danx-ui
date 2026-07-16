import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxBadge from "../DanxBadge.vue";
import type { BadgePlacement } from "../types";
import type { VariantType } from "../../../shared/types";

// All semantic badge variants (excluding blank default)
const colorVariants: VariantType[] = ["danger", "success", "warning", "info", "muted"];

// All placement options
const allPlacements: BadgePlacement[] = ["top-right", "top-left", "bottom-right", "bottom-left"];

describe("DanxBadge", () => {
  describe("Rendering", () => {
    it("renders a span wrapper with danx-badge class", () => {
      const wrapper = mount(DanxBadge);

      expect(wrapper.element.tagName).toBe("SPAN");
      expect(wrapper.classes()).toContain("danx-badge");
    });

    it("renders slot content inside the wrapper", () => {
      const wrapper = mount(DanxBadge, {
        slots: { default: "<button>Click me</button>" },
      });

      expect(wrapper.find("button").exists()).toBe(true);
      expect(wrapper.find("button").text()).toBe("Click me");
    });

    it("shows indicator when value is a positive number", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 5 },
      });

      const indicator = wrapper.find(".danx-badge__indicator");
      expect(indicator.exists()).toBe(true);
      expect(indicator.text()).toBe("5");
    });

    it("hides indicator when no value is provided", () => {
      const wrapper = mount(DanxBadge);

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);
    });

    it("hides indicator when value is undefined", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: undefined },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);
    });

    it("hides indicator when value is empty string", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "" },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);
    });
  });

  describe("Count mode", () => {
    it("displays the numeric value", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 42 },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("42");
    });

    it("shows max+ when value exceeds max", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 150, max: 99 },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("99+");
    });

    it("shows exact value when equal to max", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 99, max: 99 },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("99");
    });

    it("uses custom max value", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 15, max: 9 },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("9+");
    });

    it("hides when value is 0 by default", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 0 },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);
    });

    it("shows when value is 0 and showZero is true", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 0, showZero: true },
      });

      const indicator = wrapper.find(".danx-badge__indicator");
      expect(indicator.exists()).toBe(true);
      expect(indicator.text()).toBe("0");
    });

    it("displays value 1 without overflow", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 1 },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("1");
    });
  });

  describe("Dot mode", () => {
    it("renders indicator with dot class", () => {
      const wrapper = mount(DanxBadge, {
        props: { dot: true },
      });

      const indicator = wrapper.find(".danx-badge__indicator");
      expect(indicator.exists()).toBe(true);
      expect(indicator.classes()).toContain("danx-badge__indicator--dot");
    });

    it("has no text content in dot mode", () => {
      const wrapper = mount(DanxBadge, {
        props: { dot: true },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("");
    });

    it("ignores value in dot mode", () => {
      const wrapper = mount(DanxBadge, {
        props: { dot: true, value: 42 },
      });

      const indicator = wrapper.find(".danx-badge__indicator");
      expect(indicator.exists()).toBe(true);
      expect(indicator.text()).toBe("");
    });

    it("is visible without value in dot mode", () => {
      const wrapper = mount(DanxBadge, {
        props: { dot: true },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(true);
    });
  });

  describe("Label mode", () => {
    it("displays string value as-is", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "NEW" },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("NEW");
    });

    it("displays short label text", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "BETA" },
      });

      expect(wrapper.find(".danx-badge__indicator").text()).toBe("BETA");
    });
  });

  describe("Hidden prop", () => {
    it("hides indicator when hidden is true", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 5, hidden: true },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);
    });

    it("hides dot when hidden is true", () => {
      const wrapper = mount(DanxBadge, {
        props: { dot: true, hidden: true },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);
    });

    it("hides label when hidden is true", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "NEW", hidden: true },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);
    });
  });

  describe("Variants", () => {
    it.each(colorVariants)("applies correct inline style for variant %s", (variant) => {
      const wrapper = mount(DanxBadge, {
        props: { value: 1, variant },
      });

      const style = wrapper.find(".danx-badge__indicator").attributes("style") ?? "";
      expect(style).toContain("--dx-badge-bg");
      expect(style).toContain("--dx-badge-text");
    });

    it("applies danger variant by default", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 1 },
      });

      const indicator = wrapper.find(".danx-badge__indicator");
      const style = indicator.attributes("style") ?? "";
      expect(style).toContain("--dx-variant-danger-");
      expect(style).toContain("--dx-badge-bg:");
    });

    it("applies no inline style when variant is blank", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 1, variant: "" },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("style")).toBeUndefined();
    });
  });

  describe("Placement", () => {
    it.each(allPlacements)("applies correct class for placement %s", (placement) => {
      const wrapper = mount(DanxBadge, {
        props: { value: 1, placement },
      });

      expect(wrapper.find(".danx-badge__indicator").classes()).toContain(
        `danx-badge__indicator--${placement}`
      );
    });

    it("defaults to top-right placement", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 1 },
      });

      expect(wrapper.find(".danx-badge__indicator").classes()).toContain(
        "danx-badge__indicator--top-right"
      );
    });
  });

  describe("Auto-color", () => {
    it("applies inline style when autoColor is a string", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "Status", autoColor: "my-key" },
      });

      const style = wrapper.find(".danx-badge__indicator").attributes("style");
      expect(style).toBeTruthy();
      expect(style).toContain("--dx-badge-bg");
      expect(style).toContain("--dx-badge-text");
    });

    it("applies inline style when autoColor is true with string value", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "Active", autoColor: true },
      });

      const style = wrapper.find(".danx-badge__indicator").attributes("style");
      expect(style).toBeTruthy();
      expect(style).toContain("--dx-badge-bg");
    });

    it("uses empty string for autoColorKey when autoColor is true with numeric value", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 5, autoColor: true },
      });

      // autoColor is true but value is numeric, so autoColorKey hashes ""
      // Style is still applied (hashing empty string)
      const style = wrapper.find(".danx-badge__indicator").attributes("style");
      expect(style).toBeTruthy();
      expect(style).toContain("--dx-badge-bg");
    });

    it("applies default danger variant style when autoColor is false", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 5 },
      });

      const style = wrapper.find(".danx-badge__indicator").attributes("style") ?? "";
      // Badge defaults to danger variant, so style will be present
      expect(style).toContain("--dx-badge-bg");
    });

    it("autoColor takes precedence over variant", () => {
      const wrapper = mount(DanxBadge, {
        props: { variant: "success", value: 5, autoColor: "test-key" },
      });
      const indicator = wrapper.find(".danx-badge__indicator");
      const style = indicator.attributes("style") ?? "";
      // autoColor should win - style should NOT contain variant tokens
      expect(style).not.toContain("--dx-variant-success-");
      // autoColor sets --dx-badge-bg directly
      expect(style).toContain("--dx-badge-bg:");
    });
  });

  describe("Slot content", () => {
    it("renders complex slot content", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 3 },
        slots: { default: '<div class="my-icon">Icon</div>' },
      });

      expect(wrapper.find(".my-icon").exists()).toBe(true);
      expect(wrapper.find(".my-icon").text()).toBe("Icon");
      expect(wrapper.find(".danx-badge__indicator").text()).toBe("3");
    });

    it("renders without slot content", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 1 },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(true);
    });
  });

  describe("Accessibility", () => {
    it("uses explicit ariaLabel in count mode", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 5, ariaLabel: "Five unread messages" },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "Five unread messages"
      );
    });

    it("uses explicit ariaLabel in dot mode", () => {
      const wrapper = mount(DanxBadge, {
        props: { dot: true, ariaLabel: "Unread messages" },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "Unread messages"
      );
    });

    it("uses explicit ariaLabel in label mode", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "NEW", ariaLabel: "New feature" },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe("New feature");
    });

    it("generates a default aria-label describing the count", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 3 },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "3 notifications"
      );
    });

    it("generates a default aria-label using the overflow display for large counts", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 150, max: 99 },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "99+ notifications"
      );
    });

    it("announces the zero count when showZero is true", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 0, showZero: true },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "0 notifications"
      );
    });

    it("generates a non-empty default aria-label in dot mode", () => {
      const wrapper = mount(DanxBadge, {
        props: { dot: true },
      });

      const label = wrapper.find(".danx-badge__indicator").attributes("aria-label");
      expect(label).toBeTruthy();
    });

    it("generates a default aria-label incorporating the label text", () => {
      const wrapper = mount(DanxBadge, {
        props: { value: "NEW" },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toContain("NEW");
    });

    it("updates the aria-label reactively when value changes", async () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 3 },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "3 notifications"
      );

      await wrapper.setProps({ value: 7 });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "7 notifications"
      );
    });

    it("updates the aria-label reactively when dot changes", async () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 3 },
      });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "3 notifications"
      );

      await wrapper.setProps({ dot: true });

      const label = wrapper.find(".danx-badge__indicator").attributes("aria-label");
      expect(label).not.toBe("3 notifications");
      expect(label).toBeTruthy();
    });

    it("toggles the aria-label reactively when showZero changes", async () => {
      const wrapper = mount(DanxBadge, {
        props: { value: 0, showZero: false },
      });

      expect(wrapper.find(".danx-badge__indicator").exists()).toBe(false);

      await wrapper.setProps({ showZero: true });

      expect(wrapper.find(".danx-badge__indicator").attributes("aria-label")).toBe(
        "0 notifications"
      );
    });

    it("has no aria-label when the indicator is not rendered", () => {
      const wrapperHidden = mount(DanxBadge, {
        props: { value: 5, hidden: true },
      });
      expect(wrapperHidden.find(".danx-badge__indicator").exists()).toBe(false);

      const wrapperZero = mount(DanxBadge, {
        props: { value: 0, showZero: false },
      });
      expect(wrapperZero.find(".danx-badge__indicator").exists()).toBe(false);
    });
  });
});
