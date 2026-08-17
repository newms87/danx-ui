import { mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import { expectNoA11yViolations } from "../../../shared/testing/expectNoA11yViolations";
import DanxUsageMeter from "../DanxUsageMeter.vue";
import type { UsageMeterSegment, UsageMeterSize } from "../types";

/**
 * DanxTooltip promotes its panel to the top layer via the native Popover API,
 * which happy-dom does not implement.
 */
const popoverOpenState = new WeakMap<HTMLElement, boolean>();
const origMatches = HTMLElement.prototype.matches;

beforeEach(() => {
  HTMLElement.prototype.showPopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, true);
  });
  HTMLElement.prototype.hidePopover = vi.fn(function (this: HTMLElement) {
    popoverOpenState.set(this, false);
  });
  HTMLElement.prototype.matches = function (selector: string) {
    if (selector === ":popover-open") return popoverOpenState.get(this) ?? false;
    return origMatches.call(this, selector);
  };
});

afterEach(() => {
  HTMLElement.prototype.showPopover = undefined as unknown as () => void;
  HTMLElement.prototype.hidePopover = undefined as unknown as () => void;
  HTMLElement.prototype.matches = origMatches;
  document.body.querySelectorAll(".danx-tooltip").forEach((el) => el.remove());
});

const segments: UsageMeterSegment[] = [
  { id: "photos", label: "Photos", value: 40 },
  { id: "video", label: "Video", value: 20, variant: "warning" },
];

const allSizes: UsageMeterSize[] = ["sm", "md", "lg"];

