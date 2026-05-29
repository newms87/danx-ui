/**
 * FileExplorer Component Module
 *
 * Exports:
 * - DanxFileExplorer: Recursive file/folder tree sidebar component
 * - FileExplorerNode: Recursive row component (used internally; exported for advanced composition)
 * - useFileExplorer: Composable managing expansion + selection state
 * - isFolderNode: Helper to test whether a node is a folder
 * - Types: FileNode, DanxFileExplorerProps, etc.
 */
export { default as DanxFileExplorer } from "./DanxFileExplorer.vue";
export { default as FileExplorerNode } from "./FileExplorerNode.vue";
export { useFileExplorer, isFolderNode } from "./useFileExplorer";
export type { UseFileExplorerOptions, UseFileExplorerReturn } from "./useFileExplorer";
export type {
  FileNode,
  DanxFileExplorerProps,
  DanxFileExplorerEmits,
  DanxFileExplorerSlots,
  FileExplorerContext,
  FileExplorerNodeSlotProps,
  FileExplorerStorageState,
} from "./types";
export { FILE_EXPLORER_CONTEXT } from "./types";
