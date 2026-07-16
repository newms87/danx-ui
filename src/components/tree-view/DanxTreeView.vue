<script setup lang="ts" generic="T = unknown">
/**
 * DanxTreeView - Generic recursive hierarchical data tree
 *
 * Renders a nested, expandable/collapsable tree of arbitrary TreeNode<T> data
 * — org charts, category trees, nested comment threads, permission trees, nav
 * menus. Generalizes the expand/collapse + keyboard navigation pattern proven
 * in DanxFileExplorer/useFileExplorer, adding a generic data slot and
 * single/multi selection.
 *
 * State (expansion + selection) is owned here and shared with the recursive
 * TreeViewNode rows via provide/inject — nodes are stateless and never use
 * defineExpose or event-chaining.
 *
 * @props
 *   nodes: TreeNode<T>[] - Root nodes of the tree (required)
 *   multiple?: boolean - Allow multiple selected nodes (default: false)
 *   selectable?: boolean - Whether clicking a row selects it (default: true)
 *   defaultExpanded?: boolean - Expand all branches on first render (default: false)
 *
 * @model
 *   selected: string | string[] | null - Selected node id(s) (v-model:selected).
 *     Always a string|null when `multiple` is false, always a string[] when true.
 *   expanded: string[] - Expanded branch node ids (v-model:expanded)
 *
 * @emits
 *   select - (node: TreeNode<T>) A row was activated (leaves and branches)
 *   toggle - (node: TreeNode<T>, expanded: boolean) A branch expanded/collapsed
 *
 * @slots
 *   node - Replaces a row's icon + label { node, depth, isBranch, expanded, selected }
 *   actions - Trailing row content { node, depth, isBranch, expanded, selected }
 *   empty - Shown when there are no nodes
 *
 * @tokens
 *   --dx-tree-view-bg, --dx-tree-view-text, --dx-tree-view-indent,
 *   --dx-tree-view-row-height, --dx-tree-view-row-radius,
 *   --dx-tree-view-row-hover-bg, --dx-tree-view-row-selected-bg,
 *   --dx-tree-view-row-selected-text, --dx-tree-view-icon-color,
 *   --dx-tree-view-icon-size, --dx-tree-view-gap
 *
 * @example
 *   <DanxTreeView
 *     v-model:selected="selectedId"
 *     v-model:expanded="expandedIds"
 *     :nodes="tree"
 *   />
 */
import { provide, toRef, useSlots } from "vue";
import { DanxIcon } from "../icon";
import TreeViewNode from "./TreeViewNode.vue";
import {
  TREE_VIEW_CONTEXT,
  type DanxTreeViewProps,
  type TreeViewContext,
  type TreeViewNodeSlotProps,
  type TreeNode,
} from "./types";
import { useTreeView } from "./useTreeView";

const props = withDefaults(defineProps<DanxTreeViewProps<T>>(), {
  multiple: false,
  selectable: true,
  defaultExpanded: false,
});

const emit = defineEmits<{
  select: [node: TreeNode<T>];
  toggle: [node: TreeNode<T>, expanded: boolean];
}>();

const selected = defineModel<string | string[] | null>("selected", {
  default: (props: DanxTreeViewProps<T>) => (props.multiple ? [] : null),
});

const expanded = defineModel<string[]>("expanded", { default: () => [] });

defineSlots<{
  node?: (props: TreeViewNodeSlotProps<T>) => unknown;
  actions?: (props: TreeViewNodeSlotProps<T>) => unknown;
  empty?: () => unknown;
}>();

const slots = useSlots();

const treeView = useTreeView<T>(toRef(props, "nodes"), expanded, selected, {
  defaultExpanded: props.defaultExpanded,
  selectable: toRef(props, "selectable"),
  multiple: toRef(props, "multiple"),
});

/** ArrowUp/Down/Left/Right/Home/End move the roving-tabindex focus or expand/collapse a branch. */
function handleKeydown(event: KeyboardEvent, node: TreeNode<T>): void {
  const rows = treeView.flatRows.value;
  const index = rows.findIndex((row) => row.id === node.id);

  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      if (index < rows.length - 1) treeView.setFocused(rows[index + 1]!.id);
      break;
    case "ArrowUp":
      event.preventDefault();
      if (index > 0) treeView.setFocused(rows[index - 1]!.id);
      break;
    case "Home":
      event.preventDefault();
      if (rows.length > 0) treeView.setFocused(rows[0]!.id);
      break;
    case "End":
      event.preventDefault();
      if (rows.length > 0) treeView.setFocused(rows[rows.length - 1]!.id);
      break;
    case "ArrowRight":
      event.preventDefault();
      if (!treeView.isBranch(node)) break;
      if (!treeView.isExpanded(node.id)) {
        if (treeView.setExpanded(node, true)) emit("toggle", node, true);
      } else {
        const child = rows[index + 1];
        if (child && child.parentId === node.id) treeView.setFocused(child.id);
      }
      break;
    case "ArrowLeft":
      event.preventDefault();
      if (treeView.isBranch(node) && treeView.isExpanded(node.id)) {
        if (treeView.setExpanded(node, false)) emit("toggle", node, false);
      } else {
        const parentId = rows[index]!.parentId;
        if (parentId) treeView.setFocused(parentId);
      }
      break;
  }
}

const context: TreeViewContext<T> = {
  isExpanded: treeView.isExpanded,
  isSelected: treeView.isSelected,
  isBranch: treeView.isBranch,
  isFocused: treeView.isFocused,
  setFocused: treeView.setFocused,
  get selectable() {
    return props.selectable;
  },
  slots: {
    node: slots.node as TreeViewContext<T>["slots"]["node"],
    actions: slots.actions as TreeViewContext<T>["slots"]["actions"],
  },
  toggle(node) {
    const nowExpanded = treeView.toggle(node);
    emit("toggle", node, nowExpanded);
  },
  select(node) {
    treeView.select(node);
    if (props.selectable && !node.disabled) emit("select", node);
  },
  onKeydown: handleKeydown,
};

provide(TREE_VIEW_CONTEXT, context);
</script>

<template>
  <div class="danx-tree-view">
    <ul
      v-if="nodes.length > 0"
      class="danx-tree-view__tree"
      role="tree"
      :aria-multiselectable="multiple"
    >
      <TreeViewNode v-for="node in nodes" :key="node.id" :node="node" :depth="0" />
    </ul>

    <div v-else class="danx-tree-view__empty">
      <slot name="empty">
        <DanxIcon icon="folder" class="danx-tree-view__empty-icon" />
        <span>No items to display</span>
      </slot>
    </div>
  </div>
</template>
