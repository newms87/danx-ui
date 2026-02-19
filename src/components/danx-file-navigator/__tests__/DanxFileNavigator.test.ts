import { mount } from "@vue/test-utils";
import { describe, it, expect, afterEach } from "vitest";
import DanxFileNavigator from "../DanxFileNavigator.vue";
import type { PreviewFile } from "../../danx-file/types";

function makeFile(id: string, overrides: Partial<PreviewFile> = {}): PreviewFile {
  return {
    id,
    name: `file-${id}.jpg`,
    size: 1024,
    type: "image/jpeg",
    url: `https://example.com/${id}.jpg`,
    children: [],
    ...overrides,
  };
}

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

    it("renders image preview for image files", () => {
      const wrapper = mountNavigator();
      expect(wrapper.find(".danx-file-navigator__image").exists()).toBe(true);
    });

    it("renders video preview for video files", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { type: "video/mp4", url: "https://example.com/video.mp4" }),
      });
      expect(wrapper.find(".danx-file-navigator__video").exists()).toBe(true);
    });

    it("renders no-preview for non-previewable files", () => {
      const wrapper = mountNavigator({
        file: makeFile("1", { type: "application/pdf" }),
      });
      expect(wrapper.find(".danx-file-navigator__no-preview").exists()).toBe(true);
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

  describe("Header actions", () => {
    it("shows download button when downloadable", () => {
      const wrapper = mountNavigator({ downloadable: true });
      const btns = wrapper.findAll(".danx-file-navigator__header-actions .danx-button");
      expect(btns.length).toBeGreaterThanOrEqual(1);
    });

    it("shows close button when closable", () => {
      const wrapper = mountNavigator({ closable: true });
      const btns = wrapper.findAll(".danx-file-navigator__header-actions .danx-button");
      expect(btns.length).toBeGreaterThanOrEqual(1);
    });

    it("emits close when close button clicked", async () => {
      const wrapper = mountNavigator({ closable: true });
      const btns = wrapper.findAll(".danx-file-navigator__header-actions .danx-button");
      await btns[btns.length - 1]!.trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });

    it("emits download when download button clicked", async () => {
      const wrapper = mountNavigator({ downloadable: true });
      const btns = wrapper.findAll(".danx-file-navigator__header-actions .danx-button");
      await btns[0]!.trigger("click");
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
