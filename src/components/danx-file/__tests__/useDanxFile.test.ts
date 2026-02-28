import { flushPromises, mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { defineComponent, nextTick, reactive } from "vue";
import { useDanxFile, type UseDanxFileReturn } from "../useDanxFile";
import type { DanxFileProps } from "../types";
import { makeFile } from "./test-helpers";

/** Create a composable inside a mounted component (needed for watch). */
function createUseDanxFile(propsOverrides: Partial<DanxFileProps> = {}) {
  const props = reactive({
    file: makeFile(),
    mode: "thumb" as const,
    size: "md" as const,
    fit: "cover" as const,
    showFilename: false,
    showFileSize: false,
    downloadable: false,
    removable: false,
    disabled: false,
    loading: false,
    ...propsOverrides,
  }) as Required<DanxFileProps>;

  let result!: UseDanxFileReturn;
  const wrapper = mount(
    defineComponent({
      setup() {
        result = useDanxFile(props);
        return {};
      },
      template: "<div />",
    })
  );
  return { result, props, wrapper };
}

describe("useDanxFile", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("sizeClass", () => {
    it("returns danx-file--md by default", () => {
      const { result } = createUseDanxFile();
      expect(result.sizeClass.value).toBe("danx-file--md");
    });

    it("reflects the current size prop", () => {
      const { result } = createUseDanxFile({ size: "xl" });
      expect(result.sizeClass.value).toBe("danx-file--xl");
    });
  });

  describe("isXsSize", () => {
    it("is true for xs", () => {
      const { result } = createUseDanxFile({ size: "xs" });
      expect(result.isXsSize.value).toBe(true);
    });

    it("is false for sm", () => {
      const { result } = createUseDanxFile({ size: "sm" });
      expect(result.isXsSize.value).toBe(false);
    });
  });

  describe("isCompactDisplay", () => {
    it("is true for xs, sm, md", () => {
      for (const size of ["xs", "sm", "md"] as const) {
        const { result } = createUseDanxFile({ size });
        expect(result.isCompactDisplay.value).toBe(true);
      }
    });

    it("is false for lg, xl, xxl, auto", () => {
      for (const size of ["lg", "xl", "xxl", "auto"] as const) {
        const { result } = createUseDanxFile({ size });
        expect(result.isCompactDisplay.value).toBe(false);
      }
    });
  });

  describe("isPreviewMode", () => {
    it("is false in thumb mode", () => {
      const { result } = createUseDanxFile({ mode: "thumb" });
      expect(result.isPreviewMode.value).toBe(false);
    });

    it("is true in preview mode", () => {
      const { result } = createUseDanxFile({ mode: "preview" });
      expect(result.isPreviewMode.value).toBe(true);
    });
  });

  describe("originalUrl", () => {
    it("returns file url when available", () => {
      const { result } = createUseDanxFile();
      expect(result.originalUrl.value).toBe("https://example.com/1.jpg");
    });

    it("falls back to blobUrl", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ url: "", blobUrl: "blob:abc" }),
      });
      expect(result.originalUrl.value).toBe("blob:abc");
    });

    it("returns empty when no url or blobUrl", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ url: "" }),
      });
      expect(result.originalUrl.value).toBe("");
    });
  });

  describe("previewImageUrl", () => {
    it("returns empty for video files", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "video/mp4" }),
      });
      expect(result.previewImageUrl.value).toBe("");
    });

    it("returns empty for audio files", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "audio/mpeg" }),
      });
      expect(result.previewImageUrl.value).toBe("");
    });

    it("prefers optimized URL", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ optimized: { url: "https://example.com/opt.jpg" } }),
      });
      expect(result.previewImageUrl.value).toBe("https://example.com/opt.jpg");
    });

    it("falls back to original for images", () => {
      const { result } = createUseDanxFile();
      expect(result.previewImageUrl.value).toBe("https://example.com/1.jpg");
    });

    it("returns empty for non-image without optimized", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "application/pdf", url: "https://example.com/doc.pdf" }),
      });
      expect(result.previewImageUrl.value).toBe("");
    });
  });

  describe("thumbImageUrl", () => {
    it("prefers thumb URL", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ thumb: { url: "https://example.com/thumb.jpg" } }),
      });
      expect(result.thumbImageUrl.value).toBe("https://example.com/thumb.jpg");
    });

    it("falls back to optimized", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ optimized: { url: "https://example.com/opt.jpg" } }),
      });
      expect(result.thumbImageUrl.value).toBe("https://example.com/opt.jpg");
    });

    it("falls back to original for images", () => {
      const { result } = createUseDanxFile();
      expect(result.thumbImageUrl.value).toBe("https://example.com/1.jpg");
    });

    it("returns empty for video without thumb or optimized", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "video/mp4", url: "https://example.com/v.mp4" }),
      });
      expect(result.thumbImageUrl.value).toBe("");
    });
  });

  describe("visibility flags", () => {
    it("showPreviewVideo is true for video in preview mode with URL", () => {
      const { result } = createUseDanxFile({
        mode: "preview",
        file: makeFile({ mime: "video/mp4", url: "https://example.com/v.mp4" }),
      });
      expect(result.showPreviewVideo.value).toBe(true);
    });

    it("showPreviewVideo is false in thumb mode", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "video/mp4", url: "https://example.com/v.mp4" }),
      });
      expect(result.showPreviewVideo.value).toBe(false);
    });

    it("showPreviewVideo is false when video has no URL", () => {
      const { result } = createUseDanxFile({
        mode: "preview",
        file: makeFile({ mime: "video/mp4", url: "" }),
      });
      expect(result.showPreviewVideo.value).toBe(false);
    });

    it("showPreviewImage is true for image in preview mode", () => {
      const { result } = createUseDanxFile({ mode: "preview" });
      expect(result.showPreviewImage.value).toBe(true);
    });

    it("showPreviewImage is false in thumb mode", () => {
      const { result } = createUseDanxFile();
      expect(result.showPreviewImage.value).toBe(false);
    });

    it("showAudio is true for audio with URL", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "audio/mpeg", url: "https://example.com/a.mp3" }),
      });
      expect(result.showAudio.value).toBe(true);
    });

    it("showAudio is false for audio without URL", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "audio/mpeg", url: "" }),
      });
      expect(result.showAudio.value).toBe(false);
    });

    it("showThumbImage is true for image in thumb mode", () => {
      const { result } = createUseDanxFile();
      expect(result.showThumbImage.value).toBe(true);
    });

    it("showThumbImage is false in preview mode", () => {
      const { result } = createUseDanxFile({ mode: "preview" });
      expect(result.showThumbImage.value).toBe(false);
    });

    it("showThumbPlayIcon is true for video with thumb in thumb mode", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "video/mp4", thumb: { url: "https://example.com/t.jpg" } }),
      });
      expect(result.showThumbPlayIcon.value).toBe(true);
    });

    it("showThumbPlayIcon is false in preview mode", () => {
      const { result } = createUseDanxFile({
        mode: "preview",
        file: makeFile({ mime: "video/mp4", thumb: { url: "https://example.com/t.jpg" } }),
      });
      expect(result.showThumbPlayIcon.value).toBe(false);
    });
  });

  describe("showTypeIcon", () => {
    it("is false when audio is shown", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "audio/mpeg", url: "https://example.com/a.mp3" }),
      });
      expect(result.showTypeIcon.value).toBe(false);
    });

    it("is true when no visual content in thumb mode", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "application/pdf", url: "https://example.com/doc.pdf" }),
      });
      expect(result.showTypeIcon.value).toBe(true);
    });

    it("is false when thumb image is shown", () => {
      const { result } = createUseDanxFile();
      expect(result.showTypeIcon.value).toBe(false);
    });

    it("is true in preview mode with no video/image", () => {
      const { result } = createUseDanxFile({
        mode: "preview",
        file: makeFile({ mime: "application/pdf", url: "https://example.com/doc.pdf" }),
      });
      expect(result.showTypeIcon.value).toBe(true);
    });

    it("is false when text content is shown in preview mode", async () => {
      const { result } = createUseDanxFile({
        mode: "preview",
        file: makeFile({
          mime: "text/plain",
          url: "",
          meta: { content: "Hello" },
        }),
      });
      await flushPromises();
      expect(result.showPreviewText.value).toBe(true);
      expect(result.showTypeIcon.value).toBe(false);
    });
  });

  describe("showProgress and showError", () => {
    it("showProgress is true when in progress and no error", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ progress: 50 }),
      });
      expect(result.showProgress.value).toBe(true);
    });

    it("showProgress is false when error overrides", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ progress: 50, error: "Failed" }),
      });
      expect(result.showProgress.value).toBe(false);
    });

    it("showProgress is false when progress is null", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ progress: null }),
      });
      expect(result.showProgress.value).toBe(false);
    });

    it("showProgress is false when progress is 100", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ progress: 100 }),
      });
      expect(result.showProgress.value).toBe(false);
    });

    it("showError is true when error is set", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ error: "Upload failed" }),
      });
      expect(result.showError.value).toBe(true);
    });

    it("showError is false for empty string", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ error: "" }),
      });
      expect(result.showError.value).toBe(false);
    });
  });

  describe("iconName", () => {
    it("returns play for video", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "video/mp4" }),
      });
      expect(result.iconName.value).toBe("play");
    });

    it("returns document for generic file types", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "application/octet-stream" }),
      });
      expect(result.iconName.value).toBe("document");
    });
  });

  describe("fileSizeText", () => {
    it("returns formatted size when showFileSize is true", () => {
      const { result } = createUseDanxFile({
        showFileSize: true,
        file: makeFile({ size: 245760 }),
      });
      expect(result.fileSizeText.value).toBe("240.0 KiB");
    });

    it("returns empty when showFileSize is false", () => {
      const { result } = createUseDanxFile({
        file: makeFile({ size: 245760 }),
      });
      expect(result.fileSizeText.value).toBe("");
    });

    it("returns empty when file size is null", () => {
      const { result } = createUseDanxFile({
        showFileSize: true,
        file: makeFile({ size: null as unknown as number }),
      });
      expect(result.fileSizeText.value).toBe("");
    });
  });

  describe("showFooter", () => {
    it("is true when showFilename is true", () => {
      const { result } = createUseDanxFile({ showFilename: true });
      expect(result.showFooter.value).toBe(true);
    });

    it("is true when showFileSize is true", () => {
      const { result } = createUseDanxFile({ showFileSize: true });
      expect(result.showFooter.value).toBe(true);
    });

    it("is false by default", () => {
      const { result } = createUseDanxFile();
      expect(result.showFooter.value).toBe(false);
    });
  });

  describe("fitStyle", () => {
    it("sets --dx-file-thumb-fit from fit prop", () => {
      const { result } = createUseDanxFile({ fit: "contain" });
      expect(result.fitStyle.value).toEqual({ "--dx-file-thumb-fit": "contain" });
    });

    it("defaults to cover", () => {
      const { result } = createUseDanxFile();
      expect(result.fitStyle.value).toEqual({ "--dx-file-thumb-fit": "cover" });
    });
  });

  describe("textContent", () => {
    it("resolves from meta.content synchronously", async () => {
      const { result } = createUseDanxFile({
        file: makeFile({
          mime: "text/plain",
          url: "",
          meta: { content: "Hello world" },
        }),
      });
      await flushPromises();
      expect(result.textContent.value).toBe("Hello world");
    });

    it("fetches from URL when no meta.content", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve("Fetched content"),
      });
      vi.stubGlobal("fetch", mockFetch);

      const { result } = createUseDanxFile({
        file: makeFile({
          mime: "text/markdown",
          url: "https://example.com/readme.md",
        }),
      });
      await flushPromises();
      expect(mockFetch).toHaveBeenCalledWith("https://example.com/readme.md");
      expect(result.textContent.value).toBe("Fetched content");

      vi.unstubAllGlobals();
    });

    it("sets empty string on fetch failure", async () => {
      const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
      vi.stubGlobal("fetch", mockFetch);

      const { result } = createUseDanxFile({
        file: makeFile({
          mime: "text/plain",
          url: "https://example.com/readme.txt",
        }),
      });
      await flushPromises();
      expect(result.textContent.value).toBe("");

      vi.unstubAllGlobals();
    });

    it("clears textContent for non-text files", async () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "image/jpeg" }),
      });
      await flushPromises();
      expect(result.textContent.value).toBe("");
    });

    it("sets empty when text file has no URL and no meta.content", async () => {
      const { result } = createUseDanxFile({
        file: makeFile({ mime: "text/plain", url: "" }),
      });
      await flushPromises();
      expect(result.textContent.value).toBe("");
    });

    it("uses blobUrl for fetch when url is empty", async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        text: () => Promise.resolve("Blob content"),
      });
      vi.stubGlobal("fetch", mockFetch);

      const { result } = createUseDanxFile({
        file: makeFile({
          mime: "text/plain",
          url: "",
          blobUrl: "blob:abc",
        }),
      });
      await flushPromises();
      expect(mockFetch).toHaveBeenCalledWith("blob:abc");
      expect(result.textContent.value).toBe("Blob content");

      vi.unstubAllGlobals();
    });
  });

  describe("showPreviewText", () => {
    it("is true for text file with content in preview mode", async () => {
      const { result } = createUseDanxFile({
        mode: "preview",
        file: makeFile({
          mime: "text/plain",
          url: "",
          meta: { content: "Hello" },
        }),
      });
      await flushPromises();
      expect(result.showPreviewText.value).toBe(true);
    });

    it("is false in thumb mode", async () => {
      const { result } = createUseDanxFile({
        file: makeFile({
          mime: "text/plain",
          url: "",
          meta: { content: "Hello" },
        }),
      });
      await flushPromises();
      expect(result.showPreviewText.value).toBe(false);
    });

    it("is false when no text content resolved", async () => {
      const { result } = createUseDanxFile({
        mode: "preview",
        file: makeFile({ mime: "text/plain", url: "" }),
      });
      await flushPromises();
      expect(result.showPreviewText.value).toBe(false);
    });
  });

  describe("reactivity", () => {
    it("updates when props change", async () => {
      const { result, props } = createUseDanxFile({ size: "md" });
      expect(result.sizeClass.value).toBe("danx-file--md");

      props.size = "lg";
      await nextTick();
      expect(result.sizeClass.value).toBe("danx-file--lg");
    });
  });
});
