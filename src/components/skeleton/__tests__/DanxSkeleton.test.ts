import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxSkeleton from "../DanxSkeleton.vue";
import type { SkeletonShape, SkeletonAnimation } from "../types";

const allAnimations: SkeletonAnimation[] = ["pulse", "wave"];

describe("DanxSkeleton", () => {
  describe("Rendering and defaults", () => {
    it("renders a div with base class and default modifiers", () => {
      const wrapper = mount(DanxSkeleton);

      expect(wrapper.element.tagName).toBe("DIV");
      expect(wrapper.classes()).toEqual(["danx-skeleton", "danx-skeleton--pulse"]);
    });

    it("defaults ariaLabel to Loading...", () => {
      const wrapper = mount(DanxSkeleton);

      expect(wrapper.find(".danx-skeleton__sr-only").text()).toBe("Loading...");
    });

    it("defaults lines to 3 for text shape", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { shape: "text" },
      });

      expect(wrapper.findAll(".danx-skeleton__line")).toHaveLength(3);
    });
  });

  describe("Shapes", () => {
    it.each(["circle", "text", "rounded"] as SkeletonShape[])(
      "renders shape %s with correct modifier class",
      (shape) => {
        const wrapper = mount(DanxSkeleton, {
          props: { shape },
        });

        expect(wrapper.classes()).toContain(`danx-skeleton--${shape}`);
      }
    );

    it("rectangle shape has no shape modifier class", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { shape: "rectangle" },
      });

      expect(wrapper.classes()).toEqual(["danx-skeleton", "danx-skeleton--pulse"]);
    });
  });

  describe("Text shape", () => {
    it("renders custom number of lines via lines prop", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { shape: "text", lines: 5 },
      });

      expect(wrapper.findAll(".danx-skeleton__line")).toHaveLength(5);
    });

    it("renders single line when lines=1", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { shape: "text", lines: 1 },
      });

      expect(wrapper.findAll(".danx-skeleton__line")).toHaveLength(1);
    });

    it("renders zero lines when lines=0", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { shape: "text", lines: 0 },
      });

      expect(wrapper.findAll(".danx-skeleton__line")).toHaveLength(0);
      expect(wrapper.classes()).toContain("danx-skeleton--text");
    });

    it.each(["rectangle", "circle", "rounded"] as SkeletonShape[])(
      "does not render lines for %s shape even when lines prop is set",
      (shape) => {
        const wrapper = mount(DanxSkeleton, {
          props: { shape, lines: 5 },
        });

        expect(wrapper.findAll(".danx-skeleton__line")).toHaveLength(0);
      }
    );
  });

  describe("Animations", () => {
    it.each(allAnimations)("renders animation %s with correct modifier class", (animation) => {
      const wrapper = mount(DanxSkeleton, {
        props: { animation },
      });

      expect(wrapper.classes()).toContain(`danx-skeleton--${animation}`);
    });
  });

  describe("Accessibility", () => {
    it("has role=status attribute", () => {
      const wrapper = mount(DanxSkeleton);

      expect(wrapper.attributes("role")).toBe("status");
    });

    it("has aria-busy=true attribute", () => {
      const wrapper = mount(DanxSkeleton);

      expect(wrapper.attributes("aria-busy")).toBe("true");
    });

    it("renders default aria label in SR-only span", () => {
      const wrapper = mount(DanxSkeleton);

      const srSpan = wrapper.find(".danx-skeleton__sr-only");
      expect(srSpan.exists()).toBe(true);
      expect(srSpan.text()).toBe("Loading...");
    });

    it("renders custom aria label", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { ariaLabel: "Loading user profile" },
      });

      const srSpan = wrapper.find(".danx-skeleton__sr-only");
      expect(srSpan.text()).toBe("Loading user profile");
    });
  });

  describe("Combined props", () => {
    it("renders text shape with wave animation", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { shape: "text", animation: "wave", lines: 4 },
      });

      expect(wrapper.classes()).toContain("danx-skeleton--text");
      expect(wrapper.classes()).toContain("danx-skeleton--wave");
      expect(wrapper.findAll(".danx-skeleton__line")).toHaveLength(4);
    });

    it("renders circle with wave animation", () => {
      const wrapper = mount(DanxSkeleton, {
        props: { shape: "circle", animation: "wave" },
      });

      expect(wrapper.classes()).toContain("danx-skeleton--circle");
      expect(wrapper.classes()).toContain("danx-skeleton--wave");
    });
  });
});
