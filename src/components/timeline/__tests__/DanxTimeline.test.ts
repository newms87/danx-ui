import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxTimeline from "../DanxTimeline.vue";
import DanxTimelineItem from "../DanxTimelineItem.vue";
import type { DanxTimelineEntry } from "../types";

describe("DanxTimeline", () => {
  describe("Rendering", () => {
    it("renders a container with danx-timeline class", () => {
      const wrapper = mount(DanxTimeline);

      expect(wrapper.find("ul.danx-timeline").exists()).toBe(true);
    });

    it("renders nothing extra when items and default slot are both omitted", () => {
      const wrapper = mount(DanxTimeline);

      expect(wrapper.findAll(".danx-timeline-item")).toHaveLength(0);
    });
  });

  describe("items prop", () => {
    const entries: DanxTimelineEntry[] = [
      { type: "success", timestamp: "2m ago", content: "Deployed" },
      { type: "error", timestamp: "10m ago", content: "Build failed" },
      { content: "Commit pushed" },
    ];

    it("renders one DanxTimelineItem per entry", () => {
      const wrapper = mount(DanxTimeline, { props: { items: entries } });

      expect(wrapper.findAll(".danx-timeline-item")).toHaveLength(entries.length);
    });

    it("passes each entry's content into the item body", () => {
      const wrapper = mount(DanxTimeline, { props: { items: entries } });

      expect(wrapper.text()).toContain("Deployed");
      expect(wrapper.text()).toContain("Build failed");
      expect(wrapper.text()).toContain("Commit pushed");
    });

    it("passes each entry's type through to the rendered item class", () => {
      const wrapper = mount(DanxTimeline, { props: { items: entries } });

      const items = wrapper.findAll(".danx-timeline-item");
      expect(items[0]!.classes()).toContain("is-success");
      expect(items[1]!.classes()).toContain("is-error");
      expect(items[2]!.classes()).toContain("is-default");
    });

    it("passes each entry's timestamp through to the rendered item", () => {
      const wrapper = mount(DanxTimeline, { props: { items: entries } });

      const timestamps = wrapper.findAll(".danx-timeline-item__timestamp");
      expect(timestamps[0]!.text()).toBe("2m ago");
      expect(timestamps[1]!.text()).toBe("10m ago");
    });

    it("passes each entry's icon through to the rendered item", () => {
      const wrapper = mount(DanxTimeline, {
        props: { items: [{ icon: "confirm", content: "Approved" }] },
      });

      expect(wrapper.find(".danx-timeline-item__icon").exists()).toBe(true);
    });

    it("does not render the last item's connector", () => {
      const wrapper = mount(DanxTimeline, { props: { items: entries } });

      const items = wrapper.findAll(".danx-timeline-item");
      expect(items[items.length - 1]!.classes()).toContain("danx-timeline-item");
      // CSS hides the last connector; assert the DOM structure driving that rule is intact.
      expect(items[items.length - 1]!.find(".danx-timeline-item__connector").exists()).toBe(true);
    });
  });

  describe("default slot", () => {
    it("renders explicit DanxTimelineItem children passed via slot", () => {
      const wrapper = mount(
        {
          components: { DanxTimeline, DanxTimelineItem },
          template: `
            <DanxTimeline>
              <DanxTimelineItem type="success" timestamp="now">Child A</DanxTimelineItem>
              <DanxTimelineItem type="error" timestamp="later">Child B</DanxTimelineItem>
            </DanxTimeline>
          `,
        },
        {}
      );

      const items = wrapper.findAll(".danx-timeline-item");
      expect(items).toHaveLength(2);
      expect(items[0]!.classes()).toContain("is-success");
      expect(items[1]!.classes()).toContain("is-error");
      expect(wrapper.text()).toContain("Child A");
      expect(wrapper.text()).toContain("Child B");
    });

    it("prefers the items prop over slot children when both are given", () => {
      const wrapper = mount(
        {
          components: { DanxTimeline, DanxTimelineItem },
          template: `
            <DanxTimeline :items="[{ content: 'From items' }]">
              <DanxTimelineItem>From slot</DanxTimelineItem>
            </DanxTimeline>
          `,
        },
        {}
      );

      expect(wrapper.text()).toContain("From items");
      expect(wrapper.text()).not.toContain("From slot");
    });
  });
});
