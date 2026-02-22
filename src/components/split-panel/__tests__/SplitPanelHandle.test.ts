import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import SplitPanelHandle from "../SplitPanelHandle.vue";

describe("SplitPanelHandle", () => {
  describe("Rendering", () => {
    it("renders with separator role", () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      expect(handle.exists()).toBe(true);
      expect(handle.attributes("role")).toBe("separator");
    });

    it("sets aria-orientation to vertical by default", () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      expect(handle.attributes("aria-orientation")).toBe("vertical");
    });

    it("sets aria-orientation to horizontal when horizontal prop is true", () => {
      const wrapper = mount(SplitPanelHandle, {
        props: { horizontal: true },
      });
      const handle = wrapper.find(".danx-split-panel-handle");

      expect(handle.attributes("aria-orientation")).toBe("horizontal");
    });

    it("renders grip indicator element", () => {
      const wrapper = mount(SplitPanelHandle);

      expect(wrapper.find(".danx-split-panel-handle__grip").exists()).toBe(true);
    });

    it("applies horizontal modifier class when horizontal", () => {
      const wrapper = mount(SplitPanelHandle, {
        props: { horizontal: true },
      });

      expect(wrapper.find(".danx-split-panel-handle--horizontal").exists()).toBe(true);
    });

    it("does not apply horizontal modifier class by default", () => {
      const wrapper = mount(SplitPanelHandle);

      expect(wrapper.find(".danx-split-panel-handle--horizontal").exists()).toBe(false);
    });
  });

  describe("Events", () => {
    it("emits dragStart with PointerEvent on pointerdown", async () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("pointerdown");

      expect(wrapper.emitted("dragStart")).toHaveLength(1);
      expect(wrapper.emitted("dragStart")![0]![0]).toBeInstanceOf(Event);
    });
  });
});
