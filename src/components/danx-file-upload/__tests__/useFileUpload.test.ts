import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { type Ref, ref, nextTick } from "vue";
import { useFileUpload } from "../useFileUpload";
import type { UseFileUploadReturn } from "../useFileUpload";
import { setFileUploadHandler } from "../fileUploadConfig";
import type { PreviewFile } from "../../danx-file/types";
import { makeFile } from "../../danx-file/__tests__/test-helpers";

/** Create a browser File for testing */
function createFile(name = "test.jpg", type = "image/jpeg", size = 1024): File {
  const content = new Uint8Array(size);
  return new File([content], name, { type });
}

/** Create a FileList-like array from File objects */
function toFileList(files: File[]): FileList {
  return Object.assign(files, {
    item: (i: number) => files[i] ?? null,
  }) as unknown as FileList;
}

let _mockIdCounter = 0;

/** Create a mock upload handler that resolves with a server file */
function createMockHandler(delay = 0) {
  return vi.fn(
    (file: File, onProgress: (p: number) => void, _signal: AbortSignal): Promise<PreviewFile> => {
      return new Promise((resolve) => {
        onProgress(50);
        const finish = () => {
          onProgress(95);
          resolve(
            makeFile(String(++_mockIdCounter), {
              name: file.name,
              size: file.size,
              mime: file.type,
              url: `https://example.com/${file.name}`,
            })
          );
        };
        if (delay > 0) {
          setTimeout(finish, delay);
        } else {
          finish();
        }
      });
    }
  );
}

/** Create a mock handler that rejects */
function createFailingHandler(errorMsg = "Upload failed") {
  return vi.fn(
    (_file: File, _onProgress: (p: number) => void, _signal: AbortSignal): Promise<PreviewFile> => {
      return Promise.reject(new Error(errorMsg));
    }
  );
}

/** Create a mock handler that never resolves (for testing abort) */
function createHangingHandler() {
  return vi.fn(
    (_file: File, _onProgress: (p: number) => void, signal: AbortSignal): Promise<PreviewFile> => {
      return new Promise((_resolve, reject) => {
        signal.addEventListener("abort", () => reject(new Error("Upload aborted")));
      });
    }
  );
}

