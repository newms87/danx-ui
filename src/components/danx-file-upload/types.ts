/**
 * DanxFileUpload Type Definitions
 *
 * Types for the file upload system: handler callbacks, XHR utility options,
 * component props/emits/slots, and composable options.
 */

import type { PreviewFile, DanxFileSize } from "../danx-file/types";
import type { FormFieldBaseProps } from "../../shared/form-types";

/**
 * Application-provided upload handler.
 *
 * The app provides ONE function that handles the actual upload mechanics.
 * danx-ui calls this per file with progress reporting and cancellation support.
 *
 * @param file - The browser File object to upload
 * @param onProgress - Callback to report upload progress (0-100)
 * @param signal - AbortSignal for cancellation
 * @returns Promise resolving to the server-returned PreviewFile
 */
export type FileUploadHandler = (
  file: File,
  onProgress: (percent: number) => void,
  signal: AbortSignal
) => Promise<PreviewFile>;

/**
 * Options for the uploadFileToUrl XHR utility.
 */
export interface UploadFileToUrlOptions {
  /** HTTP method (default: "POST") */
  method?: string;
  /** Additional request headers */
  headers?: Record<string, string>;
  /** Progress callback receiving percent 0-95 */
  onProgress?: (percent: number) => void;
  /** AbortSignal for cancellation */
  signal?: AbortSignal;
}

/**
 * Props for DanxFileUpload component.
 * Extends FormFieldBaseProps for label, error, helper text integration.
 */
export interface DanxFileUploadProps extends FormFieldBaseProps {
  /** Allow multiple file selection (default: false) */
  multiple?: boolean;
  /** Accepted MIME types (e.g. "image/*,.pdf") */
  accept?: string;
  /** Maximum number of files in multi mode */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** DanxFile thumbnail size preset (default: "md") */
  fileSize?: DanxFileSize;
  /** Show filename below thumbnails (default: false) */
  showFilename?: boolean;
  /** Show file size below thumbnails (default: false) */
  showFileSize?: boolean;
  /** Per-instance upload handler override */
  uploadFn?: FileUploadHandler;
}

/**
 * Emits for DanxFileUpload component.
 */
export interface DanxFileUploadEmits {
  (e: "remove", file: PreviewFile): void;
}

/**
 * Slots for DanxFileUpload component.
 */
export interface DanxFileUploadSlots {
  /** Custom empty state content */
  empty?(): unknown;
}

/**
 * Options for the useFileUpload composable.
 */
export interface UseFileUploadOptions {
  /** Reactive model ref for the file array */
  model: { value: PreviewFile[] };
  /** Allow multiple files */
  multiple?: boolean;
  /** Accepted MIME types */
  accept?: string;
  /** Maximum number of files */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Per-instance upload handler */
  uploadFn?: FileUploadHandler;
}
