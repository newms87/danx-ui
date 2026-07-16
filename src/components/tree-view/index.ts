/**
 * TreeView Component Module
 *
 * Exports:
 * - DanxTreeView: Generic recursive hierarchical data tree component
 * - TreeViewNode: Recursive row component (used internally; exported for advanced composition)
 * - useTreeView: Composable managing expansion + selection state
 * - isBranchNode: Helper to test whether a node is a branch
 * - Types: TreeNode, DanxTreeViewProps, etc.
 */
export { default as DanxTreeView } from "./DanxTreeView.vue";
export { default as TreeViewNode } from "./TreeViewNode.vue";
export {
  useTreeView,
  type UseTreeViewOptions,
  type UseTreeViewReturn,
  type FlatTreeViewRow,
} from "./useTreeView";
export {
  isBranchNode,
  TREE_VIEW_CONTEXT,
  type TreeNode,
  type DanxTreeViewProps,
  type DanxTreeViewEmits,
  type DanxTreeViewSlots,
  type TreeViewContext,
  type TreeViewNodeSlotProps,
} from "./types";
