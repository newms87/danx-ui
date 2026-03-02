import { describe, it, expect } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import { h, defineComponent, markRaw, nextTick } from "vue";
import DanxTabs from "../DanxTabs.vue";
import { saveIcon } from "../../icon/icons";
import type { DanxTab } from "../types";
import type { VariantType } from "../../../shared/types";

/** Helper to create a basic set of tabs */
function createTabs(overrides: Partial<DanxTab>[] = []): DanxTab[] {
  const defaults: DanxTab[] = [
    { value: "one", label: "Tab One" },
    { value: "two", label: "Tab Two" },
    { value: "three", label: "Tab Three" },
  ];
  return defaults.map((tab, i) => ({ ...tab, ...overrides[i] }));
}

describe("DanxTabs", () => {
  describe("Rendering", () => {
    it("renders a container with danx-tabs class", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      expect(wrapper.find(".danx-tabs").exists()).toBe(true);
    });

    it("renders one button per tab", () => {
      const tabs = createTabs();
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs },
      });

      const buttons = wrapper.findAll(".danx-tabs__tab");
      expect(buttons).toHaveLength(tabs.length);
    });

    it("renders tab labels", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      expect(wrapper.text()).toContain("Tab One");
      expect(wrapper.text()).toContain("Tab Two");
      expect(wrapper.text()).toContain("Tab Three");
    });

    it("renders the indicator element", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      expect(wrapper.find(".danx-tabs__indicator").exists()).toBe(true);
    });

    it("renders with empty tabs array", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: [] },
      });

      expect(wrapper.find(".danx-tabs").exists()).toBe(true);
      expect(wrapper.findAll(".danx-tabs__tab")).toHaveLength(0);
    });

    it("handles modelValue that does not match any tab", () => {
      const wrapper = mount(DanxTabs, {
        props: {
          modelValue: "nonexistent",
          "onUpdate:modelValue": () => {},
          tabs: createTabs(),
        },
      });

      // No tab gets is-active class
      const buttons = wrapper.findAll(".danx-tabs__tab");
      for (const btn of buttons) {
        expect(btn.classes()).not.toContain("is-active");
      }

      // Indicator still renders with default 0/0 position
      const indicator = wrapper.find(".danx-tabs__indicator");
      expect(indicator.exists()).toBe(true);
      expect(indicator.attributes("style")).toContain("left: 0px");
      expect(indicator.attributes("style")).toContain("width: 0px");
    });

    it("renders with a single tab", () => {
      const wrapper = mount(DanxTabs, {
        props: {
          modelValue: "only",
          "onUpdate:modelValue": () => {},
          tabs: [{ value: "only", label: "Only Tab" }],
        },
      });

      expect(wrapper.findAll(".danx-tabs__tab")).toHaveLength(1);
    });
  });

  describe("Icons", () => {
    it("renders DanxIcon when tab has icon prop (SVG string)", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", icon: saveIcon }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      const iconEl = wrapper.find(".danx-tabs__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("renders DanxIcon when tab has icon name string", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", icon: "save" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      expect(wrapper.find(".danx-tabs__icon").exists()).toBe(true);
    });

    it("renders DanxIcon when tab has icon as Component", () => {
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "custom-icon" }, "X");
          },
        })
      );
      const tabs: DanxTab[] = [{ value: "a", label: "A", icon: CustomIcon }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("does not render icon area when tab has no icon", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      expect(wrapper.find(".danx-tabs__icon").exists()).toBe(false);
    });

    it("renders icon for tabs that have it, skips for those that dont", () => {
      const tabs: DanxTab[] = [
        { value: "a", label: "A", icon: "save" },
        { value: "b", label: "B" },
      ];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      const buttons = wrapper.findAll(".danx-tabs__tab");
      expect(buttons[0]!.find(".danx-tabs__icon").exists()).toBe(true);
      expect(buttons[1]!.find(".danx-tabs__icon").exists()).toBe(false);
    });
  });

  describe("Count badge", () => {
    it("renders count when present", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", count: 42 }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      const countEl = wrapper.find(".danx-tabs__count");
      expect(countEl.exists()).toBe(true);
      expect(countEl.text()).toBe("(42)");
    });

    it("renders count of 0", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", count: 0 }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      const countEl = wrapper.find(".danx-tabs__count");
      expect(countEl.exists()).toBe(true);
      expect(countEl.text()).toBe("(0)");
    });

    it("does not render count when absent", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      expect(wrapper.find(".danx-tabs__count").exists()).toBe(false);
    });
  });

  describe("v-model", () => {
    it("active tab gets is-active class", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "two", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      const buttons = wrapper.findAll(".danx-tabs__tab");
      expect(buttons[0]!.classes()).not.toContain("is-active");
      expect(buttons[1]!.classes()).toContain("is-active");
      expect(buttons[2]!.classes()).not.toContain("is-active");
    });

    it("emits update:modelValue on click with correct value", async () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      await wrapper.findAll(".danx-tabs__tab")[1]!.trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["two"]);
    });

    it("clicking already-active tab does not emit (same value)", async () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      await wrapper.findAll(".danx-tabs__tab")[0]!.trigger("click");

      // defineModel skips emit when value is unchanged
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Indicator", () => {
    it("indicator has inline style with left, width, and backgroundColor", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", activeColor: "#ff0000" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      const indicator = wrapper.find(".danx-tabs__indicator");
      const style = indicator.attributes("style");
      expect(style).toContain("left:");
      expect(style).toContain("width:");
      expect(style).toContain("background-color:");
    });

    it("uses tab activeColor when provided", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", activeColor: "#ff0000" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      const style = wrapper.find(".danx-tabs__indicator").attributes("style");
      expect(style).toContain("background-color: #ff0000");
    });

    it("falls back to CSS variable when activeColor omitted", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
      });

      const style = wrapper.find(".danx-tabs__indicator").attributes("style");
      expect(style).toContain("var(--dx-tabs-active-color)");
    });
  });

  describe("Dividers", () => {
    it("does not render divider before first tab", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      // First child after indicator should be a button, not a divider
      const children = wrapper.find(".danx-tabs").element.children;
      // children[0] is the indicator, children[1] should be the first button
      expect(children[1]!.classList.contains("danx-tabs__divider")).toBe(false);
      expect(children[1]!.classList.contains("danx-tabs__tab")).toBe(true);
    });

    it("renders dividers between subsequent tabs", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      const dividers = wrapper.findAll(".danx-tabs__divider");
      // 3 tabs = 2 dividers
      expect(dividers).toHaveLength(2);
    });

    it("does not render dividers for single tab", () => {
      const wrapper = mount(DanxTabs, {
        props: {
          modelValue: "only",
          "onUpdate:modelValue": () => {},
          tabs: [{ value: "only", label: "Only" }],
        },
      });

      expect(wrapper.findAll(".danx-tabs__divider")).toHaveLength(0);
    });
  });

  describe("Button element", () => {
    it("tab buttons are native button elements with type=button", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      const buttons = wrapper.findAll(".danx-tabs__tab");
      for (const btn of buttons) {
        expect(btn.element.tagName).toBe("BUTTON");
        expect(btn.attributes("type")).toBe("button");
      }
    });
  });

  describe("Variants", () => {
    const colorTypes: VariantType[] = ["danger", "success", "warning", "info", "muted"];

    it.each(colorTypes)("renders variant %s with inline styles", (variant) => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs(), variant },
      });

      const styleAttr = wrapper.find(".danx-tabs").attributes("style");
      expect(styleAttr).toContain("--dx-tabs-bg:");
      expect(styleAttr).toContain(`--dx-variant-${variant}-`);
    });

    it("defaults to blank variant with no inline variant styles", () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      const styleAttr = wrapper.find(".danx-tabs").attributes("style");
      // No variant tokens should be present (only indicator child has styles)
      expect(styleAttr).toBeUndefined();
    });

    it("blank variant via variant='' has no inline variant styles", () => {
      const wrapper = mount(DanxTabs, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          tabs: createTabs(),
          variant: "",
        },
      });

      expect(wrapper.find(".danx-tabs").attributes("style")).toBeUndefined();
    });
  });

  describe("Slots", () => {
    it("default slot replaces icon and label content", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", icon: "save" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
        slots: {
          default: ({ tab, isActive }: { tab: DanxTab; isActive: boolean }) =>
            h("span", { class: "custom-content" }, `${tab.label}-${isActive}`),
        },
      });

      expect(wrapper.find(".custom-content").exists()).toBe(true);
      expect(wrapper.find(".custom-content").text()).toBe("A-true");
      // Default icon and label should not render
      expect(wrapper.find(".danx-tabs__icon").exists()).toBe(false);
    });

    it("default slot still renders count badge outside slot", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", count: 5 }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
        slots: {
          default: ({ tab }: { tab: DanxTab }) => h("span", { class: "custom" }, tab.label),
        },
      });

      expect(wrapper.find(".danx-tabs__count").exists()).toBe(true);
      expect(wrapper.find(".danx-tabs__count").text()).toBe("(5)");
    });

    it("icon slot replaces icon area only", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", icon: "save" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
        slots: {
          icon: ({ tab }: { tab: DanxTab }) =>
            h("span", { class: "custom-icon" }, `icon-${tab.value}`),
        },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
      expect(wrapper.find(".custom-icon").text()).toBe("icon-a");
      // Default icon should not render
      expect(wrapper.find(".danx-tabs__icon").exists()).toBe(false);
      // Label should still render
      expect(wrapper.text()).toContain("A");
    });

    it("label slot replaces label text only", () => {
      const tabs: DanxTab[] = [{ value: "a", label: "A", icon: "save" }];
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "a", "onUpdate:modelValue": () => {}, tabs },
        slots: {
          label: ({ tab, isActive }: { tab: DanxTab; isActive: boolean }) =>
            h("span", { class: "custom-label" }, `${tab.label}${isActive ? "!" : ""}`),
        },
      });

      expect(wrapper.find(".custom-label").exists()).toBe(true);
      expect(wrapper.find(".custom-label").text()).toBe("A!");
      // Icon should still render from default
      expect(wrapper.find(".danx-tabs__icon").exists()).toBe(true);
    });

    it("scoped props pass correct isActive for each tab", () => {
      const tabs = createTabs();
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "two", "onUpdate:modelValue": () => {}, tabs },
        slots: {
          label: ({ tab, isActive }: { tab: DanxTab; isActive: boolean }) =>
            h("span", { class: `label-${tab.value}` }, isActive ? "active" : "inactive"),
        },
      });

      expect(wrapper.find(".label-one").text()).toBe("inactive");
      expect(wrapper.find(".label-two").text()).toBe("active");
      expect(wrapper.find(".label-three").text()).toBe("inactive");
    });
  });

  describe("Reactivity", () => {
    it("updates indicator when modelValue changes", async () => {
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs: createTabs() },
      });

      // Change modelValue prop
      await wrapper.setProps({ modelValue: "two" });
      await nextTick();
      await flushPromises();

      // Indicator should still exist and have style (JSDOM returns 0 for offsetLeft/offsetWidth)
      const indicator = wrapper.find(".danx-tabs__indicator");
      expect(indicator.attributes("style")).toContain("left:");
    });

    it("updates indicator when tabs change", async () => {
      const tabs = createTabs();
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs },
      });

      // Change tabs prop (e.g., count updates)
      const updatedTabs = tabs.map((t) => ({ ...t, count: 5 }));
      await wrapper.setProps({ tabs: updatedTabs });
      await nextTick();
      await flushPromises();

      // Indicator should still have style
      const indicator = wrapper.find(".danx-tabs__indicator");
      expect(indicator.attributes("style")).toContain("left:");
    });

    it("cleans up button refs when tabs are removed", async () => {
      const tabs = createTabs();
      const wrapper = mount(DanxTabs, {
        props: { modelValue: "one", "onUpdate:modelValue": () => {}, tabs },
      });

      // Remove tabs to trigger the else branch of setButtonRef (el is null)
      await wrapper.setProps({ tabs: [{ value: "one", label: "Tab One" }] });
      await nextTick();

      // Only one button should remain
      expect(wrapper.findAll(".danx-tabs__tab")).toHaveLength(1);
    });
  });
});
