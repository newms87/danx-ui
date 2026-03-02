/**
 * File URL Resolution and Download Helpers
 *
 * Pure functions for resolving file URLs and triggering browser downloads.
 * Used by DanxFile, DanxFileViewer, and DanxFileActions.
 */

import { downloadFile } from "../../shared/download";
import type { DanxFileDownloadEvent, PreviewFile } from "./types";

/**
 * Resolve the best available URL for downloading or linking to a file.
 * Priority: optimized > url > blobUrl > empty string.
 *
 * Note: For display rendering (img src), use the mode-aware logic in
 * DanxFile.vue which gates non-image originals behind isImage() checks.
 */
export function resolveFileUrl(file: PreviewFile): string {
  return file.optimized?.url || file.url || file.blobUrl || "";
}

/**
 * Resolve the best available thumbnail URL for downloading or linking.
 * Priority: thumb > optimized > url > blobUrl > empty string.
 *
 * Note: For display rendering, DanxFile.vue uses mode-aware computeds
 * that prevent non-renderable URLs (e.g. video originals) from being
 * used as image sources.
 */
export function resolveThumbUrl(file: PreviewFile): string {
  return file.thumb?.url || resolveFileUrl(file);
}

/**
 * Create a preventable download event object.
 */
export function createDownloadEvent(file: PreviewFile): DanxFileDownloadEvent {
  let prevented = false;
  return {
    file,
    get prevented() {
      return prevented;
    },
    preventDefault() {
      prevented = true;
    },
  };
}

/**
 * Trigger a browser download for a file. Resolves the best URL and downloads.
 */
export function triggerFileDownload(file: PreviewFile): void {
  const url = resolveFileUrl(file);
  if (url) {
    downloadFile(url, file.name);
  }
}

/**
 * Create a preventable download event, emit it via the given callback,
 * and trigger a browser download if the event was not prevented.
 */
export function handleDownload(
  file: PreviewFile,
  emitFn: (event: DanxFileDownloadEvent) => void
): void {
  const event = createDownloadEvent(file);
  emitFn(event);
  if (!event.prevented) {
    triggerFileDownload(file);
  }
}
