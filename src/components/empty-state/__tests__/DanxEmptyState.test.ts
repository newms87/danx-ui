import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxEmptyState from "../DanxEmptyState.vue";
import type { EmptyStateSize } from "../types";

const allSizes: EmptyStateSize[] = ["sm", "md", "lg"];

describe("DanxEmptyState", () => {
  describe("Rendering", () => {
    it("renders a div root element", () => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results" } });

      expect(wrapper.element.tagName).toBe("DIV");
    });

    it("renders the title", () => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results" } });

      expect(wrapper.find(".danx-empty-state__title").text()).toBe("No results");
    });

    it("renders with only the required title prop and no illustration/description/actions", () => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results" } });

      expect(wrapper.find(".danx-empty-state__illustration").exists()).toBe(false);
      expect(wrapper.find(".danx-empty-state__description").exists()).toBe(false);
      expect(wrapper.find(".danx-empty-state__actions").exists()).toBe(false);
    });
  });

  describe("Description", () => {
    it("renders the description when provided", () => {
      const wrapper = mount(DanxEmptyState, {
        props: { title: "No results", description: "Try a different search term." },
      });

      expect(wrapper.find(".danx-empty-state__description").text()).toBe(
        "Try a different search term."
      );
    });

    it("does not render a description element when omitted", () => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results" } });

      expect(wrapper.find(".danx-empty-state__description").exists()).toBe(false);
    });
  });

  describe("Icon", () => {
    it("renders the icon when provided", () => {
      const wrapper = mount(DanxEmptyState, {
        props: { title: "No results", icon: "search" },
      });

      expect(wrapper.find(".danx-empty-state__illustration").exists()).toBe(true);
      expect(wrapper.find(".danx-empty-state__icon").exists()).toBe(true);
    });

    it("does not render the illustration wrapper when there is no icon and no illustration slot", () => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results" } });

      expect(wrapper.find(".danx-empty-state__illustration").exists()).toBe(false);
    });
  });

  describe("Illustration Slot", () => {
    it("renders the illustration slot instead of the icon when both are provided", () => {
      const wrapper = mount(DanxEmptyState, {
        props: { title: "No results", icon: "search" },
        slots: { illustration: '<span class="custom-illustration">!</span>' },
      });

      expect(wrapper.find(".custom-illustration").exists()).toBe(true);
      expect(wrapper.find(".danx-empty-state__icon").exists()).toBe(false);
    });

    it("renders the illustration wrapper for the slot even without an icon prop", () => {
      const wrapper = mount(DanxEmptyState, {
        props: { title: "No results" },
        slots: { illustration: '<span class="custom-illustration">!</span>' },
      });

      expect(wrapper.find(".danx-empty-state__illustration").exists()).toBe(true);
      expect(wrapper.find(".custom-illustration").exists()).toBe(true);
    });
  });

  describe("Actions Slot", () => {
    it("renders the actions slot when provided", () => {
      const wrapper = mount(DanxEmptyState, {
        props: { title: "No results" },
        slots: { actions: '<button class="custom-action">Retry</button>' },
      });

      expect(wrapper.find(".danx-empty-state__actions").exists()).toBe(true);
      expect(wrapper.find(".custom-action").exists()).toBe(true);
    });

    it("does not render the actions wrapper when the actions slot is omitted", () => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results" } });

      expect(wrapper.find(".danx-empty-state__actions").exists()).toBe(false);
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results", size } });

      expect(wrapper.classes()).toContain(`danx-empty-state--${size}`);
    });

    it("defaults to md size", () => {
      const wrapper = mount(DanxEmptyState, { props: { title: "No results" } });

      expect(wrapper.classes()).toContain("danx-empty-state--md");
    });
  });

  describe("Fully Populated", () => {
    it("renders correctly with all props and slots populated", () => {
      const wrapper = mount(DanxEmptyState, {
        props: {
          title: "No files yet",
          description: "Upload your first file to get started.",
          icon: "folder",
          size: "lg",
        },
        slots: {
          actions: '<button class="custom-action">Upload</button>',
        },
      });

      expect(wrapper.classes()).toContain("danx-empty-state--lg");
      expect(wrapper.find(".danx-empty-state__title").text()).toBe("No files yet");
      expect(wrapper.find(".danx-empty-state__description").text()).toBe(
        "Upload your first file to get started."
      );
      expect(wrapper.find(".danx-empty-state__icon").exists()).toBe(true);
      expect(wrapper.find(".custom-action").exists()).toBe(true);
    });
  });
});
