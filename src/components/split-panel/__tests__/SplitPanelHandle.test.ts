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

    it("is keyboard-focusable via tabindex", () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      expect(handle.attributes("tabindex")).toBe("0");
    });

    it("reflects value-now/min/max as aria-value attributes", () => {
      const wrapper = mount(SplitPanelHandle, {
        props: { valueNow: 40, valueMin: 5, valueMax: 95 },
      });
      const handle = wrapper.find(".danx-split-panel-handle");

      expect(handle.attributes("aria-valuenow")).toBe("40");
      expect(handle.attributes("aria-valuemin")).toBe("5");
      expect(handle.attributes("aria-valuemax")).toBe("95");
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

    it("emits resize 'decrease' on ArrowLeft when vertical", async () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "ArrowLeft" });

      expect(wrapper.emitted("resize")).toEqual([["decrease"]]);
    });

    it("emits resize 'increase' on ArrowRight when vertical", async () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "ArrowRight" });

      expect(wrapper.emitted("resize")).toEqual([["increase"]]);
    });

    it("emits resize 'decrease' on ArrowUp when horizontal", async () => {
      const wrapper = mount(SplitPanelHandle, { props: { horizontal: true } });
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "ArrowUp" });

      expect(wrapper.emitted("resize")).toEqual([["decrease"]]);
    });

    it("emits resize 'increase' on ArrowDown when horizontal", async () => {
      const wrapper = mount(SplitPanelHandle, { props: { horizontal: true } });
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("resize")).toEqual([["increase"]]);
    });

    it("does not emit resize for ArrowUp/ArrowDown when vertical", async () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "ArrowUp" });
      await handle.trigger("keydown", { key: "ArrowDown" });

      expect(wrapper.emitted("resize")).toBeUndefined();
    });

    it("emits resize 'min' on Home", async () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "Home" });

      expect(wrapper.emitted("resize")).toEqual([["min"]]);
    });

    it("emits resize 'max' on End", async () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "End" });

      expect(wrapper.emitted("resize")).toEqual([["max"]]);
    });

    it("does not emit resize for unrelated keys", async () => {
      const wrapper = mount(SplitPanelHandle);
      const handle = wrapper.find(".danx-split-panel-handle");

      await handle.trigger("keydown", { key: "Tab" });

      expect(wrapper.emitted("resize")).toBeUndefined();
    });
  });
});
