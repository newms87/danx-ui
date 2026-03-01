import { describe, it, expect, beforeEach } from "vitest";
import { setFileUploadHandler, getFileUploadHandler } from "../fileUploadConfig";
import type { PreviewFile } from "../../danx-file/types";

describe("fileUploadConfig", () => {
  beforeEach(() => {
    // Reset handler to a known baseline before each test.
    // Cast needed because setFileUploadHandler only accepts FileUploadHandler,
    // but we need null state for isolation.
    (setFileUploadHandler as (fn: null) => void)(null);
  });

  it("returns null when no handler has been set", () => {
    expect(getFileUploadHandler()).toBeNull();
  });

  it("set/get round-trip returns the configured handler", () => {
    const mockHandler = async (
      _file: File,
      _onProgress: (p: number) => void,
      _signal: AbortSignal
    ): Promise<PreviewFile> => ({
      id: "1",
      name: "test.jpg",
      size: 1024,
      mime: "image/jpeg",
      url: "https://example.com/1.jpg",
    });

    setFileUploadHandler(mockHandler);
    expect(getFileUploadHandler()).toBe(mockHandler);
  });

  it("overwrites a previously set handler", () => {
    const handler1 = async () =>
      ({ id: "1", name: "a", size: 0, mime: "", url: "" }) as PreviewFile;
    const handler2 = async () =>
      ({ id: "2", name: "b", size: 0, mime: "", url: "" }) as PreviewFile;

    setFileUploadHandler(handler1);
    setFileUploadHandler(handler2);
    expect(getFileUploadHandler()).toBe(handler2);
  });
});
