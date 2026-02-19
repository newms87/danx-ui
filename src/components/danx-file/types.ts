/**
 * DanxFile Type Definitions
 *
 * Types shared between DanxFile (thumbnail) and DanxFileNavigator (viewer).
 */

/**
 * A file object for preview rendering.
 *
 * Based on quasar-ui-danx FileUpload.ts output. The `type` field matches
 * the browser File API MIME type (e.g. "image/jpeg", "video/mp4").
 *
 * Progress is auto-detected: when `progress` is non-null and < 100,
 * DanxFile automatically shows a progress bar with "Uploading... X%".
 * Use `statusMessage` to override the default text.
 */
export interface PreviewFile {
  /** Unique identifier */
  id: string;
  /** Display filename */
  name: string;
  /** File size in bytes */
  size: number;
  /** MIME type (e.g. "image/jpeg", "video/mp4") */
  type: string;
  /** URL to file (empty string during upload) */
  url: string;
  /** Temporary blob URL during upload */
  blobUrl?: string;
  /** Geolocation data */
  location?: string | Record<string, unknown> | null;
  /** Upload progress 0-100. Non-null and < 100 = in progress. */
  progress?: number | null;
  /** Thumbnail image URL */
  thumb?: { url: string };
  /** Optimized version URL */
  optimized?: { url: string };
  /** Child variants (transcodes, PDF pages, etc.) */
  children?: PreviewFile[];
  /** Application/business metadata (dimensions, format, duration, codec) */
  meta?: Record<string, unknown>;
  /** Raw EXIF/camera data (make, model, ISO, aperture, shutter speed, GPS) */
  exif?: Record<string, unknown>;
  /** Override default progress text (default: "Uploading... X%") */
  statusMessage?: string;
  /** Error message (shows error state, takes priority over progress) */
  error?: string;
}

/**
 * Image object-fit values for thumbnail rendering.
 */
export type ImageFit = "cover" | "contain" | "fill" | "none" | "scale-down";

/**
 * Metadata panel display mode for DanxFileNavigator.
 */
export type MetadataMode = "overlay" | "docked";

/**
 * Props for DanxFile (thumbnail component).
 */
export interface DanxFileProps {
  /** The file to display */
  file: PreviewFile;
  /** Image object-fit (default: "cover") */
  fit?: ImageFit;
  /** Show filename overlay (default: false) */
  showFilename?: boolean;
  /** Show download button on hover (default: false) */
  downloadable?: boolean;
  /** Show remove button on hover (default: false) */
  removable?: boolean;
  /** Suppress click event (default: false) */
  disabled?: boolean;
}

/**
 * Emits for DanxFile.
 */
export interface DanxFileEmits {
  (e: "click", file: PreviewFile): void;
  (e: "download", file: PreviewFile): void;
  (e: "remove", file: PreviewFile): void;
}

/**
 * Slots for DanxFile.
 */
export interface DanxFileSlots {
  /** Custom action buttons (hover overlay, top-right) */
  actions?(): unknown;
}
