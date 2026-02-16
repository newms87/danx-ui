import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent, markRaw } from "vue";
import DanxButtonGroup from "../DanxButtonGroup.vue";
import { saveIcon } from "../../icon/icons";
import { hashStringToIndex, AUTO_COLOR_PALETTE } from "../../../shared/autoColor";
import type { DanxButtonGroupItem } from "../types";

/** Helper to create a basic set of buttons */
function createButtons(overrides: Partial<DanxButtonGroupItem>[] = []): DanxButtonGroupItem[] {
  const defaults: DanxButtonGroupItem[] = [
    { value: "one", label: "Button One" },
    { value: "two", label: "Button Two" },
    { value: "three", label: "Button Three" },
  ];
  return defaults.map((btn, i) => ({ ...btn, ...overrides[i] }));
}

describe("DanxButtonGroup", () => {
  beforeEach(() => {
    document.documentElement.classList.remove("dark");
  });

  afterEach(() => {
    document.documentElement.classList.remove("dark");
  });

  describe("Rendering", () => {
    it("renders a container with danx-button-group class", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: createButtons() },
      });
      expect(wrapper.find(".danx-button-group").exists()).toBe(true);
    });

    it("renders one button per item", () => {
      const buttons = createButtons();
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      expect(wrapper.findAll(".danx-button-group__button")).toHaveLength(buttons.length);
    });

    it("renders button labels", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: createButtons() },
      });
      expect(wrapper.text()).toContain("Button One");
      expect(wrapper.text()).toContain("Button Two");
      expect(wrapper.text()).toContain("Button Three");
    });

    it("renders with empty buttons array", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: [] },
      });
      expect(wrapper.find(".danx-button-group").exists()).toBe(true);
      expect(wrapper.findAll(".danx-button-group__button")).toHaveLength(0);
    });

    it("renders with a single button", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: [{ value: "only", label: "Only Button" }] },
      });
      expect(wrapper.findAll(".danx-button-group__button")).toHaveLength(1);
    });
  });

  describe("Icons", () => {
    it("renders DanxIcon when button has icon prop (SVG string)", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", icon: saveIcon }];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      const iconEl = wrapper.find(".danx-button-group__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("renders DanxIcon when button has icon name string", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", icon: "save" }];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      expect(wrapper.find(".danx-button-group__icon").exists()).toBe(true);
    });

    it("renders DanxIcon when button has icon as Component", () => {
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "custom-icon" }, "X");
          },
        })
      );
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", icon: CustomIcon }];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("does not render icon area when button has no icon", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A" }];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      expect(wrapper.find(".danx-button-group__icon").exists()).toBe(false);
    });

    it("renders icon for buttons that have it, skips for those that dont", () => {
      const buttons: DanxButtonGroupItem[] = [
        { value: "a", label: "A", icon: "save" },
        { value: "b", label: "B" },
      ];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      const btns = wrapper.findAll(".danx-button-group__button");
      expect(btns[0]!.find(".danx-button-group__icon").exists()).toBe(true);
      expect(btns[1]!.find(".danx-button-group__icon").exists()).toBe(false);
    });
  });

  describe("Count badge", () => {
    it("renders count when present", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", count: 42 }];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      const countEl = wrapper.find(".danx-button-group__count");
      expect(countEl.exists()).toBe(true);
      expect(countEl.text()).toBe("(42)");
    });

    it("renders count of 0", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", count: 0 }];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      const countEl = wrapper.find(".danx-button-group__count");
      expect(countEl.exists()).toBe(true);
      expect(countEl.text()).toBe("(0)");
    });

    it("does not render count when absent", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A" }];
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons },
      });
      expect(wrapper.find(".danx-button-group__count").exists()).toBe(false);
    });
  });

  describe("Single-select v-model", () => {
    it("active button gets is-active class", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "two",
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      const btns = wrapper.findAll(".danx-button-group__button");
      expect(btns[0]!.classes()).not.toContain("is-active");
      expect(btns[1]!.classes()).toContain("is-active");
      expect(btns[2]!.classes()).not.toContain("is-active");
    });

    it("clicking inactive button selects it", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      await wrapper.findAll(".danx-button-group__button")[1]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual(["two"]);
    });

    it("clicking active button deselects it (sets null)", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([null]);
    });

    it("required mode prevents deselecting active button", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          required: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("no button gets is-active when modelValue is null", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: null,
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      const btns = wrapper.findAll(".danx-button-group__button");
      for (const btn of btns) {
        expect(btn.classes()).not.toContain("is-active");
      }
    });

    it("handles modelValue that does not match any button", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "nonexistent",
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      const btns = wrapper.findAll(".danx-button-group__button");
      for (const btn of btns) {
        expect(btn.classes()).not.toContain("is-active");
      }
    });
  });

  describe("Multi-select v-model", () => {
    it("multiple buttons can be active", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one", "three"],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
        },
      });
      const btns = wrapper.findAll(".danx-button-group__button");
      expect(btns[0]!.classes()).toContain("is-active");
      expect(btns[1]!.classes()).not.toContain("is-active");
      expect(btns[2]!.classes()).toContain("is-active");
    });

    it("clicking inactive button adds it to selection", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one"],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[1]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([["one", "two"]]);
    });

    it("clicking active button removes it from selection", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one", "two"],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([["two"]]);
    });

    it("handles null modelValue as empty array", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: null,
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([["one"]]);
    });

    it("handles string modelValue as empty array in multi mode", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one" as unknown as string[],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
        },
      });
      // "one" is not an array, so isActive returns false and click adds to empty array
      await wrapper.findAll(".danx-button-group__button")[1]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([["two"]]);
    });

    it("required mode prevents removing last selected button", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one"],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
          required: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      // Should not emit since it's the last selected
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("required mode allows removing when more than one selected", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one", "two"],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
          required: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([["two"]]);
    });
  });

  describe("Events", () => {
    it("emits select when a button is selected (single)", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: null,
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
      expect(wrapper.emitted("select")![0]).toEqual(["one"]);
    });

    it("emits deselect when a button is deselected (single)", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("deselect")).toBeTruthy();
      expect(wrapper.emitted("deselect")![0]).toEqual(["one"]);
    });

    it("emits select when a button is added (multi)", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one"],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[1]!.trigger("click");
      expect(wrapper.emitted("select")![0]).toEqual(["two"]);
    });

    it("emits deselect when a button is removed (multi)", async () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one", "two"],
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
          multiple: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(wrapper.emitted("deselect")![0]).toEqual(["one"]);
    });
  });

  describe("onClick callbacks", () => {
    it("calls per-button onClick when selecting", async () => {
      let called = false;
      const buttons = createButtons();
      buttons[1]!.onClick = () => {
        called = true;
      };
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: null,
          "onUpdate:modelValue": () => {},
          buttons,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[1]!.trigger("click");
      expect(called).toBe(true);
    });

    it("calls per-button onClick when deselecting", async () => {
      let called = false;
      const buttons = createButtons();
      buttons[0]!.onClick = () => {
        called = true;
      };
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(called).toBe(true);
    });

    it("calls onClick even when required prevents deselection", async () => {
      let called = false;
      const buttons = createButtons();
      buttons[0]!.onClick = () => {
        called = true;
      };
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons,
          required: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(called).toBe(true);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("calls onClick even when required prevents multi-select deselection", async () => {
      let called = false;
      const buttons = createButtons();
      buttons[0]!.onClick = () => {
        called = true;
      };
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: ["one"],
          "onUpdate:modelValue": () => {},
          buttons,
          multiple: true,
          required: true,
        },
      });
      await wrapper.findAll(".danx-button-group__button")[0]!.trigger("click");
      expect(called).toBe(true);
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("AutoColor", () => {
    it("does not apply inline styles when autoColor is false", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons: createButtons(),
        },
      });
      const btn = wrapper.findAll(".danx-button-group__button")[0]!;
      expect(btn.attributes("style")).toBeUndefined();
    });

    it("applies active auto-color style to selected button", () => {
      const buttons = createButtons();
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
        },
      });
      const btn = wrapper.findAll(".danx-button-group__button")[0]!;
      const style = btn.attributes("style") ?? "";
      expect(style).toContain("--dx-button-group-active-bg");
      expect(style).toContain("--dx-button-group-text-active");
    });

    it("does not apply style to inactive buttons in active-only mode", () => {
      const buttons = createButtons();
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
          autoColorMode: "active-only",
        },
      });
      const inactiveBtn = wrapper.findAll(".danx-button-group__button")[1]!;
      expect(inactiveBtn.attributes("style")).toBeUndefined();
    });

    it("applies muted style to inactive buttons in always mode", () => {
      const buttons = createButtons();
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "one",
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
          autoColorMode: "always",
        },
      });
      const inactiveBtn = wrapper.findAll(".danx-button-group__button")[1]!;
      const style = inactiveBtn.attributes("style") ?? "";
      expect(style).toContain("--dx-button-group-text");
    });

    it("uses correct palette colors based on label hash", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "TestLabel" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "a",
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
        },
      });
      const index = hashStringToIndex("TestLabel", AUTO_COLOR_PALETTE.length);
      const entry = AUTO_COLOR_PALETTE[index]!;
      const style = wrapper.find(".danx-button-group__button").attributes("style") ?? "";
      expect(style).toContain(entry.bg);
    });

    it("uses dark-mode colors when dark class is present", () => {
      document.documentElement.classList.add("dark");
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "TestLabel" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "a",
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
        },
      });
      const index = hashStringToIndex("TestLabel", AUTO_COLOR_PALETTE.length);
      const entry = AUTO_COLOR_PALETTE[index]!;
      const style = wrapper.find(".danx-button-group__button").attributes("style") ?? "";
      expect(style).toContain(entry.darkBg);
    });

    it("uses autoColor string as hash key instead of label", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "SomeLabel" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "a",
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: "CustomKey",
        },
      });
      const index = hashStringToIndex("CustomKey", AUTO_COLOR_PALETTE.length);
      const entry = AUTO_COLOR_PALETTE[index]!;
      const style = wrapper.find(".danx-button-group__button").attributes("style") ?? "";
      expect(style).toContain(entry.bg);
    });

    it("uses inactive palette for always mode inactive buttons", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "TestLabel" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: null,
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
          autoColorMode: "always",
        },
      });
      const index = hashStringToIndex("TestLabel", AUTO_COLOR_PALETTE.length);
      const entry = AUTO_COLOR_PALETTE[index]!;
      const style = wrapper.find(".danx-button-group__button").attributes("style") ?? "";
      expect(style).toContain(entry.inactiveText);
    });

    it("uses dark inactive palette for always mode in dark mode", () => {
      document.documentElement.classList.add("dark");
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "TestLabel" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: null,
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
          autoColorMode: "always",
        },
      });
      const index = hashStringToIndex("TestLabel", AUTO_COLOR_PALETTE.length);
      const entry = AUTO_COLOR_PALETTE[index]!;
      const style = wrapper.find(".danx-button-group__button").attributes("style") ?? "";
      expect(style).toContain(entry.darkInactiveText);
    });
  });

  describe("activeColor per button", () => {
    it("applies activeColor as inline style when button is active", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", activeColor: "#ff0000" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "a",
          "onUpdate:modelValue": () => {},
          buttons,
        },
      });
      const style = wrapper.find(".danx-button-group__button").attributes("style") ?? "";
      expect(style).toContain("--dx-button-group-active-bg: #ff0000");
    });

    it("does not apply activeColor when button is inactive", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", activeColor: "#ff0000" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: null,
          "onUpdate:modelValue": () => {},
          buttons,
        },
      });
      expect(wrapper.find(".danx-button-group__button").attributes("style")).toBeUndefined();
    });

    it("activeColor overrides autoColor when both present", () => {
      const buttons: DanxButtonGroupItem[] = [{ value: "a", label: "A", activeColor: "#ff0000" }];
      const wrapper = mount(DanxButtonGroup, {
        props: {
          modelValue: "a",
          "onUpdate:modelValue": () => {},
          buttons,
          autoColor: true,
        },
      });
      const style = wrapper.find(".danx-button-group__button").attributes("style") ?? "";
      expect(style).toContain("--dx-button-group-active-bg: #ff0000");
      // Should not have text-active since activeColor overrides the full autoColor
      expect(style).not.toContain("--dx-button-group-text-active");
    });
  });

  describe("Dividers", () => {
    it("does not render divider before first button", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: createButtons() },
      });
      const children = wrapper.find(".danx-button-group").element.children;
      expect(children[0]!.classList.contains("danx-button-group__divider")).toBe(false);
      expect(children[0]!.classList.contains("danx-button-group__button")).toBe(true);
    });

    it("renders dividers between subsequent buttons", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: createButtons() },
      });
      const dividers = wrapper.findAll(".danx-button-group__divider");
      expect(dividers).toHaveLength(2);
    });

    it("does not render dividers for single button", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: [{ value: "only", label: "Only" }] },
      });
      expect(wrapper.findAll(".danx-button-group__divider")).toHaveLength(0);
    });
  });

  describe("Button element", () => {
    it("buttons are native button elements with type=button", () => {
      const wrapper = mount(DanxButtonGroup, {
        props: { buttons: createButtons() },
      });
      const btns = wrapper.findAll(".danx-button-group__button");
      for (const btn of btns) {
        expect(btn.element.tagName).toBe("BUTTON");
        expect(btn.attributes("type")).toBe("button");
      }
    });
  });
});
