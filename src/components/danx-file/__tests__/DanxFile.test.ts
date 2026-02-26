import { mount, flushPromises } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { defineComponent, nextTick } from "vue";
import DanxFile from "../DanxFile.vue";
import { DanxProgressBar } from "../../progress-bar";
import { makeFile } from "./test-helpers";

function mountFile(props: Record<string, unknown> = {}) {
  return mount(DanxFile, {
    props: { file: makeFile(), ...props },
  });
}

describe("DanxFile", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Image preview", () => {
    it("renders an img element for image files with a URL", () => {
      const wrapper = mountFile();
      const img = wrapper.find(".danx-file__image");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.com/1.jpg");
      expect(img.attributes("alt")).toBe("file-1.jpg");
    });

    it("uses thumb URL when available", () => {
      const wrapper = mountFile({
        file: makeFile({ thumb: { url: "https://example.com/thumb.jpg" } }),
      });
      expect(wrapper.find(".danx-file__image").attributes("src")).toBe(
        "https://example.com/thumb.jpg"
      );
    });

    it("does not render img when image file has no URL", () => {
      const wrapper = mountFile({ file: makeFile({ url: "" }) });
      expect(wrapper.find(".danx-file__image").exists()).toBe(false);
    });
  });

  describe("Video preview", () => {
    it("renders img with play icon for video files", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "video/mp4", thumb: { url: "https://example.com/thumb.jpg" } }),
      });
      expect(wrapper.find(".danx-file__image").exists()).toBe(true);
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(true);
    });

    it("renders img with play icon for video with optimized URL (no thumb)", () => {
      const wrapper = mountFile({
        file: makeFile({
          type: "video/mp4",
          url: "https://example.com/video.mp4",
          optimized: { url: "https://example.com/optimized.jpg" },
        }),
      });
      expect(wrapper.find(".danx-file__image").exists()).toBe(true);
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(true);
    });

    it("does not show play icon when video has no thumb", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "video/mp4", url: "" }),
      });
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(false);
    });

    it("shows type icon for video with original URL but no thumb or optimized", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "video/mp4", url: "https://example.com/video.mp4" }),
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
      expect(wrapper.find(".danx-file__image").exists()).toBe(false);
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(false);
    });

    it("hides play icon when video has progress", () => {
      const wrapper = mountFile({
        file: makeFile({
          type: "video/mp4",
          thumb: { url: "https://example.com/thumb.jpg" },
          progress: 50,
        }),
      });
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(false);
    });

    it("hides play icon when video has error", () => {
      const wrapper = mountFile({
        file: makeFile({
          type: "video/mp4",
          thumb: { url: "https://example.com/thumb.jpg" },
          error: "Upload failed",
        }),
      });
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(false);
    });
  });

  describe("File-type icon", () => {
    it("shows file-type icon for non-previewable files", () => {
      const wrapper = mountFile({
        file: makeFile({
          type: "text/plain",
          url: "https://example.com/readme.txt",
          name: "readme.txt",
        }),
        size: "lg",
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
      expect(wrapper.find(".danx-file__type-icon-name").text()).toBe("readme.txt");
    });

    it("hides inline filename at compact sizes (xs, sm, md)", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "text/plain", url: "", name: "readme.txt" }),
        size: "md",
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
      expect(wrapper.find(".danx-file__type-icon-name").exists()).toBe(false);
    });

    it("shows file-type icon for image without URL", () => {
      const wrapper = mountFile({
        file: makeFile({ url: "" }),
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
    });
  });

  describe("Progress state", () => {
    it("shows progress overlay when file has progress < 100", () => {
      const wrapper = mountFile({
        file: makeFile({ progress: 45 }),
      });
      expect(wrapper.find(".danx-file__progress").exists()).toBe(true);
      expect(wrapper.find(".danx-file__progress-text").text()).toBe("Uploading... 45%");
    });

    it("shows custom status message when provided", () => {
      const wrapper = mountFile({
        file: makeFile({ progress: 70, statusMessage: "Converting..." }),
      });
      expect(wrapper.find(".danx-file__progress-text").text()).toBe("Converting...");
    });

    it("renders DanxProgressBar with correct value", () => {
      const wrapper = mountFile({
        file: makeFile({ progress: 60 }),
      });
      const progressBar = wrapper.findComponent(DanxProgressBar);
      expect(progressBar.exists()).toBe(true);
      expect(progressBar.props("value")).toBe(60);
    });

    it("does not show progress when progress is null", () => {
      const wrapper = mountFile({
        file: makeFile({ progress: null }),
      });
      expect(wrapper.find(".danx-file__progress").exists()).toBe(false);
    });

    it("does not show progress when progress is 100", () => {
      const wrapper = mountFile({
        file: makeFile({ progress: 100 }),
      });
      expect(wrapper.find(".danx-file__progress").exists()).toBe(false);
    });

    it("does not show progress when error is set (error takes priority)", () => {
      const wrapper = mountFile({
        file: makeFile({ progress: 50, error: "Upload failed" }),
      });
      expect(wrapper.find(".danx-file__progress").exists()).toBe(false);
      expect(wrapper.find(".danx-file__error").exists()).toBe(true);
    });

    it("shows progress at 0%", () => {
      const wrapper = mountFile({
        file: makeFile({ progress: 0 }),
      });
      expect(wrapper.find(".danx-file__progress").exists()).toBe(true);
      expect(wrapper.find(".danx-file__progress-text").text()).toBe("Uploading... 0%");
    });

    it("shows compact progress for xs size with icon and no text", () => {
      const wrapper = mountFile({
        size: "xs",
        file: makeFile({ progress: 50 }),
      });
      expect(wrapper.find(".danx-file__progress--compact").exists()).toBe(true);
      expect(wrapper.find(".danx-file__progress-text").exists()).toBe(false);
      expect(wrapper.findComponent(DanxProgressBar).exists()).toBe(true);
    });

    it("shows standard progress for non-xs sizes", () => {
      const wrapper = mountFile({
        size: "sm",
        file: makeFile({ progress: 50 }),
      });
      expect(wrapper.find(".danx-file__progress--compact").exists()).toBe(false);
      expect(wrapper.find(".danx-file__progress-text").exists()).toBe(true);
    });
  });

  describe("Error state", () => {
    it("shows full error overlay with text at large sizes", () => {
      const wrapper = mountFile({
        file: makeFile({ error: "Upload failed" }),
        size: "lg",
      });
      expect(wrapper.find(".danx-file__error").exists()).toBe(true);
      expect(wrapper.find(".danx-file__error-text").text()).toBe("Upload failed");
    });

    it("does not use DanxPopover at lg/xl sizes", () => {
      for (const size of ["lg", "xl"]) {
        const wrapper = mountFile({
          file: makeFile({ error: "Upload failed" }),
          size,
        });
        expect(wrapper.find(".danx-file__error-popover").exists()).toBe(false);
        expect(wrapper.find(".danx-file__error-text").exists()).toBe(true);
      }
    });

    it("shows compact error with popover at xs/sm/md sizes", () => {
      const wrapper = mountFile({
        file: makeFile({ error: "Upload failed" }),
        size: "md",
      });
      expect(wrapper.find(".danx-file__error--compact").exists()).toBe(true);
      expect(wrapper.find(".danx-file__error-text").exists()).toBe(false);
    });

    it("renders DanxPopover with danger variant at compact sizes", () => {
      const wrapper = mountFile({
        file: makeFile({ error: "Upload failed" }),
        size: "xs",
      });
      const popover = wrapper.findComponent({ name: "DanxPopover" });
      expect(popover.exists()).toBe(true);
      expect(popover.props("trigger")).toBe("hover");
      expect(popover.props("placement")).toBe("top");
      expect(popover.props("variant")).toBe("danger");
    });

    it("passes error message through compact popover", () => {
      // Mount with an always-open DanxPopover stub to verify slot content
      const AlwaysOpenPopover = defineComponent({
        template: "<div><slot name='trigger' /><slot /></div>",
      });
      const wrapper = mount(DanxFile, {
        props: {
          file: makeFile({ error: "Upload failed" }),
          size: "xs" as const,
        },
        global: {
          stubs: { DanxPopover: AlwaysOpenPopover },
        },
      });
      expect(wrapper.text()).toContain("Upload failed");
    });

    it("does not show error when no error", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file__error").exists()).toBe(false);
    });

    it("handles empty error string as no error", () => {
      const wrapper = mountFile({
        file: makeFile({ error: "" }),
      });
      expect(wrapper.find(".danx-file__error").exists()).toBe(false);
      expect(wrapper.find(".danx-file__error--compact").exists()).toBe(false);
    });
  });

  describe("Footer (filename + file size)", () => {
    it("shows filename when showFilename is true", () => {
      const wrapper = mountFile({ showFilename: true });
      expect(wrapper.find(".danx-file__footer").exists()).toBe(true);
      expect(wrapper.find(".danx-file__filename").text()).toBe("file-1.jpg");
    });

    it("hides footer by default", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file__footer").exists()).toBe(false);
    });

    it("hides footer when progress is showing", () => {
      const wrapper = mountFile({
        showFilename: true,
        file: makeFile({ progress: 50 }),
      });
      expect(wrapper.find(".danx-file__footer").exists()).toBe(false);
    });

    it("hides footer when error is showing", () => {
      const wrapper = mountFile({
        showFilename: true,
        file: makeFile({ error: "Failed" }),
      });
      expect(wrapper.find(".danx-file__footer").exists()).toBe(false);
    });

    it("shows file size when showFileSize is true", () => {
      const wrapper = mountFile({
        showFileSize: true,
        file: makeFile({ size: 245760 }),
      });
      expect(wrapper.find(".danx-file__footer").exists()).toBe(true);
      expect(wrapper.find(".danx-file__filesize").text()).toBe("240.0 KiB");
    });

    it("shows both filename and file size together", () => {
      const wrapper = mountFile({
        showFilename: true,
        showFileSize: true,
        file: makeFile({ size: 1048576 }),
      });
      expect(wrapper.find(".danx-file__filename").text()).toBe("file-1.jpg");
      expect(wrapper.find(".danx-file__filesize").text()).toBe("1.0 MiB");
    });

    it("shows file size without filename", () => {
      const wrapper = mountFile({
        showFileSize: true,
        file: makeFile({ size: 512 }),
      });
      expect(wrapper.find(".danx-file__filename").exists()).toBe(false);
      expect(wrapper.find(".danx-file__filesize").text()).toBe("512 B");
    });

    it("hides file size when showFileSize is false", () => {
      const wrapper = mountFile({ showFilename: true });
      expect(wrapper.find(".danx-file__filesize").exists()).toBe(false);
    });

    it("shows 0 B for zero-byte files", () => {
      const wrapper = mountFile({
        showFileSize: true,
        file: makeFile({ size: 0 }),
      });
      expect(wrapper.find(".danx-file__filesize").text()).toBe("0 B");
    });
  });

  describe("Click event", () => {
    it("emits click with file when clicked", async () => {
      const file = makeFile();
      const wrapper = mountFile({ file });
      await wrapper.find(".danx-file").trigger("click");
      expect(wrapper.emitted("click")).toEqual([[file]]);
    });

    it("emits click on Enter keypress", async () => {
      const file = makeFile();
      const wrapper = mountFile({ file });
      await wrapper.find(".danx-file").trigger("keydown.enter");
      expect(wrapper.emitted("click")).toEqual([[file]]);
    });

    it("does not emit click when disabled", async () => {
      const wrapper = mountFile({ disabled: true });
      await wrapper.find(".danx-file").trigger("click");
      expect(wrapper.emitted("click")).toBeUndefined();
    });

    it("applies disabled class when disabled", () => {
      const wrapper = mountFile({ disabled: true });
      expect(wrapper.find(".danx-file--disabled").exists()).toBe(true);
    });

    it("sets tabindex to -1 when disabled", () => {
      const wrapper = mountFile({ disabled: true });
      expect(wrapper.find(".danx-file").attributes("tabindex")).toBe("-1");
    });
  });

  describe("Download action", () => {
    it("shows download button with --download BEM modifier", () => {
      const wrapper = mountFile({ downloadable: true });
      const btn = wrapper.find(".danx-file__action-btn--download");
      expect(btn.exists()).toBe(true);
    });

    it("hides actions when not downloadable or removable", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file__actions").exists()).toBe(false);
    });

    it("emits download event when download button clicked", async () => {
      const file = makeFile();
      const wrapper = mountFile({ file, downloadable: true });
      const buttons = wrapper.findAll(".danx-file__action-btn");
      await buttons[0]!.trigger("click");
      const emitted = wrapper.emitted("download");
      expect(emitted).toHaveLength(1);
      expect(emitted![0]![0]).toMatchObject({ file, prevented: false });
    });
  });

  describe("Remove confirmation", () => {
    it("shows remove button with --remove BEM modifier", () => {
      const wrapper = mountFile({ removable: true });
      expect(wrapper.find(".danx-file__action-btn--remove").exists()).toBe(true);
    });

    it("arms on first click, confirms on second click", async () => {
      const file = makeFile();
      const wrapper = mountFile({ file, removable: true });
      const btn = wrapper.find(".danx-file__action-btn");

      // First click arms
      await btn.trigger("click");
      expect(wrapper.emitted("remove")).toBeUndefined();
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(true);

      // Second click confirms
      await btn.trigger("click");
      expect(wrapper.emitted("remove")).toEqual([[file]]);
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(false);
    });

    it("disarms after 3 second timeout", async () => {
      const wrapper = mountFile({ removable: true });
      const btn = wrapper.find(".danx-file__action-btn");

      await btn.trigger("click");
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(true);

      vi.advanceTimersByTime(3000);
      await nextTick();

      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(false);
    });
  });

  describe("Actions slot", () => {
    it("renders custom actions in slot", () => {
      const wrapper = mount(DanxFile, {
        props: { file: makeFile() },
        slots: { actions: "<button class='custom-action'>Custom</button>" },
      });
      expect(wrapper.find(".custom-action").exists()).toBe(true);
      expect(wrapper.find(".danx-file__actions").exists()).toBe(true);
    });
  });

  describe("Fit prop", () => {
    it("sets --dx-file-thumb-fit CSS variable from fit prop", () => {
      const wrapper = mountFile({ fit: "contain" });
      expect(wrapper.find(".danx-file").attributes("style")).toContain(
        "--dx-file-thumb-fit: contain"
      );
    });

    it("defaults to cover", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file").attributes("style")).toContain(
        "--dx-file-thumb-fit: cover"
      );
    });
  });

  describe("Audio preview", () => {
    it("renders audio element for audio files", () => {
      const wrapper = mountFile({
        file: makeFile({
          type: "audio/mpeg",
          url: "https://example.com/song.mp3",
          name: "song.mp3",
        }),
      });
      const audio = wrapper.find(".danx-file__audio");
      expect(audio.exists()).toBe(true);
      expect(audio.attributes("src")).toBe("https://example.com/song.mp3");
    });

    it("does not render audio for non-audio files", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file__audio").exists()).toBe(false);
    });

    it("does not show type icon when audio is rendered", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "audio/mpeg", url: "https://example.com/song.mp3" }),
      });
      expect(wrapper.find(".danx-file__audio").exists()).toBe(true);
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(false);
    });

    it("renders audio element in preview mode", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({ type: "audio/mpeg", url: "https://example.com/song.mp3" }),
      });
      const audio = wrapper.find(".danx-file__audio");
      expect(audio.exists()).toBe(true);
      expect(audio.attributes("src")).toBe("https://example.com/song.mp3");
    });
  });

  describe("Loading skeleton", () => {
    it("renders skeleton with wave animation when loading is true", () => {
      const wrapper = mountFile({ loading: true });
      const skeleton = wrapper.find(".danx-skeleton");
      expect(skeleton.exists()).toBe(true);
      expect(skeleton.classes()).toContain("danx-skeleton--wave");
    });

    it("does not render skeleton by default", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-skeleton").exists()).toBe(false);
    });

    it("hides image preview when loading", () => {
      const wrapper = mountFile({ loading: true });
      expect(wrapper.find(".danx-file__image").exists()).toBe(false);
    });

    it("hides type icon when loading", () => {
      const wrapper = mountFile({
        loading: true,
        file: makeFile({ type: "text/plain" }),
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(false);
    });
  });

  describe("Lazy loading", () => {
    it("sets loading=lazy on image element", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file__image").attributes("loading")).toBe("lazy");
    });
  });

  describe("Preventable download", () => {
    it("does not trigger browser download when preventDefault is called", async () => {
      const file = makeFile();
      const wrapper = mount(DanxFile, {
        props: {
          file,
          downloadable: true,
          onDownload: (event: { preventDefault(): void }) => {
            event.preventDefault();
          },
        },
      });
      const buttons = wrapper.findAll(".danx-file__action-btn");
      // Should not throw — download is suppressed
      await buttons[0]!.trigger("click");
      const emitted = wrapper.emitted("download");
      expect(emitted).toHaveLength(1);
      expect(emitted![0]![0]).toMatchObject({ prevented: true });
    });
  });

  describe("Timer cleanup on unmount", () => {
    it("clears remove timer on unmount without errors", async () => {
      const wrapper = mountFile({ removable: true });
      const btn = wrapper.find(".danx-file__action-btn");

      // Arm the remove button
      await btn.trigger("click");
      expect(wrapper.find(".danx-file__action-btn--armed").exists()).toBe(true);

      // Unmount while timer is pending
      wrapper.unmount();

      // Advance past the timeout — should not throw
      vi.advanceTimersByTime(5000);
    });
  });

  describe("Enter key while disabled", () => {
    it("does not emit click on Enter keypress when disabled", async () => {
      const wrapper = mountFile({ disabled: true });
      await wrapper.find(".danx-file").trigger("keydown.enter");
      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Download with empty URL", () => {
    it("emits download event even when file has no URL", async () => {
      const wrapper = mountFile({
        file: makeFile({ url: "" }),
        downloadable: true,
      });
      const buttons = wrapper.findAll(".danx-file__action-btn");
      await buttons[0]!.trigger("click");
      expect(wrapper.emitted("download")).toHaveLength(1);
    });
  });

  describe("Both downloadable and removable", () => {
    it("renders both download and remove buttons simultaneously", () => {
      const wrapper = mountFile({ downloadable: true, removable: true });
      const buttons = wrapper.findAll(".danx-file__action-btn");
      expect(buttons.length).toBe(2);
    });
  });

  describe("Actions overlay click.stop", () => {
    it("clicking download does not also emit click", async () => {
      const wrapper = mountFile({ downloadable: true });
      const buttons = wrapper.findAll(".danx-file__action-btn");
      await buttons[0]!.trigger("click");
      expect(wrapper.emitted("click")).toBeUndefined();
    });
  });

  describe("Size prop", () => {
    it("defaults to md size class", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file").classes()).toContain("danx-file--md");
    });

    it("applies xs size class", () => {
      const wrapper = mountFile({ size: "xs" });
      expect(wrapper.find(".danx-file").classes()).toContain("danx-file--xs");
    });

    it("applies sm size class", () => {
      const wrapper = mountFile({ size: "sm" });
      expect(wrapper.find(".danx-file").classes()).toContain("danx-file--sm");
    });

    it("applies lg size class", () => {
      const wrapper = mountFile({ size: "lg" });
      expect(wrapper.find(".danx-file").classes()).toContain("danx-file--lg");
    });

    it("applies xl size class", () => {
      const wrapper = mountFile({ size: "xl" });
      expect(wrapper.find(".danx-file").classes()).toContain("danx-file--xl");
    });

    it("applies xxl size class", () => {
      const wrapper = mountFile({ size: "xxl" });
      expect(wrapper.find(".danx-file").classes()).toContain("danx-file--xxl");
    });

    it("applies auto size class", () => {
      const wrapper = mountFile({ size: "auto" });
      expect(wrapper.find(".danx-file").classes()).toContain("danx-file--auto");
    });
  });

  describe("Accessibility", () => {
    it("has role=button on root element", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file").attributes("role")).toBe("button");
    });

    it("has tabindex=0 when not disabled", () => {
      const wrapper = mountFile();
      expect(wrapper.find(".danx-file").attributes("tabindex")).toBe("0");
    });

    it("has tabindex=-1 when disabled", () => {
      const wrapper = mountFile({ disabled: true });
      expect(wrapper.find(".danx-file").attributes("tabindex")).toBe("-1");
    });
  });

  describe("Preview wrapper structure", () => {
    it("wraps image content in preview div", () => {
      const wrapper = mountFile();
      const preview = wrapper.find(".danx-file__preview");
      expect(preview.exists()).toBe(true);
      expect(preview.find(".danx-file__image").exists()).toBe(true);
    });

    it("wraps skeleton in preview div when loading", () => {
      const wrapper = mountFile({ loading: true });
      const preview = wrapper.find(".danx-file__preview");
      expect(preview.exists()).toBe(true);
      expect(preview.find(".danx-skeleton").exists()).toBe(true);
    });

    it("wraps type icon in preview div", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "text/plain", url: "https://example.com/readme.txt" }),
      });
      const preview = wrapper.find(".danx-file__preview");
      expect(preview.find(".danx-file__type-icon").exists()).toBe(true);
    });

    it("places footer outside preview wrapper", () => {
      const wrapper = mountFile({ showFilename: true });
      const preview = wrapper.find(".danx-file__preview");
      // Footer should be a sibling of preview, not inside it
      expect(preview.find(".danx-file__footer").exists()).toBe(false);
      expect(wrapper.find(".danx-file__footer").exists()).toBe(true);
    });

    it("places actions inside preview wrapper", () => {
      const wrapper = mountFile({ downloadable: true });
      const preview = wrapper.find(".danx-file__preview");
      expect(preview.find(".danx-file__actions").exists()).toBe(true);
    });

    it("wraps audio element in preview div", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "audio/mpeg", url: "https://example.com/song.mp3" }),
      });
      const preview = wrapper.find(".danx-file__preview");
      expect(preview.find(".danx-file__audio").exists()).toBe(true);
    });

    it("wraps progress overlay in preview div", () => {
      const wrapper = mountFile({ file: makeFile({ progress: 50 }) });
      const preview = wrapper.find(".danx-file__preview");
      expect(preview.find(".danx-file__progress").exists()).toBe(true);
    });

    it("wraps error overlay in preview div", () => {
      const wrapper = mountFile({ file: makeFile({ error: "Failed" }) });
      const preview = wrapper.find(".danx-file__preview");
      expect(preview.find(".danx-file__error").exists()).toBe(true);
    });
  });

  describe("Preview mode (mode='preview')", () => {
    it("renders <video controls> for video files", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({ type: "video/mp4", url: "https://example.com/video.mp4" }),
      });
      const video = wrapper.find(".danx-file__video");
      expect(video.exists()).toBe(true);
      expect(video.attributes("controls")).toBeDefined();
      expect(video.attributes("src")).toBe("https://example.com/video.mp4");
      // Should NOT show thumb image or play icon
      expect(wrapper.find(".danx-file__image").exists()).toBe(false);
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(false);
    });

    it("shows type icon for PDF without optimized/thumb URL", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          type: "application/pdf",
          url: "https://example.com/doc.pdf",
          name: "doc.pdf",
        }),
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
      expect(wrapper.find(".danx-file__image").exists()).toBe(false);
    });

    it("renders optimized image for PDF with optimized URL", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          type: "application/pdf",
          url: "https://example.com/doc.pdf",
          optimized: { url: "https://example.com/doc-optimized.jpg" },
        }),
      });
      const img = wrapper.find(".danx-file__image--preview");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.com/doc-optimized.jpg");
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(false);
    });

    it("renders full-size <img> with resolveFileUrl (not thumb) for images", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          url: "https://example.com/full.jpg",
          thumb: { url: "https://example.com/thumb.jpg" },
        }),
      });
      const img = wrapper.find(".danx-file__image");
      expect(img.exists()).toBe(true);
      // Should use the full URL, not thumb
      expect(img.attributes("src")).toBe("https://example.com/full.jpg");
      expect(img.classes()).toContain("danx-file__image--preview");
    });

    it("uses blobUrl as preview image when url is empty", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          url: "",
          blobUrl: "blob:https://example.com/abc123",
        }),
      });
      const img = wrapper.find(".danx-file__image");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("blob:https://example.com/abc123");
    });

    it("uses original URL for video playback, not optimized", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          type: "video/mp4",
          url: "https://example.com/video.mp4",
          optimized: { url: "https://example.com/optimized.jpg" },
        }),
      });
      const video = wrapper.find(".danx-file__video");
      expect(video.exists()).toBe(true);
      expect(video.attributes("src")).toBe("https://example.com/video.mp4");
      expect(wrapper.find(".danx-file__image").exists()).toBe(false);
    });

    it("uses optimized URL when available for preview image", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          url: "https://example.com/original.jpg",
          optimized: { url: "https://example.com/optimized.jpg" },
          thumb: { url: "https://example.com/thumb.jpg" },
        }),
      });
      expect(wrapper.find(".danx-file__image").attributes("src")).toBe(
        "https://example.com/optimized.jpg"
      );
    });

    it("still shows progress overlay in preview mode", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({ progress: 45 }),
      });
      expect(wrapper.find(".danx-file__progress").exists()).toBe(true);
    });

    it("still shows error overlay in preview mode", () => {
      const wrapper = mountFile({
        mode: "preview",
        size: "lg",
        file: makeFile({ error: "Processing failed" }),
      });
      expect(wrapper.find(".danx-file__error").exists()).toBe(true);
    });

    it("shows type icon for non-previewable files in preview mode", () => {
      const wrapper = mountFile({
        mode: "preview",
        size: "lg",
        file: makeFile({
          type: "text/plain",
          url: "https://example.com/readme.txt",
          name: "readme.txt",
        }),
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
    });

    it("shows type icon when preview file has no URL", () => {
      const wrapper = mountFile({
        mode: "preview",
        size: "lg",
        file: makeFile({ type: "video/mp4", url: "" }),
      });
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
      expect(wrapper.find(".danx-file__video").exists()).toBe(false);
    });

    it("does not show play icon in preview mode", () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({ type: "video/mp4", url: "https://example.com/video.mp4" }),
      });
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(false);
    });
  });

  describe("Thumb mode URL resolution", () => {
    it("uses optimized URL when no thumb is set for image file", () => {
      const wrapper = mountFile({
        file: makeFile({
          url: "https://example.com/original.jpg",
          optimized: { url: "https://example.com/optimized.jpg" },
        }),
      });
      expect(wrapper.find(".danx-file__image").attributes("src")).toBe(
        "https://example.com/optimized.jpg"
      );
    });

    it("renders thumb image for PDF with optimized URL", () => {
      const wrapper = mountFile({
        file: makeFile({
          type: "application/pdf",
          url: "https://example.com/doc.pdf",
          optimized: { url: "https://example.com/doc-optimized.jpg" },
        }),
      });
      const img = wrapper.find(".danx-file__image");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("https://example.com/doc-optimized.jpg");
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(false);
    });

    it("still renders thumbnail for video with play icon in thumb mode", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "video/mp4", thumb: { url: "https://example.com/thumb.jpg" } }),
      });
      expect(wrapper.find(".danx-file__image").exists()).toBe(true);
      expect(wrapper.find(".danx-file__image").attributes("src")).toBe(
        "https://example.com/thumb.jpg"
      );
      expect(wrapper.find(".danx-file__play-icon").exists()).toBe(true);
      expect(wrapper.find(".danx-file__video").exists()).toBe(false);
    });

    it("does not render <video> element in thumb mode", () => {
      const wrapper = mountFile({
        file: makeFile({ type: "video/mp4", thumb: { url: "https://example.com/thumb.jpg" } }),
      });
      expect(wrapper.find(".danx-file__video").exists()).toBe(false);
    });
  });

  describe("Blob URL fallback in thumb mode", () => {
    it("uses blobUrl when url is empty for image file", () => {
      const wrapper = mountFile({
        file: makeFile({ url: "", blobUrl: "blob:https://example.com/abc123" }),
      });
      const img = wrapper.find(".danx-file__image");
      expect(img.exists()).toBe(true);
      expect(img.attributes("src")).toBe("blob:https://example.com/abc123");
    });
  });

  describe("Text preview", () => {
    it("renders MarkdownContent for text file with meta.content in preview mode", async () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          type: "text/plain",
          url: "",
          name: "readme.txt",
          meta: { content: "Hello world" },
        }),
      });
      await flushPromises();
      expect(wrapper.find(".danx-file__text-preview").exists()).toBe(true);
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(false);
    });

    it("shows type icon for text file without content in preview mode", async () => {
      const wrapper = mountFile({
        mode: "preview",
        size: "lg",
        file: makeFile({
          type: "text/plain",
          url: "",
          name: "readme.txt",
        }),
      });
      await flushPromises();
      expect(wrapper.find(".danx-file__text-preview").exists()).toBe(false);
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
    });

    it("shows type icon for text file in thumb mode (not text preview)", async () => {
      const wrapper = mountFile({
        mode: "thumb",
        file: makeFile({
          type: "text/plain",
          url: "",
          name: "readme.txt",
          meta: { content: "Hello world" },
        }),
      });
      await flushPromises();
      expect(wrapper.find(".danx-file__text-preview").exists()).toBe(false);
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);
    });

    it("fetches content from URL when no meta.content", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve("Fetched content"),
      });
      vi.stubGlobal("fetch", mockFetch);

      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          type: "text/markdown",
          url: "https://example.com/readme.md",
          name: "readme.md",
        }),
      });
      await flushPromises();
      expect(mockFetch).toHaveBeenCalledWith("https://example.com/readme.md");
      expect(wrapper.find(".danx-file__text-preview").exists()).toBe(true);

      vi.unstubAllGlobals();
    });

    it("handles fetch failure gracefully", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("fetch", mockFetch);

      const wrapper = mountFile({
        mode: "preview",
        size: "lg",
        file: makeFile({
          type: "text/plain",
          url: "https://example.com/readme.txt",
          name: "readme.txt",
        }),
      });
      await flushPromises();
      expect(wrapper.find(".danx-file__text-preview").exists()).toBe(false);
      expect(wrapper.find(".danx-file__type-icon").exists()).toBe(true);

      vi.unstubAllGlobals();
    });

    it("renders MarkdownEditor in readonly mode for text/markdown files", async () => {
      const wrapper = mountFile({
        mode: "preview",
        file: makeFile({
          type: "text/markdown",
          url: "",
          name: "notes.md",
          meta: { content: "# Title\n\nSome **bold** text." },
        }),
      });
      await flushPromises();
      expect(wrapper.find(".danx-file__text-preview").exists()).toBe(true);
      expect(wrapper.find(".dx-markdown-editor").exists()).toBe(true);
      expect(wrapper.find(".dx-markdown-editor.is-readonly").exists()).toBe(true);
    });
  });
});
