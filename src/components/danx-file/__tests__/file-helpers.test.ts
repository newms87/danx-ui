import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  resolveFileUrl,
  resolveThumbUrl,
  isImage,
  isVideo,
  isPdf,
  isAudio,
  isPreviewable,
  isInProgress,
  hasChildren,
  fileTypeIcon,
  formatFileSize,
  createDownloadEvent,
  triggerFileDownload,
} from "../file-helpers";
import { downloadFile } from "../../../shared/download";
import { makeFile } from "./test-helpers";

vi.mock("../../../shared/download", () => ({
  downloadFile: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("resolveFileUrl", () => {
  it("returns optimized URL when available", () => {
    const file = makeFile({ optimized: { url: "https://example.com/optimized.jpg" } });
    expect(resolveFileUrl(file)).toBe("https://example.com/optimized.jpg");
  });

  it("returns url when no optimized", () => {
    const file = makeFile();
    expect(resolveFileUrl(file)).toBe("https://example.com/1.jpg");
  });

  it("returns blobUrl when no url or optimized", () => {
    const file = makeFile({ url: "", blobUrl: "blob:http://localhost/abc" });
    expect(resolveFileUrl(file)).toBe("blob:http://localhost/abc");
  });

  it("returns empty string when nothing available", () => {
    const file = makeFile({ url: "" });
    expect(resolveFileUrl(file)).toBe("");
  });
});

describe("resolveThumbUrl", () => {
  it("returns thumb URL when available", () => {
    const file = makeFile({ thumb: { url: "https://example.com/thumb.jpg" } });
    expect(resolveThumbUrl(file)).toBe("https://example.com/thumb.jpg");
  });

  it("falls back to resolveFileUrl when no thumb", () => {
    const file = makeFile();
    expect(resolveThumbUrl(file)).toBe("https://example.com/1.jpg");
  });

  it("returns optimized URL when no thumb but optimized exists", () => {
    const file = makeFile({ optimized: { url: "https://example.com/opt.jpg" } });
    expect(resolveThumbUrl(file)).toBe("https://example.com/opt.jpg");
  });
});

describe("isImage", () => {
  it("returns true for image MIME types", () => {
    expect(isImage(makeFile({ type: "image/jpeg" }))).toBe(true);
    expect(isImage(makeFile({ type: "image/png" }))).toBe(true);
    expect(isImage(makeFile({ type: "image/gif" }))).toBe(true);
    expect(isImage(makeFile({ type: "image/webp" }))).toBe(true);
  });

  it("returns false for non-image types", () => {
    expect(isImage(makeFile({ type: "video/mp4" }))).toBe(false);
    expect(isImage(makeFile({ type: "application/pdf" }))).toBe(false);
  });
});

describe("isVideo", () => {
  it("returns true for video MIME types", () => {
    expect(isVideo(makeFile({ type: "video/mp4" }))).toBe(true);
    expect(isVideo(makeFile({ type: "video/webm" }))).toBe(true);
  });

  it("returns false for non-video types", () => {
    expect(isVideo(makeFile({ type: "image/jpeg" }))).toBe(false);
  });
});

describe("isAudio", () => {
  it("returns true for audio MIME types", () => {
    expect(isAudio(makeFile({ type: "audio/mpeg" }))).toBe(true);
    expect(isAudio(makeFile({ type: "audio/wav" }))).toBe(true);
    expect(isAudio(makeFile({ type: "audio/ogg" }))).toBe(true);
  });

  it("returns false for non-audio types", () => {
    expect(isAudio(makeFile({ type: "image/jpeg" }))).toBe(false);
    expect(isAudio(makeFile({ type: "video/mp4" }))).toBe(false);
  });
});

describe("isPdf", () => {
  it("returns true for PDF MIME type", () => {
    expect(isPdf(makeFile({ type: "application/pdf" }))).toBe(true);
  });

  it("returns false for non-PDF types", () => {
    expect(isPdf(makeFile({ type: "image/jpeg" }))).toBe(false);
  });
});

describe("isPreviewable", () => {
  it("returns true for images, videos, audio, and PDFs", () => {
    expect(isPreviewable(makeFile({ type: "image/jpeg" }))).toBe(true);
    expect(isPreviewable(makeFile({ type: "video/mp4" }))).toBe(true);
    expect(isPreviewable(makeFile({ type: "audio/mpeg" }))).toBe(true);
    expect(isPreviewable(makeFile({ type: "application/pdf" }))).toBe(true);
  });

  it("returns false for non-previewable types", () => {
    expect(isPreviewable(makeFile({ type: "text/plain" }))).toBe(false);
    expect(isPreviewable(makeFile({ type: "application/zip" }))).toBe(false);
  });
});

describe("isInProgress", () => {
  it("returns true when progress is non-null and < 100", () => {
    expect(isInProgress(makeFile({ progress: 0 }))).toBe(true);
    expect(isInProgress(makeFile({ progress: 50 }))).toBe(true);
    expect(isInProgress(makeFile({ progress: 99 }))).toBe(true);
  });

  it("returns false when progress is 100", () => {
    expect(isInProgress(makeFile({ progress: 100 }))).toBe(false);
  });

  it("returns false when progress is null or undefined", () => {
    expect(isInProgress(makeFile({ progress: null }))).toBe(false);
    expect(isInProgress(makeFile())).toBe(false);
  });
});

describe("hasChildren", () => {
  it("returns true when file has non-empty children array", () => {
    const child = makeFile({ id: "2", name: "child.jpg" });
    expect(hasChildren(makeFile({ children: [child] }))).toBe(true);
  });

  it("returns false when children is empty", () => {
    expect(hasChildren(makeFile({ children: [] }))).toBe(false);
  });

  it("returns false when children is undefined", () => {
    expect(hasChildren(makeFile())).toBe(false);
  });
});

describe("fileTypeIcon", () => {
  it("returns 'play' for video files", () => {
    expect(fileTypeIcon(makeFile({ type: "video/mp4" }))).toBe("play");
    expect(fileTypeIcon(makeFile({ type: "video/webm" }))).toBe("play");
  });

  it("returns 'folder' for compressed files", () => {
    expect(fileTypeIcon(makeFile({ type: "application/zip" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ type: "application/gzip" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ type: "application/x-rar-compressed" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ type: "application/x-tar" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ type: "application/x-7z-compressed" }))).toBe("folder");
  });

  it("returns 'music' for audio files", () => {
    expect(fileTypeIcon(makeFile({ type: "audio/mpeg" }))).toBe("music");
    expect(fileTypeIcon(makeFile({ type: "audio/wav" }))).toBe("music");
  });

  it("returns 'file-pdf' for PDF files", () => {
    expect(fileTypeIcon(makeFile({ type: "application/pdf" }))).toBe("file-pdf");
  });

  it("returns 'document' for other types", () => {
    expect(fileTypeIcon(makeFile({ type: "text/plain" }))).toBe("document");
    expect(fileTypeIcon(makeFile({ type: "image/jpeg" }))).toBe("document");
  });
});

describe("formatFileSize", () => {
  it("formats zero bytes", () => {
    expect(formatFileSize(0)).toBe("0 B");
  });

  it("formats bytes", () => {
    expect(formatFileSize(500)).toBe("500 B");
    expect(formatFileSize(1023)).toBe("1023 B");
  });

  it("formats kilobytes", () => {
    expect(formatFileSize(1024)).toBe("1.0 KiB");
    expect(formatFileSize(1536)).toBe("1.5 KiB");
  });

  it("formats megabytes", () => {
    expect(formatFileSize(1024 * 1024)).toBe("1.0 MiB");
    expect(formatFileSize(2.5 * 1024 * 1024)).toBe("2.5 MiB");
  });

  it("formats gigabytes", () => {
    expect(formatFileSize(1024 * 1024 * 1024)).toBe("1.0 GiB");
  });
});

describe("createDownloadEvent", () => {
  it("creates event with file and prevented=false", () => {
    const file = makeFile();
    const event = createDownloadEvent(file);
    expect(event.file).toBe(file);
    expect(event.prevented).toBe(false);
  });

  it("sets prevented to true when preventDefault is called", () => {
    const event = createDownloadEvent(makeFile());
    event.preventDefault();
    expect(event.prevented).toBe(true);
  });
});

describe("triggerFileDownload", () => {
  it("calls downloadFile with resolved URL and filename", () => {
    const file = makeFile({ url: "https://example.com/file.jpg", name: "photo.jpg" });
    triggerFileDownload(file);
    expect(downloadFile).toHaveBeenCalledWith("https://example.com/file.jpg", "photo.jpg");
  });

  it("does not call downloadFile when URL is empty", () => {
    const file = makeFile({ url: "" });
    triggerFileDownload(file);
    expect(downloadFile).not.toHaveBeenCalled();
  });
});
