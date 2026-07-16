import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxCard from "../DanxCard.vue";
import type { CardPadding, CardVariant } from "../types";

describe("DanxCard", () => {
  describe("Rendering", () => {
    it("renders a div with the danx-card class", () => {
      const wrapper = mount(DanxCard);

      expect(wrapper.element.tagName).toBe("DIV");
      expect(wrapper.classes()).toContain("danx-card");
    });

    it("renders default slot content as the body", () => {
      const wrapper = mount(DanxCard, {
        slots: { default: "Body content" },
      });

      expect(wrapper.find(".danx-card__body").text()).toBe("Body content");
    });

    it("omits the body element when no default slot is provided", () => {
      const wrapper = mount(DanxCard);

      expect(wrapper.find(".danx-card__body").exists()).toBe(false);
    });

    it("omits the header element when no header slot or title/subtitle is provided", () => {
      const wrapper = mount(DanxCard);

      expect(wrapper.find(".danx-card__header").exists()).toBe(false);
    });

    it("omits the footer element when no footer slot is provided", () => {
      const wrapper = mount(DanxCard);

      expect(wrapper.find(".danx-card__footer").exists()).toBe(false);
    });

    it("renders the footer slot when provided", () => {
      const wrapper = mount(DanxCard, {
        slots: { footer: "<button>Save</button>" },
      });

      expect(wrapper.find(".danx-card__footer button").exists()).toBe(true);
    });

    it("renders any subset of slots: body-only", () => {
      const wrapper = mount(DanxCard, { slots: { default: "Only body" } });

      expect(wrapper.find(".danx-card__header").exists()).toBe(false);
      expect(wrapper.find(".danx-card__body").exists()).toBe(true);
      expect(wrapper.find(".danx-card__footer").exists()).toBe(false);
    });

    it("renders any subset of slots: header + body", () => {
      const wrapper = mount(DanxCard, {
        slots: { header: "Header", default: "Body" },
      });

      expect(wrapper.find(".danx-card__header").exists()).toBe(true);
      expect(wrapper.find(".danx-card__body").exists()).toBe(true);
      expect(wrapper.find(".danx-card__footer").exists()).toBe(false);
    });

    it("renders any subset of slots: full (header + body + footer)", () => {
      const wrapper = mount(DanxCard, {
        slots: { header: "Header", default: "Body", footer: "Footer" },
      });

      expect(wrapper.find(".danx-card__header").exists()).toBe(true);
      expect(wrapper.find(".danx-card__body").exists()).toBe(true);
      expect(wrapper.find(".danx-card__footer").exists()).toBe(true);
    });
  });

  describe("Title/subtitle convenience props", () => {
    it("renders the title in the header when no header slot is given", () => {
      const wrapper = mount(DanxCard, { props: { title: "Team members" } });

      const header = wrapper.find(".danx-card__header");
      expect(header.exists()).toBe(true);
      expect(wrapper.find(".danx-card__title").text()).toBe("Team members");
    });

    it("renders the subtitle below the title", () => {
      const wrapper = mount(DanxCard, {
        props: { title: "Team members", subtitle: "12 active" },
      });

      expect(wrapper.find(".danx-card__subtitle").text()).toBe("12 active");
    });

    it("renders the subtitle alone without a title", () => {
      const wrapper = mount(DanxCard, { props: { subtitle: "12 active" } });

      expect(wrapper.find(".danx-card__title").exists()).toBe(false);
      expect(wrapper.find(".danx-card__subtitle").text()).toBe("12 active");
    });

    it("omits title/subtitle elements when neither prop is set", () => {
      const wrapper = mount(DanxCard);

      expect(wrapper.find(".danx-card__title").exists()).toBe(false);
      expect(wrapper.find(".danx-card__subtitle").exists()).toBe(false);
    });

    it("prefers the header slot over title/subtitle props when both are given", () => {
      const wrapper = mount(DanxCard, {
        props: { title: "Ignored title" },
        slots: { header: "<span class='custom-header'>Custom</span>" },
      });

      expect(wrapper.find(".danx-card__title").exists()).toBe(false);
      expect(wrapper.find(".custom-header").exists()).toBe(true);
    });
  });

  describe("Variants", () => {
    it("defaults to the outlined variant", () => {
      const wrapper = mount(DanxCard);

      expect(wrapper.classes()).toContain("danx-card--outlined");
    });

    it.each(["elevated", "outlined", "flat"] as CardVariant[])(
      "applies the danx-card--%s class for the %s variant",
      (variant) => {
        const wrapper = mount(DanxCard, { props: { variant } });

        expect(wrapper.classes()).toContain(`danx-card--${variant}`);
      }
    );
  });

  describe("Padding density", () => {
    it("defaults to the comfortable padding density", () => {
      const wrapper = mount(DanxCard);

      expect(wrapper.classes()).toContain("danx-card--padding-comfortable");
    });

    it.each(["compact", "comfortable", "spacious"] as CardPadding[])(
      "applies the danx-card--padding-%s class for the %s density",
      (padding) => {
        const wrapper = mount(DanxCard, { props: { padding } });

        expect(wrapper.classes()).toContain(`danx-card--padding-${padding}`);
      }
    );
  });
});
