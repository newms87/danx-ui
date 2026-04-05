/**
 * File Children Handler Configuration
 *
 * Module-level get/set for the global file children loader.
 * Apps call setFileChildrenHandler() once at startup to configure how
 * file children (e.g. PDF page transcodes) are lazily loaded.
 * DanxFileUpload reads this via getFileChildrenHandler() to handle
 * DanxFileViewer's loadChildren emit internally.
 *
 * Follows the same pattern as fileUploadConfig.ts.
 */

import type { PreviewFile } from "../danx-file";

export type FileChildrenHandler = (file: PreviewFile) => Promise<void>;

let handler: FileChildrenHandler | null = null;

/**
 * Set the global file children handler.
 * Call this once at app startup to configure lazy child loading.
 */
export function setFileChildrenHandler(fn: FileChildrenHandler): void {
  handler = fn;
}

/**
 * Get the global file children handler.
 * Returns null if no handler has been configured.
 */
export function getFileChildrenHandler(): FileChildrenHandler | null {
  return handler;
}

/**
 * Reset the global file children handler to null.
 * Test-only utility for isolating handler state between tests.
 */
export function resetFileChildrenHandler(): void {
  handler = null;
}
