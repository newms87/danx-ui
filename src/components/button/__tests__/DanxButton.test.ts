import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent, markRaw } from "vue";
import DanxButton from "../DanxButton.vue";
import { saveIcon } from "../../icon/icons";
import type { ButtonSize } from "../types";
import type { VariantType } from "../../../shared/types";

// All semantic button variants (excluding blank default)
const colorTypes: VariantType[] = ["danger", "success", "warning", "info", "muted"];

// All button sizes
const allSizes: ButtonSize[] = ["xxs", "xs", "sm", "md", "lg", "xl"];

describe("DanxButton", () => {
  describe("Rendering", () => {
    it("renders a button element", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.find("button").exists()).toBe(true);
    });

    it("renders with type=button attribute", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.find("button").attributes("type")).toBe("button");
    });

    it("renders default slot content", () => {
      const wrapper = mount(DanxButton, {
        slots: { default: "Save Changes" },
      });

      expect(wrapper.text()).toContain("Save Changes");
    });

    it("renders label prop as text content", () => {
      const wrapper = mount(DanxButton, {
        props: { label: "Save Changes" },
      });

      expect(wrapper.text()).toContain("Save Changes");
    });

    it("slot content takes precedence over label prop", () => {
      const wrapper = mount(DanxButton, {
        props: { label: "From Prop" },
        slots: { default: "From Slot" },
      });

      expect(wrapper.text()).toContain("From Slot");
      expect(wrapper.text()).not.toContain("From Prop");
    });

    it("renders icon-only when icon prop provided without slot content", () => {
      const wrapper = mount(DanxButton, {
        props: { icon: saveIcon },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(true);
    });
  });

  describe("Variants", () => {
    it.each(colorTypes)("renders variant %s with inline styles", (variant) => {
      const wrapper = mount(DanxButton, {
        props: { variant },
      });

      const styleAttr = wrapper.find("button").attributes("style");
      expect(styleAttr).toContain("--dx-button-bg:");
      expect(styleAttr).toContain(`--dx-variant-${variant}-`);
    });

    it("defaults to blank variant with no inline styles", () => {
      const wrapper = mount(DanxButton);

      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("danx-button");
      expect(btn.classes()).toContain("danx-button--md");
      expect(btn.attributes("style")).toBeUndefined();
    });

    it("blank variant via variant='' has no inline styles", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "" },
      });

      expect(wrapper.find("button").attributes("style")).toBeUndefined();
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", size },
      });

      expect(wrapper.find("button").classes()).toContain(`danx-button--${size}`);
    });

    it("defaults to md size when not specified", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.find("button").classes()).toContain("danx-button--md");
    });
  });

  describe("Icon rendering", () => {
    it("does not render icon area when no icon prop and no icon slot", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success" },
        slots: { default: "Save" },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(false);
    });

    it("renders icon area with SVG when icon prop is a raw SVG string", () => {
      const wrapper = mount(DanxButton, {
        props: { icon: saveIcon },
      });

      const iconEl = wrapper.find(".danx-button__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("resolves built-in icon by name string", () => {
      const wrapper = mount(DanxButton, {
        props: { icon: "save" },
      });

      const iconEl = wrapper.find(".danx-button__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("falls back to raw SVG for unrecognized string", () => {
      const rawSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const wrapper = mount(DanxButton, {
        props: { icon: rawSvg },
      });

      const iconEl = wrapper.find(".danx-button__icon");
      expect(iconEl.html()).toContain("<circle");
    });

    it("renders custom icon component when icon prop is a Component", () => {
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "custom-icon" }, "X");
          },
        })
      );

      const wrapper = mount(DanxButton, {
        props: { variant: "success", icon: CustomIcon },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("renders icon slot content when provided", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success" },
        slots: { icon: '<span class="slot-icon">Custom</span>' },
      });

      expect(wrapper.find(".slot-icon").exists()).toBe(true);
    });

    it("icon slot takes precedence over icon prop", () => {
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "prop-icon" }, "Prop");
          },
        })
      );

      const wrapper = mount(DanxButton, {
        props: { variant: "success", icon: CustomIcon },
        slots: { icon: '<span class="slot-icon">Slot</span>' },
      });

      expect(wrapper.find(".slot-icon").exists()).toBe(true);
      expect(wrapper.find(".prop-icon").exists()).toBe(false);
    });
  });

  describe("Disabled state", () => {
    it("has disabled attribute when disabled=true", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", disabled: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("does not have disabled attribute when disabled=false", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", disabled: false },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });

    it("does not emit click when disabled", async () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", disabled: true },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Loading state", () => {
    it("has disabled attribute when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("shows spinner when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", loading: true },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("hides icon when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", icon: saveIcon, loading: true },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(false);
    });

    it("hides icon slot content when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", loading: true },
        slots: { icon: '<span class="slot-icon">Icon</span>' },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(false);
      expect(wrapper.find(".slot-icon").exists()).toBe(false);
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("does not apply loading class when loading is false", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.find("button").classes()).not.toContain("danx-button--loading");
    });

    it("adds loading class when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", loading: true },
      });

      expect(wrapper.find("button").classes()).toContain("danx-button--loading");
    });

    it("does not emit click when loading", async () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", loading: true },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Tooltip", () => {
    it("wraps button in DanxTooltip when tooltip provided", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "danger", tooltip: "Delete item" },
      });

      const tooltip = wrapper.findComponent({ name: "DanxTooltip" });
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props("tooltip")).toBe("Delete item");
      expect(wrapper.find("button").attributes("title")).toBeUndefined();
    });

    it("disables DanxTooltip when tooltip not provided", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "danger" },
      });

      const tooltip = wrapper.findComponent({ name: "DanxTooltip" });
      expect(tooltip.exists()).toBe(true);
      expect(tooltip.props("disabled")).toBe(true);
    });
  });

  describe("Click event", () => {
    it("emits click event when clicked", async () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success" },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("passes MouseEvent to click handler", async () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success" },
      });

      await wrapper.find("button").trigger("click");

      const emitted = wrapper.emitted("click");
      expect(emitted).toHaveLength(1);
      expect(emitted?.[0]?.[0]).toBeInstanceOf(MouseEvent);
    });
  });

  describe("Custom variant", () => {
    it("applies inline styles for custom variant", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "restart" },
      });

      const styleAttr = wrapper.find("button").attributes("style");
      expect(styleAttr).toContain("--dx-button-bg:");
      expect(styleAttr).toContain("--dx-variant-restart-");
    });
  });

  describe("CSS classes", () => {
    it("has base class danx-button", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.find("button").classes()).toContain("danx-button");
    });

    it("combines variant styles and size classes", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "danger", size: "lg" },
      });

      const btn = wrapper.find("button");
      expect(btn.classes()).toContain("danx-button");
      expect(btn.classes()).toContain("danx-button--lg");
      const styleAttr = btn.attributes("style");
      expect(styleAttr).toContain("--dx-button-bg:");
      expect(styleAttr).toContain("--dx-variant-danger-");
    });
  });

  describe("Combined disabled and loading", () => {
    it("disabled takes effect even with loading=false", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", disabled: true, loading: false },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("loading takes effect even with disabled=false", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", disabled: false, loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("both disabled and loading set disables button", () => {
      const wrapper = mount(DanxButton, {
        props: { variant: "success", disabled: true, loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });
  });
});
