/**
 * DanxFileNavigator Type Definitions
 *
 * Types specific to the file navigator component.
 */

import type { DanxFileDownloadEvent, PreviewFile } from "../danx-file/types";

/**
 * A virtual slide descriptor for the carousel buffer.
 *
 * The virtual carousel renders current ±2 slides for smooth opacity
 * transitions. Only the active slide receives pointer events.
 */
export interface VirtualSlide {
  /** The file this slide represents */
  file: PreviewFile;
  /** Pre-resolved display URL (avoids repeated resolveFileUrl calls) */
  url: string;
  /** Index in the full file list */
  index: number;
  /** Whether this is the currently active/visible slide */
  isActive: boolean;
}

/**
 * Props for DanxFileNavigator.
 */
export interface DanxFileNavigatorProps {
  /** The main/anchor file */
  file: PreviewFile;
  /** Related files for carousel navigation */
  relatedFiles?: PreviewFile[];
  /** Show download button in header */
  downloadable?: boolean;
  /** Show close button (standalone, top-right) */
  closable?: boolean;
}

/**
 * Emits for DanxFileNavigator.
 */
export interface DanxFileNavigatorEmits {
  (e: "download", event: DanxFileDownloadEvent): void;
  (e: "loadChildren", file: PreviewFile): void;
  (e: "close"): void;
}

/**
 * Slots for DanxFileNavigator.
 */
export interface DanxFileNavigatorSlots {
  /** Extra buttons in the header bar */
  "header-actions"?(): unknown;
}
