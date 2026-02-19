/**
 * DanxFileNavigator Type Definitions
 *
 * Types specific to the file navigator component.
 */

import type { PreviewFile } from "../danx-file/types";

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
