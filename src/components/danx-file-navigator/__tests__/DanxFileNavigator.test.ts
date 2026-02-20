import { mount } from "@vue/test-utils";
import { describe, it, expect, afterEach } from "vitest";
import DanxFileNavigator from "../DanxFileNavigator.vue";
import type { PreviewFile } from "../../danx-file/types";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

const wrappers: ReturnType<typeof mount>[] = [];

function mountNavigator(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxFileNavigator, {
    props: { file: makeFile("1"), ...props },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
});

describe("DanxFileNavigator", () => {
  describe("Rendering", () => {
    it("renders the navigator container", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-navigator").exists()).toBe(true);
    });

    it("displays filename in header", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-1.jpg");
    });

    it("renders image preview inside active slide for image files", () => {
      const wrapper = mountNavigator();
      const activeSlide = wrapper.find(".danx-file-navigator__slide--active");
      expect(activeSlide.exists()).toBe(true);
      expect(activeSlide.find(".danx-file-navigator__image").exists()).toBe(true);
    });

    it("renders video preview inside active slide for video files", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { type: "video/mp4", url: "https://example.com/video.mp4" }),
      });
      const activeSlide = wrapper.find(".danx-file-navigator__slide--active");
      expect(activeSlide.find(".danx-file-navigator__video").exists()).toBe(true);
    });

    it("renders PDF preview inside active slide for PDF files", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { type: "application/pdf" }),
      });
      const activeSlide = wrapper.find(".danx-file-navigator__slide--active");
      expect(activeSlide.find(".danx-file-navigator__pdf").exists()).toBe(true);
    });

    it("renders no-preview inside active slide for non-previewable files", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { type: "text/plain" }),
      });
      const activeSlide = wrapper.find(".danx-file-navigator__slide--active");
      expect(activeSlide.find(".danx-file-navigator__no-preview").exists()).toBe(true);
    });
  });

  describe("Virtual carousel", () => {
    it("renders multiple slides when navigating with related files", () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      const slides = wrapper.findAll(".danx-file-navigator__slide");
      // At index 0 with 3 files, buffer shows indices 0-2
      expect(slides.length).toBe(3);
    });

    it("only one slide has --active class", () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      const activeSlides = wrapper.findAll(".danx-file-navigator__slide--active");
      expect(activeSlides.length).toBe(1);
    });
  });

  describe("Navigation", () => {
    it("shows navigation arrows when related files exist", () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      expect(wrapper.find(".danx-file-navigator__arrow--next").exists()).toBe(true);
    });

    it("does not show arrows for single file", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-navigator__arrow--prev").exists()).toBe(false);
      expect(wrapper.find(".danx-file-navigator__arrow--next").exists()).toBe(false);
    });

    it("navigates to next file when next arrow clicked", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      await wrapper.find(".danx-file-navigator__arrow--next").trigger("click");
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-2.jpg");
    });

    it("shows slide counter", () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      expect(wrapper.find(".danx-file-navigator__counter").text()).toBe("1 / 3");
    });

    it("does not show counter for single file", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-navigator__counter").exists()).toBe(false);
    });
  });

  describe("Keyboard navigation", () => {
    it("navigates with ArrowRight key", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      await wrapper.find(".danx-file-navigator").trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-2.jpg");
    });

    it("navigates with ArrowLeft key", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      // Go to file 2 first
      await wrapper.find(".danx-file-navigator").trigger("keydown", { key: "ArrowRight" });
      // Go back to file 1
      await wrapper.find(".danx-file-navigator").trigger("keydown", { key: "ArrowLeft" });
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Thumbnail strip", () => {
    it("renders strip for 2+ files", () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      expect(wrapper.find(".danx-file-strip").exists()).toBe(true);
    });

    it("does not render strip for single file", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-strip").exists()).toBe(false);
    });

    it("navigates when strip thumbnail clicked", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      await thumbs[1]!.trigger("click");
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-2.jpg");
    });

    it("marks active thumbnail", () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      expect(thumbs[0]!.classes()).toContain("danx-file-strip__thumb--active");
      expect(thumbs[1]!.classes()).not.toContain("danx-file-strip__thumb--active");
    });
  });

  describe("Standalone close button", () => {
    it("shows standalone close button when closable", () => {
      const wrapper = mountNavigator({ closable: true });
      expect(wrapper.find(".danx-file-navigator__close-btn").exists()).toBe(true);
    });

    it("does not show standalone close button when not closable", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-navigator__close-btn").exists()).toBe(false);
    });

    it("emits close when standalone close button clicked", async () => {
      const wrapper = mountNavigator({ closable: true });
      await wrapper.find(".danx-file-navigator__close-btn").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("Header actions", () => {
    it("shows download button when downloadable", () => {
      const wrapper = mountNavigator({ downloadable: true });
      const downloadBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Download");
      expect(downloadBtn).toBeTruthy();
    });

    it("emits download when download button clicked", async () => {
      const wrapper = mountNavigator({ downloadable: true });
      const downloadBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Download")!;
      await downloadBtn.trigger("click");
      expect(wrapper.emitted("download")).toBeTruthy();
    });

    it("emits download even when file has no URL", async () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { type: "application/pdf", url: "" }),
        downloadable: true,
      });
      const downloadBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Download")!;
      await downloadBtn.trigger("click");
      expect(wrapper.emitted("download")).toBeTruthy();
    });
  });

  describe("Header-actions slot", () => {
    it("renders custom header actions", () => {
      const wrapper = mount(DanxFileNavigator, {
        props: { file: makeFile("1") },
        slots: { "header-actions": "<button class='custom-btn'>Custom</button>" },
        attachTo: document.body,
      });
      wrappers.push(wrapper);
      expect(wrapper.find(".custom-btn").exists()).toBe(true);
    });
  });

  describe("fileInPreview model", () => {
    it("emits update:fileInPreview on navigation", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      await wrapper.find(".danx-file-navigator__arrow--next").trigger("click");
      const emitted = wrapper.emitted("update:fileInPreview");
      expect(emitted).toBeTruthy();
      // Find the navigation emission (not the initial sync)
      const lastEmit = emitted![emitted!.length - 1]!;
      expect((lastEmit[0] as PreviewFile).id).toBe("2");
    });
  });

  describe("Back button", () => {
    it("does not show back button by default", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-navigator__back-btn").exists()).toBe(false);
    });
  });

  describe("Children menu", () => {
    it("shows children menu when file.children is undefined", () => {
      const file = makeFile("1");
      delete (file as unknown as Record<string, unknown>).children;
      const wrapper = mountNavigator({ file });
      expect(wrapper.findComponent({ name: "DanxFileChildrenMenu" }).exists()).toBe(true);
    });
  });

  describe("Audio preview", () => {
    it("renders audio element in carousel for audio files", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { type: "audio/mpeg", url: "https://example.com/song.mp3" }),
      });
      const activeSlide = wrapper.find(".danx-file-navigator__slide--active");
      expect(activeSlide.find(".danx-file-navigator__audio").exists()).toBe(true);
    });
  });

  describe("Previous arrow", () => {
    it("navigates when previous arrow is clicked", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      // Go to file 2 first
      await wrapper.find(".danx-file-navigator__arrow--next").trigger("click");
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-2.jpg");
      // Now go back
      await wrapper.find(".danx-file-navigator__arrow--prev").trigger("click");
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Touch/swipe navigation", () => {
    it("swipe left navigates to next", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      const nav = wrapper.find(".danx-file-navigator");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      });
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-2.jpg");
    });

    it("swipe right navigates to previous", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      // First go to file 2
      await wrapper.find(".danx-file-navigator__arrow--next").trigger("click");
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-2.jpg");

      const nav = wrapper.find(".danx-file-navigator");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [{ clientX: 250, clientY: 100 }],
      });
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-1.jpg");
    });

    it("ignores vertical swipes", async () => {
      const wrapper = mountNavigator({
        relatedFiles: [makeFile("2")],
      });
      const nav = wrapper.find(".danx-file-navigator");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [{ clientX: 180, clientY: 300 }],
      });
      // Should not navigate — vertical swipe
      expect(wrapper.find(".danx-file-navigator__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Preventable download", () => {
    it("emits download event with preventable interface", async () => {
      const wrapper = mountNavigator({ downloadable: true });
      const downloadBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Download")!;
      await downloadBtn.trigger("click");
      const emitted = wrapper.emitted("download");
      expect(emitted).toHaveLength(1);
      expect(emitted![0]![0]).toMatchObject({ prevented: false });
      expect(typeof (emitted![0]![0] as { preventDefault: unknown }).preventDefault).toBe(
        "function"
      );
    });
  });

  describe("Metadata", () => {
    it("shows metadata button when file has meta", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata");
      expect(metaBtn).toBeTruthy();
    });

    it("does not show metadata button when file has no meta or exif", () => {
      const wrapper = mountNavigator();
      const metaBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata");
      expect(metaBtn).toBeUndefined();
    });

    it("shows metadata button when file has only exif", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { exif: { camera: "Canon" } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata");
      expect(metaBtn).toBeTruthy();
    });

    it("shows metadata badge with info count", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { meta: { width: 800, height: 600 }, exif: { camera: "Canon" } }),
      });
      const badge = wrapper.find(".danx-file-navigator__meta-badge");
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe("3");
    });

    it("toggles metadata panel when metadata button clicked", async () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      // No metadata panel initially
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);

      // Click metadata button
      const metaBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);

      // Click again to hide
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("renders metadata in docked mode when localStorage is set", async () => {
      localStorage.setItem("danx-file-metadata-mode", "docked");
      const wrapper = mountNavigator({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      // Docked mode renders as sibling to content, outside __content
      expect(wrapper.find(".danx-file-metadata--docked").exists()).toBe(true);
      localStorage.removeItem("danx-file-metadata-mode");
    });

    it("hides metadata panel when close event fires", async () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-navigator__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);

      // Emit close from metadata panel
      const metadataPanel = wrapper.findComponent({ name: "DanxFileMetadata" });
      metadataPanel.vm.$emit("close");
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });
  });
});
