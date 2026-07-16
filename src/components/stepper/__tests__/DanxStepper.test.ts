import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent, markRaw } from "vue";
import DanxStepper from "../DanxStepper.vue";
import { saveIcon } from "../../icon/icons";
import type { DanxStep } from "../types";

/** Helper to create a basic set of steps */
function createSteps(overrides: Partial<DanxStep>[] = []): DanxStep[] {
  const defaults: DanxStep[] = [
    { label: "Step One" },
    { label: "Step Two" },
    { label: "Step Three" },
  ];
  return defaults.map((step, i) => ({ ...step, ...overrides[i] }));
}

describe("DanxStepper", () => {
  describe("Rendering", () => {
    it("renders a container with danx-stepper class", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      expect(wrapper.find(".danx-stepper").exists()).toBe(true);
    });

    it("renders one item per step", () => {
      const steps = createSteps();
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps },
      });

      expect(wrapper.findAll(".danx-stepper__step")).toHaveLength(steps.length);
    });

    it("renders step labels", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      expect(wrapper.text()).toContain("Step One");
      expect(wrapper.text()).toContain("Step Two");
      expect(wrapper.text()).toContain("Step Three");
    });

    it("renders step descriptions when provided", () => {
      const steps = createSteps([{ description: "First description" }]);
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps },
      });

      expect(wrapper.find(".danx-stepper__description").exists()).toBe(true);
      expect(wrapper.text()).toContain("First description");
    });

    it("omits description element when absent", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      expect(wrapper.find(".danx-stepper__description").exists()).toBe(false);
    });

    it("renders with a single step", () => {
      const wrapper = mount(DanxStepper, {
        props: {
          modelValue: 0,
          "onUpdate:modelValue": () => {},
          steps: [{ label: "Only Step" }],
        },
      });

      expect(wrapper.findAll(".danx-stepper__step")).toHaveLength(1);
    });

    it("renders index numbers for steps without icons", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      const indicators = wrapper.findAll(".danx-stepper__indicator");
      expect(indicators[0]!.text()).toBe("1");
      expect(indicators[2]!.text()).toBe("3");
    });
  });

  describe("Icons", () => {
    it("renders DanxIcon when step has icon prop (SVG string)", () => {
      const steps: DanxStep[] = [{ label: "A", icon: saveIcon }];
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps },
      });

      const iconEl = wrapper.find(".danx-stepper__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("renders DanxIcon when step has icon as Component", () => {
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "custom-icon" }, "X");
          },
        })
      );
      const steps: DanxStep[] = [{ label: "A", icon: CustomIcon }];
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps },
      });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });

    it("renders a checkmark icon for complete steps without an explicit icon", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 2, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      const indicators = wrapper.findAll(".danx-stepper__indicator");
      expect(indicators[0]!.find(".danx-stepper__icon").exists()).toBe(true);
      expect(indicators[0]!.text()).not.toContain("1");
    });

    it("step icon takes precedence over the complete checkmark", () => {
      const steps: DanxStep[] = [{ label: "A", icon: saveIcon }, { label: "B" }];
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 1, "onUpdate:modelValue": () => {}, steps },
      });

      const indicators = wrapper.findAll(".danx-stepper__indicator");
      expect(indicators[0]!.find(".danx-stepper__icon").exists()).toBe(true);
    });
  });

  describe("Status derivation", () => {
    it("marks steps before the active index as complete", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 2, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      const items = wrapper.findAll(".danx-stepper__step");
      expect(items[0]!.classes()).toContain("is-complete");
      expect(items[1]!.classes()).toContain("is-complete");
    });

    it("marks the active index as active", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 1, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      const items = wrapper.findAll(".danx-stepper__step");
      expect(items[1]!.classes()).toContain("is-active");
      expect(items[1]!.attributes()).toBeDefined();
    });

    it("sets aria-current=step on the active indicator", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 1, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      const indicators = wrapper.findAll(".danx-stepper__indicator");
      expect(indicators[1]!.attributes("aria-current")).toBe("step");
      expect(indicators[0]!.attributes("aria-current")).toBeUndefined();
    });

    it("marks steps after the active index as upcoming", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      const items = wrapper.findAll(".danx-stepper__step");
      expect(items[1]!.classes()).toContain("is-upcoming");
      expect(items[2]!.classes()).toContain("is-upcoming");
    });

    it("honors an explicit status override", () => {
      const steps = createSteps([{ status: "error" }]);
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 1, "onUpdate:modelValue": () => {}, steps },
      });

      const items = wrapper.findAll(".danx-stepper__step");
      expect(items[0]!.classes()).toContain("is-error");
    });
  });

  describe("Orientation", () => {
    it("defaults to horizontal (no is-vertical class)", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      expect(wrapper.find(".danx-stepper").classes()).not.toContain("is-vertical");
    });

    it("applies is-vertical class when orientation is vertical", () => {
      const wrapper = mount(DanxStepper, {
        props: {
          modelValue: 0,
          "onUpdate:modelValue": () => {},
          steps: createSteps(),
          orientation: "vertical",
        },
      });

      expect(wrapper.find(".danx-stepper").classes()).toContain("is-vertical");
    });
  });

  describe("Clickable navigation", () => {
    it("renders indicators as div elements when not clickable", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      const indicators = wrapper.findAll(".danx-stepper__indicator");
      expect(indicators[0]!.element.tagName).toBe("DIV");
    });

    it("renders indicators as button elements when clickable", () => {
      const wrapper = mount(DanxStepper, {
        props: {
          modelValue: 0,
          "onUpdate:modelValue": () => {},
          steps: createSteps(),
          clickable: true,
        },
      });

      const indicators = wrapper.findAll(".danx-stepper__indicator");
      expect(indicators[0]!.element.tagName).toBe("BUTTON");
      expect(indicators[0]!.attributes("type")).toBe("button");
    });

    it("applies is-clickable class to steps when clickable", () => {
      const wrapper = mount(DanxStepper, {
        props: {
          modelValue: 0,
          "onUpdate:modelValue": () => {},
          steps: createSteps(),
          clickable: true,
        },
      });

      expect(wrapper.findAll(".danx-stepper__step")[0]!.classes()).toContain("is-clickable");
    });

    it("does not emit update:modelValue or step-change when not clickable", async () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps: createSteps() },
      });

      await wrapper.findAll(".danx-stepper__indicator")[2]!.trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
      expect(wrapper.emitted("stepChange")).toBeUndefined();
    });

    it("emits update:modelValue and step-change with the clicked index when clickable", async () => {
      const wrapper = mount(DanxStepper, {
        props: {
          modelValue: 0,
          "onUpdate:modelValue": () => {},
          steps: createSteps(),
          clickable: true,
        },
      });

      await wrapper.findAll(".danx-stepper__indicator")[2]!.trigger("click");

      expect(wrapper.emitted("update:modelValue")).toBeTruthy();
      expect(wrapper.emitted("update:modelValue")![0]).toEqual([2]);
      expect(wrapper.emitted("stepChange")).toBeTruthy();
      expect(wrapper.emitted("stepChange")![0]).toEqual([2]);
    });
  });

  describe("Connectors", () => {
    it("renders one fewer connector than steps", () => {
      const steps = createSteps();
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps },
      });

      expect(wrapper.findAll(".danx-stepper__connector")).toHaveLength(steps.length - 1);
    });

    it("renders no connector for a single step", () => {
      const wrapper = mount(DanxStepper, {
        props: {
          modelValue: 0,
          "onUpdate:modelValue": () => {},
          steps: [{ label: "Only" }],
        },
      });

      expect(wrapper.findAll(".danx-stepper__connector")).toHaveLength(0);
    });
  });

  describe("Slots", () => {
    it("label slot replaces default label and description content", () => {
      const steps: DanxStep[] = [{ label: "A", description: "desc" }];
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 0, "onUpdate:modelValue": () => {}, steps },
        slots: {
          label: ({ step, status }: { step: DanxStep; status: string }) =>
            h("span", { class: "custom-label" }, `${step.label}-${status}`),
        },
      });

      expect(wrapper.find(".custom-label").exists()).toBe(true);
      expect(wrapper.find(".custom-label").text()).toBe("A-active");
      expect(wrapper.find(".danx-stepper__label").exists()).toBe(false);
    });

    it("label slot receives the correct index for each step", () => {
      const steps = createSteps();
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 1, "onUpdate:modelValue": () => {}, steps },
        slots: {
          label: ({ index }: { index: number }) => h("span", { class: `idx-${index}` }, `${index}`),
        },
      });

      expect(wrapper.find(".idx-0").exists()).toBe(true);
      expect(wrapper.find(".idx-1").exists()).toBe(true);
      expect(wrapper.find(".idx-2").exists()).toBe(true);
    });

    it("connector slot replaces connector content", () => {
      const wrapper = mount(DanxStepper, {
        props: { modelValue: 1, "onUpdate:modelValue": () => {}, steps: createSteps() },
        slots: {
          connector: ({ index, status }: { index: number; status: string }) =>
            h("span", { class: "custom-connector" }, `${index}-${status}`),
        },
      });

      const customConnectors = wrapper.findAll(".custom-connector");
      expect(customConnectors).toHaveLength(2);
      expect(customConnectors[0]!.text()).toBe("0-complete");
    });
  });
});
