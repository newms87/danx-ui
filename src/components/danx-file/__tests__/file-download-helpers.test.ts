import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  resolveFileUrl,
  resolveThumbUrl,
  createDownloadEvent,
  triggerFileDownload,
  handleDownload,
} from "../file-download-helpers";
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

describe("handleDownload", () => {
  it("triggers download when emit callback does not preventDefault", () => {
    const file = makeFile({ url: "https://example.com/file.jpg", name: "photo.jpg" });
    const emitFn = vi.fn();

    handleDownload(file, emitFn);

    expect(emitFn).toHaveBeenCalledTimes(1);
    expect(emitFn.mock.calls[0]![0].file).toBe(file);
    expect(downloadFile).toHaveBeenCalledWith("https://example.com/file.jpg", "photo.jpg");
  });

  it("does not trigger download when emit callback calls preventDefault", () => {
    const file = makeFile({ url: "https://example.com/file.jpg", name: "photo.jpg" });
    const emitFn = vi.fn((event) => event.preventDefault());

    handleDownload(file, emitFn);

    expect(emitFn).toHaveBeenCalledTimes(1);
    expect(downloadFile).not.toHaveBeenCalled();
  });
});
