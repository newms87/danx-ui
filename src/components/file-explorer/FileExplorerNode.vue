<script setup lang="ts">
/**
 * FileExplorerNode - Single recursive row in a DanxFileExplorer tree
 *
 * Renders one file/folder row and recurses into child nodes when the node is
 * an expanded folder. It is intentionally "dumb": all state (expansion,
 * selection) and handlers come from the FileExplorerContext provided by the
 * root DanxFileExplorer via inject. The node holds no model and emits nothing,
 * which keeps the recursive tree free of O(depth) event forwarding.
 *
 * Slot content (node/actions) is provided through the same injected context as
 * render functions rather than forwarded through the template — that avoids the
 * circular type inference a recursive component's slot pass-through triggers.
 *
 * Indentation is driven by `depth` via the --dx-file-explorer-indent token.
 * Folders show a chevron only when they have visible children. The folder icon
 * swaps between closed/open based on expansion state.
 *
 * @props
 *   node: FileNode - The node to render (required)
 *   depth: number - Nesting depth, root nodes are 0 (required)
 */
import { computed, inject, nextTick, ref, watch } from "vue";
import { DanxIcon } from "../icon";
import { FILE_EXPLORER_CONTEXT, type FileNode } from "./types";

const props = defineProps<{
  node: FileNode;
  depth: number;
}>();

const ctx = inject(FILE_EXPLORER_CONTEXT, undefined);
if (!ctx) {
  throw new Error("FileExplorerNode must be used within a DanxFileExplorer");
}

const rowEl = ref<HTMLElement | null>(null);

const selectable = computed(() => ctx.selectable);
const isFolder = computed(() => ctx.isFolder(props.node));
const children = computed(() => ctx.visibleChildren(props.node));
const hasChildren = computed(() => children.value.length > 0);
const expanded = computed(() => isFolder.value && ctx.isExpanded(props.node.id));
const selected = computed(() => ctx.isSelected(props.node.id));
const focused = computed(() => ctx!.isFocused(props.node.id));

// Roving tabindex: move real DOM focus to this row when it becomes the tab stop.
watch(focused, (isFocused) => {
  if (isFocused) nextTick(() => rowEl.value?.focus());
});

const nodeIcon = computed(() => {
  if (props.node.icon) return props.node.icon;
  if (isFolder.value) return expanded.value ? "folder-open" : "folder";
  return "file";
});

const slotProps = computed(() => ({
  node: props.node,
  depth: props.depth,
  isFolder: isFolder.value,
  expanded: expanded.value,
  selected: selected.value,
}));

// Wrap injected slot render functions as functional components so the template
// can render them via <component :is> without re-forwarding slots recursively.
const NodeSlot = () => ctx!.slots.node?.(slotProps.value);
const ActionsSlot = () => ctx!.slots.actions?.(slotProps.value);

function onActivate(): void {
  if (props.node.disabled) return;
  ctx!.setFocused(props.node.id);
  if (isFolder.value) ctx!.toggle(props.node);
  ctx!.select(props.node);
}

function onChevron(event: MouseEvent): void {
  event.stopPropagation();
  if (props.node.disabled) return;
  ctx!.setFocused(props.node.id);
  ctx!.toggle(props.node);
}

function onKeydown(event: KeyboardEvent): void {
  if (props.node.disabled) return;
  ctx!.onKeydown(event, props.node);
}
</script>

<template>
  <li class="danx-file-explorer-node" role="none">
    <div
      ref="rowEl"
      class="danx-file-explorer-node__row"
      :class="{
        'is-selected': selected,
        'is-folder': isFolder,
        'is-disabled': node.disabled,
        'is-clickable': selectable && !node.disabled,
      }"
      :style="{ '--dx-file-explorer-depth': depth }"
      role="treeitem"
      :aria-expanded="isFolder && hasChildren ? expanded : undefined"
      :aria-selected="selected"
      :aria-disabled="node.disabled || undefined"
      :tabindex="node.disabled ? -1 : focused ? 0 : -1"
      @click="onActivate"
      @keydown.enter.prevent="onActivate"
      @keydown.space.prevent="onActivate"
      @keydown="onKeydown"
    >
      <span class="danx-file-explorer-node__indent" aria-hidden="true" />

      <button
        v-if="isFolder && hasChildren"
        type="button"
        class="danx-file-explorer-node__chevron"
        :class="{ 'is-open': expanded }"
        :aria-label="expanded ? 'Collapse' : 'Expand'"
        tabindex="-1"
        @click="onChevron"
      >
        <DanxIcon icon="chevron-right" />
      </button>
      <span v-else class="danx-file-explorer-node__chevron-spacer" aria-hidden="true" />

      <component :is="NodeSlot" v-if="ctx.slots.node" />
      <template v-else>
        <DanxIcon :icon="nodeIcon" class="danx-file-explorer-node__icon" />
        <span class="danx-file-explorer-node__name">{{ node.name }}</span>
      </template>

      <span v-if="ctx.slots.actions" class="danx-file-explorer-node__actions">
        <component :is="ActionsSlot" />
      </span>
    </div>

    <ul
      v-if="isFolder && expanded && hasChildren"
      class="danx-file-explorer-node__children"
      role="group"
    >
      <FileExplorerNode
        v-for="child in children"
        :key="child.id"
        :node="child"
        :depth="depth + 1"
      />
    </ul>
  </li>
</template>
