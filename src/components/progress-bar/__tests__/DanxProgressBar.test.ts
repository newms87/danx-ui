import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { defineComponent, markRaw } from "vue";
import DanxProgressBar from "../DanxProgressBar.vue";
import type { ProgressBarType, ProgressBarSize, ProgressBarTextPosition } from "../types";
import { saveIcon } from "../../icon/icons";

const allTypes: ProgressBarType[] = ["danger", "success", "warning", "info", "muted"];
const allSizes: ProgressBarSize[] = ["sm", "md", "lg"];
const allTextPositions: ProgressBarTextPosition[] = ["inside", "above", "beside"];

describe("DanxProgressBar", () => {
  describe("Rendering", () => {
    it("renders a div wrapper with danx-progress-bar class", () => {
      const wrapper = mount(DanxProgressBar);

      expect(wrapper.element.tagName).toBe("DIV");
      expect(wrapper.classes()).toContain("danx-progress-bar");
    });

    it("renders track element", () => {
      const wrapper = mount(DanxProgressBar);

      expect(wrapper.find(".danx-progress-bar__track").exists()).toBe(true);
    });

    it("renders fill bar inside track", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50 },
      });

      expect(wrapper.find(".danx-progress-bar__fill").exists()).toBe(true);
    });

    it("sets fill width to match percent", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 75, max: 100 },
      });

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 75%");
    });

    it("displays percentage text by default", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 42 },
      });

      expect(wrapper.text()).toContain("42%");
    });

    it("rounds percent display to nearest integer", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 1, max: 3 },
      });

      // 1/3 = 33.333...%, should round to 33%
      expect(wrapper.text()).toContain("33%");
      expect(wrapper.text()).not.toContain("33.3");
    });

    it("displays 0% text and 0% fill width at default value", () => {
      const wrapper = mount(DanxProgressBar);

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 0%");
      expect(wrapper.text()).toContain("0%");
    });

    it("displays 100% at full completion", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 100, max: 100 },
      });

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 100%");
      expect(wrapper.text()).toContain("100%");
    });
  });

  describe("Value clamping", () => {
    it("clamps negative values to 0%", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: -10 },
      });

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 0%");
    });

    it("clamps values exceeding max to 100%", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 150, max: 100 },
      });

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 100%");
    });

    it("handles zero max without error", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, max: 0 },
      });

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 0%");
    });

    it("handles negative max without error", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, max: -5 },
      });

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 0%");
    });

    it("computes percent correctly with custom max", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 3, max: 10 },
      });

      const fill = wrapper.find(".danx-progress-bar__fill");
      expect(fill.attributes("style")).toContain("width: 30%");
      expect(wrapper.text()).toContain("30%");
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("applies size modifier class for size '%s'", (size) => {
      const wrapper = mount(DanxProgressBar, {
        props: { size },
      });

      expect(wrapper.classes()).toContain(`danx-progress-bar--${size}`);
    });

    it("defaults to md size", () => {
      const wrapper = mount(DanxProgressBar);

      expect(wrapper.classes()).toContain("danx-progress-bar--md");
    });
  });

  describe("Types", () => {
    it.each(allTypes)("applies type modifier class for type '%s'", (type) => {
      const wrapper = mount(DanxProgressBar, {
        props: { type },
      });

      expect(wrapper.classes()).toContain(`danx-progress-bar--${type}`);
    });

    it("does not add type modifier for blank type", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { type: "" },
      });

      const classes = wrapper.classes();
      for (const type of allTypes) {
        expect(classes).not.toContain(`danx-progress-bar--${type}`);
      }
    });

    it("customType takes precedence over type", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { type: "danger", customType: "upload" },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--upload");
      expect(wrapper.classes()).not.toContain("danx-progress-bar--danger");
    });

    it("customType works without explicit type prop", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { customType: "upload" },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--upload");
    });
  });

  describe("Text positions", () => {
    it.each(allTextPositions)("renders text in '%s' position", (position) => {
      const wrapper = mount(DanxProgressBar, {
        props: {
          value: 50,
          textPosition: position,
          size: position === "inside" ? "md" : undefined,
        },
      });

      expect(wrapper.find(`.danx-progress-bar__text--${position}`).exists()).toBe(true);
    });

    it("forces 'beside' text position when size is sm and textPosition is inside", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, textPosition: "inside", size: "sm" },
      });

      expect(wrapper.find(".danx-progress-bar__text--beside").exists()).toBe(true);
      expect(wrapper.find(".danx-progress-bar__text--inside").exists()).toBe(false);
    });

    it("forces 'beside' text position when size is sm and textPosition is above", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, textPosition: "above", size: "sm" },
      });

      expect(wrapper.find(".danx-progress-bar__text--beside").exists()).toBe(true);
      expect(wrapper.find(".danx-progress-bar__text--above").exists()).toBe(false);
    });
  });

  describe("Text alignment", () => {
    it("applies text-center alignment class by default", () => {
      const wrapper = mount(DanxProgressBar);

      expect(wrapper.classes()).toContain("danx-progress-bar--text-center");
    });

    it("applies text-left alignment class", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { textAlign: "left" },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--text-left");
    });

    it("applies text-right alignment class", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { textAlign: "right" },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--text-right");
    });
  });

  describe("showText", () => {
    it("shows text by default", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50 },
      });

      expect(wrapper.text()).toContain("50%");
    });

    it("hides text when showText is false", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, showText: false },
      });

      expect(wrapper.find(".danx-progress-bar__text--inside").exists()).toBe(false);
      expect(wrapper.find(".danx-progress-bar__text--above").exists()).toBe(false);
      expect(wrapper.find(".danx-progress-bar__text--beside").exists()).toBe(false);
    });
  });

  describe("Custom label", () => {
    it("displays custom label instead of percentage", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 3, max: 10, label: "3 of 10 files" },
      });

      expect(wrapper.text()).toContain("3 of 10 files");
      expect(wrapper.text()).not.toContain("30%");
    });

    it("displays empty string label", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, label: "" },
      });

      // The label element exists but text is empty
      expect(wrapper.find(".danx-progress-bar__text--inside").exists()).toBe(true);
      expect(wrapper.find(".danx-progress-bar__text--inside").text()).toBe("");
    });
  });

  describe("Default slot", () => {
    it("renders slot content with slot props", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 42, max: 100 },
        slots: {
          default: `<template #default="{ value, max, percent }">{{ value }}/{{ max }} ({{ percent }}%)</template>`,
        },
      });

      expect(wrapper.text()).toContain("42/100 (42%)");
    });
  });

  describe("Icon", () => {
    it("renders icon when icon prop is a raw SVG string", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, icon: saveIcon },
      });

      const iconEl = wrapper.find(".danx-progress-bar__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("does not render icon area when no icon prop and no icon slot", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50 },
      });

      expect(wrapper.find(".danx-progress-bar__icon").exists()).toBe(false);
    });

    it("renders icon slot content when provided", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50 },
        slots: {
          icon: '<span class="custom-icon">★</span>',
        },
      });

      const iconEl = wrapper.find(".danx-progress-bar__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.find(".custom-icon").exists()).toBe(true);
    });

    it("renders icon with Vue component", () => {
      const IconComp = markRaw(
        defineComponent({
          template: '<span class="vue-icon">icon</span>',
        })
      );

      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, icon: IconComp },
      });

      expect(wrapper.find(".danx-progress-bar__icon").exists()).toBe(true);
    });
  });

  describe("Buffer bar", () => {
    it("renders buffer bar when buffer > 0", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 30, buffer: 60 },
      });

      const buffer = wrapper.find(".danx-progress-bar__buffer");
      expect(buffer.exists()).toBe(true);
      expect(buffer.attributes("style")).toContain("width: 60%");
    });

    it("does not render buffer bar when buffer is 0", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 30, buffer: 0 },
      });

      expect(wrapper.find(".danx-progress-bar__buffer").exists()).toBe(false);
    });

    it("clamps buffer percent to 100%", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 30, buffer: 150, max: 100 },
      });

      const buffer = wrapper.find(".danx-progress-bar__buffer");
      expect(buffer.attributes("style")).toContain("width: 100%");
    });

    it("clamps negative buffer to 0%", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 30, buffer: -10 },
      });

      // Buffer is negative so the condition buffer > 0 is false
      expect(wrapper.find(".danx-progress-bar__buffer").exists()).toBe(false);
    });

    it("computes buffer percent correctly with custom max", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 3, buffer: 5, max: 10 },
      });

      const buffer = wrapper.find(".danx-progress-bar__buffer");
      expect(buffer.exists()).toBe(true);
      expect(buffer.attributes("style")).toContain("width: 50%");
    });

    it("handles buffer with negative max", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 30, buffer: 60, max: -5 },
      });

      // Negative max → buffer > 0 is true but bufferPercent returns 0
      const buffer = wrapper.find(".danx-progress-bar__buffer");
      expect(buffer.exists()).toBe(true);
      expect(buffer.attributes("style")).toContain("width: 0%");
    });
  });

  describe("Indeterminate mode", () => {
    it("renders indeterminate bar when indeterminate is true", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { indeterminate: true },
      });

      expect(wrapper.find(".danx-progress-bar__indeterminate").exists()).toBe(true);
    });

    it("does not render fill or buffer when indeterminate", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { indeterminate: true, value: 50, buffer: 30 },
      });

      expect(wrapper.find(".danx-progress-bar__fill").exists()).toBe(false);
      expect(wrapper.find(".danx-progress-bar__buffer").exists()).toBe(false);
    });

    it("does not render indeterminate bar in determinate mode", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50 },
      });

      expect(wrapper.find(".danx-progress-bar__indeterminate").exists()).toBe(false);
    });

    it("renders no text elements when indeterminate and showText is false", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { indeterminate: true, showText: false },
      });

      expect(wrapper.find(".danx-progress-bar__text--inside").exists()).toBe(false);
      expect(wrapper.find(".danx-progress-bar__text--above").exists()).toBe(false);
      expect(wrapper.find(".danx-progress-bar__text--beside").exists()).toBe(false);
    });
  });

  describe("Effect classes", () => {
    it("applies striped class", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, striped: true },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--striped");
    });

    it("applies animate-stripes class", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, animateStripes: true },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--animate-stripes");
    });

    it("applies glow class", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, glow: true },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--glow");
    });

    it("applies shimmer class", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, shimmer: true },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--shimmer");
    });

    it("applies gradient class", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, gradient: true },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--gradient");
    });

    it("applies multiple effect classes simultaneously", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50, striped: true, glow: true, shimmer: true },
      });

      expect(wrapper.classes()).toContain("danx-progress-bar--striped");
      expect(wrapper.classes()).toContain("danx-progress-bar--glow");
      expect(wrapper.classes()).toContain("danx-progress-bar--shimmer");
    });

    it("does not apply effect classes when false", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 50 },
      });

      expect(wrapper.classes()).not.toContain("danx-progress-bar--striped");
      expect(wrapper.classes()).not.toContain("danx-progress-bar--animate-stripes");
      expect(wrapper.classes()).not.toContain("danx-progress-bar--glow");
      expect(wrapper.classes()).not.toContain("danx-progress-bar--shimmer");
      expect(wrapper.classes()).not.toContain("danx-progress-bar--gradient");
    });
  });

  describe("ARIA accessibility", () => {
    it("has role=progressbar", () => {
      const wrapper = mount(DanxProgressBar);

      expect(wrapper.attributes("role")).toBe("progressbar");
    });

    it("sets aria-valuenow to current value", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { value: 65 },
      });

      expect(wrapper.attributes("aria-valuenow")).toBe("65");
    });

    it("sets aria-valuemin to 0", () => {
      const wrapper = mount(DanxProgressBar);

      expect(wrapper.attributes("aria-valuemin")).toBe("0");
    });

    it("sets aria-valuemax to max prop", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { max: 200 },
      });

      expect(wrapper.attributes("aria-valuemax")).toBe("200");
    });

    it("sets aria-label when provided", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { ariaLabel: "Upload progress" },
      });

      expect(wrapper.attributes("aria-label")).toBe("Upload progress");
    });

    it("omits aria-valuenow in indeterminate mode", () => {
      const wrapper = mount(DanxProgressBar, {
        props: { indeterminate: true },
      });

      expect(wrapper.attributes("aria-valuenow")).toBeUndefined();
    });
  });
});
