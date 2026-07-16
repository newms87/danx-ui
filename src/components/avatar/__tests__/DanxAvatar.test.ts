import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import DanxAvatar from "../DanxAvatar.vue";
import type { AvatarShape, AvatarSize } from "../types";

const allSizes: AvatarSize[] = ["xs", "sm", "md", "lg", "xl"];
const allShapes: AvatarShape[] = ["circle", "square"];

describe("DanxAvatar", () => {
  describe("Rendering", () => {
    it("renders a span root element", () => {
      const wrapper = mount(DanxAvatar);

      expect(wrapper.element.tagName).toBe("SPAN");
    });

    it("renders an img when src is provided", () => {
      const wrapper = mount(DanxAvatar, {
        props: { src: "/user.jpg", name: "Ada Lovelace" },
      });

      const img = wrapper.find("img");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("/user.jpg");
    });

    it("does not render an img when src is omitted", () => {
      const wrapper = mount(DanxAvatar, { props: { name: "Ada Lovelace" } });

      expect(wrapper.find("img").exists()).toBe(false);
    });

    it("uses name as the default alt text", () => {
      const wrapper = mount(DanxAvatar, {
        props: { src: "/user.jpg", name: "Ada Lovelace" },
      });

      expect(wrapper.find("img").attributes("alt")).toBe("Ada Lovelace");
    });

    it("uses alt prop over name when provided", () => {
      const wrapper = mount(DanxAvatar, {
        props: { src: "/user.jpg", name: "Ada Lovelace", alt: "Profile photo" },
      });

      expect(wrapper.find("img").attributes("alt")).toBe("Profile photo");
    });

    it("defaults alt to empty string when neither alt nor name is set", () => {
      const wrapper = mount(DanxAvatar, { props: { src: "/user.jpg" } });

      expect(wrapper.find("img").attributes("alt")).toBe("");
    });
  });

  describe("Initials Fallback", () => {
    it("renders initials derived from name when there is no src", () => {
      const wrapper = mount(DanxAvatar, { props: { name: "Ada Lovelace" } });

      expect(wrapper.find(".danx-avatar__initials").text()).toBe("AL");
    });

    it("renders nothing in the fallback when there is no name and no icon", () => {
      const wrapper = mount(DanxAvatar);

      expect(wrapper.find(".danx-avatar__initials").exists()).toBe(false);
      expect(wrapper.find(".danx-avatar__icon").exists()).toBe(false);
    });
  });

  describe("Icon Fallback", () => {
    it("renders the icon fallback when there is no name", () => {
      const wrapper = mount(DanxAvatar, { props: { icon: "trash" } });

      expect(wrapper.find(".danx-avatar__icon").exists()).toBe(true);
      expect(wrapper.find(".danx-avatar__initials").exists()).toBe(false);
    });

    it("prefers initials over icon when both name and icon are set", () => {
      const wrapper = mount(DanxAvatar, { props: { name: "Ada Lovelace", icon: "trash" } });

      expect(wrapper.find(".danx-avatar__initials").exists()).toBe(true);
      expect(wrapper.find(".danx-avatar__icon").exists()).toBe(false);
    });
  });

  describe("Image Load Error", () => {
    it("switches to the fallback when the image fails to load", async () => {
      const wrapper = mount(DanxAvatar, {
        props: { src: "/broken.jpg", name: "Ada Lovelace" },
      });

      expect(wrapper.find("img").exists()).toBe(true);

      await wrapper.find("img").trigger("error");

      expect(wrapper.find("img").exists()).toBe(false);
      expect(wrapper.find(".danx-avatar__initials").text()).toBe("AL");
    });

    it("resets the error state and re-attempts the image when src changes", async () => {
      const wrapper = mount(DanxAvatar, {
        props: { src: "/broken.jpg", name: "Ada Lovelace" },
      });

      await wrapper.find("img").trigger("error");
      expect(wrapper.find("img").exists()).toBe(false);

      await wrapper.setProps({ src: "/new.jpg" });

      expect(wrapper.find("img").exists()).toBe(true);
      expect(wrapper.find("img").attributes("src")).toBe("/new.jpg");
    });
  });

  describe("Sizes", () => {
    it.each(allSizes)("renders size %s with correct class", (size) => {
      const wrapper = mount(DanxAvatar, { props: { size } });

      expect(wrapper.classes()).toContain(`danx-avatar--${size}`);
    });

    it("defaults to md size", () => {
      const wrapper = mount(DanxAvatar);

      expect(wrapper.classes()).toContain("danx-avatar--md");
    });

    it("applies numeric size as inline style tokens instead of a size class", () => {
      const wrapper = mount(DanxAvatar, { props: { size: 64 } });

      const style = wrapper.attributes("style") ?? "";
      expect(style).toContain("--dx-avatar-size: 64px");
      expect(style).toContain("--dx-avatar-font-size: 25.6px");
      expect(style).toContain("--dx-avatar-icon-size: 32px");
      expect(wrapper.classes().some((c) => /^danx-avatar--(xs|sm|md|lg|xl)$/.test(c))).toBe(false);
    });
  });

  describe("Shapes", () => {
    it.each(allShapes)("renders shape %s with correct class", (shape) => {
      const wrapper = mount(DanxAvatar, { props: { shape } });

      expect(wrapper.classes()).toContain(`danx-avatar--${shape}`);
    });

    it("defaults to circle shape", () => {
      const wrapper = mount(DanxAvatar);

      expect(wrapper.classes()).toContain("danx-avatar--circle");
    });
  });

  describe("Auto Color", () => {
    it("applies autoColor background/text tokens when showing the fallback", () => {
      const wrapper = mount(DanxAvatar, { props: { name: "Ada Lovelace" } });

      const style = wrapper.attributes("style") ?? "";
      expect(style).toContain("--dx-avatar-bg");
      expect(style).toContain("--dx-avatar-text");
    });

    it("does not apply autoColor tokens while the image is showing", () => {
      const wrapper = mount(DanxAvatar, { props: { src: "/user.jpg", name: "Ada Lovelace" } });

      const style = wrapper.attributes("style") ?? "";
      expect(style).not.toContain("--dx-avatar-bg");
      expect(style).not.toContain("--dx-avatar-text");
    });

    it("applies autoColor tokens once the image fallback is active after an error", async () => {
      const wrapper = mount(DanxAvatar, { props: { src: "/broken.jpg", name: "Ada Lovelace" } });

      await wrapper.find("img").trigger("error");

      const style = wrapper.attributes("style") ?? "";
      expect(style).toContain("--dx-avatar-bg");
    });
  });

  describe("Fallback Slot", () => {
    it("renders the fallback slot instead of initials/icon when provided", () => {
      const wrapper = mount(DanxAvatar, {
        props: { name: "Ada Lovelace" },
        slots: { fallback: '<span class="custom-fallback">?</span>' },
      });

      expect(wrapper.find(".custom-fallback").exists()).toBe(true);
      expect(wrapper.find(".danx-avatar__initials").exists()).toBe(false);
    });
  });
});