describe("DanxUsageMeter", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountMeter(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    wrapper = mount(DanxUsageMeter, {
      props: { segments, total: 100, ...props },
      slots,
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders the meter wrapper with the base class", () => {
      mountMeter();

      expect(wrapper.classes()).toContain("danx-usage-meter");
    });

    it("renders one element per segment, in order, sized proportionally", () => {
      mountMeter();

      const rendered = wrapper.findAll(".danx-usage-meter__segment");
      expect(rendered).toHaveLength(2);
      expect(rendered[0]!.attributes("style")).toContain("width: 40%");
      expect(rendered[1]!.attributes("style")).toContain("width: 20%");
    });

    it("renders the unused capacity as remaining track space", () => {
      mountMeter();

      const remaining = wrapper.find(".danx-usage-meter__remaining");
      expect(remaining.exists()).toBe(true);
      expect(remaining.attributes("style")).toContain("width: 40%");
    });

    it("renders no segments when the list is empty", () => {
      mountMeter({ segments: [] });

      expect(wrapper.findAll(".danx-usage-meter__segment")).toHaveLength(0);
      expect(wrapper.find(".danx-usage-meter__remaining").attributes("style")).toContain(
        "width: 100%"
      );
    });

    it("renders with no props beyond the defaults", () => {
      wrapper = mount(DanxUsageMeter);

      expect(wrapper.find(".danx-usage-meter__track").exists()).toBe(true);
      expect(wrapper.text()).toContain("0 / 0 (0%)");
      expect(wrapper.text()).not.toContain("NaN");
    });
  });

  describe("header", () => {
    it("renders the label and the readout", () => {
      mountMeter({ label: "Storage" });

      expect(wrapper.find(".danx-usage-meter__label").text()).toBe("Storage");
      expect(wrapper.find(".danx-usage-meter__readout").text()).toBe("60 / 100 (60%)");
    });

    it("omits the label element when no label is supplied", () => {
      mountMeter();

      expect(wrapper.find(".danx-usage-meter__label").exists()).toBe(false);
      expect(wrapper.find(".danx-usage-meter__readout").exists()).toBe(true);
    });

    it("omits the readout when showReadout is false", () => {
      mountMeter({ label: "Storage", showReadout: false });

      expect(wrapper.find(".danx-usage-meter__readout").exists()).toBe(false);
      expect(wrapper.find(".danx-usage-meter__label").exists()).toBe(true);
    });

    it("omits the header entirely when there is nothing to show", () => {
      mountMeter({ showReadout: false });

      expect(wrapper.find(".danx-usage-meter__header").exists()).toBe(false);
    });

    it("formats the readout with a custom formatValue", () => {
      mountMeter({ total: 512, formatValue: (value: number) => `${value} GB` });

      expect(wrapper.find(".danx-usage-meter__readout").text()).toBe("60 GB / 512 GB (12%)");
    });

    it("abbreviates large numbers by default", () => {
      mountMeter({
        segments: [{ id: "a", label: "A", value: 355400 }],
        total: 1_000_000,
      });

      expect(wrapper.find(".danx-usage-meter__readout").text()).toBe("355.4k / 1M (36%)");
    });
  });

  describe("sizes", () => {
    it.each(allSizes)("applies the %s size modifier", (size) => {
      mountMeter({ size });

      expect(wrapper.classes()).toContain(`danx-usage-meter--${size}`);
    });

    it("defaults to the md size", () => {
      mountMeter();

      expect(wrapper.classes()).toContain("danx-usage-meter--md");
    });
  });

  describe("variants", () => {
    it("applies the meter variant to segments without their own", () => {
      mountMeter({ variant: "info" });

      const style = wrapper.findAll(".danx-usage-meter__segment")[0]!.attributes("style") ?? "";
      expect(style).toContain("var(--dx-variant-usage-meter-info-bg, var(--dx-variant-info-bg))");
    });

    it("keeps a segment's own variant over the meter variant", () => {
      mountMeter({ variant: "info" });

      const style = wrapper.findAll(".danx-usage-meter__segment")[1]!.attributes("style") ?? "";
      expect(style).toContain(
        "var(--dx-variant-usage-meter-warning-bg, var(--dx-variant-warning-bg))"
      );
    });

    it("applies an explicit segment color", () => {
      mountMeter({
        segments: [{ id: "a", label: "A", value: 10, color: "var(--brand-teal)" }],
      });

      const style = wrapper.find(".danx-usage-meter__segment").attributes("style") ?? "";
      expect(style).toContain("--dx-usage-meter-segment-bg: var(--brand-teal)");
    });
  });

  describe("over capacity", () => {
    it("flags the meter and reports the true percentage", () => {
      mountMeter({ segments: [{ id: "a", label: "A", value: 150 }], total: 100 });

      expect(wrapper.classes()).toContain("danx-usage-meter--over-capacity");
      expect(wrapper.find(".danx-usage-meter__readout").text()).toBe("150 / 100 (150%)");
      expect(wrapper.find(".danx-usage-meter__segment").attributes("style")).toContain(
        "width: 100%"
      );
    });

    it("is not flagged while usage stays within the total", () => {
      mountMeter();

      expect(wrapper.classes()).not.toContain("danx-usage-meter--over-capacity");
    });
  });

  describe("zero total", () => {
    it("renders a sane empty meter instead of NaN%", () => {
      mountMeter({ segments: [], total: 0, label: "Empty" });

      expect(wrapper.find(".danx-usage-meter__readout").text()).toBe("0 / 0 (0%)");
      expect(wrapper.text()).not.toContain("NaN");
      expect(wrapper.find(".danx-usage-meter__track").attributes("aria-valuemax")).toBe("0");
    });
  });

  describe("accessibility", () => {
    it("exposes progressbar semantics on the track", () => {
      mountMeter({ label: "Storage" });

      const track = wrapper.find(".danx-usage-meter__track");
      expect(track.attributes("role")).toBe("progressbar");
      expect(track.attributes("aria-valuenow")).toBe("60");
      expect(track.attributes("aria-valuemin")).toBe("0");
      expect(track.attributes("aria-valuemax")).toBe("100");
      expect(track.attributes("aria-valuetext")).toBe("60 / 100 (60%)");
    });

    it("names the meter with ariaLabel when supplied", () => {
      mountMeter({ label: "Storage", ariaLabel: "Storage quota consumption" });

      expect(wrapper.find(".danx-usage-meter__track").attributes("aria-label")).toBe(
        "Storage quota consumption"
      );
    });

    it("falls back to the visible label for the accessible name", () => {
      mountMeter({ label: "Storage" });

      expect(wrapper.find(".danx-usage-meter__track").attributes("aria-label")).toBe("Storage");
    });

    it("always has an accessible name even with no label", () => {
      mountMeter();

      expect(wrapper.find(".danx-usage-meter__track").attributes("aria-label")).toBe("Usage");
    });

    it("has no axe violations", async () => {
      mountMeter({ label: "Storage" });

      await expectNoA11yViolations(wrapper.element);
    });
  });

  describe("tooltips", () => {
    async function hoverFirstSegment() {
      // Segment tooltips anchor to the segment element, which only exists
      // after the template refs resolve on the first render pass.
      await nextTick();
      await wrapper.findAll(".danx-usage-meter__segment")[0]!.trigger("mouseenter");
      await nextTick();
    }

    it("shows a tooltip with the segment label, value, and share", async () => {
      mountMeter();
      await hoverFirstSegment();

      const panel = document.body.querySelector(".danx-usage-meter__tooltip");
      expect(panel).not.toBeNull();
      expect(panel!.textContent).toContain("Photos");
      expect(panel!.textContent).toContain("40%");
    });

    it("forwards the tooltip slot to every segment", async () => {
      mountMeter(
        {},
        {
          tooltip: `<template #tooltip="{ segment }"><span class="custom-tip">{{ segment.label }} uses {{ segment.formattedValue }}</span></template>`,
        }
      );
      await hoverFirstSegment();

      const panel = document.body.querySelector(".danx-usage-meter__tooltip");
      expect(panel!.querySelector(".custom-tip")).not.toBeNull();
      expect(panel!.textContent).toContain("Photos uses 40");
    });

    it("renders no tooltips when showTooltips is false", async () => {
      mountMeter({ showTooltips: false });
      await hoverFirstSegment();

      expect(document.body.querySelector(".danx-usage-meter__tooltip")).toBeNull();
    });
  });

  describe("slots", () => {
    it("replaces the heading via the label slot", () => {
      mountMeter(
        { label: "Storage" },
        { label: `<template #label="{ formattedTotal }">Quota of {{ formattedTotal }}</template>` }
      );

      expect(wrapper.find(".danx-usage-meter__label").text()).toBe("Quota of 100");
    });

    it("renders the label slot even without a label prop", () => {
      mountMeter({}, { label: `<template #label>Custom heading</template>` });

      expect(wrapper.find(".danx-usage-meter__label").text()).toBe("Custom heading");
    });

    it("replaces the readout via the readout slot", () => {
      mountMeter(
        {},
        {
          readout: `<template #readout="{ formattedRemaining, percentLabel }">{{ formattedRemaining }} free · {{ percentLabel }} used</template>`,
        }
      );

      expect(wrapper.find(".danx-usage-meter__readout").text()).toBe("40 free · 60% used");
    });
  });

  describe("reactivity", () => {
    it("resizes segments when the props change", async () => {
      mountMeter();

      await wrapper.setProps({
        segments: [{ id: "photos", label: "Photos", value: 80 }],
        total: 160,
      });

      expect(wrapper.find(".danx-usage-meter__segment").attributes("style")).toContain(
        "width: 50%"
      );
      expect(wrapper.find(".danx-usage-meter__readout").text()).toBe("80 / 160 (50%)");
    });
  });
});
