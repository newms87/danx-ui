import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { h, defineComponent, markRaw } from "vue";
import DanxTimelineItem from "../DanxTimelineItem.vue";
import { confirmIcon } from "../../icon/icons";

describe("DanxTimelineItem", () => {
  describe("Rendering", () => {
    it("renders a list item with danx-timeline-item class", () => {
      const wrapper = mount(DanxTimelineItem);

      expect(wrapper.find("li.danx-timeline-item").exists()).toBe(true);
    });

    it("renders default slot content", () => {
      const wrapper = mount(DanxTimelineItem, {
        slots: { default: "Entry content" },
      });

      expect(wrapper.find(".danx-timeline-item__body").text()).toBe("Entry content");
    });

    it("applies the is-default class when no type is given", () => {
      const wrapper = mount(DanxTimelineItem);

      expect(wrapper.classes()).toContain("is-default");
    });

    it("applies is-{type} class for a given type", () => {
      const wrapper = mount(DanxTimelineItem, { props: { type: "success" } });

      expect(wrapper.classes()).toContain("is-success");
    });

    it("supports error, warning, and info types", () => {
      expect(mount(DanxTimelineItem, { props: { type: "error" } }).classes()).toContain("is-error");
      expect(mount(DanxTimelineItem, { props: { type: "warning" } }).classes()).toContain(
        "is-warning"
      );
      expect(mount(DanxTimelineItem, { props: { type: "info" } }).classes()).toContain("is-info");
    });

    it("always renders a marker element", () => {
      const wrapper = mount(DanxTimelineItem);

      expect(wrapper.find(".danx-timeline-item__marker").exists()).toBe(true);
    });

    it("always renders a connector element", () => {
      const wrapper = mount(DanxTimelineItem);

      expect(wrapper.find(".danx-timeline-item__connector").exists()).toBe(true);
    });
  });

  describe("Timestamp", () => {
    it("renders the timestamp prop when provided", () => {
      const wrapper = mount(DanxTimelineItem, { props: { timestamp: "2 minutes ago" } });

      expect(wrapper.find(".danx-timeline-item__timestamp").text()).toBe("2 minutes ago");
    });

    it("omits the timestamp element when absent", () => {
      const wrapper = mount(DanxTimelineItem);

      expect(wrapper.find(".danx-timeline-item__timestamp").exists()).toBe(false);
    });

    it("renders the timestamp slot, overriding the prop", () => {
      const wrapper = mount(DanxTimelineItem, {
        props: { timestamp: "2 minutes ago" },
        slots: { timestamp: "Custom timestamp" },
      });

      expect(wrapper.find(".danx-timeline-item__timestamp").text()).toBe("Custom timestamp");
    });
  });

  describe("Icons", () => {
    it("renders no DanxIcon when icon prop is omitted (colored dot fallback)", () => {
      const wrapper = mount(DanxTimelineItem);

      expect(wrapper.find(".danx-timeline-item__icon").exists()).toBe(false);
    });

    it("renders DanxIcon when icon prop is an SVG string", () => {
      const wrapper = mount(DanxTimelineItem, { props: { icon: confirmIcon } });

      const iconEl = wrapper.find(".danx-timeline-item__icon");
      expect(iconEl.exists()).toBe(true);
      expect(iconEl.html()).toContain("<svg");
    });

    it("renders DanxIcon when icon prop is a built-in icon name", () => {
      const wrapper = mount(DanxTimelineItem, { props: { icon: "confirm" } });

      expect(wrapper.find(".danx-timeline-item__icon").exists()).toBe(true);
    });

    it("renders DanxIcon when icon prop is a Vue component", () => {
      const CustomIcon = markRaw(
        defineComponent({
          render() {
            return h("span", { class: "custom-icon" }, "X");
          },
        })
      );
      const wrapper = mount(DanxTimelineItem, { props: { icon: CustomIcon } });

      expect(wrapper.find(".custom-icon").exists()).toBe(true);
    });
  });
});
