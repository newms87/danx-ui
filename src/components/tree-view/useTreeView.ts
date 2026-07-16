import { computed, type Ref, ref, watch } from "vue";
import { isBranchNode, type TreeNode } from "./types";

/**
 * useTreeView Composable
 *
 * Owns the expansion + selection state for a DanxTreeView tree and the
 * derived helpers shared with recursive nodes. Generalizes the pattern
 * proven in useFileExplorer.ts to arbitrary TreeNode<T> data, adding
 * multi-selection support.
 *
 * Expansion/selection are tracked as reactive Sets for O(1) lookups but
 * mirrored to their v-model refs so consumers can read/control them
 * declaratively (controlled mode) or let the composable own them
 * (uncontrolled mode).
 */
export interface UseTreeViewOptions {
  /** Expand every branch on first render when no v-model:expanded value is provided. */
  defaultExpanded?: boolean;

  /** Reactive selectable flag — disables selection when false. */
  selectable: Ref<boolean>;

  /** Reactive multi-select flag. */
  multiple: Ref<boolean>;
}

export interface FlatTreeViewRow<T> {
  id: string;
  node: TreeNode<T>;
  depth: number;
  parentId: string | null;
}

export interface UseTreeViewReturn<T> {
  isExpanded: (id: string) => boolean;
  isSelected: (id: string) => boolean;
  toggle: (node: TreeNode<T>) => boolean;
  setExpanded: (node: TreeNode<T>, value: boolean) => boolean;
  select: (node: TreeNode<T>) => void;
  isBranch: (node: TreeNode<T>) => boolean;
  flatRows: Ref<FlatTreeViewRow<T>[]>;
  isFocused: (id: string) => boolean;
  setFocused: (id: string) => void;
}

/** Normalizes the `selected` v-model (string | string[] | null) to a Set of ids. */
function toSelectedSet(value: string | string[] | null): Set<string> {
  if (Array.isArray(value)) return new Set(value);
  return value ? new Set([value]) : new Set();
}

export function useTreeView<T>(
  nodes: Ref<TreeNode<T>[]>,
  expanded: Ref<string[]>,
  selected: Ref<string | string[] | null>,
  options: UseTreeViewOptions
): UseTreeViewReturn<T> {
  const { defaultExpanded = false, selectable, multiple } = options;

  function collectBranchIds(list: TreeNode<T>[], acc: string[]): string[] {
    for (const node of list) {
      if (isBranchNode(node)) {
        acc.push(node.id);
        collectBranchIds(node.children!, acc);
      }
    }
    return acc;
  }

  const expandedSet = ref<Set<string>>(
    new Set(
      expanded.value.length > 0
        ? expanded.value
        : defaultExpanded
          ? collectBranchIds(nodes.value, [])
          : []
    )
  );

  function syncExpanded(): void {
    expanded.value = [...expandedSet.value];
  }
  if (expanded.value.length === 0 && expandedSet.value.size > 0) syncExpanded();

  watch(expanded, (ids) => {
    const next = new Set(ids);
    const current = expandedSet.value;
    if (next.size === current.size && [...next].every((id) => current.has(id))) return;
    expandedSet.value = next;
  });

  const selectedSet = ref<Set<string>>(toSelectedSet(selected.value));

  watch(selected, (value) => {
    const next = toSelectedSet(value);
    const current = selectedSet.value;
    if (next.size === current.size && [...next].every((id) => current.has(id))) return;
    selectedSet.value = next;
  });

  function syncSelected(): void {
    const ids = [...selectedSet.value];
    selected.value = multiple.value ? ids : ids[0]!;
  }

  function isExpanded(id: string): boolean {
    return expandedSet.value.has(id);
  }

  function isSelected(id: string): boolean {
    return selectedSet.value.has(id);
  }

  function toggle(node: TreeNode<T>): boolean {
    const nowExpanded = !expandedSet.value.has(node.id);
    setExpanded(node, nowExpanded);
    return nowExpanded;
  }

  function setExpanded(node: TreeNode<T>, value: boolean): boolean {
    if (expandedSet.value.has(node.id) === value) return false;
    const next = new Set(expandedSet.value);
    if (value) next.add(node.id);
    else next.delete(node.id);
    expandedSet.value = next;
    syncExpanded();
    return true;
  }

  function select(node: TreeNode<T>): void {
    if (!selectable.value || node.disabled) return;
    if (multiple.value) {
      const next = new Set(selectedSet.value);
      if (next.has(node.id)) next.delete(node.id);
      else next.add(node.id);
      selectedSet.value = next;
    } else {
      selectedSet.value = new Set([node.id]);
    }
    syncSelected();
  }

  const flatRows = computed<FlatTreeViewRow<T>[]>(() => {
    const rows: FlatTreeViewRow<T>[] = [];
    function walk(list: TreeNode<T>[], depth: number, parentId: string | null): void {
      for (const node of list) {
        rows.push({ id: node.id, node, depth, parentId });
        if (isBranchNode(node) && expandedSet.value.has(node.id) && node.children) {
          walk(node.children, depth + 1, node.id);
        }
      }
    }
    walk(nodes.value, 0, null);
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
    isBranch: isBranchNode,
    flatRows,
    isFocused,
    setFocused,
  };
}