describe("useFileUpload", () => {
  let mockCreateObjectURL: ReturnType<typeof vi.fn>;
  let mockRevokeObjectURL: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateObjectURL = vi.fn(() => "blob:mock-url");
    mockRevokeObjectURL = vi.fn();
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: mockCreateObjectURL,
      revokeObjectURL: mockRevokeObjectURL,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  function createComposable(
    overrides: Partial<Parameters<typeof useFileUpload>[0]> = {}
  ): UseFileUploadReturn & { model: Ref<PreviewFile[]> } {
    const model = ref<PreviewFile[]>([]);
    const result = useFileUpload({
      model,
      ...overrides,
      ...(overrides.model ? {} : { model }),
    });
    return {
      ...result,
      model: (overrides.model as ReturnType<typeof ref<PreviewFile[]>>) ?? model,
    };
  }

  describe("initial state", () => {
    it("starts with isUploading false", () => {
      const { isUploading } = createComposable({ uploadFn: createMockHandler() });
      expect(isUploading.value).toBe(false);
    });

    it("starts with canAddMore true for single mode", () => {
      const { canAddMore } = createComposable({ uploadFn: createMockHandler() });
      expect(canAddMore.value).toBe(true);
    });

    it("starts with canAddMore true for multi mode", () => {
      const { canAddMore } = createComposable({ multiple: true, uploadFn: createMockHandler() });
      expect(canAddMore.value).toBe(true);
    });

    it("starts with isDragging false", () => {
      const { isDragging } = createComposable({ uploadFn: createMockHandler() });
      expect(isDragging.value).toBe(false);
    });

    it("starts with inputRef null", () => {
      const { inputRef } = createComposable({ uploadFn: createMockHandler() });
      expect(inputRef.value).toBe(null);
    });
  });

  describe("single mode", () => {
    it("replaces existing file when adding a new one", async () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({ uploadFn: handler });

      addFiles([createFile("first.jpg")]);
      await nextTick();
      // Wait for handler to resolve
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      addFiles([createFile("second.jpg")]);
      await nextTick();
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
      await nextTick();

      expect(model.value).toHaveLength(1);
      expect(model.value[0]!.name).toBe("second.jpg");
    });

    it("canAddMore is false when a file exists", async () => {
      const handler = createMockHandler();
      const { addFiles, canAddMore } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      expect(canAddMore.value).toBe(false);
    });
  });

  describe("multi mode", () => {
    it("accumulates files", async () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({ multiple: true, uploadFn: handler });

      addFiles([createFile("a.jpg"), createFile("b.jpg")]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
      await nextTick();

      expect(model.value).toHaveLength(2);
    });

    it("respects maxFiles limit", async () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({
        multiple: true,
        maxFiles: 2,
        uploadFn: handler,
      });

      addFiles([createFile("a.jpg"), createFile("b.jpg"), createFile("c.jpg")]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
      await nextTick();

      expect(model.value).toHaveLength(2);
    });

    it("canAddMore respects maxFiles", async () => {
      const handler = createMockHandler();
      const { addFiles, canAddMore } = createComposable({
        multiple: true,
        maxFiles: 1,
        uploadFn: handler,
      });

      addFiles([createFile()]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      expect(canAddMore.value).toBe(false);
    });
  });

  describe("validation", () => {
    it("rejects files that do not match accept MIME types", () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({
        accept: "image/*",
        uploadFn: handler,
      });

      addFiles([createFile("doc.pdf", "application/pdf")]);

      expect(model.value).toHaveLength(1);
      expect(model.value[0]!.error).toContain("not accepted");
      expect(handler).not.toHaveBeenCalled();
    });

    it("accepts files matching wildcard MIME", () => {
      const handler = createMockHandler();
      const { addFiles } = createComposable({
        accept: "image/*",
        uploadFn: handler,
      });

      addFiles([createFile("photo.png", "image/png")]);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("accepts files matching exact MIME type", () => {
      const handler = createMockHandler();
      const { addFiles } = createComposable({
        accept: "application/pdf",
        uploadFn: handler,
      });

      addFiles([createFile("doc.pdf", "application/pdf")]);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("rejects files not matching exact MIME type", () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({
        accept: "application/pdf",
        uploadFn: handler,
      });

      addFiles([createFile("photo.png", "image/png")]);
      expect(model.value[0]!.error).toContain("not accepted");
      expect(handler).not.toHaveBeenCalled();
    });

    it("accepts files matching extension filter", () => {
      const handler = createMockHandler();
      const { addFiles } = createComposable({
        accept: ".pdf,.jpg",
        uploadFn: handler,
      });

      addFiles([createFile("doc.pdf", "application/pdf")]);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("rejects files exceeding maxFileSize", () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({
        maxFileSize: 500,
        uploadFn: handler,
      });

      addFiles([createFile("big.jpg", "image/jpeg", 1000)]);

      expect(model.value).toHaveLength(1);
      expect(model.value[0]!.error).toContain("exceeds maximum size");
      expect(handler).not.toHaveBeenCalled();
    });

    it("accepts files within maxFileSize", () => {
      const handler = createMockHandler();
      const { addFiles } = createComposable({
        maxFileSize: 2000,
        uploadFn: handler,
      });

      addFiles([createFile("small.jpg", "image/jpeg", 1000)]);
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe("progress", () => {
    it("updates file progress during upload", async () => {
      let capturedOnProgress: ((p: number) => void) | undefined;
      const handler = vi.fn(
        (
          _file: File,
          onProgress: (p: number) => void,
          _signal: AbortSignal
        ): Promise<PreviewFile> => {
          capturedOnProgress = onProgress;
          return new Promise(() => {
            /* never resolves for this test */
          });
        }
      );

      const { addFiles, model, isUploading } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await nextTick();

      expect(isUploading.value).toBe(true);
      expect(model.value[0]!.progress).toBe(0);

      capturedOnProgress!(50);
      await nextTick();
      expect(model.value[0]!.progress).toBe(50);
    });

    it("isUploading is true when files have progress < 100", async () => {
      const handler = vi.fn(
        (): Promise<PreviewFile> =>
          new Promise(() => {
            /* hang */
          })
      );
      const { addFiles, isUploading } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await nextTick();

      expect(isUploading.value).toBe(true);
    });
  });

  describe("successful upload", () => {
    it("replaces temp file with server-returned file", async () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({ uploadFn: handler });

      addFiles([createFile("test.jpg")]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      expect(model.value).toHaveLength(1);
      expect(model.value[0]!.url).toBe("https://example.com/test.jpg");
      expect(model.value[0]!.id).not.toContain("__upload:");
    });

    it("revokes blobUrl on successful upload", async () => {
      const handler = createMockHandler();
      const { addFiles } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });

    it("creates blobUrl for immediate preview", () => {
      const handler = vi.fn(
        (): Promise<PreviewFile> =>
          new Promise(() => {
            /* hang */
          })
      );
      const { addFiles, model } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);

      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(model.value[0]!.blobUrl).toBe("blob:mock-url");
    });
  });

  describe("error handling", () => {
    it("sets error on the temp file when upload fails", async () => {
      const handler = createFailingHandler("Server error");
      const { addFiles, model } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      expect(model.value).toHaveLength(1);
      expect(model.value[0]!.error).toBe("Server error");
      expect(model.value[0]!.progress).toBeNull();
    });

    it("throws when no handler is configured", () => {
      // Ensure no global handler is set for this test
      const { addFiles, model } = createComposable({ uploadFn: undefined });

      // Save and clear global handler
      addFiles([createFile()]);

      expect(model.value).toHaveLength(1);
      expect(model.value[0]!.error).toContain("No file upload handler configured");
    });
  });

  describe("retry", () => {
    it("retries a failed upload", async () => {
      let callCount = 0;
      const handler = vi.fn(
        (
          file: File,
          _onProgress: (p: number) => void,
          _signal: AbortSignal
        ): Promise<PreviewFile> => {
          callCount++;
          if (callCount === 1) {
            return Promise.reject(new Error("First attempt failed"));
          }
          return Promise.resolve(
            makeFile({ name: file.name, url: `https://example.com/${file.name}` })
          );
        }
      );

      const { addFiles, retryFile, model } = createComposable({ uploadFn: handler });

      addFiles([createFile("retry.jpg")]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      expect(model.value[0]!.error).toBe("First attempt failed");
      const tempId = model.value[0]!.id;

      retryFile(tempId);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
      await nextTick();

      expect(model.value[0]!.url).toBe("https://example.com/retry.jpg");
      expect(model.value[0]!.error).toBeUndefined();
    });

    it("does nothing when retrying non-existent file ID", () => {
      const handler = createMockHandler();
      const { retryFile, model } = createComposable({ uploadFn: handler });

      retryFile("nonexistent");
      expect(model.value).toHaveLength(0);
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("removeFile", () => {
    it("removes a file from the model", async () => {
      const handler = createMockHandler();
      const { addFiles, removeFile, model } = createComposable({
        multiple: true,
        uploadFn: handler,
      });

      addFiles([createFile("a.jpg"), createFile("b.jpg")]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(2));
      await nextTick();

      removeFile(model.value[0]!);
      expect(model.value).toHaveLength(1);
      expect(model.value[0]!.name).toBe("b.jpg");
    });

    it("aborts in-progress upload when removing", async () => {
      const handler = createHangingHandler();
      const { addFiles, removeFile, model } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await nextTick();

      // File is uploading (handler never resolves)
      expect(model.value).toHaveLength(1);

      removeFile(model.value[0]!);
      expect(model.value).toHaveLength(0);
    });

    it("revokes blobUrl when removing", async () => {
      const handler = createHangingHandler();
      const { addFiles, removeFile, model } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await nextTick();

      removeFile(model.value[0]!);
      expect(mockRevokeObjectURL).toHaveBeenCalledWith("blob:mock-url");
    });
  });

  describe("clearFiles", () => {
    it("removes all files and aborts in-progress uploads", async () => {
      const handler = createHangingHandler();
      const { addFiles, clearFiles, model } = createComposable({
        multiple: true,
        uploadFn: handler,
      });

      addFiles([createFile("a.jpg"), createFile("b.jpg")]);
      await nextTick();

      expect(model.value).toHaveLength(2);

      clearFiles();
      expect(model.value).toHaveLength(0);
    });

    it("revokes all blobUrls", async () => {
      const handler = createHangingHandler();
      const { addFiles, clearFiles } = createComposable({
        multiple: true,
        uploadFn: handler,
      });

      addFiles([createFile("a.jpg"), createFile("b.jpg")]);
      await nextTick();

      clearFiles();
      expect(mockRevokeObjectURL).toHaveBeenCalledTimes(2);
    });
  });

  describe("drag handlers", () => {
    it("sets isDragging on drag enter", () => {
      const { handleDragEnter, isDragging } = createComposable({
        uploadFn: createMockHandler(),
      });

      handleDragEnter();
      expect(isDragging.value).toBe(true);
    });

    it("clears isDragging when drag depth returns to 0", () => {
      const { handleDragEnter, handleDragLeave, isDragging } = createComposable({
        uploadFn: createMockHandler(),
      });

      handleDragEnter();
      handleDragEnter();
      handleDragLeave();
      expect(isDragging.value).toBe(true);

      handleDragLeave();
      expect(isDragging.value).toBe(false);
    });

    it("handleDrop resets isDragging and adds files", () => {
      const handler = createMockHandler();
      const { handleDragEnter, handleDrop, isDragging, model } = createComposable({
        uploadFn: handler,
      });

      handleDragEnter();
      expect(isDragging.value).toBe(true);

      const file = createFile();
      const event = {
        dataTransfer: { files: toFileList([file]) },
      } as unknown as DragEvent;

      handleDrop(event);

      expect(isDragging.value).toBe(false);
      expect(model.value).toHaveLength(1);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("handleDrop does nothing when no files in dataTransfer", () => {
      const handler = createMockHandler();
      const { handleDrop, model } = createComposable({ uploadFn: handler });

      const event = {
        dataTransfer: { files: toFileList([]) },
      } as unknown as DragEvent;

      handleDrop(event);
      expect(model.value).toHaveLength(0);
    });

    it("handleDrop handles null dataTransfer", () => {
      const handler = createMockHandler();
      const { handleDrop, model } = createComposable({ uploadFn: handler });

      const event = { dataTransfer: null } as unknown as DragEvent;

      handleDrop(event);
      expect(model.value).toHaveLength(0);
    });
  });

  describe("temp file IDs", () => {
    it("generates IDs with __upload: prefix", () => {
      const handler = vi.fn(
        (): Promise<PreviewFile> =>
          new Promise(() => {
            /* hang */
          })
      );
      const { addFiles, model } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      expect(model.value[0]!.id).toMatch(/^__upload:\d+$/);
    });
  });

  describe("global handler via setFileUploadHandler", () => {
    it("uses the global handler when no uploadFn is provided", async () => {
      const handler = createMockHandler();
      setFileUploadHandler(handler);

      const { addFiles } = createComposable({});

      addFiles([createFile()]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
    });

    it("prefers uploadFn over global handler", async () => {
      const globalHandler = createMockHandler();
      const instanceHandler = createMockHandler();
      setFileUploadHandler(globalHandler);

      const { addFiles } = createComposable({ uploadFn: instanceHandler });

      addFiles([createFile()]);
      await vi.waitFor(() => expect(instanceHandler).toHaveBeenCalledTimes(1));
      expect(globalHandler).not.toHaveBeenCalled();
    });
  });

  describe("edge cases", () => {
    it("handles non-Error rejection from handler", async () => {
      const handler = vi.fn((): Promise<PreviewFile> => Promise.reject("string error"));
      const { addFiles, model } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      expect(model.value[0]!.error).toBe("string error");
    });

    it("suppresses error when file was removed during upload", async () => {
      let rejectFn: ((err: Error) => void) | undefined;
      const handler = vi.fn(
        (): Promise<PreviewFile> =>
          new Promise((_resolve, reject) => {
            rejectFn = reject;
          })
      );
      const { addFiles, removeFile, model } = createComposable({ uploadFn: handler });

      addFiles([createFile()]);
      await nextTick();

      // Remove the file while upload is in progress
      removeFile(model.value[0]!);
      expect(model.value).toHaveLength(0);

      // Now reject the handler — should not crash or add anything
      rejectFn!(new Error("Upload failed"));
      await nextTick();

      expect(model.value).toHaveLength(0);
    });

    it("does not revoke blobUrl when file has none during clearFiles", async () => {
      const handler = createMockHandler();
      const { addFiles, clearFiles, model } = createComposable({
        multiple: true,
        uploadFn: handler,
      });

      addFiles([createFile()]);
      await vi.waitFor(() => expect(handler).toHaveBeenCalledTimes(1));
      await nextTick();

      // After successful upload, blobUrl was revoked and replaced with server file
      // Server file should not have blobUrl
      mockRevokeObjectURL.mockClear();
      clearFiles();
      expect(model.value).toHaveLength(0);
      // Should not call revokeObjectURL for server files without blobUrl
      expect(mockRevokeObjectURL).not.toHaveBeenCalled();
    });

    it("clamps drag depth to 0 on excess handleDragLeave calls", () => {
      const { handleDragEnter, handleDragLeave, isDragging } = createComposable({
        uploadFn: createMockHandler(),
      });

      handleDragEnter();
      handleDragLeave();
      handleDragLeave(); // Extra leave
      handleDragLeave(); // Even more

      expect(isDragging.value).toBe(false);

      // Should still work normally after excess leaves
      handleDragEnter();
      expect(isDragging.value).toBe(true);
    });

    it("validates empty MIME type with accept filter", () => {
      const handler = createMockHandler();
      const { addFiles, model } = createComposable({
        accept: "image/*",
        uploadFn: handler,
      });

      addFiles([createFile("file.bin", "", 100)]);

      expect(model.value[0]!.error).toContain("unknown");
      expect(handler).not.toHaveBeenCalled();
    });
  });
});
