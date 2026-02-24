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

    // Mock navigator userAgent as standard browser by default
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/91.0",
      configurable: true,
    });
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

    it("handles URI-encoded (non-base64) data URLs", () => {
      const dataUrl = "data:text/plain;charset=utf-8,Hello%20World";
      const result = downloadFile(dataUrl, "test.txt");

      expect(appendChildSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("converts large URI-encoded data URLs to blob first", () => {
      const largeText = "A".repeat(2 * 1024 * 1024);
      const dataUrl = "data:text/plain;charset=utf-8," + encodeURIComponent(largeText);
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

    it("XHR onload triggers blob download with extracted filename", () => {
      let xhrOnload: (() => void) | null = null;
      const xhrInstance = {
        open: vi.fn(),
        send: vi.fn(),
        responseType: "",
        response: new Blob(["downloaded content"]),
        onload: null as unknown,
        onerror: null as unknown,
      };

      class MockXHR {
        open = xhrInstance.open;
        send = xhrInstance.send;
        responseType = xhrInstance.responseType;
        response = xhrInstance.response;
        onload: unknown = null;
        onerror: unknown = null;
      }

      vi.stubGlobal("XMLHttpRequest", MockXHR);

      const result = downloadFile("https://example.com/file.txt");
      // Capture the onload callback
      xhrOnload = (result as unknown as { onload: () => void }).onload;

      vi.advanceTimersByTime(0);
      expect(xhrInstance.send).toHaveBeenCalled();

      // Trigger onload - should call downloadFile with the blob response
      xhrOnload!();
      expect(createObjectURLSpy).toHaveBeenCalled();
    });

    it("XHR onerror falls back to window.open", () => {
      let xhrOnerror: (() => void) | null = null;
      const xhrInstance = {
        open: vi.fn(),
        send: vi.fn(),
        responseType: "",
        onload: null as unknown,
        onerror: null as unknown,
      };

      class MockXHR {
        open = xhrInstance.open;
        send = xhrInstance.send;
        responseType = xhrInstance.responseType;
        onload: unknown = null;
        onerror: unknown = null;
      }

      vi.stubGlobal("XMLHttpRequest", MockXHR);

      const windowOpenSpy = vi
        .spyOn(window, "open")
        .mockReturnValue({ focus: vi.fn() } as unknown as Window);
      const result = downloadFile("https://example.com/file.txt");
      xhrOnerror = (result as unknown as { onerror: () => void }).onerror;

      vi.advanceTimersByTime(0);

      // Trigger onerror - should open URL in new tab
      xhrOnerror!();
      expect(windowOpenSpy).toHaveBeenCalledWith("https://example.com/file.txt", "_blank");
    });

    it("uses 'download' as filename when URL ends with slash", () => {
      const xhrInstance = {
        open: vi.fn(),
        send: vi.fn(),
        responseType: "",
        response: new Blob(["content"]),
        onload: null as unknown,
        onerror: null as unknown,
      };

      class MockXHR {
        open = xhrInstance.open;
        send = xhrInstance.send;
        responseType = xhrInstance.responseType;
        response = xhrInstance.response;
        onload: unknown = null;
        onerror: unknown = null;
      }

      vi.stubGlobal("XMLHttpRequest", MockXHR);

      const result = downloadFile("https://example.com/");
      const xhr = result as unknown as { onload: () => void };

      vi.advanceTimersByTime(0);

      // Trigger onload - filename should fall back to "download"
      xhr.onload();
      expect(createObjectURLSpy).toHaveBeenCalled();
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

    it("does not revoke URL for direct data URL downloads", () => {
      const dataUrl = "data:text/plain;base64,SGVsbG8=";
      downloadFile(dataUrl, "test.txt");

      vi.advanceTimersByTime(66);
      vi.advanceTimersByTime(250);

      // revokeAfter=false for direct data URLs, so revokeObjectURL should not be called
      expect(revokeObjectURLSpy).not.toHaveBeenCalled();
    });
  });

  describe("Browser fallbacks", () => {
    /**
     * Helper: replace the beforeEach createElement spy with one that wraps
     * anchor elements in a Proxy that hides the `download` property from
     * the `"download" in anchor` check, simulating a browser without the
     * download attribute.
     */
    function mockNoDownloadAttribute() {
      vi.mocked(document.createElement).mockRestore();
      const realCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        const el = realCreateElement(tag);
        if (tag === "a") {
          el.click = clickSpy as unknown as () => void;
          return new Proxy(el, {
            has(target, prop) {
              if (prop === "download") return false;
              return prop in target;
            },
          }) as unknown as HTMLElement;
        }
        return el;
      });
    }

    it("uses window.open for Safari when download attribute not supported", () => {
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        configurable: true,
      });
      mockNoDownloadAttribute();

      const windowOpenSpy = vi.spyOn(window, "open").mockReturnValue({} as unknown as Window);
      const blob = new Blob(["test content"], { type: "text/plain" });
      const result = downloadFile(blob, "test.txt");

      expect(windowOpenSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it("falls back to location.href when window.open returns null on Safari", () => {
      Object.defineProperty(navigator, "userAgent", {
        value:
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15",
        configurable: true,
      });
      mockNoDownloadAttribute();

      vi.spyOn(window, "open").mockReturnValue(null);

      const blob = new Blob(["test content"], { type: "text/plain" });
      const result = downloadFile(blob, "test.txt");

      // Falls back to location.href when window.open returns null
      expect(result).toBe(true);
    });

    it("creates iframe for unsupported non-Safari browsers", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.24 (KHTML, like Gecko)",
        configurable: true,
      });
      mockNoDownloadAttribute();

      const blob = new Blob(["test content"], { type: "text/plain" });
      const result = downloadFile(blob, "test.txt");

      expect(appendChildSpy).toHaveBeenCalled();
      expect(result).toBe(true);

      // Advance timer to trigger iframe cleanup callback
      vi.advanceTimersByTime(333);
      expect(removeChildSpy).toHaveBeenCalled();
    });

    it("creates iframe with data URL prefix when revokeAfter is false", () => {
      Object.defineProperty(navigator, "userAgent", {
        value: "Mozilla/5.0 (Windows NT 6.1) AppleWebKit/534.24 (KHTML, like Gecko)",
        configurable: true,
      });
      mockNoDownloadAttribute();

      const dataUrl = "data:text/plain;base64,SGVsbG8=";
      const result = downloadFile(dataUrl, "test.txt");

      expect(appendChildSpy).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });

  describe("Invalid URL error (line 115)", () => {
    it("throws error for invalid short URLs that fail validation", () => {
      // Restore existing spy, grab real createElement, then re-spy
      vi.mocked(document.createElement).mockRestore();
      const realCreateElement = document.createElement.bind(document);
      vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
        const el = realCreateElement(tag);
        if (tag === "a") {
          // Force href to always be "about:blank" so URL validation fails
          Object.defineProperty(el, "href", {
            get: () => "about:blank",
            set: () => {},
            configurable: true,
          });
        }
        return el;
      });

      expect(() => downloadFile("javascript:void(0)")).toThrow(
        "Invalid URL given, cannot download file: javascript:void(0)"
      );
    });
  });
});
