import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { nextTick } from "vue";
import DanxFileViewer from "../DanxFileViewer.vue";
import type { PreviewFile } from "../../danx-file/types";
import { makeFile, makeChild } from "../../danx-file/__tests__/test-helpers";

const wrappers: ReturnType<typeof mount>[] = [];

// New layout/zoom features persist to localStorage. Reset between tests so a
// run from a previous test does not bleed into the next mount's defaults.
beforeEach(() => {
  if (typeof window !== "undefined") {
    window.localStorage.clear();
  }
});

/** Find a DanxButton by its tooltip prop and return its inner <button> element. */
function findButtonByTooltip(wrapper: ReturnType<typeof mount>, tooltip: string) {
  const comp = wrapper
    .findAllComponents({ name: "DanxButton" })
    .find((btn) => btn.props("tooltip") === tooltip);
  return comp?.find(".danx-button");
}

/** Find the children navigation button by its icon prop. */
function findChildrenButton(wrapper: ReturnType<typeof mount>) {
  const comp = wrapper
    .findAllComponents({ name: "DanxButton" })
    .find((btn) => btn.props("icon") === "list");
  return comp?.find(".danx-button");
}

function mountViewer(props: Record<string, unknown> = {}) {
  const wrapper = mount(DanxFileViewer, {
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
      expect(activeSlide.find(".danx-file__image").exists()).toBe(true);
    });

    it("renders DanxFile in preview mode with video for video files", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { mime: "video/mp4", url: "https://example.com/video.mp4" }),
      });
      const activeSlide = wrapper.find(".danx-file-viewer__slide--active");
      expect(activeSlide.find(".danx-file__video").exists()).toBe(true);
    });

    it("renders type icon for PDF without optimized/thumb URL", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { mime: "application/pdf" }),
      });
      const activeSlide = wrapper.find(".danx-file-viewer__slide--active");
      expect(activeSlide.find(".danx-file__type-icon").exists()).toBe(true);
    });

    it("renders DanxFile with type icon for non-previewable files", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { mime: "text/plain" }),
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
      await wrapper.find(".danx-file-viewer").trigger("keydown", { key: "ArrowRight" });
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
      await flushPromises();
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      await thumbs[1]!.trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
    });

    it("marks active thumbnail", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      const thumbs = wrapper.findAll(".danx-file-strip__thumb");
      expect(thumbs[0]!.classes()).toContain("danx-file-strip__thumb--active");
      expect(thumbs[1]!.classes()).not.toContain("danx-file-strip__thumb--active");
    });
  });

  describe("Header actions", () => {
    it("shows download button when downloadable", () => {
      const wrapper = mountViewer({ downloadable: true });
      const downloadBtn = findButtonByTooltip(wrapper, "Download");
      expect(downloadBtn).toBeTruthy();
    });

    it("emits download when download button clicked", async () => {
      const wrapper = mountViewer({ downloadable: true });
      const downloadBtn = findButtonByTooltip(wrapper, "Download")!;
      await downloadBtn.trigger("click");
      expect(wrapper.emitted("download")).toBeTruthy();
    });

    it("emits download even when file has no URL", async () => {
      const wrapper = mountViewer({
        file: makeFile("1", { mime: "application/pdf", url: "" }),
        downloadable: true,
      });
      const downloadBtn = findButtonByTooltip(wrapper, "Download")!;
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
      const lastEmit = emitted![emitted!.length - 1]!;
      expect((lastEmit[0] as PreviewFile).id).toBe("2");
    });
  });

  describe("Navigation buttons", () => {
    it("does not show nav buttons when no children and at root", () => {
      const wrapper = mountViewer({ file: makeFile("1", { children: [] }) });
      expect(wrapper.find(".danx-file-viewer__nav-buttons").exists()).toBe(false);
    });

    it("shows children button with count when file has children", () => {
      const children = [makeChild("c1"), makeChild("c2")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper);
      expect(btn).toBeTruthy();
      expect(btn!.text()).toContain("2");
      expect(btn!.text()).toContain("Children");
    });

    it("uses custom childrenLabel prop", () => {
      const children = [makeChild("c1"), makeChild("c2"), makeChild("c3")];
      const wrapper = mountViewer({
        file: makeFile("1", { children }),
        childrenLabel: "Pages",
      });
      const btn = findChildrenButton(wrapper);
      expect(btn!.text()).toContain("3");
      expect(btn!.text()).toContain("Pages");
    });

    it("children button has variant info", () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const comp = wrapper
        .findAllComponents({ name: "DanxButton" })
        .find((btn) => btn.props("icon") === "list");
      expect(comp).toBeTruthy();
      expect(comp!.props("variant")).toBe("info");
    });

    it("parent button has back icon", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");
      const parentComp = wrapper
        .findAllComponents({ name: "DanxButton" })
        .find((b) => b.props("icon") === "back");
      expect(parentComp).toBeTruthy();
    });

    it("does not show Go to parent button at root level", () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findButtonByTooltip(wrapper, "Go to parent");
      expect(btn).toBeUndefined();
    });

    it("dives into children when View children clicked", async () => {
      const children = [makeChild("c1"), makeChild("c2")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("child-c1.jpg");
    });

    it("shows Go to parent button when viewing children", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const viewChildrenBtn = findChildrenButton(wrapper)!;
      await viewChildrenBtn.trigger("click");
      const parentBtn = findButtonByTooltip(wrapper, "Go to parent");
      expect(parentBtn).toBeTruthy();
    });

    it("returns to parent when Go to parent clicked", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const viewChildrenBtn = findChildrenButton(wrapper)!;
      await viewChildrenBtn.trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("child-c1.jpg");

      const parentBtn = findButtonByTooltip(wrapper, "Go to parent")!;
      await parentBtn.trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Breadcrumb navigation", () => {
    it("does not show breadcrumbs by default", () => {
      const wrapper = mountViewer();
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);
    });

    it("shows breadcrumbs when viewing a child file", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);

      // Dive into children via button
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");

      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(true);
      const items = wrapper.findAll(".danx-file-viewer__breadcrumb-item");
      expect(items.length).toBe(2);
      expect(items[0]!.text()).toBe("file-1.jpg");
      expect(items[1]!.text()).toBe("child-c1.jpg");
    });

    it("navigates to ancestor when breadcrumb clicked", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");

      // Click parent breadcrumb
      const breadcrumbBtn = wrapper.find(".danx-file-viewer__breadcrumb-item");
      await breadcrumbBtn.trigger("click");

      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);
    });

    it("hides breadcrumbs after returning to root", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(true);

      const breadcrumbBtn = wrapper.find(".danx-file-viewer__breadcrumb-item");
      await breadcrumbBtn.trigger("click");
      expect(wrapper.find(".danx-file-viewer__breadcrumbs").exists()).toBe(false);
    });

    it("marks last breadcrumb as active (non-clickable)", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");

      const activeItem = wrapper.find(".danx-file-viewer__breadcrumb-item--active");
      expect(activeItem.exists()).toBe(true);
      expect(activeItem.element.tagName).toBe("SPAN");
      expect(activeItem.attributes("aria-current")).toBe("step");
    });

    it("shows slide counter when viewing children with multiple files", async () => {
      const children = [makeChild("c1"), makeChild("c2"), makeChild("c3")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });

      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");

      // Counter should show children count
      expect(wrapper.find(".danx-file-viewer__counter").text()).toBe("1 / 3");
    });

    it("shows separators between breadcrumb items", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");

      const separators = wrapper.findAll(".danx-file-viewer__breadcrumb-separator");
      expect(separators.length).toBe(1);
      expect(separators[0]!.text()).toBe("/");
    });

    it("shows 3-level breadcrumbs for nested children", async () => {
      const grandchildren = [makeChild("gc1", { name: "grandchild.jpg", children: [] })];
      const children = [makeChild("c1", { children: grandchildren }), makeChild("c2")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });

      // Dive into children
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("child-c1.jpg");

      // Dive into grandchildren
      const childBtn = findChildrenButton(wrapper)!;
      await childBtn.trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("grandchild.jpg");

      // Breadcrumbs should show 3 levels
      const items = wrapper.findAll(".danx-file-viewer__breadcrumb-item");
      expect(items.length).toBe(3);
      expect(items[0]!.text()).toBe("file-1.jpg");
      expect(items[1]!.text()).toBe("child-c1.jpg");
      expect(items[2]!.text()).toBe("grandchild.jpg");
    });

    it("has aria-label on breadcrumb nav element", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");

      const nav = wrapper.find(".danx-file-viewer__breadcrumbs");
      expect(nav.attributes("aria-label")).toBe("File navigation");
    });

    it("breadcrumbs render outside the header element", async () => {
      const children = [makeChild("c1")];
      const wrapper = mountViewer({ file: makeFile("1", { children }) });
      const btn = findChildrenButton(wrapper)!;
      await btn.trigger("click");

      // Breadcrumbs should NOT be inside the header
      expect(
        wrapper.find(".danx-file-viewer__header .danx-file-viewer__breadcrumbs").exists()
      ).toBe(false);
      // Breadcrumbs should be a direct child of the viewer
      expect(wrapper.find(".danx-file-viewer > .danx-file-viewer__breadcrumbs").exists()).toBe(
        true
      );
    });
  });

  describe("loadChildren emit", () => {
    it("emits loadChildren when file.children is undefined", () => {
      const file = makeFile("1", { children: undefined });
      const wrapper = mountViewer({ file });
      const emitted = wrapper.emitted("loadChildren");
      expect(emitted).toBeTruthy();
      expect(emitted![0]![0]).toEqual(file);
    });

    it("does not emit loadChildren when children are loaded", () => {
      const wrapper = mountViewer({ file: makeFile("1", { children: [] }) });
      expect(wrapper.emitted("loadChildren")).toBeFalsy();
    });

    it("emits loadChildren when navigating to a file with undefined children", async () => {
      const file2 = makeFile("2", { children: undefined });
      const wrapper = mountViewer({
        file: makeFile("1", { children: [] }),
        relatedFiles: [file2],
      });
      // Initial mount should not emit (children is [])
      expect(wrapper.emitted("loadChildren")).toBeFalsy();

      // Navigate to file-2 which has undefined children
      await wrapper.find(".danx-file-viewer__arrow--next").trigger("click");
      const emitted = wrapper.emitted("loadChildren");
      expect(emitted).toBeTruthy();
      expect((emitted![0]![0] as PreviewFile).id).toBe("2");
    });
  });

  describe("Audio preview", () => {
    it("renders audio element in carousel for audio files", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { mime: "audio/mpeg", url: "https://example.com/song.mp3" }),
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
      await wrapper.find(".danx-file-viewer__arrow--next").trigger("click");
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
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
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Preventable download", () => {
    it("emits download event with preventable interface", async () => {
      const wrapper = mountViewer({ downloadable: true });
      const downloadBtn = findButtonByTooltip(wrapper, "Download")!;
      await downloadBtn.trigger("click");
      const emitted = wrapper.emitted("download");
      expect(emitted).toHaveLength(1);
      expect(emitted![0]![0]).toMatchObject({ prevented: false });
      expect(typeof (emitted![0]![0] as { preventDefault: unknown }).preventDefault).toBe(
        "function"
      );
    });
  });

  describe("Touch/swipe edge cases", () => {
    it("handles touchstart with empty touches array", async () => {
      const wrapper = mountViewer({
        relatedFiles: [makeFile("2")],
      });
      const nav = wrapper.find(".danx-file-viewer");
      await nav.trigger("touchstart", {
        touches: [],
      });
      await nav.trigger("touchend", {
        // touchStartX/Y stayed at 0; deltaX=30 is under the 50px threshold
        changedTouches: [{ clientX: 30, clientY: 0 }],
      });
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Metadata", () => {
    it("shows metadata button when file has meta", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = findButtonByTooltip(wrapper, "Metadata");
      expect(metaBtn).toBeTruthy();
    });

    it("does not show metadata button when file has no meta or exif", () => {
      const wrapper = mountViewer();
      const metaBtn = findButtonByTooltip(wrapper, "Metadata");
      expect(metaBtn).toBeUndefined();
    });

    it("does not show metadata panel for file without meta/exif even if metadataEnabled was toggled", async () => {
      // First mount with meta to toggle metadata on
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = findButtonByTooltip(wrapper, "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);

      // Navigate to a file without meta — metadata panel should hide
      await wrapper.setProps({
        file: makeFile("2"),
        relatedFiles: [],
      });
      await nextTick();
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("shows metadata button when file has only exif", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { exif: { camera: "Canon" } }),
      });
      const metaBtn = findButtonByTooltip(wrapper, "Metadata");
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
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);

      const metaBtn = findButtonByTooltip(wrapper, "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);

      await metaBtn.trigger("click");
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("renders metadata inside split panel", async () => {
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const metaBtn = findButtonByTooltip(wrapper, "Metadata")!;
      await metaBtn.trigger("click");
      expect(wrapper.findComponent({ name: "DanxSplitPanel" }).exists()).toBe(true);
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
    });

    it("uses DanxSplitPanel for body layout", () => {
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      expect(wrapper.findComponent({ name: "DanxSplitPanel" }).exists()).toBe(true);
    });
  });

  describe("Layout toggles", () => {
    it("defaults to no-sidebar + paged (no toolbar, bottom strip)", () => {
      const wrapper = mountViewer({ relatedFiles: [makeFile("2")] });
      expect(wrapper.classes()).toContain("danx-file-viewer--no-sidebar");
      expect(wrapper.classes()).toContain("danx-file-viewer--paged");
      expect(wrapper.find(".danx-file-viewer__toolbar").exists()).toBe(false);
    });

    it("shows toolbar when layoutToggles is non-empty", () => {
      const wrapper = mountViewer({ layoutToggles: ["sidebar"] });
      expect(wrapper.find(".danx-file-viewer__toolbar").exists()).toBe(true);
    });

    it("shows toolbar when zoomable=true (even with no layout toggles)", () => {
      const wrapper = mountViewer({ zoomable: true });
      expect(wrapper.find(".danx-file-viewer__toolbar").exists()).toBe(true);
    });

    it("respects showToolbar=false override", () => {
      const wrapper = mountViewer({
        layoutToggles: ["sidebar", "continuous"],
        showToolbar: false,
      });
      expect(wrapper.find(".danx-file-viewer__toolbar").exists()).toBe(false);
    });

    it("respects showToolbar=true override even when no opt-in", () => {
      const wrapper = mountViewer({ showToolbar: true });
      expect(wrapper.find(".danx-file-viewer__toolbar").exists()).toBe(true);
    });

    it("defaultSidebar=true renders vertical thumbnail sidebar", async () => {
      const wrapper = mountViewer({
        defaultSidebar: true,
        layoutToggles: ["sidebar"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--sidebar");
      const stripComps = wrapper.findAllComponents({ name: "DanxFileThumbnailStrip" });
      expect(stripComps.some((s) => s.props("orientation") === "vertical")).toBe(true);
    });

    it("defaultContinuous=true renders DanxFileViewerContinuous + no slides", async () => {
      const wrapper = mountViewer({
        defaultContinuous: true,
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
      expect(wrapper.findComponent({ name: "DanxFileViewerContinuous" }).exists()).toBe(true);
      expect(wrapper.find(".danx-file-viewer__slide").exists()).toBe(false);
      expect(wrapper.find(".danx-file-viewer__arrow--next").exists()).toBe(false);
    });

    it("supports both toggles on at the same time (sidebar + continuous)", async () => {
      const wrapper = mountViewer({
        defaultSidebar: true,
        defaultContinuous: true,
        layoutToggles: ["sidebar", "continuous"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--sidebar");
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
      expect(wrapper.findComponent({ name: "DanxFileViewerContinuous" }).exists()).toBe(true);
      const stripComps = wrapper.findAllComponents({ name: "DanxFileThumbnailStrip" });
      expect(stripComps.some((s) => s.props("orientation") === "vertical")).toBe(true);
    });

    it("clears stored sidebar flag when not in layoutToggles", () => {
      window.localStorage.setItem("danx-file-viewer-sidebar", "true");
      const wrapper = mountViewer({ layoutToggles: [] });
      expect(wrapper.classes()).toContain("danx-file-viewer--no-sidebar");
    });

    it("clears stored continuous flag when not in layoutToggles", () => {
      window.localStorage.setItem("danx-file-viewer-continuous", "true");
      const wrapper = mountViewer({ layoutToggles: ["sidebar"] });
      expect(wrapper.classes()).toContain("danx-file-viewer--paged");
    });

    it("hydrates sidebar + continuous from localStorage", async () => {
      window.localStorage.setItem("danx-file-viewer-sidebar", "true");
      window.localStorage.setItem("danx-file-viewer-continuous", "true");
      const wrapper = mountViewer({ layoutToggles: ["sidebar", "continuous"] });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--sidebar");
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
    });

    it("continuous mode ignores ArrowRight/Left keyboard nav (scroll owns it)", async () => {
      const wrapper = mountViewer({
        defaultContinuous: true,
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      await wrapper.find(".danx-file-viewer").trigger("keydown", { key: "ArrowRight" });
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });

    it("continuous emits update:activeFileId → updates currentFile", async () => {
      const wrapper = mountViewer({
        defaultContinuous: true,
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      await flushPromises();
      const cont = wrapper.findComponent({ name: "DanxFileViewerContinuous" });
      cont.vm.$emit("update:activeFileId", "2");
      await nextTick();
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-2.jpg");
    });

    it("continuous mode ignores swipe navigation", async () => {
      const wrapper = mountViewer({
        defaultContinuous: true,
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      const nav = wrapper.find(".danx-file-viewer");
      await nav.trigger("touchstart", { touches: [{ clientX: 200, clientY: 100 }] });
      await nav.trigger("touchend", { changedTouches: [{ clientX: 100, clientY: 100 }] });
      expect(wrapper.find(".danx-file-viewer__filename").text()).toBe("file-1.jpg");
    });
  });

  describe("Locked authoritative props", () => {
    it("locked continuous overrides a conflicting localStorage value", async () => {
      window.localStorage.setItem("danx-file-viewer-continuous", "false");
      const wrapper = mountViewer({
        continuous: true,
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
      expect(wrapper.findComponent({ name: "DanxFileViewerContinuous" }).exists()).toBe(true);
    });

    it("locked sidebar overrides a conflicting localStorage value", async () => {
      window.localStorage.setItem("danx-file-viewer-sidebar", "false");
      const wrapper = mountViewer({
        sidebar: true,
        layoutToggles: ["sidebar"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--sidebar");
    });

    it("locked continuous never writes to localStorage", async () => {
      mountViewer({ continuous: true, relatedFiles: [makeFile("2")] });
      await flushPromises();
      expect(window.localStorage.getItem("danx-file-viewer-continuous")).toBe(null);
    });

    it("locked sidebar toggle button does not render in toolbar", () => {
      const wrapper = mountViewer({
        layoutToggles: ["sidebar", "continuous"],
        sidebar: true,
      });
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      expect(toolbar.props("layoutToggles")).toEqual(["continuous"]);
      const labels = toolbar.findAll(".danx-button-group__button").map((b) => b.text());
      expect(labels.some((t) => t.includes("Sidebar"))).toBe(false);
      expect(labels.some((t) => t.includes("Continuous"))).toBe(true);
    });

    it("locked continuous toggle button does not render in toolbar", () => {
      const wrapper = mountViewer({
        layoutToggles: ["sidebar", "continuous"],
        continuous: true,
      });
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      expect(toolbar.props("layoutToggles")).toEqual(["sidebar"]);
    });

    it("layoutToggles=[] + locked continuous still renders continuous (watcher does not clobber)", async () => {
      const wrapper = mountViewer({
        layoutToggles: [],
        continuous: true,
        relatedFiles: [makeFile("2"), makeFile("3")],
      });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
    });

    it("layoutToggles=[] + locked sidebar still renders sidebar (watcher does not clobber)", async () => {
      const wrapper = mountViewer({
        layoutToggles: [],
        sidebar: true,
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--sidebar");
    });

    it("fully locked viewer hides the toolbar entirely", () => {
      const wrapper = mountViewer({
        layoutToggles: ["sidebar", "continuous"],
        sidebar: true,
        continuous: true,
        zoomable: true,
        zoom: 100,
      });
      expect(wrapper.find(".danx-file-viewer__toolbar").exists()).toBe(false);
    });

    it("locked continuous reacts to prop changes (false → true)", async () => {
      const wrapper = mountViewer({ continuous: false, relatedFiles: [makeFile("2")] });
      expect(wrapper.classes()).toContain("danx-file-viewer--paged");
      await wrapper.setProps({ continuous: true });
      await flushPromises();
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
    });

    it("locked zoom pins the zoom model, bypassing localStorage", () => {
      window.localStorage.setItem("danx-file-viewer-zoom", "175");
      const wrapper = mountViewer({ zoomable: true, zoom: 45 });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      expect(zoomable.props("zoom")).toBe(45);
    });

    it("locked zoom ignores update:zoom writes (no localStorage, model stays)", async () => {
      const wrapper = mountViewer({ zoomable: true, zoom: 45 });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      zoomable.vm.$emit("update:zoom", 200);
      await nextTick();
      expect(window.localStorage.getItem("danx-file-viewer-zoom")).toBe(null);
      expect(zoomable.props("zoom")).toBe(45);
    });

    it("locked zoom hides toolbar zoom controls but disables zoom gestures on zoomable", () => {
      const wrapper = mountViewer({ zoomable: true, zoom: 45, showToolbar: true });
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      expect(toolbar.props("zoomable")).toBe(false);
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      expect(zoomable.props("wheelDisabled")).toBe(true);
      expect(zoomable.props("keyboardDisabled")).toBe(true);
    });

    it("locked zoom passes lockZoom + zoom to continuous body", async () => {
      const wrapper = mountViewer({
        zoomable: true,
        zoom: 45,
        continuous: true,
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      const cont = wrapper.findComponent({ name: "DanxFileViewerContinuous" });
      expect(cont.props("zoom")).toBe(45);
      expect(cont.props("lockZoom")).toBe(true);
      expect(cont.props("zoomable")).toBe(true);
    });

    it("undefined locked props preserve seed + toggle behavior (regression guard)", async () => {
      window.localStorage.setItem("danx-file-viewer-continuous", "true");
      const wrapper = mountViewer({
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      // localStorage seed honored, toggle button present, pref still writable.
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      expect(toolbar.props("layoutToggles")).toEqual(["continuous"]);
    });
  });

  describe("Zoom integration", () => {
    it("wraps active slide in DanxZoomable when zoomable=true", () => {
      const wrapper = mountViewer({ zoomable: true });
      expect(wrapper.findComponent({ name: "DanxZoomable" }).exists()).toBe(true);
    });

    it("does not wrap in DanxZoomable when zoomable=false", () => {
      const wrapper = mountViewer({ zoomable: false });
      expect(wrapper.findComponent({ name: "DanxZoomable" }).exists()).toBe(false);
    });

    it("does not wrap in DanxZoomable when continuous is on", async () => {
      const wrapper = mountViewer({
        zoomable: true,
        defaultContinuous: true,
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2")],
      });
      await flushPromises();
      expect(wrapper.findComponent({ name: "DanxZoomable" }).exists()).toBe(false);
    });

    it("persists zoom value across slide changes", async () => {
      const wrapper = mountViewer({
        zoomable: true,
        relatedFiles: [makeFile("2")],
      });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      zoomable.vm.$emit("update:zoom", 175);
      await nextTick();
      // localStorage written
      expect(window.localStorage.getItem("danx-file-viewer-zoom")).toBe("175");
    });

    it("hydrates zoom from localStorage on mount", () => {
      window.localStorage.setItem("danx-file-viewer-zoom", "175");
      const wrapper = mountViewer({ zoomable: true });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      expect(zoomable.props("zoom")).toBe(175);
    });

    it("uses defaultZoom when localStorage empty", () => {
      const wrapper = mountViewer({ zoomable: true, defaultZoom: 150 });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      expect(zoomable.props("zoom")).toBe(150);
    });

    it("toolbar zoom controls stay enabled in continuous mode (item-level scale)", async () => {
      const wrapper = mountViewer({
        zoomable: true,
        defaultContinuous: true,
        layoutToggles: ["continuous"],
      });
      await flushPromises();
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      expect(toolbar.props("zoomable")).toBe(true);
    });

    it("continuous body receives zoom + zoomable from parent", async () => {
      const wrapper = mountViewer({
        zoomable: true,
        defaultContinuous: true,
        defaultZoom: 175,
        layoutToggles: ["continuous"],
      });
      await flushPromises();
      const cont = wrapper.findComponent({ name: "DanxFileViewerContinuous" });
      expect(cont.props("zoom")).toBe(175);
      expect(cont.props("zoomable")).toBe(true);
    });

    it("continuous body update:zoom round-trips through parent persistence", async () => {
      const wrapper = mountViewer({
        zoomable: true,
        defaultContinuous: true,
        layoutToggles: ["continuous"],
      });
      await flushPromises();
      const cont = wrapper.findComponent({ name: "DanxFileViewerContinuous" });
      cont.vm.$emit("update:zoom", 220);
      await nextTick();
      expect(window.localStorage.getItem("danx-file-viewer-zoom")).toBe("220");
    });

    it("toolbar update:sidebar v-model toggles the sidebar flag", async () => {
      const wrapper = mountViewer({
        layoutToggles: ["sidebar"],
        relatedFiles: [makeFile("2")],
      });
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      toolbar.vm.$emit("update:sidebar", true);
      await nextTick();
      expect(wrapper.classes()).toContain("danx-file-viewer--sidebar");
      expect(window.localStorage.getItem("danx-file-viewer-sidebar")).toBe("true");
    });

    it("toolbar update:continuous v-model toggles the continuous flag", async () => {
      const wrapper = mountViewer({
        layoutToggles: ["continuous"],
        relatedFiles: [makeFile("2")],
      });
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      toolbar.vm.$emit("update:continuous", true);
      await nextTick();
      expect(wrapper.classes()).toContain("danx-file-viewer--continuous");
      expect(window.localStorage.getItem("danx-file-viewer-continuous")).toBe("true");
    });

    it("toolbar zoom v-model updates persisted zoom", async () => {
      const wrapper = mountViewer({ zoomable: true });
      const toolbar = wrapper.findComponent({ name: "DanxFileViewerToolbar" });
      toolbar.vm.$emit("update:zoom", 200);
      await nextTick();
      expect(window.localStorage.getItem("danx-file-viewer-zoom")).toBe("200");
    });

    it("pan v-model updates from DanxZoomable do not throw", async () => {
      const wrapper = mountViewer({ zoomable: true });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      zoomable.vm.$emit("update:pan", { x: 50, y: 30 });
      await nextTick();
      expect(zoomable.props("pan")).toEqual({ x: 50, y: 30 });
    });

    it("pan resets to zero when active file changes", async () => {
      const wrapper = mountViewer({
        zoomable: true,
        relatedFiles: [makeFile("2")],
      });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      zoomable.vm.$emit("update:pan", { x: 50, y: 30 });
      await nextTick();
      await wrapper.find(".danx-file-viewer__arrow--next").trigger("click");
      await nextTick();
      const zoomable2 = wrapper.findComponent({ name: "DanxZoomable" });
      expect(zoomable2.props("pan")).toEqual({ x: 0, y: 0 });
    });

    it("split panel set handler updates metadata visibility", async () => {
      const wrapper = mountViewer({
        file: makeFile("1", { meta: { width: 800 } }),
      });
      const split = wrapper.findComponent({ name: "DanxSplitPanel" });
      // Simulate split panel emitting the panel list with metadata
      split.vm.$emit("update:modelValue", ["viewer", "metadata"]);
      await nextTick();
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(true);
      split.vm.$emit("update:modelValue", ["viewer"]);
      await nextTick();
      expect(wrapper.find(".danx-file-metadata").exists()).toBe(false);
    });

    it("storageKey namespaces preferences", () => {
      const wrapper = mountViewer({ zoomable: true, storageKey: "custom-key" });
      const zoomable = wrapper.findComponent({ name: "DanxZoomable" });
      zoomable.vm.$emit("update:zoom", 200);
      expect(window.localStorage.getItem("custom-key-zoom")).toBe("200");
      expect(window.localStorage.getItem("danx-file-viewer-zoom")).toBe(null);
      wrapper.unmount();
    });
  });
});
