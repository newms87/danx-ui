/**
 * useFileUpload - Core composable for file upload management
 *
 * Handles file selection, validation, progress tracking, error states,
 * abort/retry, and drag-and-drop coordination. Delegates actual upload
 * mechanics to the app-provided FileUploadHandler.
 *
 * Upload lifecycle per file:
 * 1. Validate MIME (against accept) and size (against maxFileSize)
 * 2. In single mode: clear existing files first
 * 3. Create blobUrl via URL.createObjectURL for immediate preview
 * 4. Create temp PreviewFile with __upload:N ID
 * 5. Call handler(file, progressCallback, signal)
 * 6. On resolve: replace temp with server-returned PreviewFile, revoke blobUrl
 * 7. On reject: set error on temp PreviewFile, keep in _fileMap for retry
 */

import { computed, ref, type ComputedRef, type Ref } from "vue";
import { formatFileSize } from "../danx-file";
import type { PreviewFile } from "../danx-file";
import { getFileUploadHandler } from "./fileUploadConfig";
import { isAcceptedType } from "./fileValidation";
import { useDragDrop } from "./useDragDrop";
import type { FileUploadHandler, UseFileUploadOptions } from "./types";

export interface UseFileUploadReturn {
  /** Whether any file has non-null progress < 100 */
  isUploading: ComputedRef<boolean>;
  /** Whether more files can be added (multi: under maxFiles, single: no file) */
  canAddMore: ComputedRef<boolean>;
  /** Drag active over drop zone */
  isDragging: Ref<boolean>;
  /** Template ref for hidden file input */
  inputRef: Ref<HTMLInputElement | null>;
  /** Click hidden input programmatically */
  openFilePicker: () => void;
  /** Entry point for input change + drop */
  addFiles: (files: FileList | File[]) => void;
  /** Remove file + abort if in-progress */
  removeFile: (file: PreviewFile) => void;
  /** Re-attempt an errored upload */
  retryFile: (fileId: string) => void;
  /** Remove all files + abort all pending */
  clearFiles: () => void;
  /** Get a stable key for a file (preserves temp ID across upload completion) */
  getStableKey: (file: PreviewFile) => string;
  /** Increment drag depth counter */
  handleDragEnter: () => void;
  /** Decrement drag depth counter */
  handleDragLeave: () => void;
  /** Extract files from drop event */
  handleDrop: (event: DragEvent) => void;
}

let _counter = 0;

