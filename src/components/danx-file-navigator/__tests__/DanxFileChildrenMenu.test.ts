import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DanxFileChildrenMenu from "../DanxFileChildrenMenu.vue";
import { makeFile, makeChild } from "../../danx-file/__tests__/test-helpers";

// NOTE: DanxPopover uses the native Popover API (popover="auto", showPopover/hidePopover)
// which is not supported in JSDOM. This means popover content (children list, select events,
// loading skeletons) cannot be tested here. These behaviors are covered by the component's
// integration within DanxFileNavigator. Only trigger visibility and loadChildren emission
// can be tested in isolation.

describe("DanxFileChildrenMenu", () => {
  describe("Visibility", () => {
    it("renders when file has children", () => {
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile({ children: [makeChild("c1"), makeChild("c2")] }),
        },
      });
      expect(wrapper.find(".danx-popover-trigger").exists()).toBe(true);
    });

    it("renders when children are not yet loaded (undefined)", () => {
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile(),
        },
      });
      expect(wrapper.find(".danx-popover-trigger").exists()).toBe(true);
    });

    it("does not render when children is empty array", () => {
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile({ children: [] }),
        },
      });
      // hasChildren returns false for empty array, and children is defined
      expect(wrapper.find(".danx-popover-trigger").exists()).toBe(false);
    });
  });

  describe("Load children", () => {
    it("emits loadChildren on mount when children are undefined", () => {
      const file = makeFile();
      const wrapper = mount(DanxFileChildrenMenu, {
        props: { file },
      });
      expect(wrapper.emitted("loadChildren")).toBeTruthy();
      expect(wrapper.emitted("loadChildren")![0]![0]).toEqual(file);
    });

    it("does not emit loadChildren when children are already loaded", () => {
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile({ children: [makeChild("c1")] }),
        },
      });
      expect(wrapper.emitted("loadChildren")).toBeFalsy();
    });

    it("emits loadChildren when file prop changes to one without children", async () => {
      const file1 = makeFile({ children: [makeChild("c1")] });
      const file2 = makeFile({ id: "other", name: "other.jpg" });
      const wrapper = mount(DanxFileChildrenMenu, {
        props: { file: file1 },
      });
      expect(wrapper.emitted("loadChildren")).toBeFalsy();
      await wrapper.setProps({ file: file2 });
      expect(wrapper.emitted("loadChildren")).toBeTruthy();
      expect(wrapper.emitted("loadChildren")![0]![0]).toEqual(file2);
    });
  });

  describe("Trigger button", () => {
    it("renders a trigger button when file has children", () => {
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile({ children: [makeChild("c1")] }),
        },
      });
      expect(wrapper.find(".danx-button").exists()).toBe(true);
    });

    it("renders a trigger button when children are loading", () => {
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile(),
        },
      });
      expect(wrapper.find(".danx-button").exists()).toBe(true);
    });
  });
});
