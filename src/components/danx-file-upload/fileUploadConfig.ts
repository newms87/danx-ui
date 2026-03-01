/**
 * File Upload Handler Configuration
 *
 * Module-level get/set for the global upload handler function.
 * Apps call setFileUploadHandler() once at startup to configure how files
 * are uploaded. The useFileUpload composable reads this via getFileUploadHandler().
 *
 * Follows the same pattern as useStructuredDataPreference.ts: module-level
 * variable with pure get/set functions.
 */

import type { FileUploadHandler } from "./types";

let handler: FileUploadHandler | null = null;

/**
 * Set the global file upload handler.
 * Call this once at app startup to configure upload behavior.
 */
export function setFileUploadHandler(fn: FileUploadHandler): void {
  handler = fn;
}

/**
 * Get the global file upload handler.
 * Returns null if no handler has been configured.
 */
export function getFileUploadHandler(): FileUploadHandler | null {
  return handler;
}
