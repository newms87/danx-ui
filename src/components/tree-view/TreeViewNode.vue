<script setup lang="ts" generic="T = unknown">
/**
 * TreeViewNode - Single recursive row in a DanxTreeView tree
 *
 * Renders one node row and recurses into child nodes when the node is an
 * expanded branch. Intentionally "dumb": all state (expansion, selection)
 * and handlers come from the TreeViewContext provided by the root
 * DanxTreeView via inject.
 *
 * @props
 *   node: TreeNode<T> - The node to render (required)
 *   depth: number - Nesting depth, root nodes are 0 (required)
 */
import { computed, inject, nextTick, ref, watch } from "vue";
import { DanxIcon } from "../icon";
import { TREE_VIEW_CONTEXT, type TreeNode } from "./types";

const props = defineProps<{
  node: TreeNode<T>;
  depth: number;
}>();

const ctx = inject(TREE_VIEW_CONTEXT, undefined);
if (!ctx) {
  throw new Error("TreeViewNode must be used within a DanxTreeView");
}

const rowEl = ref<HTMLElement | null>(null);

const isBranch = computed(() => ctx.isBranch(props.node));
const children = computed(() => props.node.children ?? []);
const hasChildren = computed(() => children.value.length > 0);
const expanded = computed(() => isBranch.value && ctx.isExpanded(props.node.id));
const selected = computed(() => ctx.isSelected(props.node.id));
const focused = computed(() => ctx!.isFocused(props.node.id));

// Roving tabindex: move real DOM focus to this row when it becomes the tab stop.
watch(focused, (isFocused) => {
  if (isFocused) nextTick(() => rowEl.value?.focus());
});

const nodeIcon = computed(() => {
  if (props.node.icon) return props.node.icon;
  if (isBranch.value) return expanded.value ? "folder-open" : "folder";
  return "file";
});

const slotProps = computed(() => ({
  node: props.node,
  depth: props.depth,
  isBranch: isBranch.value,
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
  if (isBranch.value) ctx!.toggle(props.node);
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
  <li class="danx-tree-view-node" role="none">
    <div
      ref="rowEl"
      class="danx-tree-view-node__row"
      :class="{
        'is-selected': selected,
        'is-branch': isBranch,
        'is-disabled': node.disabled,
        'is-clickable': ctx.selectable && !node.disabled,
      }"
      :style="{ '--dx-tree-view-depth': depth }"
      role="treeitem"
      :aria-expanded="isBranch && hasChildren ? expanded : undefined"
      :aria-selected="selected"
      :aria-disabled="node.disabled || undefined"
      :tabindex="node.disabled ? -1 : focused ? 0 : -1"
      @click="onActivate"
      @keydown.enter.prevent="onActivate"
      @keydown.space.prevent="onActivate"
      @keydown="onKeydown"
    >
      <span class="danx-tree-view-node__indent" aria-hidden="true" />

      <button
        v-if="isBranch && hasChildren"
        type="button"
        class="danx-tree-view-node__chevron"
        :class="{ 'is-open': expanded }"
        :aria-label="expanded ? 'Collapse' : 'Expand'"
        tabindex="-1"
        @click="onChevron"
      >
        <DanxIcon icon="chevron-right" />
      </button>
      <span v-else class="danx-tree-view-node__chevron-spacer" aria-hidden="true" />

      <component :is="NodeSlot" v-if="ctx.slots.node" />
      <template v-else>
        <DanxIcon :icon="nodeIcon" class="danx-tree-view-node__icon" />
        <span class="danx-tree-view-node__name">{{ node.label }}</span>
      </template>

      <span v-if="ctx.slots.actions" class="danx-tree-view-node__actions">
        <component :is="ActionsSlot" />
      </span>
    </div>

    <ul
      v-if="isBranch && expanded && hasChildren"
      class="danx-tree-view-node__children"
      role="group"
    >
      <TreeViewNode v-for="child in children" :key="child.id" :node="child" :depth="depth + 1" />
    </ul>
  </li>
</template>
