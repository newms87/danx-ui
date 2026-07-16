import { computed, type Ref, ref, watch } from "vue";
import { getItem, setItem } from "../../shared/storage";
import type { FileExplorerStorageState, FileNode } from "./types";

/**
 * useFileExplorer Composable
 *
 * Owns the expansion + selection state for a DanxFileExplorer tree and the
 * derived helpers shared with recursive nodes. Handles optional localStorage
 * persistence of expanded folder IDs and folders-only filtering.
 *
 * Expansion is tracked as a reactive Set for O(1) lookups but mirrored to the
 * `expanded` v-model array so consumers can read/control it declaratively.
 *
 * @param nodes - Reactive root nodes of the tree
 * @param expanded - v-model ref of expanded folder ID strings
 * @param selected - v-model ref of the selected node ID (or null)
 * @param options - Configuration (read once at init, not reactive)
 */
export interface UseFileExplorerOptions {
  /** localStorage key for persisting expanded IDs (omit to disable). */
  storageKey?: string;

  /** Expand every folder on first render when no persisted state exists. */
  defaultExpanded?: boolean;

  /** Reactive folders-only flag — hides file nodes when true. */
  foldersOnly: Ref<boolean>;

  /** Reactive selectable flag — disables selection when false. */
  selectable: Ref<boolean>;

  /**
   * Reactive filter query — case-insensitive substring match on node name.
   * Ancestor folders of any match auto-expand; expansion state prior to
   * filtering is restored when the query is cleared.
   */
  filterQuery?: Ref<string>;
}

export interface UseFileExplorerReturn {
  /** Whether a folder ID is currently expanded */
  isExpanded: (id: string) => boolean;

  /** Whether a node ID is the selected node */
  isSelected: (id: string) => boolean;

  /** Expand/collapse a folder node, returns the new expanded state */
  toggle: (node: FileNode) => boolean;

  /** Set a folder's expanded state explicitly. Returns whether it changed. */
  setExpanded: (node: FileNode, value: boolean) => boolean;

  /** Select a node (no-op when not selectable or node disabled) */
  select: (node: FileNode) => void;

  /** Whether a node is a folder (explicit type or presence of children) */
  isFolder: (node: FileNode) => boolean;

  /** Children of a node after folders-only filtering */
  visibleChildren: (node: FileNode) => FileNode[];

  /** Root nodes after folders-only filtering */
  visibleNodes: Ref<FileNode[]>;

  /** Flattened, in-order list of every currently-visible row (roving tabindex + arrow nav) */
  flatRows: Ref<FlatFileExplorerRow[]>;

  /** Whether a node ID is the current roving-tabindex focus target */
  isFocused: (id: string) => boolean;

  /** Move the roving-tabindex focus target to a node ID */
  setFocused: (id: string) => void;

  /** The matched substring range in a node's name for the active filter query, or null. */
  matchRange: (node: FileNode) => { start: number; end: number } | null;
}

/** One entry of the flattened, in-order visible-row list used for arrow-key navigation. */
export interface FlatFileExplorerRow {
  id: string;
  node: FileNode;
  depth: number;
  parentId: string | null;
}

/** A node is a folder when explicitly typed so OR when it has a children array. */
export function isFolderNode(node: FileNode): boolean {
  if (node.type === "folder") return true;
  if (node.type === "file") return false;
  return Array.isArray(node.children);
}

