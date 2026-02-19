import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { downloadFile } from "../download";

describe("downloadFile", () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;
  let createObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let revokeObjectURLSpy: ReturnType<typeof vi.spyOn>;
  let clickSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    clickSpy = vi.fn();

    // Mock anchor element creation
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = originalCreateElement(tag);
      if (tag === "a") {
        el.click = clickSpy as unknown as () => void;
      }
      return el;
    });

    appendChildSpy = vi
      .spyOn(document.body, "appendChild")
      .mockReturnValue(null as unknown as Node);
    removeChildSpy = vi
      .spyOn(document.body, "removeChild")
      .mockReturnValue(null as unknown as Node);
    createObjectURLSpy = vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:mock-url");
    revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockReturnValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Blob downloads", () => {
    it("creates object URL and triggers download for Blob input", () => {
      const blob = new Blob(["test content"], { type: "text/plain" });
      const result = downloadFile(blob, "test.txt", "text/plain");

      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(appendChildSpy).toHaveBeenCalled();
      expect(result).toBe(true);

      vi.advanceTimersByTime(66);
      expect(clickSpy).toHaveBeenCalled();
    });

    it("converts string data to Blob when filename is provided", () => {
      const result = downloadFile("file content", "output.txt", "text/plain");
      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("Data URL downloads", () => {
    it("handles small data URLs directly", () => {
      const dataUrl = "data:text/plain;base64,SGVsbG8=";
      const result = downloadFile(dataUrl, "test.txt");

      expect(appendChildSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("converts large data URLs to blob first", () => {
      // Create a data URL > 2MB
      const largeData = "A".repeat(2 * 1024 * 1024);
      const dataUrl = "data:text/plain;base64," + btoa(largeData);
      const result = downloadFile(dataUrl, "large.txt");

      expect(createObjectURLSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("URL downloads", () => {
    it("returns XMLHttpRequest for URL-only argument", () => {
      const xhrInstance = {
        open: vi.fn(),
        send: vi.fn(),
        responseType: "",
        onload: null as unknown,
        onerror: null as unknown,
      };

      // Use a real class so `new` works
      class MockXHR {
        open = xhrInstance.open;
        send = xhrInstance.send;
        responseType = xhrInstance.responseType;
        onload = xhrInstance.onload;
        onerror = xhrInstance.onerror;
      }

      vi.stubGlobal("XMLHttpRequest", MockXHR);

      const result = downloadFile("https://example.com/file.txt");
      expect(result).toBeInstanceOf(MockXHR);
      expect(xhrInstance.open).toHaveBeenCalledWith(
        "GET",
        expect.stringContaining("https://example.com/file.txt"),
        true
      );

      vi.advanceTimersByTime(0);
      expect(xhrInstance.send).toHaveBeenCalled();
    });
  });

  describe("Default filename", () => {
    it("uses 'download' as default filename", () => {
      const blob = new Blob(["test"]);
      downloadFile(blob, undefined, "text/plain");

      expect(appendChildSpy).toHaveBeenCalled();
      // Verify the anchor was set up (createElement was called with 'a')
      expect(document.createElement).toHaveBeenCalledWith("a");
    });
  });

  describe("Cleanup", () => {
    it("revokes object URL after download", () => {
      const blob = new Blob(["test"]);
      downloadFile(blob, "test.txt");

      vi.advanceTimersByTime(66);
      vi.advanceTimersByTime(250);

      expect(revokeObjectURLSpy).toHaveBeenCalledWith("blob:mock-url");
    });

    it("removes anchor from DOM after click", () => {
      const blob = new Blob(["test"]);
      downloadFile(blob, "test.txt");

      vi.advanceTimersByTime(66);

      expect(removeChildSpy).toHaveBeenCalled();
    });
  });
});
