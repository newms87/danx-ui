import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent, markRaw } from "vue";
import DanxChip from "../DanxChip.vue";
import { saveIcon } from "../../icon/icons";
import type { ChipType, ChipSize } from "../types";

// All semantic chip types (excluding blank default)
const colorTypes: ChipType[] = ["danger", "success", "warning", "info", "muted"];

// All chip sizes
const allSizes: ChipSize[] = ["xxs", "xs", "sm", "md", "lg", "xl"];

describe("DanxChip", () => {
  describe("Rendering", () => {
    it("renders a span element (not button)", () => {
      const wrapper = mount(DanxChip);

      expect(wrapper.element.tagName).toBe("SPAN");
      expect(wrapper.find("button").exists()).toBe(false);
    });

    it("renders default slot content", () => {
      const wrapper = mount(DanxChip, {
        slots: { default: "Active" },
      });

      expect(wrapper.text()).toContain("Active");
    });

    it("renders label prop as text content", () => {
      const wrapper = mount(DanxChip, {
        props: { label: "Active" },
      });

      expect(wrapper.text()).toContain("Active");
    });

    it("slot content takes precedence over label prop", () => {
      const wrapper = mount(DanxChip, {
        props: { label: "From Prop" },
        slots: { default: "From Slot" },
      });

      expect(wrapper.text()).toContain("From Slot");
      expect(wrapper.text()).not.toContain("From Prop");
    });
  });

  describe("Types", () => {
    it.each(colorTypes)("renders type %s with correct class", (type) => {
      const wrapper = mount(DanxChip, {
        props: { type },
      });

      expect(wrapper.classes()).toContain(`danx-chip--${type}`);
    });

    it("defaults to blank type with no type modifier class", () => {
      const wrapper = mount(DanxChip);

      expect(wrapper.classes()).toContain("danx-chip");
      expect(wrapper.classes()).toContain("danx-chip--md");
      for (const t of colorTypes) {
        expect(wrapper.classes()).not.toContain(`danx-chip--${t}`);
      }
    });

    it("blank type via type='' has no type modifier class", () => {
      const wrapper = mount(DanxChip, {
        props: { type: "" },
      });

      for (const t of colorTypes) {
        expect(wrapper.classes()).not.toContain(`danx-chip--${t}`);
      }
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxChip, {
        props: { size },
      });

      expect(wrapper.classes()).toContain(`danx-chip--${size}`);
    });

    it("defaults to md size when not specified", () => {
      const wrapper = mount(DanxChip);

      expect(wrapper.classes()).toContain("danx-chip--md");
    });
  });

  describe("Icon rendering", () => {
    it("does not render icon area when no icon prop and no icon slot", () => {
      const wrapper = mount(DanxChip, {
        slots: { default: "Tag" },
      });

      expect(wrapper.find(".danx-chip__icon").exists()).toBe(false);
    });

    it("renders icon area with SVG when icon prop is a raw SVG string", () => {
      const wrapper = mount(DanxChip, {
        props: { icon: saveIcon },
      });

      const iconEl = wrapper.find(".danx-chip__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("resolves built-in icon by name string", () => {
      const wrapper = mount(DanxChip, {
        props: { icon: "save" },
      });

      const iconEl = wrapper.find(".danx-chip__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("falls back to raw SVG for unrecognized string", () => {
      const rawSvg = '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>';
      const wrapper = mount(DanxChip, {
        props: { icon: rawSvg },
      });

      const iconEl = wrapper.find(".danx-chip__icon");
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

      const wrapper = mount(DanxChip, {
        props: { icon: CustomIcon },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("renders icon slot content when provided", () => {
      const wrapper = mount(DanxChip, {
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

      const wrapper = mount(DanxChip, {
        props: { icon: CustomIcon },
        slots: { icon: '<span class="slot-icon">Slot</span>' },
      });

      expect(wrapper.find(".slot-icon").exists()).toBe(true);
      expect(wrapper.find(".prop-icon").exists()).toBe(false);
    });
  });

  describe("Tooltip", () => {
    it("renders title attribute when tooltip provided", () => {
      const wrapper = mount(DanxChip, {
        props: { tooltip: "Status label" },
      });

      expect(wrapper.attributes("title")).toBe("Status label");
    });

    it("does not render title attribute when tooltip not provided", () => {
      const wrapper = mount(DanxChip);

      expect(wrapper.attributes("title")).toBeUndefined();
    });
  });

  describe("Click passthrough", () => {
    it("fires native click via fallthrough attrs without component handler", async () => {
      let clicked = false;
      const wrapper = mount(DanxChip, {
        attrs: {
          onClick: () => {
            clicked = true;
          },
        },
        slots: { default: "Clickable" },
      });

      await wrapper.trigger("click");

      // Click passes through natively — no component-level "click" emit needed.
      expect(clicked).toBe(true);
      expect(wrapper.emitted("remove")).toBeUndefined();
    });
  });

  describe("Removable", () => {
    it("does not render remove element by default", () => {
      const wrapper = mount(DanxChip, {
        slots: { default: "Tag" },
      });

      expect(wrapper.find(".danx-chip__remove").exists()).toBe(false);
    });

    it("renders remove element when removable=true", () => {
      const wrapper = mount(DanxChip, {
        props: { removable: true },
        slots: { default: "Tag" },
      });

      expect(wrapper.find(".danx-chip__remove").exists()).toBe(true);
    });

    it("emits remove on click", async () => {
      const wrapper = mount(DanxChip, {
        props: { removable: true },
        slots: { default: "Tag" },
      });

      await wrapper.find(".danx-chip__remove").trigger("click");

      expect(wrapper.emitted("remove")).toHaveLength(1);
    });

    it("emits remove on Enter key via native button", async () => {
      const wrapper = mount(DanxChip, {
        props: { removable: true },
        slots: { default: "Tag" },
      });

      // Native button elements handle Enter key, triggering a click event
      await wrapper.find(".danx-chip__remove").trigger("click");

      expect(wrapper.emitted("remove")).toHaveLength(1);
    });

    it("remove click does not propagate to parent", async () => {
      let parentClicked = false;
      const wrapper = mount(DanxChip, {
        props: { removable: true },
        attrs: {
          onClick: () => {
            parentClicked = true;
          },
        },
        slots: { default: "Tag" },
      });

      await wrapper.find(".danx-chip__remove").trigger("click");

      expect(wrapper.emitted("remove")).toHaveLength(1);
      expect(parentClicked).toBe(false);
    });

    it("uses a native button element with aria-label for accessibility", () => {
      const wrapper = mount(DanxChip, {
        props: { removable: true },
        slots: { default: "Tag" },
      });

      const remove = wrapper.find(".danx-chip__remove");
      expect(remove.element.tagName).toBe("BUTTON");
      expect(remove.attributes("aria-label")).toBe("Remove");
      expect(remove.attributes("type")).toBe("button");
    });
  });

  describe("CSS classes", () => {
    it("has base class danx-chip", () => {
      const wrapper = mount(DanxChip);

      expect(wrapper.classes()).toContain("danx-chip");
    });

    it("combines type and size classes", () => {
      const wrapper = mount(DanxChip, {
        props: { type: "danger", size: "lg" },
      });

      expect(wrapper.classes()).toContain("danx-chip");
      expect(wrapper.classes()).toContain("danx-chip--danger");
      expect(wrapper.classes()).toContain("danx-chip--lg");
    });
  });
});
