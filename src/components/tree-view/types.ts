/**
 * TreeView Type Definitions
 *
 * Types for the generic DanxTreeView hierarchical data component.
 */

import type { InjectionKey, VNode } from "vue";

/**
 * A single node in the tree, generic over an arbitrary `data` payload `T`.
 *
 * A node is a "branch" when it has a `children` array (even if empty).
 * Otherwise it is a "leaf". Branches may recurse to any depth via `children`.
 */
export interface TreeNode<T = unknown> {
  /** Unique identifier — used for selection, expansion, and as the v-for key */
  id: string;

  /** Display label */
  label: string;

  /** Child nodes. Presence (even an empty array) implies the node is a branch. */
  children?: TreeNode<T>[];

  /**
   * Optional icon override (built-in DanxIcon name or raw SVG string).
   * When omitted, branches use folder/folder-open icons and leaves use a
   * generic file icon — consumers typically override via the `node` slot.
   */
  icon?: string;

  /** When true, the node is rendered dimmed and is not selectable/expandable via click. */
  disabled?: boolean;

  /** Arbitrary consumer payload, passed back through slots and events. */
  data?: T;
}

/** Props for the DanxTreeView component */
export interface DanxTreeViewProps<T = unknown> {
  /** Root nodes of the tree (required) */
  nodes: TreeNode<T>[];

  /** When true, multiple nodes may be selected at once. Default: false. */
  multiple?: boolean;

  /** When true, clicking a row selects it. Default: true. */
  selectable?: boolean;

  /** When true, expand every branch on initial render (uncontrolled only). */
  defaultExpanded?: boolean;
}

/** Emits for the DanxTreeView component */
export interface DanxTreeViewEmits<T = unknown> {
  /** Selected node id(s) changed (v-model:selected) */
  (e: "update:selected", value: string | string[] | null): void;

  /** Expanded node ids changed (v-model:expanded) */
  (e: "update:expanded", value: string[]): void;

  /** A node row was activated (leaves and branches alike). */
  (e: "select", node: TreeNode<T>): void;

  /** A branch was expanded or collapsed. */
  (e: "toggle", node: TreeNode<T>, expanded: boolean): void;
}

/** Scoped slot bindings shared by the per-node slots. */
export interface TreeViewNodeSlotProps<T = unknown> {
  /** The node being rendered */
  node: TreeNode<T>;

  /** Nesting depth (root nodes are depth 0) */
  depth: number;

  /** Whether the node is a branch (has a children array) */
  isBranch: boolean;

  /** Whether this branch is currently expanded */
  expanded: boolean;

  /** Whether this node is currently selected */
  selected: boolean;
}

/** Slots for the DanxTreeView component */
export interface DanxTreeViewSlots<T = unknown> {
  /** Replaces the default icon/label row content for every node. */
  node?: (props: TreeViewNodeSlotProps<T>) => unknown;

  /** Trailing content for each node row (e.g. action buttons, badges). */
  actions?: (props: TreeViewNodeSlotProps<T>) => unknown;

  /** Rendered when there are no nodes. */
  empty?: () => unknown;
}

/**
 * Internal context shared from DanxTreeView down to every recursive
 * TreeViewNode via provide/inject. Per-instance — not global state.
 */
export interface TreeViewContext<T = unknown> {
  isExpanded: (id: string) => boolean;
  isSelected: (id: string) => boolean;
  toggle: (node: TreeNode<T>) => void;
  select: (node: TreeNode<T>) => void;
  isBranch: (node: TreeNode<T>) => boolean;
  selectable: boolean;
  isFocused: (id: string) => boolean;
  setFocused: (id: string) => void;
  onKeydown: (event: KeyboardEvent, node: TreeNode<T>) => void;
  slots: {
    node?: (props: TreeViewNodeSlotProps<T>) => VNode[];
    actions?: (props: TreeViewNodeSlotProps<T>) => VNode[];
  };
}

/** Injection key for the tree view context */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- a single InjectionKey is shared across every DanxTreeView<T> instantiation
export const TREE_VIEW_CONTEXT: InjectionKey<TreeViewContext<any>> = Symbol("danx-tree-view");

/** A node is a branch when it has a `children` array (even if empty). */
export function isBranchNode<T>(node: TreeNode<T>): boolean {
  return Array.isArray(node.children);
}
