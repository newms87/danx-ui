import { mount } from "@vue/test-utils";
import { describe, it, expect, afterEach } from "vitest";
import { defineComponent } from "vue";
import DanxFileViewer from "../DanxFileViewer.vue";
import type { PreviewFile } from "../../danx-file/types";
import { makeFile, makeChild } from "../../danx-file/__tests__/test-helpers";

const wrappers: ReturnType<typeof mount>[] = [];

// Stub DanxPopover to render its slot content for testing popover-based interactions
const PopoverStub = defineComponent({
  template: '<div><slot name="trigger" /><slot /></div>',
});

function mountViewer(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxFileViewer, {
    props: { file: makeFile("1"), ...props },
    attachTo: document.body,
  });
  wrappers.push(wrapper);
  return wrapper;
}

function mountViewerWithPopoverStub(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxFileViewer, {
    props: { file: makeFile("1"), ...props },
    attachTo: document.body,
    global: {
      stubs: { DanxPopover: PopoverStub },
    },
  });
  wrappers.push(wrapper);
  return wrapper;
}

afterEach(() => {
  for (const w of wrappers) w.unmount();
  wrappers.length = 0;
  localStorage.removeItem("danx-file-metadata-mode");
});

describe("DanxFileViewer", () => {
  describe("Rendering", () => {
    it("renders the navigator container", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-viewer").exists()).toBe(true);
    });

    it("displays filename in header", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });

    it("renders DanxFile in preview mode inside active slide for image files", () => {
      const wrapper = mountViewer();
      const activeSlide = wrapper.find(".danx-file-viewer__slide--active");
      expect(activeSlide.exists()).toBe(true);
      // DanxFile renders .danx-file__image for images in preview mode
      expect(activeSlide.find(".danx-file__image").exists()).toBe(true);
    });

    it("renders DanxFile in preview mode with video for video files", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { type: "video/mp4", url: "https://example.com/video.mp4" }),
      });
      const activeSlide = wrapper.find(".danx-file-viewer__slide--active");
      expect(activeSlide.find(".danx-file__video").exists()).toBe(true);
    });

    it("renders DanxFile in preview mode with PDF embed for PDF files", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { type: "application/pdf" }),
      });
      const activeSlide = wrapper.find(".danx-file-viewer__slide--active");
      expect(activeSlide.find(".danx-file__pdf").exists()).toBe(true);
    });

    it("renders DanxFile with type icon for non-previewable files", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { type: "text/plain" }),
      });
      const activeSlide = wrapper.find(".danx-file-viewer__slide--active");
      expect(activeSlide.find(".danx-file__type-icon").exists()).toBe(true);
    });
  });

  describe("Virtual carousel", () => {
    it("renders multiple slides when navigating with related files", () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      const slides = wrapper.findAll(".danx-file-viewer__slide");
      // At index 0 with 3 files, buffer shows indices 0-2
      expect(slides.length).toBe(3);
    });

    it("only one slide has --active class", () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      const activeSlides = wrapper.findAll(".danx-file-viewer__slide--active");
      expect(activeSlides.length).toBe(1);
    });
  });

  describe("Navigation", () => {
    it("shows navigation arrows when related files exist", () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      expect(wrapper.find(".danx-file-viewer__arrow--next").exists()).toBe(true);
    });

    it("does not show arrows for single file", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-viewer__arrow--prev").exists()).toBe(false);
      expect(wrapper.find(".danx-file-viewer__arrow--next").exists()).toBe(false);
    });

    it("navigates to next file when next arrow clicked", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      await wrapper.find(".danx-file-viewer__arrow--next").trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
    });

    it("shows slide counter", () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      expect(wrapper.find(".danx-file-viewer__counter").text()).toBe("1 / 3");
    });

    it("does not show counter for single file", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-viewer__counter").exists()).toBe(false);
    });
  });

  describe("Keyboard navigation", () => {
    it("navigates with ArrowRight key", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      await wrapper.find(".danx-file-viewer").trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
    });

    it("navigates with ArrowLeft key", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      // Go to file 2 first
      await wrapper.find(".danx-file-viewer").trigger("keydown", { key: "ArrowRight" });
      // Go back to file 1
      await wrapper.find(".danx-file-viewer").trigger("keydown", { key: "ArrowLeft" });
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Thumbnail strip", () => {
    it("renders strip for 2+ files", () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      expect(wrapper.find(".danx-file-strip").exists()).toBe(true);
    });

    it("does not render strip for single file", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-strip").exists()).toBe(false);
    });

    it("navigates when strip thumbnail clicked", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      await thumbs[1]!.trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
    });

    it("marks active thumbnail", () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      expect(thumbs[0]!.classes()).toContain("danx-file-strip__thumb--active");
      expect(thumbs[1]!.classes()).not.toContain("danx-file-strip__thumb--active");
    });
  });

  describe("Standalone close button", () => {
    it("shows standalone close button when closable", () => {
      const wrapper = mountViewer({ closable: true });
      expect(wrapper.find(".danx-file-viewer__close-btn").exists()).toBe(true);
    });

    it("does not show standalone close button when not closable", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-viewer__close-btn").exists()).toBe(false);
    });

    it("emits close when standalone close button clicked", async () => {
      const wrapper = mountViewer({ closable: true });
      await wrapper.find(".danx-file-viewer__close-btn").trigger("click");
      expect(wrapper.emitted("close")).toHaveLength(1);
    });
  });

  describe("Header actions", () => {
    it("shows download button when downloadable", () => {
      const wrapper = mountViewer({ downloadable: true });
      const downloadBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Download");
      expect(downloadBtn).toBeTruthy();
    });

    it("emits download when download button clicked", async () => {
      const wrapper = mountViewer({ downloadable: true });
      const downloadBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Download")!;
      await downloadBtn.trigger("click");
      expect(wrapper.emitted("download")).toBeTruthy();
    });

    it("emits download even when file has no URL", async () => {
      const wrapper = mountViewer({
        file: makeFile("1", { type: "application/pdf", url: "" }),
        downloadable: true,
      });
      const downloadBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Download")!;
      await downloadBtn.trigger("click");
      expect(wrapper.emitted("download")).toBeTruthy();
    });
  });

  describe("Header-actions slot", () => {
    it("renders custom header actions", () => {
      const wrapper = mount(DanxFileViewer, {
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
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      await wrapper.find(".danx-file-viewer__arrow--next").trigger("click");
      const emitted = wrapper.emitted("update:fileInPreview");
      expect(emitted).toBeTruthy();
      // Find the navigation emission (not the initial sync)
      const lastEmit = emitted![emitted!.length - 1]!;
      expect((lastEmit[0] as PreviewFile).id).toBe("2");
    });
  });

  describe("Breadcrumb navigation", () => {
    it("does not show breadcrumbs by default", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);
    });

    it("shows breadcrumbs when viewing a child file", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewerWithPopoverStub({
        file: makeFile("1", { children }),
      });
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);

      // Dive into child
      const childItem = wrapper.find(".danx-file-children__item");
      await childItem.trigger("click");

      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(true);
      const items = wrapper.findAll(".danx-file-viewer__breadcrumb-item");
      expect(items.length).toBe(2);
      expect(items[0]!.text()).toBe("file-1.jpg");
      expect(items[1]!.text()).toBe("child-c1.jpg");
    });

    it("navigates to ancestor when breadcrumb clicked", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewerWithPopoverStub({
        file: makeFile("1", { children }),
      });
      // Dive into child
      const childItem = wrapper.find(".danx-file-children__item");
      await childItem.trigger("click");

      // Click parent breadcrumb
      const breadcrumbBtn = wrapper.find(".danx-file-viewer__breadcrumb-item");
      await breadcrumbBtn.trigger("click");

      // Should be back at parent
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);
    });

    it("hides breadcrumbs after returning to root", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewerWithPopoverStub({
        file: makeFile("1", { children }),
      });
      // Dive into child
      const childItem = wrapper.find(".danx-file-children__item");
      await childItem.trigger("click");
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(true);

      // Click parent breadcrumb
      const breadcrumbBtn = wrapper.find(".danx-file-viewer__breadcrumb-item");
      await breadcrumbBtn.trigger("click");

      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);
    });

    it("marks last breadcrumb as active (non-clickable)", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewerWithPopoverStub({
        file: makeFile("1", { children }),
      });
      const childItem = wrapper.find(".danx-file-children__item");
      await childItem.trigger("click");

      const activeItem = wrapper.find(".danx-file-viewer__breadcrumb-item--active");
      expect(activeItem.exists()).toBe(true);
      expect(activeItem.element.tagName).toBe("SPAN");
      expect(activeItem.attributes("aria-current")).toBe("step");
    });

    it("hides slide counter when viewing a child file", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewerWithPopoverStub({
        file: makeFile("1"),
        relatedFiles: [makeFile("2")],
      });
      // Counter should be visible initially
      expect(wrapper.find(".danx-file-viewer__counter").exists()).toBe(true);

      // Update file to have children and dive in
      await wrapper.setProps({ file: makeFile("1", { children }) });
      const childItem = wrapper.find(".danx-file-children__item");
      await childItem.trigger("click");

      // Counter should be hidden when viewing a child
      expect(wrapper.find(".danx-file-viewer__counter").exists()).toBe(false);
    });

    it("shows separators between breadcrumb items", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewerWithPopoverStub({
        file: makeFile("1", { children }),
      });
      const childItem = wrapper.find(".danx-file-children__item");
      await childItem.trigger("click");

      const separators = wrapper.findAll(".danx-file-viewer__breadcrumb-separator");
      expect(separators.length).toBe(1);
      expect(separators[0]!.text()).toBe("/");
    });
  });

  describe("Children menu", () => {
    it("shows children menu when file.children is undefined", () => {
      const file = makeFile("1", { children: undefined });
      const wrapper = mountViewer({ file });
      expect(wrapper.findComponent({ name: "DanxFileChildrenMenu" }).exists()).toBe(true);
    });

    it("re-emits loadChildren event from DanxFileChildrenMenu", () => {
      const file = makeFile("1", { children: undefined });
      const wrapper = mountViewerWithPopoverStub({ file });
      const childrenMenu = wrapper.findComponent({ name: "DanxFileChildrenMenu" });
      const targetFile = makeFile("target");
      childrenMenu.vm.$emit("loadChildren", targetFile);
      const emitted = wrapper.emitted("loadChildren")!;
      // Last emission should be our manually triggered one
      const lastEmission = emitted[emitted.length - 1]!;
      expect(lastEmission[0]).toBe(targetFile);
    });
  });

  describe("Audio preview", () => {
    it("renders audio element in carousel for audio files", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { type: "audio/mpeg", url: "https://example.com/song.mp3" }),
      });
      const activeSlide = wrapper.find(".danx-file-viewer__slide--active");
      expect(activeSlide.find(".danx-file__audio").exists()).toBe(true);
    });
  });

  describe("Previous arrow", () => {
    it("navigates when previous arrow is clicked", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      // Go to file 2 first
      await wrapper.find(".danx-file-viewer__arrow--next").trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
      // Now go back
      await wrapper.find(".danx-file-viewer__arrow--prev").trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Touch/swipe navigation", () => {
    it("swipe left navigates to next", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      const nav = wrapper.find(".danx-file-viewer");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [{ clientX: 100, clientY: 100 }],
      });
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
    });

    it("swipe right navigates to previous", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      // First go to file 2
      await wrapper.find(".danx-file-viewer__arrow--next").trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");

      const nav = wrapper.find(".danx-file-viewer");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 100, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [{ clientX: 250, clientY: 100 }],
      });
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });

    it("handles touchend with empty changedTouches", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      const nav = wrapper.find(".danx-file-viewer");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [],
      });
      // Should not navigate or throw
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });

    it("ignores sub-threshold horizontal swipes", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      const nav = wrapper.find(".danx-file-viewer");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [{ clientX: 170, clientY: 100 }],
      });
      // 30px horizontal is below the 50px threshold — should not navigate
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });

    it("ignores vertical swipes", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      const nav = wrapper.find(".danx-file-viewer");
      await nav.trigger("touchstart", {
        touches: [{ clientX: 200, clientY: 100 }],
      });
      await nav.trigger("touchend", {
        changedTouches: [{ clientX: 180, clientY: 300 }],
      });
      // Should not navigate — vertical swipe
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Preventable download", () => {
    it("emits download event with preventable interface", async () => {
      const wrapper = mountViewer({ downloadable: true });
      const downloadBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
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
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata");
      expect(metaBtn).toBeTruthy();
    });

    it("does not show metadata button when file has no meta or exif", () => {
      const wrapper = mountViewer();
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata");
      expect(metaBtn).toBeUndefined();
    });

    it("shows metadata button when file has only exif", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { exif: { camera: "Canon" } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata");
      expect(metaBtn).toBeTruthy();
    });

    it("shows metadata badge with info count", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800, height: 600 }, exif: { camera: "Canon" } }),
      });
      const badge = wrapper.find(".danx-file-viewer__meta-badge");
      expect(badge.exists()).toBe(true);
      expect(badge.text()).toBe("3");
    });

    it("toggles metadata panel when metadata button clicked", async () => {
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      // No metadata panel initially
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);

      // Click metadata button
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);

      // Click again to hide
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("renders metadata in docked mode when localStorage is set", async () => {
      localStorage.setItem("danx-file-metadata-mode", "docked");
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      // Docked mode renders as sibling to content, outside __content
      expect(wrapper.find(".danx-file-metadata--docked").exists()).toBe(true);
    });

    it("hides metadata panel when close event fires", async () => {
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);

      // Emit close from metadata panel
      const metadataPanel = wrapper.findComponent({ name: "DanxFileMetadata" });
      metadataPanel.vm.$emit("close");
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("renders metadata in overlay mode (default) when localStorage is not set", async () => {
      // Clear any existing localStorage setting
      localStorage.removeItem("danx-file-metadata-mode");
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      // Overlay mode renders inside __content with class --overlay (or no special class)
      const metadata = wrapper.find(".danx-file-metadata");
      expect(metadata.exists()).toBe(true);
      // Metadata should be a child of .danx-file-viewer__content (overlay positioning)
      expect(wrapper.find(".danx-file-viewer__content .danx-file-metadata").exists()).toBe(true);
    });

    it("applies docked class when metadata is in docked mode", async () => {
      localStorage.setItem("danx-file-metadata-mode", "docked");
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      // Docked mode has --docked class and is a sibling to content (not inside __content)
      const dockedMetadata = wrapper.find(".danx-file-metadata--docked");
      expect(dockedMetadata.exists()).toBe(true);
      // In docked mode, metadata should be a direct child of __body, not __content
      expect(wrapper.find(".danx-file-viewer__body > .danx-file-metadata--docked").exists()).toBe(
        true
      );
    });

    it("closes docked metadata panel when close event fires", async () => {
      localStorage.setItem("danx-file-metadata-mode", "docked");
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata--docked").exists()).toBe(true);

      // Emit close from docked metadata panel
      const metadataPanel = wrapper.findComponent({ name: "DanxFileMetadata" });
      metadataPanel.vm.$emit("close");
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("updates mode from overlay to docked via DanxFileMetadata toggle", async () => {
      localStorage.removeItem("danx-file-metadata-mode");
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata--overlay").exists()).toBe(true);

      // Toggle overlay → docked
      const toggleBtn = wrapper
        .findComponent({ name: "DanxFileMetadata" })
        .findAll(".danx-button")
        .find((btn) => btn.attributes("title") === "Toggle mode")!;
      await toggleBtn.trigger("click");
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-file-metadata--docked").exists()).toBe(true);
    });

    it("updates mode from docked to overlay via DanxFileMetadata toggle", async () => {
      localStorage.setItem("danx-file-metadata-mode", "docked");
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = wrapper
        .findAll(".danx-file-viewer__header-actions .danx-button")
        .find((btn) => btn.attributes("title") === "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata--docked").exists()).toBe(true);

      // Toggle docked → overlay (exercises v-model:mode on the docked instance)
      const toggleBtn = wrapper
        .findComponent({ name: "DanxFileMetadata" })
        .findAll(".danx-button")
        .find((btn) => btn.attributes("title") === "Toggle mode")!;
      await toggleBtn.trigger("click");
      await wrapper.vm.$nextTick();
      expect(wrapper.find(".danx-file-metadata--overlay").exists()).toBe(true);
    });
  });
});
