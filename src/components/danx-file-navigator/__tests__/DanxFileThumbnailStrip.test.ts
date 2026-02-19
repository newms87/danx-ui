import { mount } from "@vue/test-utils";
import { describe, it, expect, afterEach } from "vitest";
import DanxFileThumbnailStrip from "../DanxFileThumbnailStrip.vue";
import type { PreviewFile } from "../../danx-file/types";

function makeFile(id: string, overrides: Partial<PreviewFile> = {}): PreviewFile {
  return {
    id,
    name: `file-${id}.jpg`,
    size: 1024,
    type: "image/jpeg",
    url: `https://example.com/${id}.jpg`,
    ...overrides,
  };
}

const wrappers: ReturnType<typeof mount>[] = [];

function mountStrip(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxFileThumbnailStrip, {
    props: {
      files: [makeFile("1"), makeFile("2")],
      activeFileId: "1",
      ...props,
    },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
});

describe("DanxFileThumbnailStrip", () => {
  describe("Rendering", () => {
    it("renders strip for 2+ files", () => {
      const wrapper = mountStrip();
      expect(wrapper.find(".danx-file-strip").exists()).toBe(true);
    });

    it("does not render for single file", () => {
      const wrapper = mountStrip({
        files: [makeFile("1")],
      });
      expect(wrapper.find(".danx-file-strip").exists()).toBe(false);
    });

    it("does not render for empty files array", () => {
      const wrapper = mountStrip({
        files: [],
      });
      expect(wrapper.find(".danx-file-strip").exists()).toBe(false);
    });

    it("renders a thumb per file", () => {
      const wrapper = mountStrip({
        files: [makeFile("1"), makeFile("2"), makeFile("3")],
      });
      expect(wrapper.findAll(".danx-file-strip__thumb").length).toBe(3);
    });
  });

  describe("Active state", () => {
    it("marks the active thumbnail with --active class", () => {
      const wrapper = mountStrip();
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      expect(thumbs[0]!.classes()).toContain("danx-file-strip__thumb--active");
      expect(thumbs[1]!.classes()).not.toContain("danx-file-strip__thumb--active");
    });

    it("updates active class when activeFileId changes", async () => {
      const wrapper = mountStrip();
      await wrapper.setProps({ activeFileId: "2" });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      expect(thumbs[0]!.classes()).not.toContain("danx-file-strip__thumb--active");
      expect(thumbs[1]!.classes()).toContain("danx-file-strip__thumb--active");
    });
  });

  describe("Events", () => {
    it("emits select with file when thumb is clicked", async () => {
      const files = [makeFile("1"), makeFile("2")];
      const wrapper = mountStrip({ files });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      await thumbs[1]!.trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
      expect(wrapper.emitted("select")![0]![0]).toEqual(files[1]);
    });
  });

  describe("Index badges", () => {
    it("shows index badges when 3+ files", () => {
      const wrapper = mountStrip({
        files: [makeFile("1"), makeFile("2"), makeFile("3")],
      });
      const badges = wrapper.findAll(".danx-file-strip__badge");
      expect(badges.length).toBe(3);
      expect(badges[0]!.text()).toBe("1");
      expect(badges[1]!.text()).toBe("2");
      expect(badges[2]!.text()).toBe("3");
    });

    it("does not show index badges when only 2 files", () => {
      const wrapper = mountStrip();
      expect(wrapper.findAll(".danx-file-strip__badge").length).toBe(0);
    });
  });

  describe("Raw image thumbnails", () => {
    it("renders raw img elements for image files", () => {
      const wrapper = mountStrip();
      const imgs = wrapper.findAll(".danx-file-strip__img");
      expect(imgs.length).toBe(2);
    });

    it("sets correct src on img elements", () => {
      const wrapper = mountStrip();
      const img = wrapper.find(".danx-file-strip__img");
      expect(img.attributes("src")).toBe("https://example.com/1.jpg");
    });

    it("renders fallback icon for non-previewable files", () => {
      const wrapper = mountStrip({
        files: [
          makeFile("1", { type: "application/pdf", url: "https://example.com/doc.pdf" }),
          makeFile("2"),
        ],
      });
      const icons = wrapper.findAll(".danx-file-strip__fallback-icon");
      expect(icons.length).toBe(1);
    });

    it("uses thumb URL when available", () => {
      const wrapper = mountStrip({
        files: [
          makeFile("1", { thumb: { url: "https://example.com/thumb-1.jpg" } }),
          makeFile("2"),
        ],
      });
      const imgs = wrapper.findAll(".danx-file-strip__img");
      expect(imgs[0]!.attributes("src")).toBe("https://example.com/thumb-1.jpg");
    });

    it("renders img for video file thumbnails", () => {
      const wrapper = mountStrip({
        files: [
          makeFile("1", { type: "video/mp4", url: "https://example.com/video.mp4" }),
          makeFile("2"),
        ],
      });
      const imgs = wrapper.findAll(".danx-file-strip__img");
      expect(imgs.length).toBe(2);
    });

    it("renders fallback icon for image file with no URL", () => {
      const wrapper = mountStrip({
        files: [makeFile("1", { url: "" }), makeFile("2")],
      });
      const icons = wrapper.findAll(".danx-file-strip__fallback-icon");
      expect(icons.length).toBe(1);
    });
  });
});
