import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { defineComponent } from "vue";
import DanxFileChildrenMenu from "../DanxFileChildrenMenu.vue";
import { makeFile, makeChild } from "../../danx-file/__tests__/test-helpers";

// NOTE: DanxPopover uses the native Popover API (popover="auto", showPopover/hidePopover)
// which is not supported in JSDOM. However, we can stub DanxPopover to render its slot content
// and test the popover content (children list, select events, loading skeletons).

// Stub that renders popover trigger and default slot content
const PopoverStub = defineComponent({
  template: '<div><slot name="trigger" /><slot /></div>',
});

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

  describe("Popover content - with DanxPopover stubbed", () => {
    it("renders loading skeleton when children is undefined", () => {
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile(),
        },
        global: {
          stubs: { DanxPopover: PopoverStub },
        },
      });
      const loading = wrapper.find(".danx-file-children__loading");
      expect(loading.exists()).toBe(true);
      // Should have 3 skeleton rows
      const rows = wrapper.findAll(".danx-file-children__skeleton-row");
      expect(rows).toHaveLength(3);
    });

    it("renders children list when children are loaded", () => {
      const children = [makeChild("c1"), makeChild("c2"), makeChild("c3")];
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile({ children }),
        },
        global: {
          stubs: { DanxPopover: PopoverStub },
        },
      });
      const items = wrapper.findAll(".danx-file-children__item");
      expect(items).toHaveLength(3);
      // Verify children names are rendered
      expect(items[0]!.text()).toContain("child-c1.jpg");
      expect(items[1]!.text()).toContain("child-c2.jpg");
      expect(items[2]!.text()).toContain("child-c3.jpg");
    });

    it("emits select event when a child is clicked", async () => {
      const children = [makeChild("c1"), makeChild("c2")];
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile({ children }),
        },
        global: {
          stubs: { DanxPopover: PopoverStub },
        },
      });
      const items = wrapper.findAll(".danx-file-children__item");
      await items[1]!.trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
      const emitted = wrapper.emitted("select")!;
      expect(emitted[0]![0]).toEqual(children[1]);
    });

    it("emits select with correct child when first child clicked", async () => {
      const children = [makeChild("c1"), makeChild("c2")];
      const wrapper = mount(DanxFileChildrenMenu, {
        props: {
          file: makeFile({ children }),
        },
        global: {
          stubs: { DanxPopover: PopoverStub },
        },
      });
      const items = wrapper.findAll(".danx-file-children__item");
      await items[0]!.trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
      const emitted = wrapper.emitted("select")!;
      expect(emitted[0]![0]).toEqual(children[0]);
    });
  });
});
