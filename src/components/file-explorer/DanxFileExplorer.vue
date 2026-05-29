<script setup lang="ts">
/**
 * DanxFileExplorer - Recursive file/folder tree sidebar
 *
 * Renders a nested, expandable/collapsable tree of files and folders. Built to
 * drop into any container (e.g. a DanxSplitPanel panel) — it fills its parent
 * and overflows naturally rather than owning its own scroll, so it never
 * produces a double scrollbar inside a scrolling panel.
 *
 * State (expansion + single selection) is owned here and shared with the
 * recursive FileExplorerNode rows via provide/inject — nodes are stateless and
 * never use defineExpose or event-chaining. Expanded folder IDs optionally
 * persist to localStorage via `storageKey`.
 *
 * A folder is any node with `type: "folder"` or a `children` array. Set
 * `foldersOnly` to hide file nodes (useful for folder pickers). Folder icons
 * swap between closed and open based on expansion.
 *
 * @props
 *   nodes: FileNode[] - Root nodes of the tree (required)
 *   foldersOnly?: boolean - Hide file nodes, show only folders (default: false)
 *   defaultExpanded?: boolean - Expand all folders on first render (default: false)
 *   storageKey?: string - localStorage key for persisting expanded IDs (omit to disable)
 *   selectable?: boolean - Whether clicking a row selects it (default: true)
 *
 * @model
 *   selected: string | null - Selected node ID (v-model:selected)
 *   expanded: string[] - Expanded folder IDs (v-model:expanded)
 *
 * @emits
 *   select - (node: FileNode) A row was activated (files and folders)
 *   toggle - (node: FileNode, expanded: boolean) A folder expanded/collapsed
 *
 * @slots
 *   node - Replaces a row's icon + label { node, depth, isFolder, expanded, selected }
 *   actions - Trailing row content { node, depth, isFolder, expanded, selected }
 *   empty - Shown when there are no visible nodes
 *
 * @tokens
 *   --dx-file-explorer-bg - Tree background (default: transparent)
 *   --dx-file-explorer-text - Row text color (default: var(--color-text))
 *   --dx-file-explorer-indent - Indent per depth level (default: 1.25rem)
 *   --dx-file-explorer-row-height - Row min height (default: 1.875rem)
 *   --dx-file-explorer-row-radius - Row corner radius (default: var(--radius-sm))
 *   --dx-file-explorer-row-hover-bg - Row hover background (default: var(--color-surface-sunken))
 *   --dx-file-explorer-row-selected-bg - Selected row background (default: var(--color-interactive-subtle))
 *   --dx-file-explorer-row-selected-text - Selected row text (default: var(--color-interactive))
 *   --dx-file-explorer-icon-color - Folder/file icon color (default: var(--color-text-subtle))
 *   --dx-file-explorer-icon-size - Icon size (default: 1rem)
 *   --dx-file-explorer-gap - Gap between chevron/icon/label (default: 0.375rem)
 *
 * @example
 *   <DanxFileExplorer
 *     v-model:selected="selectedId"
 *     v-model:expanded="expandedIds"
 *     :nodes="tree"
 *     storage-key="my-explorer"
 *   />
 */
import { provide, toRef, useSlots } from "vue";
import { DanxIcon } from "../icon";
import FileExplorerNode from "./FileExplorerNode.vue";
import {
  FILE_EXPLORER_CONTEXT,
  type DanxFileExplorerProps,
  type FileExplorerContext,
  type FileExplorerNodeSlotProps,
  type FileNode,
} from "./types";
import { useFileExplorer } from "./useFileExplorer";

const props = withDefaults(defineProps<DanxFileExplorerProps>(), {
  foldersOnly: false,
  defaultExpanded: false,
  storageKey: undefined,
  selectable: true,
});

const emit = defineEmits<{
  select: [node: FileNode];
  toggle: [node: FileNode, expanded: boolean];
}>();

const selected = defineModel<string | null>("selected", { default: null });

const expanded = defineModel<string[]>("expanded", { default: () => [] });

defineSlots<{
  node?: (props: FileExplorerNodeSlotProps) => unknown;
  actions?: (props: FileExplorerNodeSlotProps) => unknown;
  empty?: () => unknown;
}>();

const slots = useSlots();

const explorer = useFileExplorer(toRef(props, "nodes"), expanded, selected, {
  storageKey: props.storageKey,
  defaultExpanded: props.defaultExpanded,
  foldersOnly: toRef(props, "foldersOnly"),
  selectable: toRef(props, "selectable"),
});

const context: FileExplorerContext = {
  isExpanded: explorer.isExpanded,
  isSelected: explorer.isSelected,
  isFolder: explorer.isFolder,
  visibleChildren: explorer.visibleChildren,
  get selectable() {
    return props.selectable;
  },
  slots: {
    node: slots.node as FileExplorerContext["slots"]["node"],
    actions: slots.actions as FileExplorerContext["slots"]["actions"],
  },
  toggle(node) {
    const nowExpanded = explorer.toggle(node);
    emit("toggle", node, nowExpanded);
  },
  select(node) {
    explorer.select(node);
    if (props.selectable && !node.disabled) emit("select", node);
  },
};

provide(FILE_EXPLORER_CONTEXT, context);
</script>

<template>
  <div class="danx-file-explorer">
    <ul v-if="explorer.visibleNodes.value.length > 0" class="danx-file-explorer__tree" role="tree">
      <FileExplorerNode
        v-for="node in explorer.visibleNodes.value"
        :key="node.id"
        :node="node"
        :depth="0"
      />
    </ul>

    <div v-else class="danx-file-explorer__empty">
      <slot name="empty">
        <DanxIcon icon="folder" class="danx-file-explorer__empty-icon" />
        <span>No items to display</span>
      </slot>
    </div>
  </div>
</template>