export function useFileExplorer(
  nodes: Ref<FileNode[]>,
  expanded: Ref<string[]>,
  selected: Ref<string | null>,
  options: UseFileExplorerOptions
): UseFileExplorerReturn {
  const {
    storageKey,
    defaultExpanded = false,
    foldersOnly,
    selectable,
    filterQuery = ref(""),
  } = options;

  const expandedSet = ref<Set<string>>(new Set());

  function collectFolderIds(list: FileNode[], acc: string[]): string[] {
    for (const node of list) {
      if (isFolderNode(node)) {
        acc.push(node.id);
        if (node.children) collectFolderIds(node.children, acc);
      }
    }
    return acc;
  }

  function isFileExplorerStorageState(value: unknown): value is FileExplorerStorageState {
    return (
      typeof value === "object" &&
      value !== null &&
      Array.isArray((value as FileExplorerStorageState).expandedIds)
    );
  }

  function loadFromStorage(): boolean {
    if (!storageKey) return false;
    const stored = getItem<FileExplorerStorageState | null>(
      storageKey,
      null,
      isFileExplorerStorageState
    );
    if (!stored) return false;
    expandedSet.value = new Set(stored.expandedIds.filter((id) => typeof id === "string"));
    return true;
  }

  function saveToStorage(): void {
    if (!storageKey) return;
    const state: FileExplorerStorageState = { expandedIds: [...expandedSet.value] };
    setItem(storageKey, state);
  }

  // --- Initialize: persisted state > provided v-model > defaultExpanded ---
  const restored = loadFromStorage();
  if (!restored) {
    if (expanded.value.length > 0) {
      expandedSet.value = new Set(expanded.value);
    } else if (defaultExpanded) {
      expandedSet.value = new Set(collectFolderIds(nodes.value, []));
    }
  }

  // Sync the Set out to the v-model array (and persist).
  function syncExpanded(): void {
    expanded.value = [...expandedSet.value];
    saveToStorage();
  }
  syncExpanded();

  // Honor external v-model:expanded updates (controlled usage).
  watch(expanded, (ids) => {
    const next = new Set(ids);
    const current = expandedSet.value;
    if (next.size === current.size && [...next].every((id) => current.has(id))) return;
    expandedSet.value = next;
    saveToStorage();
  });

  function isExpanded(id: string): boolean {
    return expandedSet.value.has(id);
  }

  function isSelected(id: string): boolean {
    return selected.value === id;
  }

  function toggle(node: FileNode): boolean {
    const nowExpanded = !expandedSet.value.has(node.id);
    setExpanded(node, nowExpanded);
    return nowExpanded;
  }

  /** Explicitly expand/collapse a folder. Returns whether the state actually changed. */
  function setExpanded(node: FileNode, value: boolean): boolean {
    if (expandedSet.value.has(node.id) === value) return false;
    const next = new Set(expandedSet.value);
    if (value) next.add(node.id);
    else next.delete(node.id);
    expandedSet.value = next;
    syncExpanded();
    return true;
  }

  function select(node: FileNode): void {
    if (!selectable.value || node.disabled) return;
    selected.value = node.id;
  }

  function visibleChildren(node: FileNode): FileNode[] {
    const children = node.children ?? [];
    if (!foldersOnly.value) return children;
    return children.filter((child) => isFolderNode(child));
  }

  // --- Name filtering ---

  /**
   * Recursively keeps only nodes whose name matches, or that have a matching
   * descendant. A self-matched folder keeps all of its children (matched or
   * not) so its full contents remain browsable once revealed by the filter.
   */
  function filterTree(list: FileNode[], query: string): FileNode[] {
    const result: FileNode[] = [];
    for (const node of list) {
      if (node.name.toLowerCase().includes(query)) {
        result.push(node);
        continue;
      }
      if (node.children) {
        const filteredChildren = filterTree(node.children, query);
        if (filteredChildren.length > 0) {
          result.push({ ...node, children: filteredChildren });
        }
      }
    }
    return result;
  }

  const filteredNodes = computed<FileNode[]>(() => {
    const query = filterQuery.value.trim().toLowerCase();
    if (!query) return nodes.value;
    return filterTree(nodes.value, query);
  });

  const visibleNodes = computed<FileNode[]>(() => {
    if (!foldersOnly.value) return filteredNodes.value;
    return filteredNodes.value.filter((node) => isFolderNode(node));
  });

  /** The matched substring range in a node's name for the active filter query, or null. */
  function matchRange(node: FileNode): { start: number; end: number } | null {
    const query = filterQuery.value.trim().toLowerCase();
    if (!query) return null;
    const start = node.name.toLowerCase().indexOf(query);
    if (start === -1) return null;
    return { start, end: start + query.length };
  }

  // Auto-expand ancestor folders of any match while filtering; restore the
  // pre-filter expansion state once the query is cleared.
  let preFilterExpanded: Set<string> | null = null;

  function collectFolderIdsWithChildren(list: FileNode[], acc: string[]): string[] {
    for (const node of list) {
      if (isFolderNode(node) && node.children && node.children.length > 0) {
        acc.push(node.id);
        collectFolderIdsWithChildren(node.children, acc);
      }
    }
    return acc;
  }

  watch(
    filterQuery,
    (query) => {
      const trimmed = query.trim();
      if (trimmed) {
        if (preFilterExpanded === null) {
          preFilterExpanded = new Set(expandedSet.value);
        }
        expandedSet.value = new Set(collectFolderIdsWithChildren(filteredNodes.value, []));
        syncExpanded();
      } else if (preFilterExpanded !== null) {
        expandedSet.value = preFilterExpanded;
        preFilterExpanded = null;
        syncExpanded();
      }
    },
    { immediate: true }
  );

  // --- Roving tabindex / arrow-key navigation ---

  const flatRows = computed<FlatFileExplorerRow[]>(() => {
    const rows: FlatFileExplorerRow[] = [];
    function walk(list: FileNode[], depth: number, parentId: string | null): void {
      for (const node of list) {
        rows.push({ id: node.id, node, depth, parentId });
        if (isFolderNode(node) && expandedSet.value.has(node.id)) {
          walk(visibleChildren(node), depth + 1, node.id);
        }
      }
    }
    walk(visibleNodes.value, 0, null);
    return rows;
  });

  const focusedId = ref<string | null>(null);

  const effectiveFocusedId = computed<string | null>(() => {
    const rows = flatRows.value;
    if (focusedId.value && rows.some((row) => row.id === focusedId.value)) {
      return focusedId.value;
    }
    return rows[0]?.id ?? null;
  });

  function isFocused(id: string): boolean {
    return effectiveFocusedId.value === id;
  }

  function setFocused(id: string): void {
    focusedId.value = id;
  }

  return {
    isExpanded,
    isSelected,
    toggle,
    setExpanded,
    select,
    isFolder: isFolderNode,
    visibleChildren,
    visibleNodes,
    flatRows,
    isFocused,
    setFocused,
    matchRange,
  };
}
