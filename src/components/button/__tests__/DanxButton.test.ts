import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent, markRaw } from "vue";
import DanxButton from "../DanxButton.vue";
import { saveIcon } from "../../icon/icons";
import type { ButtonType, ButtonSize } from "../types";

// All semantic button types (excluding blank default)
const colorTypes: ButtonType[] = ["danger", "success", "warning", "info", "muted"];

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

  describe("Types", () => {
    it.each(colorTypes)("renders type %s with correct class", (type) => {
      const wrapper = mount(DanxButton, {
        props: { type },
      });

      expect(wrapper.classes()).toContain(`danx-button--${type}`);
    });

    it("defaults to blank type with no type modifier class", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.classes()).toContain("danx-button");
      expect(wrapper.classes()).toContain("danx-button--md");
      for (const t of colorTypes) {
        expect(wrapper.classes()).not.toContain(`danx-button--${t}`);
      }
    });

    it("blank type via type='' has no type modifier class", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "" },
      });

      for (const t of colorTypes) {
        expect(wrapper.classes()).not.toContain(`danx-button--${t}`);
      }
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", size },
      });

      expect(wrapper.classes()).toContain(`danx-button--${size}`);
    });

    it("defaults to md size when not specified", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.classes()).toContain("danx-button--md");
    });
  });

  describe("Icon rendering", () => {
    it("does not render icon area when no icon prop and no icon slot", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success" },
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
        props: { type: "success", icon: CustomIcon },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("renders icon slot content when provided", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success" },
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
        props: { type: "success", icon: CustomIcon },
        slots: { icon: '<span class="slot-icon">Slot</span>' },
      });

      expect(wrapper.find(".slot-icon").exists()).toBe(true);
      expect(wrapper.find(".prop-icon").exists()).toBe(false);
    });
  });

  describe("Disabled state", () => {
    it("has disabled attribute when disabled=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", disabled: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("does not have disabled attribute when disabled=false", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", disabled: false },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });

    it("does not emit click when disabled", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", disabled: true },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Loading state", () => {
    it("has disabled attribute when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("shows spinner when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", loading: true },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("hides icon when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", icon: saveIcon, loading: true },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(false);
    });

    it("hides icon slot content when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", loading: true },
        slots: { icon: '<span class="slot-icon">Icon</span>' },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(false);
      expect(wrapper.find(".slot-icon").exists()).toBe(false);
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("does not apply loading class when loading is false", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.classes()).not.toContain("danx-button--loading");
    });

    it("adds loading class when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", loading: true },
      });

      expect(wrapper.classes()).toContain("danx-button--loading");
    });

    it("does not emit click when loading", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", loading: true },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Tooltip", () => {
    it("renders title attribute when tooltip provided", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "danger", tooltip: "Delete item" },
      });

      expect(wrapper.find("button").attributes("title")).toBe("Delete item");
    });

    it("does not render title attribute when tooltip not provided", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "danger" },
      });

      expect(wrapper.find("button").attributes("title")).toBeUndefined();
    });
  });

  describe("Click event", () => {
    it("emits click event when clicked", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success" },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("passes MouseEvent to click handler", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success" },
      });

      await wrapper.find("button").trigger("click");

      const emitted = wrapper.emitted("click");
      expect(emitted).toHaveLength(1);
      expect(emitted?.[0]?.[0]).toBeInstanceOf(MouseEvent);
    });
  });

  describe("Custom type", () => {
    it("adds the correct BEM modifier class for customType", () => {
      const wrapper = mount(DanxButton, {
        props: { customType: "restart" },
      });

      expect(wrapper.classes()).toContain("danx-button--restart");
    });

    it("customType takes precedence over type", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "danger", customType: "restart" },
      });

      expect(wrapper.classes()).toContain("danx-button--restart");
      expect(wrapper.classes()).not.toContain("danx-button--danger");
    });

    it("no modifier class when neither type nor customType is set", () => {
      const wrapper = mount(DanxButton);

      const modifierClasses = wrapper
        .classes()
        .filter((c) => c.startsWith("danx-button--") && c !== "danx-button--md");
      expect(modifierClasses).toHaveLength(0);
    });
  });

  describe("CSS classes", () => {
    it("has base class danx-button", () => {
      const wrapper = mount(DanxButton);

      expect(wrapper.classes()).toContain("danx-button");
    });

    it("combines type and size classes", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "danger", size: "lg" },
      });

      expect(wrapper.classes()).toContain("danx-button");
      expect(wrapper.classes()).toContain("danx-button--danger");
      expect(wrapper.classes()).toContain("danx-button--lg");
    });
  });

  describe("Combined disabled and loading", () => {
    it("disabled takes effect even with loading=false", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", disabled: true, loading: false },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("loading takes effect even with disabled=false", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", disabled: false, loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("both disabled and loading set disables button", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "success", disabled: true, loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });
  });
});
