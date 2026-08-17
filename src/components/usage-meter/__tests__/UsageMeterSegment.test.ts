import { mount, type VueWrapper } from "@vue/test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { nextTick } from "vue";
import type { UsageMeterSegmentGeometry } from "../types";
import UsageMeterSegment from "../UsageMeterSegment.vue";

/**
 * DanxTooltip promotes its panel to the top layer via the native Popover API,
 * which happy-dom does not implement. Same mock the tooltip suite uses.
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

function geometry(overrides: Partial<UsageMeterSegmentGeometry> = {}): UsageMeterSegmentGeometry {
  return {
    id: "photos",
    label: "Photos",
    value: 40,
    variant: "",
    percent: 40,
    width: "40%",
    formattedValue: "40",
    percentLabel: "40%",
    ...overrides,
  };
}

describe("UsageMeterSegment", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  function mountSegment(props: Record<string, unknown> = {}, slots: Record<string, string> = {}) {
    wrapper = mount(UsageMeterSegment, {
      props: { segment: geometry(), ...props },
      slots,
      attachTo: document.body,
    });
    return wrapper;
  }

  describe("rendering", () => {
    it("renders a segment element sized by its geometry", () => {
      mountSegment();

      const segment = wrapper.find(".danx-usage-meter__segment");
      expect(segment.exists()).toBe(true);
      expect(segment.attributes("style")).toContain("width: 40%");
    });

    it("applies no variant tokens when the segment has no variant", () => {
      mountSegment();

      const style = wrapper.find(".danx-usage-meter__segment").attributes("style") ?? "";
      expect(style).not.toContain("--dx-variant");
    });

    it("maps a segment variant onto the segment background token", () => {
      mountSegment({ segment: geometry({ variant: "danger" }) });

      const style = wrapper.find(".danx-usage-meter__segment").attributes("style") ?? "";
      expect(style).toContain(
        "var(--dx-variant-usage-meter-danger-bg, var(--dx-variant-danger-bg))"
      );
    });

    it("lets an explicit color win over the variant", () => {
      mountSegment({ segment: geometry({ variant: "danger", color: "var(--brand-teal)" }) });

      const style = wrapper.find(".danx-usage-meter__segment").attributes("style") ?? "";
      expect(style).toContain("--dx-usage-meter-segment-bg: var(--brand-teal)");
      expect(style).not.toContain("--dx-variant-danger-bg");
    });
  });

  describe("tooltip", () => {
    async function hoverSegment() {
      // The tooltip anchors to the segment element, which only exists after
      // the template ref resolves on the first render pass.
      await nextTick();
      await wrapper.find(".danx-usage-meter__segment").trigger("mouseenter");
      await nextTick();
    }

    it("shows the label, value, and share on hover", async () => {
      mountSegment();
      await hoverSegment();

      const panel = document.body.querySelector(".danx-usage-meter__tooltip");
      expect(panel).not.toBeNull();
      expect(panel!.textContent).toContain("Photos");
      expect(panel!.textContent).toContain("40");
      expect(panel!.textContent).toContain("40%");
    });

    it("hides the tooltip again on mouseleave", async () => {
      mountSegment();
      await hoverSegment();

      await wrapper.find(".danx-usage-meter__segment").trigger("mouseleave");
      await nextTick();

      expect(document.body.querySelector(".danx-usage-meter__tooltip")).toBeNull();
    });

    it("renders custom tooltip content from the tooltip slot", async () => {
      mountSegment(
        {},
        {
          tooltip: `<template #tooltip="{ segment }"><span class="custom-tip">{{ segment.label }} detail</span></template>`,
        }
      );
      await hoverSegment();

      const panel = document.body.querySelector(".danx-usage-meter__tooltip");
      expect(panel!.querySelector(".custom-tip")).not.toBeNull();
      expect(panel!.textContent).toContain("Photos detail");
    });

    it("renders no tooltip when showTooltip is false", async () => {
      mountSegment({ showTooltip: false });
      await hoverSegment();

      expect(document.body.querySelector(".danx-usage-meter__tooltip")).toBeNull();
    });
  });
});
