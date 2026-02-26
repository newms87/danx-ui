import { mount } from "@vue/test-utils";
import { describe, it, expect } from "vitest";
import DanxFileProgress from "../DanxFileProgress.vue";
import { DanxProgressBar } from "../../progress-bar";
import { makeFile } from "./test-helpers";

function mountProgress(props: Record<string, unknown> = {}) {
  return mount(DanxFileProgress, {
    props: {
      file: makeFile({ progress: 50 }),
      isXsSize: false,
      ...props,
    },
  });
}

describe("DanxFileProgress", () => {
  describe("Standard (non-xs) mode", () => {
    it("renders progress text with default message", () => {
      const wrapper = mountProgress({
        file: makeFile({ progress: 45 }),
      });
      expect(wrapper.find(".danx-file__progress-text").text()).toBe("Uploading... 45%");
    });

    it("renders custom statusMessage", () => {
      const wrapper = mountProgress({
        file: makeFile({ progress: 70, statusMessage: "Converting..." }),
      });
      expect(wrapper.find(".danx-file__progress-text").text()).toBe("Converting...");
    });

    it("renders DanxProgressBar with correct value", () => {
      const wrapper = mountProgress({
        file: makeFile({ progress: 60 }),
      });
      const bar = wrapper.findComponent(DanxProgressBar);
      expect(bar.exists()).toBe(true);
      expect(bar.props("value")).toBe(60);
      expect(bar.props("striped")).toBe(true);
      expect(bar.props("animateStripes")).toBe(true);
    });

    it("shows 0% when progress is 0", () => {
      const wrapper = mountProgress({
        file: makeFile({ progress: 0 }),
      });
      expect(wrapper.find(".danx-file__progress-text").text()).toBe("Uploading... 0%");
    });

    it("defaults to 0% when progress is null", () => {
      const wrapper = mountProgress({
        file: makeFile({ progress: null }),
      });
      expect(wrapper.find(".danx-file__progress-text").text()).toBe("Uploading... 0%");
    });

    it("does not apply compact class", () => {
      const wrapper = mountProgress();
      expect(wrapper.find(".danx-file__progress--compact").exists()).toBe(false);
    });
  });

  describe("Compact (xs) mode", () => {
    it("applies compact class", () => {
      const wrapper = mountProgress({ isXsSize: true });
      expect(wrapper.find(".danx-file__progress--compact").exists()).toBe(true);
    });

    it("does not show progress text", () => {
      const wrapper = mountProgress({ isXsSize: true });
      expect(wrapper.find(".danx-file__progress-text").exists()).toBe(false);
    });

    it("renders DanxProgressBar without stripes", () => {
      const wrapper = mountProgress({ isXsSize: true });
      const bar = wrapper.findComponent(DanxProgressBar);
      expect(bar.exists()).toBe(true);
      expect(bar.props("striped")).toBeFalsy();
    });

    it("renders clock icon", () => {
      const wrapper = mountProgress({ isXsSize: true });
      const icon = wrapper.findComponent({ name: "DanxIcon" });
      expect(icon.exists()).toBe(true);
      expect(icon.props("icon")).toBe("clock");
    });
  });
});
