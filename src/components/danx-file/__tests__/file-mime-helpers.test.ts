import { describe, it, expect } from "vitest";
import {
  isImage,
  isVideo,
  isPdf,
  isAudio,
  isText,
  isPreviewable,
  fileTypeIcon,
} from "../file-mime-helpers";
import { makeFile } from "./test-helpers";

describe("isImage", () => {
  it("returns true for image MIME types", () => {
    expect(isImage(makeFile({ mime: "image/jpeg" }))).toBe(true);
    expect(isImage(makeFile({ mime: "image/png" }))).toBe(true);
    expect(isImage(makeFile({ mime: "image/gif" }))).toBe(true);
    expect(isImage(makeFile({ mime: "image/webp" }))).toBe(true);
  });

  it("returns false for non-image types", () => {
    expect(isImage(makeFile({ mime: "video/mp4" }))).toBe(false);
    expect(isImage(makeFile({ mime: "application/pdf" }))).toBe(false);
  });
});

describe("isVideo", () => {
  it("returns true for video MIME types", () => {
    expect(isVideo(makeFile({ mime: "video/mp4" }))).toBe(true);
    expect(isVideo(makeFile({ mime: "video/webm" }))).toBe(true);
  });

  it("returns false for non-video types", () => {
    expect(isVideo(makeFile({ mime: "image/jpeg" }))).toBe(false);
  });
});

describe("isAudio", () => {
  it("returns true for audio MIME types", () => {
    expect(isAudio(makeFile({ mime: "audio/mpeg" }))).toBe(true);
    expect(isAudio(makeFile({ mime: "audio/wav" }))).toBe(true);
    expect(isAudio(makeFile({ mime: "audio/ogg" }))).toBe(true);
  });

  it("returns false for non-audio types", () => {
    expect(isAudio(makeFile({ mime: "image/jpeg" }))).toBe(false);
    expect(isAudio(makeFile({ mime: "video/mp4" }))).toBe(false);
  });
});

describe("isPdf", () => {
  it("returns true for PDF MIME type", () => {
    expect(isPdf(makeFile({ mime: "application/pdf" }))).toBe(true);
  });

  it("returns false for non-PDF types", () => {
    expect(isPdf(makeFile({ mime: "image/jpeg" }))).toBe(false);
  });
});

describe("isText", () => {
  it("returns true for text MIME types", () => {
    expect(isText(makeFile({ mime: "text/plain" }))).toBe(true);
    expect(isText(makeFile({ mime: "text/markdown" }))).toBe(true);
    expect(isText(makeFile({ mime: "text/html" }))).toBe(true);
    expect(isText(makeFile({ mime: "text/csv" }))).toBe(true);
  });

  it("returns false for non-text types", () => {
    expect(isText(makeFile({ mime: "image/jpeg" }))).toBe(false);
    expect(isText(makeFile({ mime: "application/pdf" }))).toBe(false);
  });
});

describe("isPreviewable", () => {
  it("returns true for images, videos, audio, PDFs, and text", () => {
    expect(isPreviewable(makeFile({ mime: "image/jpeg" }))).toBe(true);
    expect(isPreviewable(makeFile({ mime: "video/mp4" }))).toBe(true);
    expect(isPreviewable(makeFile({ mime: "audio/mpeg" }))).toBe(true);
    expect(isPreviewable(makeFile({ mime: "application/pdf" }))).toBe(true);
    expect(isPreviewable(makeFile({ mime: "text/plain" }))).toBe(true);
    expect(isPreviewable(makeFile({ mime: "text/markdown" }))).toBe(true);
  });

  it("returns false for non-previewable types", () => {
    expect(isPreviewable(makeFile({ mime: "application/zip" }))).toBe(false);
    expect(isPreviewable(makeFile({ mime: "application/octet-stream" }))).toBe(false);
  });
});

describe("fileTypeIcon", () => {
  it("returns 'play' for video files", () => {
    expect(fileTypeIcon(makeFile({ mime: "video/mp4" }))).toBe("play");
    expect(fileTypeIcon(makeFile({ mime: "video/webm" }))).toBe("play");
  });

  it("returns 'folder' for compressed files", () => {
    expect(fileTypeIcon(makeFile({ mime: "application/zip" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ mime: "application/gzip" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ mime: "application/x-rar-compressed" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ mime: "application/x-tar" }))).toBe("folder");
    expect(fileTypeIcon(makeFile({ mime: "application/x-7z-compressed" }))).toBe("folder");
  });

  it("returns 'music' for audio files", () => {
    expect(fileTypeIcon(makeFile({ mime: "audio/mpeg" }))).toBe("music");
    expect(fileTypeIcon(makeFile({ mime: "audio/wav" }))).toBe("music");
  });

  it("returns 'file-pdf' for PDF files", () => {
    expect(fileTypeIcon(makeFile({ mime: "application/pdf" }))).toBe("file-pdf");
  });

  it("returns 'document' for other types", () => {
    expect(fileTypeIcon(makeFile({ mime: "text/plain" }))).toBe("document");
    expect(fileTypeIcon(makeFile({ mime: "image/jpeg" }))).toBe("document");
  });
});
