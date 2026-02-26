import { mount } from "@vue/test-utils";
import { nextTick } from "vue";
import { describe, it, expect, afterEach, vi } from "vitest";
import DanxFileThumbnailStrip from "../DanxFileThumbnailStrip.vue";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

const wrappers: ReturnType<typeof mount>[] = [];

async function mountStrip(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxFileThumbnailStrip, {
    props: {
      files: [makeFile("1"), makeFile("2")],
      activeFileId: "1",
      ...props,
    },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  // DanxVirtualScroll renders items asynchronously after onMounted detects
  // the viewport element and recalculates visible items.
  await nextTick();
  await nextTick();
  return wrapper;
}

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
});

describe("DanxFileThumbnailStrip", () => {
  describe("Rendering", () => {
    it("renders strip for 2+ files", async () => {
      const wrapper = await mountStrip();
      expect(wrapper.find(".danx-file-strip").exists()).toBe(true);
    });

    it("does not render for single file", async () => {
      const wrapper = await mountStrip({
        files: [makeFile("1")],
      });
      expect(wrapper.find(".danx-file-strip").exists()).toBe(false);
    });

    it("does not render for empty files array", async () => {
      const wrapper = await mountStrip({
        files: [],
      });
      expect(wrapper.find(".danx-file-strip").exists()).toBe(false);
    });

    it("renders a thumb per file", async () => {
      const wrapper = await mountStrip({
        files: [makeFile("1"), makeFile("2"), makeFile("3")],
      });
      expect(wrapper.findAll(".danx-file-strip__thumb").length).toBe(3);
    });
  });

  describe("Active state", () => {
    it("marks the active thumbnail with --active class", async () => {
      const wrapper = await mountStrip();
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      expect(thumbs[0]!.classes()).toContain("danx-file-strip__thumb--active");
      expect(thumbs[1]!.classes()).not.toContain("danx-file-strip__thumb--active");
    });

    it("updates active class when activeFileId changes", async () => {
      const wrapper = await mountStrip();
      await wrapper.setProps({ activeFileId: "2" });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      expect(thumbs[0]!.classes()).not.toContain("danx-file-strip__thumb--active");
      expect(thumbs[1]!.classes()).toContain("danx-file-strip__thumb--active");
    });
  });

  describe("Events", () => {
    it("emits select with file when thumb is clicked", async () => {
      const files = [makeFile("1"), makeFile("2")];
      const wrapper = await mountStrip({ files });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      await thumbs[1]!.trigger("click");
      expect(wrapper.emitted("select")).toBeTruthy();
      expect(wrapper.emitted("select")![0]![0]).toEqual(files[1]);
    });
  });

  describe("Index badges", () => {
    it("shows index badges when 3+ files", async () => {
      const wrapper = await mountStrip({
        files: [makeFile("1"), makeFile("2"), makeFile("3")],
      });
      const badges = wrapper.findAll(".danx-file-strip__badge");
      expect(badges.length).toBe(3);
      expect(badges[0]!.text()).toBe("1");
      expect(badges[1]!.text()).toBe("2");
      expect(badges[2]!.text()).toBe("3");
    });

    it("does not show index badges when only 2 files", async () => {
      const wrapper = await mountStrip();
      expect(wrapper.findAll(".danx-file-strip__badge").length).toBe(0);
    });
  });

  describe("Auto-scroll", () => {
    it("calls scrollIntoView on active thumb when activeFileId changes", async () => {
      const files = [makeFile("1"), makeFile("2"), makeFile("3")];
      const wrapper = await mountStrip({ files, activeFileId: "1" });
      const scrollSpy = vi.fn();
      // Stub scrollIntoView on all thumb elements
      wrapper.findAll(".danx-file-strip__thumb").forEach((thumb) => {
        (thumb.element as HTMLElement).scrollIntoView = scrollSpy;
      });
      await wrapper.setProps({ activeFileId: "3" });
      await nextTick();
      expect(scrollSpy).toHaveBeenCalledWith({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    });

    it("does not call scrollIntoView for unknown file ID", async () => {
      const files = [makeFile("1"), makeFile("2")];
      const wrapper = await mountStrip({ files, activeFileId: "1" });
      const scrollSpy = vi.fn();
      wrapper.findAll(".danx-file-strip__thumb").forEach((thumb) => {
        (thumb.element as HTMLElement).scrollIntoView = scrollSpy;
      });
      await wrapper.setProps({ activeFileId: "unknown" });
      await nextTick();
      expect(scrollSpy).not.toHaveBeenCalled();
    });
  });

  describe("DanxFile thumbnails", () => {
    it("renders DanxFile components for image files", async () => {
      const wrapper = await mountStrip();
      const imgs = wrapper.findAll(".danx-file__image");
      expect(imgs.length).toBe(2);
    });

    it("sets correct src on DanxFile images", async () => {
      const wrapper = await mountStrip();
      const img = wrapper.find(".danx-file__image");
      expect(img.attributes("src")).toBe("https://example.com/1.jpg");
    });

    it("renders type icon for non-previewable files", async () => {
      const wrapper = await mountStrip({
        files: [
          makeFile("1", { type: "application/pdf", url: "https://example.com/doc.pdf" }),
          makeFile("2"),
        ],
      });
      const icons = wrapper.findAll(".danx-file__type-icon");
      expect(icons.length).toBe(1);
    });

    it("uses thumb URL when available", async () => {
      const wrapper = await mountStrip({
        files: [
          makeFile("1", { thumb: { url: "https://example.com/thumb-1.jpg" } }),
          makeFile("2"),
        ],
      });
      const imgs = wrapper.findAll(".danx-file__image");
      expect(imgs[0]!.attributes("src")).toBe("https://example.com/thumb-1.jpg");
    });

    it("renders thumbnail for video file with thumb URL", async () => {
      const wrapper = await mountStrip({
        files: [
          makeFile("1", {
            type: "video/mp4",
            url: "https://example.com/video.mp4",
            thumb: { url: "https://example.com/video-thumb.jpg" },
          }),
          makeFile("2"),
        ],
      });
      const imgs = wrapper.findAll(".danx-file__image");
      expect(imgs.length).toBe(2);
    });

    it("renders type icon for video file without thumb URL", async () => {
      const wrapper = await mountStrip({
        files: [
          makeFile("1", { type: "video/mp4", url: "https://example.com/video.mp4" }),
          makeFile("2"),
        ],
      });
      const icons = wrapper.findAll(".danx-file__type-icon");
      expect(icons.length).toBe(1);
    });

    it("renders type icon for image file with no URL", async () => {
      const wrapper = await mountStrip({
        files: [makeFile("1", { url: "" }), makeFile("2")],
      });
      const icons = wrapper.findAll(".danx-file__type-icon");
      expect(icons.length).toBe(1);
    });
  });
});
