import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxDragHandle from "../DanxDragHandle.vue";

describe("DanxDragHandle", () => {
  describe("Rendering", () => {
    it("renders a button with the default aria-label", () => {
      const wrapper = mount(DanxDragHandle);
      const button = wrapper.find("button.danx-drag-handle");

      expect(button.exists()).toBe(true);
      expect(button.attributes("aria-label")).toBe("Reorder item");
    });

    it("uses a custom label when provided", () => {
      const wrapper = mount(DanxDragHandle, { props: { label: "Reorder Alpha" } });

      expect(wrapper.find("button").attributes("aria-label")).toBe("Reorder Alpha");
    });

    it("sets aria-roledescription for screen readers", () => {
      const wrapper = mount(DanxDragHandle);

      expect(wrapper.find("button").attributes("aria-roledescription")).toBe("draggable item");
    });

    it("renders the grip icon", () => {
      const wrapper = mount(DanxDragHandle);

      expect(wrapper.find(".danx-drag-handle__icon").exists()).toBe(true);
    });

    it("forwards extra attributes (e.g. class) to the button", () => {
      const wrapper = mount(DanxDragHandle, {
        attrs: { class: "danx-drag-handle--active" },
      });

      expect(wrapper.find("button").classes()).toContain("danx-drag-handle--active");
    });
  });

  describe("Events", () => {
    it("emits dragStart with the PointerEvent on pointerdown", async () => {
      const wrapper = mount(DanxDragHandle);

      await wrapper.find("button").trigger("pointerdown");

      expect(wrapper.emitted("dragStart")).toHaveLength(1);
    });

    it("emits keydown with the KeyboardEvent on keydown", async () => {
      const wrapper = mount(DanxDragHandle);

      await wrapper.find("button").trigger("keydown", { key: " " });

      expect(wrapper.emitted("keydown")).toHaveLength(1);
      const [event] = wrapper.emitted("keydown")![0] as [KeyboardEvent];
      expect(event.key).toBe(" ");
    });
  });
});
