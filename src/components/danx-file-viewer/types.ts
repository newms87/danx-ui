/**
 * DanxFileViewer Type Definitions
 *
 * Types specific to the file viewer component.
 */

import type { DanxFileDownloadEvent, PreviewFile } from "../danx-file";

/**
 * Layout modes for DanxFileViewer.
 *
 * - `horizontal` — single active slide with a thin thumbnail strip beneath (default carousel).
 * - `vertical`   — single active slide with a tall thumbnail column to the left (PDF sidebar).
 * - `continuous` — virtualized scrolling column of every file, PDF-reader style.
 */
export type Layout = "horizontal" | "vertical" | "continuous";

/**
 * A virtual slide descriptor for the carousel buffer.
 *
 * The virtual carousel renders current ±2 slides for smooth opacity
 * transitions. Only the active slide receives pointer events.
 */
export interface VirtualSlide {
  /** The file this slide represents */
  file: PreviewFile;
  /** Index in the full file list */
  index: number;
  /** Whether this is the currently active/visible slide */
  isActive: boolean;
}

/** A breadcrumb entry for file ancestor navigation. */
export interface BreadcrumbEntry {
  id: string;
  name: string;
}

/**
 * Props for DanxFileViewer.
 */
export interface DanxFileViewerProps {
  /** The main/anchor file */
  file: PreviewFile;
  /** Related files for carousel navigation */
  relatedFiles?: PreviewFile[];
  /** Show download button in header */
  downloadable?: boolean;
  /** Label for the children navigation button (default: "Children") */
  childrenLabel?: string;
  /**
   * Layout used when no localStorage preference exists.
   * Persisted preference always wins. Default: `"horizontal"`.
   */
  defaultLayout?: Layout;
  /**
   * Zoom percent used when no localStorage preference exists. Default: `100`.
   */
  defaultZoom?: number;
  /**
   * Layouts the user can switch between via the toolbar. Limiting this list
   * locks the viewer to a subset (e.g. `["horizontal"]` matches the original
   * behavior with no toolbar). Default: `["horizontal"]`.
   */
  availableLayouts?: Layout[];
  /**
   * Enable Photoshop-style zoom + pan (Ctrl+wheel, Ctrl+drag, etc.) and show
   * zoom controls in the toolbar. Default: `false`.
   */
  zoomable?: boolean;
  /**
   * localStorage namespace for layout / zoom / panel-width preferences.
   * Default: `"danx-file-viewer"`.
   */
  storageKey?: string;
  /**
   * Force-show or hide the toolbar. When omitted, the toolbar auto-shows
   * whenever a layout toggle is available (`availableLayouts.length > 1`)
   * or zoom is enabled.
   */
  showToolbar?: boolean;
}

/**
 * Emits for DanxFileViewer.
 */
export interface DanxFileViewerEmits {
  (e: "download", event: DanxFileDownloadEvent): void;
  (e: "loadChildren", file: PreviewFile): void;
}

/**
 * Slots for DanxFileViewer.
 */
export interface DanxFileViewerSlots {
  /** Extra buttons in the header bar */
  "header-actions"?(): unknown;
}
