/**
 * Context Menu Module
 *
 * Exports the DanxContextMenu component, types, and positioning utility.
 */

export { default as DanxContextMenu } from "./DanxContextMenu.vue";
export { calculateContextMenuPosition } from "./useContextMenuPosition";
export type { ContextMenuPositionResult } from "./useContextMenuPosition";
export type {
  ContextMenuItem,
  ContextMenuPosition,
  DanxContextMenuEmits,
  DanxContextMenuProps,
} from "./types";
