import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { uploadFileToUrl } from "../uploadFileToUrl";

/**
 * Mock XMLHttpRequest for testing upload behavior.
 */
class MockXHR {
  method = "";
  url = "";
  requestHeaders: Record<string, string> = {};
  status = 200;
  response = "";
  upload = {
    onprogress: null as ((event: ProgressEvent) => void) | null,
  };

  onload: (() => void) | null = null;
  onerror: (() => void) | null = null;
  onabort: (() => void) | null = null;

  open(method: string, url: string) {
    this.method = method;
    this.url = url;
  }

  setRequestHeader(key: string, value: string) {
    this.requestHeaders[key] = value;
  }

  send(_body?: unknown) {
    // Trigger load by default for success tests
  }

  abort() {
    this.onabort?.();
  }

  /** Simulate a successful upload with optional progress events */
  simulateSuccess(status = 200) {
    this.status = status;
    this.onload?.();
  }

  /** Simulate a progress event */
  simulateProgress(loaded: number, total: number) {
    this.upload.onprogress?.(
      new ProgressEvent("progress", { lengthComputable: true, loaded, total })
    );
  }

  /** Simulate a network error */
  simulateError() {
    this.onerror?.();
  }
}

let mockXhr: MockXHR;

/** Factory class that always returns the shared mockXhr instance */
class MockXHRFactory {
  constructor() {
    return mockXhr as unknown as MockXHRFactory;
  }
}

describe("uploadFileToUrl", () => {
  beforeEach(() => {
    mockXhr = new MockXHR();
    vi.stubGlobal("XMLHttpRequest", MockXHRFactory);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends a POST request to the given URL by default", () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    uploadFileToUrl(file, "https://example.com/upload");

    expect(mockXhr.method).toBe("POST");
    expect(mockXhr.url).toBe("https://example.com/upload");
  });

  it("uses the specified HTTP method", () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    uploadFileToUrl(file, "https://example.com/upload", { method: "PUT" });

    expect(mockXhr.method).toBe("PUT");
  });

  it("sets Content-Type from the file MIME type", () => {
    const file = new File(["data"], "test.jpg", { type: "image/jpeg" });
    uploadFileToUrl(file, "https://example.com/upload");

    expect(mockXhr.requestHeaders["Content-Type"]).toBe("image/jpeg");
  });

  it("applies custom headers", () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    uploadFileToUrl(file, "https://example.com/upload", {
      headers: { Authorization: "Bearer token123", "X-Custom": "value" },
    });

    expect(mockXhr.requestHeaders["Authorization"]).toBe("Bearer token123");
    expect(mockXhr.requestHeaders["X-Custom"]).toBe("value");
  });

  it("resolves with the XHR on success (2xx status)", async () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const promise = uploadFileToUrl(file, "https://example.com/upload");

    mockXhr.simulateSuccess(200);
    const result = await promise;
    expect(result).toBe(mockXhr);
  });

  it("resolves on 201 status", async () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const promise = uploadFileToUrl(file, "https://example.com/upload");

    mockXhr.simulateSuccess(201);
    const result = await promise;
    expect(result).toBe(mockXhr);
  });

  it("rejects on non-2xx status", async () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const promise = uploadFileToUrl(file, "https://example.com/upload");

    mockXhr.simulateSuccess(500);
    await expect(promise).rejects.toThrow("Upload failed with status 500");
  });

  it("rejects on network error", async () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const promise = uploadFileToUrl(file, "https://example.com/upload");

    mockXhr.simulateError();
    await expect(promise).rejects.toThrow("Upload network error");
  });

  it("reports progress in the 0-95 range", () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const progressValues: number[] = [];

    uploadFileToUrl(file, "https://example.com/upload", {
      onProgress: (p) => progressValues.push(p),
    });

    mockXhr.simulateProgress(0, 1000);
    mockXhr.simulateProgress(500, 1000);
    mockXhr.simulateProgress(1000, 1000);

    expect(progressValues).toEqual([0, 48, 95]);
  });

  it("caps progress at 95 even when fully loaded", () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const progressValues: number[] = [];

    uploadFileToUrl(file, "https://example.com/upload", {
      onProgress: (p) => progressValues.push(p),
    });

    mockXhr.simulateProgress(1000, 1000);
    expect(progressValues[0]).toBe(95);
  });

  it("aborts when signal is already aborted", async () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const controller = new AbortController();
    controller.abort();

    const promise = uploadFileToUrl(file, "https://example.com/upload", {
      signal: controller.signal,
    });

    await expect(promise).rejects.toThrow("Upload aborted");
  });

  it("aborts when signal fires after send", async () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const controller = new AbortController();

    const promise = uploadFileToUrl(file, "https://example.com/upload", {
      signal: controller.signal,
    });

    controller.abort();
    await expect(promise).rejects.toThrow("Upload aborted");
  });

  it("does not set Content-Type when file has no type", () => {
    const file = new File(["data"], "test.bin", { type: "" });
    uploadFileToUrl(file, "https://example.com/upload");

    expect(mockXhr.requestHeaders["Content-Type"]).toBeUndefined();
  });

  it("does not report progress for non-lengthComputable events", () => {
    const file = new File(["data"], "test.txt", { type: "text/plain" });
    const progressValues: number[] = [];

    uploadFileToUrl(file, "https://example.com/upload", {
      onProgress: (p) => progressValues.push(p),
    });

    // Fire a non-computable progress event
    mockXhr.upload.onprogress?.(
      new ProgressEvent("progress", { lengthComputable: false, loaded: 500, total: 0 })
    );

    expect(progressValues).toHaveLength(0);
  });
});
