import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent } from "vue";
import DanxButton from "../DanxButton.vue";
import { buttonIcons } from "../icons";
import type { ButtonType, ButtonSize } from "../types";

// All button types for iteration
const allTypes: ButtonType[] = [
  "trash",
  "stop",
  "close",
  "save",
  "create",
  "confirm",
  "check",
  "pause",
  "clock",
  "view",
  "document",
  "users",
  "database",
  "folder",
  "cancel",
  "back",
  "edit",
  "copy",
  "refresh",
  "export",
  "import",
  "minus",
  "merge",
  "restart",
  "play",
];

// All button sizes
const allSizes: ButtonSize[] = ["xxs", "xs", "sm", "md", "lg"];

describe("DanxButton", () => {
  describe("Rendering", () => {
    it("renders a button element", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
      });

      expect(wrapper.find("button").exists()).toBe(true);
    });

    it("renders with type=button attribute", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
      });

      expect(wrapper.find("button").attributes("type")).toBe("button");
    });

    it("renders default slot content", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
        slots: { default: "Save Changes" },
      });

      expect(wrapper.text()).toContain("Save Changes");
    });

    it("renders without text (icon-only)", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "trash" },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(true);
    });
  });

  describe("Types", () => {
    it.each(allTypes)("renders type %s with correct class", (type) => {
      const wrapper = mount(DanxButton, {
        props: { type },
      });

      expect(wrapper.classes()).toContain(`danx-button--${type}`);
    });

    it.each(allTypes)("renders type %s with correct icon SVG", (type) => {
      const wrapper = mount(DanxButton, {
        props: { type },
      });

      const iconHtml = wrapper.find(".danx-button__icon").html();
      expect(iconHtml).toContain("<svg");
    });

    it("icons map has all button types", () => {
      for (const type of allTypes) {
        expect(buttonIcons[type]).toBeDefined();
        expect(buttonIcons[type]).toContain("<svg");
      }
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", size },
      });

      expect(wrapper.classes()).toContain(`danx-button--${size}`);
    });

    it("defaults to md size when not specified", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
      });

      expect(wrapper.classes()).toContain("danx-button--md");
    });
  });

  describe("Icon override", () => {
    it("renders custom icon component when icon prop provided", () => {
      const CustomIcon = defineComponent({
        render() {
          return h("span", { class: "custom-icon" }, "X");
        },
      });

      const wrapper = mount(DanxButton, {
        props: { type: "save", icon: CustomIcon },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("renders icon slot content when provided", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
        slots: { icon: '<span class="slot-icon">Custom</span>' },
      });

      expect(wrapper.find(".slot-icon").exists()).toBe(true);
    });

    it("icon slot takes precedence over icon prop", () => {
      const CustomIcon = defineComponent({
        render() {
          return h("span", { class: "prop-icon" }, "Prop");
        },
      });

      const wrapper = mount(DanxButton, {
        props: { type: "save", icon: CustomIcon },
        slots: { icon: '<span class="slot-icon">Slot</span>' },
      });

      expect(wrapper.find(".slot-icon").exists()).toBe(true);
      expect(wrapper.find(".prop-icon").exists()).toBe(false);
    });
  });

  describe("Disabled state", () => {
    it("has disabled attribute when disabled=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", disabled: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("does not have disabled attribute when disabled=false", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", disabled: false },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeUndefined();
    });

    it("does not emit click when disabled", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", disabled: true },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Loading state", () => {
    it("has disabled attribute when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });

    it("shows spinner when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", loading: true },
      });

      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("hides icon when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", loading: true },
      });

      expect(wrapper.find(".danx-button__icon").exists()).toBe(false);
    });

    it("adds loading class when loading=true", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", loading: true },
      });

      expect(wrapper.classes()).toContain("danx-button--loading");
    });

    it("does not emit click when loading", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", loading: true },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Tooltip", () => {
    it("renders title attribute when tooltip provided", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "trash", tooltip: "Delete item" },
      });

      expect(wrapper.find("button").attributes("title")).toBe("Delete item");
    });

    it("does not render title attribute when tooltip not provided", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "trash" },
      });

      expect(wrapper.find("button").attributes("title")).toBeUndefined();
    });
  });

  describe("Click event", () => {
    it("emits click event when clicked", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
      });

      await wrapper.find("button").trigger("click");

      expect(wrapper.emitted("click")).toHaveLength(1);
    });

    it("passes MouseEvent to click handler", async () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
      });

      await wrapper.find("button").trigger("click");

      const emitted = wrapper.emitted("click");
      expect(emitted).toHaveLength(1);
      expect(emitted?.[0]?.[0]).toBeInstanceOf(MouseEvent);
    });
  });

  describe("CSS classes", () => {
    it("has base class danx-button", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save" },
      });

      expect(wrapper.classes()).toContain("danx-button");
    });

    it("combines type and size classes", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "trash", size: "lg" },
      });

      expect(wrapper.classes()).toContain("danx-button");
      expect(wrapper.classes()).toContain("danx-button--trash");
      expect(wrapper.classes()).toContain("danx-button--lg");
    });
  });

  describe("Combined disabled and loading", () => {
    it("disabled takes effect even with loading=false", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", disabled: true, loading: false },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(false);
    });

    it("loading takes effect even with disabled=false", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", disabled: false, loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
      expect(wrapper.find(".danx-button__spinner").exists()).toBe(true);
    });

    it("both disabled and loading set disables button", () => {
      const wrapper = mount(DanxButton, {
        props: { type: "save", disabled: true, loading: true },
      });

      expect(wrapper.find("button").attributes("disabled")).toBeDefined();
    });
  });
});
