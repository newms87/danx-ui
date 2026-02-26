import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, nextTick } from "vue";
import DanxFileActions from "../DanxFileActions.vue";
import { makeFile } from "./test-helpers";

function mountActions(props: Record<string, unknown> = {}) {
  return mount(DanxFileActions, {
    props: {
      file: makeFile(),
      downloadable: false,
      removable: false,
      ...props,
    },
  });
}

describe("DanxFileActions", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Download button", () => {
    it("shows download button when downloadable", () => {
      const wrapper = mountActions({ downloadable: true });
      expect(wrapper.find(".danx-file__action-btn--download").exists()).toBe(true);
    });

    it("hides download button when not downloadable", () => {
      const wrapper = mountActions();
      expect(wrapper.find(".danx-file__action-btn--download").exists()).toBe(false);
    });

    it("emits download event with preventable event object", async () => {
      const file = makeFile();
      const wrapper = mountActions({ file, downloadable: true });
      await wrapper.find(".danx-file__action-btn--download").trigger("click");
      const emitted = wrapper.emitted("download");
      expect(emitted).toHaveLength(1);
      expect(emitted![0]![0]).toMatchObject({ file, prevented: false });
    });
  });

  describe("Remove button", () => {
    it("shows remove button when removable", () => {
      const wrapper = mountActions({ removable: true });
      expect(wrapper.find(".danx-file__action-btn--remove").exists()).toBe(true);
    });

    it("hides remove button when not removable", () => {
      const wrapper = mountActions();
      expect(wrapper.find(".danx-file__action-btn--remove").exists()).toBe(false);
    });

    it("arms on first click, confirms on second", async () => {
      const file = makeFile();
      const wrapper = mountActions({ file, removable: true });
      const btn = wrapper.find(".danx-file__action-btn--remove");

      // First click arms
      await btn.trigger("click");
      expect(wrapper.emitted("remove")).toBeUndefined();
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(true);

      // Second click confirms
      await btn.trigger("click");
      expect(wrapper.emitted("remove")).toEqual([[file]]);
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(false);
    });

    it("auto-disarms after 3 second timeout", async () => {
      const wrapper = mountActions({ removable: true });
      const btn = wrapper.find(".danx-file__action-btn--remove");

      await btn.trigger("click");
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(true);

      vi.advanceTimersByTime(3000);
      await nextTick();

      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(false);
    });

    it("cleans up timer on unmount without errors", async () => {
      const wrapper = mountActions({ removable: true });
      const btn = wrapper.find(".danx-file__action-btn--remove");

      await btn.trigger("click");
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(true);

      wrapper.unmount();

      // Should not throw
      vi.advanceTimersByTime(5000);
    });
  });

  describe("Both buttons", () => {
    it("renders both download and remove simultaneously", () => {
      const wrapper = mountActions({ downloadable: true, removable: true });
      expect(wrapper.findAll(".danx-file__action-btn").length).toBe(2);
    });
  });

  describe("Actions slot", () => {
    it("renders slot content", () => {
      const wrapper = mount(DanxFileActions, {
        props: { file: makeFile(), downloadable: false, removable: false },
        slots: { actions: "<button class='custom-action'>Custom</button>" },
      });
      expect(wrapper.find(".custom-action").exists()).toBe(true);
    });
  });

  describe("Click propagation", () => {
    it("stops click propagation from actions container", async () => {
      const parentClickHandler = vi.fn();
      const Parent = defineComponent({
        components: { DanxFileActions },
        template: `<div @click="onClick"><DanxFileActions :file="file" :downloadable="true" :removable="false" /></div>`,
        setup() {
          return { file: makeFile(), onClick: parentClickHandler };
        },
      });
      const wrapper = mount(Parent);
      await wrapper.find(".danx-file__action-btn--download").trigger("click");
      expect(parentClickHandler).not.toHaveBeenCalled();
    });
  });
});