export function useFileUpload(options: UseFileUploadOptions): UseFileUploadReturn {
  const { model, multiple, accept, maxFiles, maxFileSize, uploadFn } = options;

  /** Maps temp IDs to original File objects (for retry) */
  const _fileMap = new Map<string, File>();
  /** One AbortController per in-progress upload */
  const _controllers = new Map<string, AbortController>();
  /** Maps server file ID -> temp ID for stable rendering keys */
  const _stableKeys = new Map<string, string>();

  const inputRef = ref<HTMLInputElement | null>(null);

  const isUploading = computed(() =>
    model.value.some((f) => f.progress != null && f.progress < 100)
  );

  const canAddMore = computed(() => {
    if (!multiple) return model.value.length === 0;
    if (maxFiles != null) return model.value.length < maxFiles;
    return true;
  });

  function openFilePicker() {
    inputRef.value?.click();
  }

  function createAndAppendErrorFile(file: File, error: string) {
    const tempFile = createTempFile(file);
    tempFile.error = error;
    tempFile.progress = null;
    model.value = [...model.value, tempFile];
  }

  function addFiles(files: FileList | File[]) {
    const fileArray = Array.from(files);

    for (const file of fileArray) {
      // Validate MIME type
      if (!isAcceptedType(file, accept)) {
        createAndAppendErrorFile(file, `File type "${file.type || "unknown"}" is not accepted`);
        continue;
      }

      // Validate file size
      if (maxFileSize != null && file.size > maxFileSize) {
        createAndAppendErrorFile(
          file,
          `File exceeds maximum size of ${formatFileSize(maxFileSize)}`
        );
        continue;
      }

      // Single mode: clear existing files first (before canAddMore check)
      if (!multiple) {
        clearFiles();
      }

      // Check maxFiles limit (in multi mode)
      if (!canAddMore.value) break;

      const tempFile = createTempFile(file);
      _fileMap.set(tempFile.id, file);

      model.value = [...model.value, tempFile];
      startUpload(tempFile.id, file);
    }
  }

  function createTempFile(file: File): PreviewFile {
    const id = `__upload:${++_counter}`;
    return {
      id,
      name: file.name,
      size: file.size,
      mime: file.type,
      url: "",
      blobUrl: URL.createObjectURL(file),
      progress: 0,
    };
  }

  function resolveHandler(): FileUploadHandler {
    const handler = uploadFn ?? getFileUploadHandler();
    if (!handler) {
      throw new Error(
        "No file upload handler configured. Call setFileUploadHandler() at app startup or pass uploadFn prop."
      );
    }
    return handler;
  }

  async function startUpload(tempId: string, file: File) {
    const controller = new AbortController();
    _controllers.set(tempId, controller);

    let handler: FileUploadHandler;
    try {
      handler = resolveHandler();
    } catch (e) {
      updateFileInModel(tempId, {
        error: e instanceof Error ? e.message : String(e),
        progress: null,
      });
      _controllers.delete(tempId);
      return;
    }

    const progressCallback = (percent: number) => {
      updateFileInModel(tempId, { progress: percent });
    };

    try {
      const serverFile = await handler(file, progressCallback, controller.signal);
      // Revoke the temp blobUrl
      const tempFile = model.value.find((f) => f.id === tempId);
      if (tempFile?.blobUrl) {
        URL.revokeObjectURL(tempFile.blobUrl);
      }
      // Record stable key mapping: server ID -> temp ID
      _stableKeys.set(serverFile.id, tempId);
      // Replace temp with server-returned file
      model.value = model.value.map((f) => (f.id === tempId ? serverFile : f));
      _fileMap.delete(tempId);
      _controllers.delete(tempId);
    } catch (e) {
      // Only set error if the file is still in the model (not removed during upload)
      if (model.value.some((f) => f.id === tempId)) {
        updateFileInModel(tempId, {
          error: e instanceof Error ? e.message : String(e),
          progress: null,
        });
      }
      _controllers.delete(tempId);
      // Keep _fileMap entry for retry
    }
  }

  function updateFileInModel(fileId: string, updates: Partial<PreviewFile>) {
    model.value = model.value.map((f) => (f.id === fileId ? { ...f, ...updates } : f));
  }

  function removeFile(file: PreviewFile) {
    // Abort if in-progress
    const controller = _controllers.get(file.id);
    if (controller) {
      controller.abort();
      _controllers.delete(file.id);
    }

    // Revoke blobUrl
    if (file.blobUrl) {
      URL.revokeObjectURL(file.blobUrl);
    }

    _fileMap.delete(file.id);
    _stableKeys.delete(file.id);
    model.value = model.value.filter((f) => f.id !== file.id);
  }

  function retryFile(fileId: string) {
    const file = _fileMap.get(fileId);
    if (!file) return;

    // Reset the temp file to uploading state
    updateFileInModel(fileId, { error: undefined, progress: 0 });
    startUpload(fileId, file);
  }

  function clearFiles() {
    // Abort all in-progress uploads
    for (const controller of _controllers.values()) {
      controller.abort();
    }
    _controllers.clear();

    // Revoke all blobUrls
    for (const f of model.value) {
      if (f.blobUrl) {
        URL.revokeObjectURL(f.blobUrl);
      }
    }

    _fileMap.clear();
    _stableKeys.clear();
    model.value = [];
  }

  const { isDragging, handleDragEnter, handleDragLeave, handleDrop } = useDragDrop({
    onDrop: addFiles,
  });

  function getStableKey(file: PreviewFile): string {
    return _stableKeys.get(file.id) ?? file.id;
  }

  return {
    isUploading,
    canAddMore,
    isDragging,
    inputRef,
    openFilePicker,
    addFiles,
    removeFile,
    retryFile,
    clearFiles,
    getStableKey,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
  };
}
