/**
 * DanxFileViewer Type Definitions
 *
 * Types specific to the file viewer component.
 */

import type { DanxFileDownloadEvent, PreviewFile } from "../danx-file";

/**
 * Layout toggles for DanxFileViewer.
 *
 * Two independent boolean flags compose into four visual layouts:
 *
 * - neither              → horizontal carousel with bottom thumbnail strip (default).
 * - `sidebar`            → carousel body with left-hand vertical thumbnail sidebar.
 * - `continuous`         → virtualized PDF-style scroll body with bottom thumbnail strip.
 * - `sidebar`+`continuous` → continuous scroll body with left-hand vertical sidebar.
 */
export type LayoutToggle = "sidebar" | "continuous";

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
   * Initial sidebar flag when no localStorage preference exists. When `true`,
   * the thumbnail strip renders as a tall left-hand column (PDF-style).
   * Default: `false`.
   */
  defaultSidebar?: boolean;
  /**
   * Initial continuous-scroll flag when no localStorage preference exists.
   * When `true`, every file renders in a virtualized scrolling column instead
   * of a paged carousel. Default: `false`.
   */
  defaultContinuous?: boolean;
  /**
   * Zoom percent used when no localStorage preference exists. Default: `100`.
   */
  defaultZoom?: number;
  /**
   * Toggles the user can flip via the toolbar. `[]` (default) hides the
   * layout toggle group entirely. Pass `["sidebar", "continuous"]` (or any
   * subset) to let the user enable each independently.
   */
  layoutToggles?: LayoutToggle[];
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
