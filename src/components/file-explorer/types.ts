/**
 * FileExplorer Type Definitions
 *
 * Types for the DanxFileExplorer recursive file/folder tree component.
 */

import type { InjectionKey, VNode } from "vue";

/**
 * A single node in the file explorer tree.
 *
 * A node is a folder when `type` is `"folder"` OR when it has a `children`
 * array (even if empty). Otherwise it is treated as a file. Folders may
 * recurse to any depth via their `children`.
 */
export interface FileNode {
  /** Unique identifier — used for selection, expansion, and as the v-for key */
  id: string;

  /** Display name (e.g. "index.ts", "components") */
  name: string;

  /**
   * Node kind. Optional — inferred as `"folder"` when `children` is present,
   * otherwise `"file"`. Set explicitly to render an empty folder (no children).
   */
  type?: "file" | "folder";

  /** Child nodes (folders only). Presence implies the node is a folder. */
  children?: FileNode[];

  /**
   * Optional icon override (built-in icon name or raw SVG string).
   * When omitted, folders use the folder/folder-open icons and files use
   * the generic file icon.
   */
  icon?: string;

  /** When true, the node is rendered dimmed and is not selectable. */
  disabled?: boolean;

  /** Arbitrary consumer data, passed back through the `select` event and slots. */
  meta?: Record<string, unknown>;
}

/** Props for the DanxFileExplorer component */
export interface DanxFileExplorerProps {
  /** Root nodes of the tree (required) */
  nodes: FileNode[];

  /**
   * When true, only folders are rendered — files are hidden entirely.
   * Folders whose only descendants are files still render (as empty folders).
   */
  foldersOnly?: boolean;

  /**
   * When true, expand every folder on initial render.
   * Ignored once the user toggles a folder or when `storageKey` restores state.
   */
  defaultExpanded?: boolean;

  /**
   * localStorage key for persisting expanded folder IDs.
   * When provided, expansion state survives page refreshes. Omit to disable.
   */
  storageKey?: string;

  /** When true, clicking a row selects it (single selection). Default: true. */
  selectable?: boolean;
}

/** Emits for the DanxFileExplorer component */
export interface DanxFileExplorerEmits {
  /** Selected node ID changed (v-model:selected) */
  (e: "update:selected", value: string | null): void;

  /** Expanded folder IDs changed (v-model:expanded) */
  (e: "update:expanded", value: string[]): void;

  /** A node row was activated. Fires for files and folders alike. */
  (e: "select", node: FileNode): void;

  /** A folder was expanded or collapsed. */
  (e: "toggle", node: FileNode, expanded: boolean): void;
}

/**
 * Scoped slot bindings shared by the per-node slots.
 */
export interface FileExplorerNodeSlotProps {
  /** The node being rendered */
  node: FileNode;

  /** Nesting depth (root nodes are depth 0) */
  depth: number;

  /** Whether the node is an (open) folder */
  isFolder: boolean;

  /** Whether this folder is currently expanded */
  expanded: boolean;

  /** Whether this node is the selected node */
  selected: boolean;
}

/** Slots for the DanxFileExplorer component */
export interface DanxFileExplorerSlots {
  /** Replaces the default label/icon row content for every node. */
  node?: (props: FileExplorerNodeSlotProps) => unknown;

  /** Trailing content for each node row (e.g. action buttons, badges). */
  actions?: (props: FileExplorerNodeSlotProps) => unknown;

  /** Rendered when there are no visible nodes. */
  empty?: () => unknown;
}

/**
 * Internal context shared from DanxFileExplorer down to every recursive
 * FileExplorerNode via provide/inject. Per-instance — not global state.
 */
export interface FileExplorerContext {
  /** Returns whether a folder ID is currently expanded */
  isExpanded: (id: string) => boolean;

  /** Returns whether a node ID is the selected node */
  isSelected: (id: string) => boolean;

  /** Expand/collapse a folder node */
  toggle: (node: FileNode) => void;

  /** Select a node (no-op when not selectable or node disabled) */
  select: (node: FileNode) => void;

  /** Whether a node is a folder (explicit type or presence of children) */
  isFolder: (node: FileNode) => boolean;

  /** Children of a node after folders-only filtering */
  visibleChildren: (node: FileNode) => FileNode[];

  /** Whether rows are selectable */
  selectable: boolean;

  /**
   * Root-provided slot render functions, forwarded to every node via inject
   * (avoids recursive template slot-forwarding and its circular typing).
   */
  slots: {
    node?: (props: FileExplorerNodeSlotProps) => VNode[];
    actions?: (props: FileExplorerNodeSlotProps) => VNode[];
  };
}

/** Injection key for the file explorer context */
export const FILE_EXPLORER_CONTEXT: InjectionKey<FileExplorerContext> =
  Symbol("danx-file-explorer");

/** Shape of the localStorage persisted state */
export interface FileExplorerStorageState {
  /** IDs of currently expanded folders */
  expandedIds: string[];
}
