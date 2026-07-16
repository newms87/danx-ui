import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import DanxAccordion from "../DanxAccordion.vue";
import type { AccordionItem, DanxAccordionProps } from "../types";
import { expectNoA11yViolations } from "../../../shared/testing/expectNoA11yViolations";

function createItems(overrides: Partial<AccordionItem>[] = []): AccordionItem[] {
  const defaults: AccordionItem[] = [
    { value: "one", label: "Section One" },
    { value: "two", label: "Section Two" },
    { value: "three", label: "Section Three" },
  ];
  return defaults.map((item, i) => ({ ...item, ...overrides[i] }));
}

interface AccordionTestProps extends DanxAccordionProps {
  modelValue?: string | string[] | null;
}

/** @vue/test-utils stubs <Transition> by default — disable so the panel actually mounts/unmounts. */
function mountAccordion(props: AccordionTestProps) {
  return mount(DanxAccordion, { props, global: { stubs: { transition: false } } });
}

/** CollapseTransition's enter/leave hooks only resolve on the `height` property. */
function heightTransitionEnd(): Event {
  const event = new Event("transitionend");
  Object.defineProperty(event, "propertyName", { value: "height" });
  return event;
}

describe("DanxAccordion", () => {
  describe("Rendering", () => {
    it("renders a container with danx-accordion class", () => {
      const wrapper = mountAccordion({ modelValue: null, items: createItems() });
      expect(wrapper.find(".danx-accordion").exists()).toBe(true);
    });

    it("renders one item per entry", () => {
      const items = createItems();
      const wrapper = mountAccordion({ modelValue: null, items });
      expect(wrapper.findAll(".danx-accordion__item")).toHaveLength(items.length);
    });

    it("renders item.label as the default header content", () => {
      const wrapper = mountAccordion({ modelValue: null, items: createItems() });
      expect(wrapper.find(".danx-accordion__header").text()).toContain("Section One");
    });

    it("renders no panel for closed items", () => {
      const wrapper = mountAccordion({ modelValue: null, items: createItems() });
      expect(wrapper.find(".danx-accordion__panel").exists()).toBe(false);
    });

    it("renders a panel for the open item (single mode)", () => {
      const wrapper = mountAccordion({ modelValue: "one", items: createItems() });
      expect(wrapper.findAll(".danx-accordion__panel")).toHaveLength(1);
    });

    it("renders a panel per open item (multiple mode)", () => {
      const wrapper = mountAccordion({
        modelValue: ["one", "two"],
        items: createItems(),
        multiple: true,
      });
      expect(wrapper.findAll(".danx-accordion__panel")).toHaveLength(2);
    });
  });

  describe("Slots", () => {
    it("renders custom header slot content, replacing the label", () => {
      const wrapper = mount(DanxAccordion, {
        props: { modelValue: null, items: createItems() },
        global: { stubs: { transition: false } },
        slots: { header: "<b>Custom Header</b>" },
      });
      expect(wrapper.find(".danx-accordion__header-content b").text()).toBe("Custom Header");
    });

    it("passes item and isOpen to the panel slot", () => {
      const wrapper = mount(DanxAccordion, {
        props: { modelValue: "one", items: createItems() },
        global: { stubs: { transition: false } },
        slots: {
          panel: `<template #panel="{ item, isOpen }">{{ item.value }}:{{ isOpen }}</template>`,
        },
      });
      expect(wrapper.find(".danx-accordion__panel").text()).toBe("one:true");
    });
  });

  describe("Single-open mode", () => {
    it("opens a closed item on click", async () => {
      const wrapper = mountAccordion({ modelValue: null, items: createItems() });
      await wrapper.find(".danx-accordion__header").trigger("click");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["one"]);
    });

    it("closes the open item on click", async () => {
      const wrapper = mountAccordion({ modelValue: "one", items: createItems() });
      await wrapper.find(".danx-accordion__header").trigger("click");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([null]);
    });

    it("switches the open item to the newly clicked one", async () => {
      const wrapper = mountAccordion({ modelValue: "one", items: createItems() });
      const headers = wrapper.findAll(".danx-accordion__header");
      await headers[1]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["two"]);
    });
  });

  describe("Multiple mode", () => {
    it("adds an item to the open set on click", async () => {
      const wrapper = mountAccordion({ modelValue: ["one"], items: createItems(), multiple: true });
      const headers = wrapper.findAll(".danx-accordion__header");
      await headers[1]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["one", "two"]]);
    });

    it("removes an item from the open set on click", async () => {
      const wrapper = mountAccordion({
        modelValue: ["one", "two"],
        items: createItems(),
        multiple: true,
      });
      const headers = wrapper.findAll(".danx-accordion__header");
      await headers[0]!.trigger("click");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual([["two"]]);
    });

    it("defaults modelValue to an empty open set when undefined", () => {
      const wrapper = mountAccordion({ items: createItems(), multiple: true });
      expect(wrapper.findAll(".danx-accordion__panel")).toHaveLength(0);
    });
  });

  describe("Disabled items", () => {
    it("does not toggle a disabled item on click", async () => {
      const wrapper = mountAccordion({
        modelValue: null,
        items: createItems([{ disabled: true }]),
      });
      await wrapper.find(".danx-accordion__header").trigger("click");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });

    it("renders the header button as disabled", () => {
      const wrapper = mountAccordion({
        modelValue: null,
        items: createItems([{ disabled: true }]),
      });
      expect(wrapper.find(".danx-accordion__header").attributes("disabled")).toBeDefined();
    });
  });

  describe("Keyboard toggle", () => {
    it("toggles on Enter", async () => {
      const wrapper = mountAccordion({ modelValue: null, items: createItems() });
      await wrapper.find(".danx-accordion__header").trigger("keydown.enter");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["one"]);
    });

    it("toggles on Space", async () => {
      const wrapper = mountAccordion({ modelValue: null, items: createItems() });
      await wrapper.find(".danx-accordion__header").trigger("keydown.space");
      expect(wrapper.emitted("update:modelValue")?.[0]).toEqual(["one"]);
    });

    it("does not toggle a disabled item on Enter", async () => {
      const wrapper = mountAccordion({
        modelValue: null,
        items: createItems([{ disabled: true }]),
      });
      await wrapper.find(".danx-accordion__header").trigger("keydown.enter");
      expect(wrapper.emitted("update:modelValue")).toBeUndefined();
    });
  });

  describe("Aria semantics", () => {
    it("sets aria-expanded to false when closed and true when open", () => {
      const closed = mountAccordion({ modelValue: null, items: createItems() });
      expect(closed.find(".danx-accordion__header").attributes("aria-expanded")).toBe("false");

      const open = mountAccordion({ modelValue: "one", items: createItems() });
      expect(open.find(".danx-accordion__header").attributes("aria-expanded")).toBe("true");
    });

    it("links the header to its panel via aria-controls / id", () => {
      const wrapper = mountAccordion({ modelValue: "one", items: createItems() });
      const header = wrapper.find(".danx-accordion__header");
      const panel = wrapper.find(".danx-accordion__panel");
      expect(header.attributes("aria-controls")).toBe(panel.attributes("id"));
    });

    it("links the panel back to its header via aria-labelledby, and sets role=region", () => {
      const wrapper = mountAccordion({ modelValue: "one", items: createItems() });
      const header = wrapper.find(".danx-accordion__header");
      const panel = wrapper.find(".danx-accordion__panel");
      expect(panel.attributes("aria-labelledby")).toBe(header.attributes("id"));
      expect(panel.attributes("role")).toBe("region");
    });

    it("generates distinct ids across multiple accordion instances", () => {
      const first = mountAccordion({ modelValue: "one", items: createItems() });
      const second = mountAccordion({ modelValue: "one", items: createItems() });
      const firstId = first.find(".danx-accordion__header").attributes("id");
      const secondId = second.find(".danx-accordion__header").attributes("id");
      expect(firstId).not.toBe(secondId);
    });

    it("has no axe accessibility violations", async () => {
      const wrapper = mount(DanxAccordion, {
        props: { modelValue: "one", items: createItems() },
        global: { stubs: { transition: false } },
        attachTo: document.body,
      });
      await expectNoA11yViolations(wrapper.element);
      wrapper.unmount();
    });
  });

  describe("Transition lifecycle", () => {
    it("mounts the panel after opening and removes it after closing", async () => {
      vi.spyOn(window, "requestAnimationFrame").mockImplementation((cb) => {
        cb(0);
        return 0;
      });

      const wrapper = mount(DanxAccordion, {
        props: { modelValue: null, items: createItems(), "onUpdate:modelValue": () => {} },
        global: { stubs: { transition: false } },
      });

      await wrapper.setProps({ modelValue: "one" });
      expect(wrapper.find(".danx-accordion__panel").exists()).toBe(true);

      const panel = wrapper.find(".danx-accordion__panel").element as HTMLElement;
      panel.dispatchEvent(heightTransitionEnd());
      await wrapper.vm.$nextTick();

      await wrapper.setProps({ modelValue: null });
      // Leave has started; the panel is removed once the leave transition ends.
      const leavingPanel = wrapper.find(".danx-accordion__panel");
      expect(leavingPanel.exists()).toBe(true);
      leavingPanel.element.dispatchEvent(heightTransitionEnd());
      await wrapper.vm.$nextTick();

      expect(wrapper.find(".danx-accordion__panel").exists()).toBe(false);

      vi.restoreAllMocks();
    });
  });
});
