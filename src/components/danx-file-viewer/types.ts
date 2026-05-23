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
   * SEED — initial sidebar flag when no localStorage preference exists. When
   * `true`, the thumbnail strip renders as a tall left-hand column (PDF-style).
   * A stored preference or the user toggling the toolbar overrides this.
   * Default: `false`. For a value the consumer cannot override, use `sidebar`.
   */
  defaultSidebar?: boolean;
  /**
   * SEED — initial continuous-scroll flag when no localStorage preference
   * exists. When `true`, every file renders in a virtualized scrolling column
   * instead of a paged carousel. A stored preference or the toolbar toggle
   * overrides this. Default: `false`. For a locked value, use `continuous`.
   */
  defaultContinuous?: boolean;
  /**
   * SEED — zoom percent used when no localStorage preference exists.
   * Default: `100`. For a locked value, use `zoom`.
   */
  defaultZoom?: number;
  /**
   * LOCKED — authoritative sidebar state. When provided (not `undefined`),
   * the sidebar is PINNED to this value: localStorage is bypassed entirely
   * (no read, no write), the sidebar toggle button does not render, and the
   * `layoutToggles` watcher will not clear it. The state reactively follows
   * prop changes. Leave `undefined` for the seed + toggle behavior (see
   * `defaultSidebar`).
   */
  sidebar?: boolean;
  /**
   * LOCKED — authoritative continuous-scroll state. When provided (not
   * `undefined`), continuous mode is PINNED to this value: localStorage is
   * bypassed, the continuous toggle button does not render, and the
   * `layoutToggles` watcher will not clear it. Reactively follows prop
   * changes. Leave `undefined` for seed + toggle behavior (see
   * `defaultContinuous`).
   */
  continuous?: boolean;
  /**
   * LOCKED — authoritative zoom percent. When provided (not `undefined`),
   * the zoom model is PINNED to this value: localStorage is bypassed, the
   * toolbar zoom controls and Ctrl+wheel / keyboard zoom gestures are
   * disabled. Ctrl+drag pan (paged) and drag-scroll (continuous) still work.
   * Reactively follows prop changes. Leave `undefined` for seed + controls
   * behavior (see `defaultZoom`).
   */
  zoom?: number;
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
