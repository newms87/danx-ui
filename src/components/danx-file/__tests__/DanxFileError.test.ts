import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import { defineComponent } from "vue";
import DanxFileError from "../DanxFileError.vue";
import { makeFile } from "./test-helpers";

function mountError(props: Record<string, unknown> = {}) {
  return mount(DanxFileError, {
    props: {
      file: makeFile({ error: "Upload failed" }),
      isCompactDisplay: false,
      ...props,
    },
  });
}

describe("DanxFileError", () => {
  describe("Full (non-compact) mode", () => {
    it("renders error text", () => {
      const wrapper = mountError();
      expect(wrapper.find(".danx-file__error-text").text()).toBe("Upload failed");
    });

    it("renders warning icon", () => {
      const wrapper = mountError();
      const icon = wrapper.findComponent({ name: "DanxIcon" });
      expect(icon.exists()).toBe(true);
      expect(icon.props("icon")).toBe("warning-triangle");
    });

    it("does not render popover", () => {
      const wrapper = mountError();
      expect(wrapper.find(".danx-file__error-popover").exists()).toBe(false);
    });

    it("does not apply compact class", () => {
      const wrapper = mountError();
      expect(wrapper.find(".danx-file__error--compact").exists()).toBe(false);
    });
  });

  describe("Compact mode", () => {
    it("renders compact error with popover", () => {
      const wrapper = mountError({ isCompactDisplay: true });
      expect(wrapper.find(".danx-file__error--compact").exists()).toBe(true);
    });

    it("renders DanxPopover with danger variant", () => {
      const wrapper = mountError({ isCompactDisplay: true });
      const popover = wrapper.findComponent({ name: "DanxPopover" });
      expect(popover.exists()).toBe(true);
      expect(popover.props("trigger")).toBe("hover");
      expect(popover.props("placement")).toBe("top");
      expect(popover.props("variant")).toBe("danger");
    });

    it("does not render error text inline", () => {
      const wrapper = mountError({ isCompactDisplay: true });
      expect(wrapper.find(".danx-file__error-text").exists()).toBe(false);
    });

    it("passes error message through popover content", () => {
      const AlwaysOpenPopover = defineComponent({
        template: "<div><slot name='trigger' /><slot /></div>",
      });
      const wrapper = mount(DanxFileError, {
        props: {
          file: makeFile({ error: "Upload failed" }),
          isCompactDisplay: true,
        },
        global: {
          stubs: { DanxPopover: AlwaysOpenPopover },
        },
      });
      expect(wrapper.text()).toContain("Upload failed");
    });
  });
});
