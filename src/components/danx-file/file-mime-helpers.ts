/**
 * File MIME Detection and Icon Mapping
 *
 * Pure functions for checking file MIME types and mapping them to icon names.
 * Used by DanxFile, DanxFileViewer, and useDanxFile composable.
 */

import type { PreviewFile } from "./types";

/** Check if file has an image MIME type */
export function isImage(file: PreviewFile): boolean {
  return file.mime.startsWith("image/");
}

/** Check if file has a video MIME type */
export function isVideo(file: PreviewFile): boolean {
  return file.mime.startsWith("video/");
}

/** Check if file is a PDF */
export function isPdf(file: PreviewFile): boolean {
  return file.mime === "application/pdf";
}

/** Check if file has an audio MIME type */
export function isAudio(file: PreviewFile): boolean {
  return file.mime.startsWith("audio/");
}

/** Check if file has a text MIME type (text/plain, text/markdown, etc.) */
export function isText(file: PreviewFile): boolean {
  return file.mime.startsWith("text/");
}

/** Check if file can be directly previewed (image, video, audio, PDF, or text) */
export function isPreviewable(file: PreviewFile): boolean {
  return isImage(file) || isVideo(file) || isAudio(file) || isPdf(file) || isText(file);
}

/**
 * Map a file's MIME type to an icon registry name.
 *
 * Returns a string matching a key in the DanxIcon iconRegistry:
 * - image/* (when no thumb) → "document" (image-like file)
 * - video/* → "play"
 * - application/pdf → "document"
 * - compressed types → "folder"
 * - text/* → "document"
 * - default → "document"
 */
export function fileTypeIcon(file: PreviewFile): string {
  const { mime } = file;

  if (mime.startsWith("video/")) return "play";
  if (mime.startsWith("audio/")) return "music";
  if (mime === "application/pdf") return "file-pdf";

  if (
    mime === "application/zip" ||
    mime === "application/x-rar-compressed" ||
    mime === "application/gzip" ||
    mime === "application/x-tar" ||
    mime === "application/x-7z-compressed"
  ) {
    return "folder";
  }

  return "document";
}
