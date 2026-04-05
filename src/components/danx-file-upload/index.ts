/**
 * DanxFileUpload Component Module
 *
 * Exports:
 * - DanxFileUpload: File upload component with drag-and-drop
 * - useFileUpload: Core composable for upload management
 * - fileUploadConfig: Global handler get/set
 * - uploadFileToUrl: Generic XHR upload utility
 * - Types: TypeScript interfaces
 */

export { default as DanxFileUpload } from "./DanxFileUpload.vue";
export { useFileUpload } from "./useFileUpload";
export type { UseFileUploadReturn } from "./useFileUpload";
export {
  setFileUploadHandler,
  getFileUploadHandler,
  // resetFileUploadHandler intentionally not in src/index.ts — test-only utility
  resetFileUploadHandler,
} from "./fileUploadConfig";
export {
  setFileChildrenHandler,
  getFileChildrenHandler,
  resetFileChildrenHandler,
} from "./fileChildrenConfig";
export type { FileChildrenHandler } from "./fileChildrenConfig";
export { uploadFileToUrl } from "./uploadFileToUrl";
export { isAcceptedType } from "./fileValidation";
export type {
  FileUploadHandler,
  UploadFileToUrlOptions,
  DanxFileUploadProps,
  DanxFileUploadEmits,
  DanxFileUploadSlots,
  UseFileUploadOptions,
} from "./types";
