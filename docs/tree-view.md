# Tree View

A generic, recursive hierarchical data tree. `DanxTreeView` renders nested
`TreeNode<T>`s to any depth — org charts, category trees, nested comment
threads, permission trees, nav menus — with expand/collapse, single/multi
selection, keyboard navigation, and a node-content slot for arbitrary
per-node rendering.

It generalizes the same expand/collapse and roving-tabindex keyboard
navigation pattern used by [File Explorer](./file-explorer.md), without the
file/folder-specific semantics.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `TreeNode<T>[]` | required | Root nodes of the tree |
| `multiple` | `boolean` | `false` | Allow multiple selected nodes |
| `selectable` | `boolean` | `true` | Whether clicking a row selects it |
| `defaultExpanded` | `boolean` | `false` | Expand every branch on first render |

### TreeNode<T>

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (selection, expansion, v-for key) |
| `label` | `string` | Display label |
| `children` | `TreeNode<T>[]` | Child nodes (presence, even empty, implies a branch) |
| `icon` | `string` | Icon override (built-in icon name or raw SVG) |
| `disabled` | `boolean` | Render dimmed and non-selectable/expandable via click |
| `data` | `T` | Arbitrary consumer payload (returned via events/slots) |

A node is a **branch** when it has a `children` array (even an empty one).
Everything else is a **leaf**.

## v-model

| Binding | Type | Description |
|---------|------|-------------|
| `v-model:selected` | `string \| string[] \| null` | Selected node id(s). A `string \| null` in single-select mode, always a `string[]` when `multiple` is set |
| `v-model:expanded` | `string[]` | Expanded branch node ids (controllable) |

Both are optional — omit them to let the component own the state
(uncontrolled), or bind them to drive expansion/selection externally
(controlled).

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `select` | `(node: TreeNode<T>)` | A row was activated (leaves and branches) |
| `toggle` | `(node: TreeNode<T>, expanded: boolean)` | A branch expanded/collapsed |

## Slots

| Slot | Bindings | Description |
|------|----------|-------------|
| `node` | `{ node, depth, isBranch, expanded, selected }` | Replaces a row's icon + label |
| `actions` | `{ node, depth, isBranch, expanded, selected }` | Trailing row content (revealed on hover/selection) |
| `empty` | — | Shown when there are no nodes |

All slots are forwarded recursively to every node at every depth.

## Keyboard navigation

Rows use a roving-tabindex pattern following the WAI-ARIA tree view
practice: only the focused row is a tab stop.

| Key | Behavior |
|-----|----------|
| `ArrowDown` / `ArrowUp` | Move focus to the next/previous visible row |
| `ArrowRight` | Expand a collapsed branch, or move focus to its first child if already expanded |
| `ArrowLeft` | Collapse an expanded branch, or move focus to its parent |
| `Home` / `End` | Jump focus to the first/last visible row |
| `Enter` / `Space` | Activate the focused row (select, and toggle if a branch) |

## Multi-selection

Set `multiple` to accumulate selections as an array — clicking a selected
node deselects it, clicking an unselected node adds it. `v-model:selected`
is always a `string[]` in this mode.

## CSS Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-tree-view-bg` | `transparent` | Tree background |
| `--dx-tree-view-text` | `var(--color-text)` | Row text color |
| `--dx-tree-view-indent` | `1.25rem` | Indent per depth level |
| `--dx-tree-view-row-height` | `1.875rem` | Row min height |
| `--dx-tree-view-row-radius` | `var(--radius-sm)` | Row corner radius |
| `--dx-tree-view-row-hover-bg` | `var(--color-surface-sunken)` | Row hover background |
| `--dx-tree-view-row-selected-bg` | `var(--color-interactive-subtle)` | Selected row background |
| `--dx-tree-view-row-selected-text` | `var(--color-interactive)` | Selected row text |
| `--dx-tree-view-icon-color` | `var(--color-text-subtle)` | Branch/leaf icon color |
| `--dx-tree-view-icon-size` | `1rem` | Icon size |
| `--dx-tree-view-gap` | `0.375rem` | Gap between chevron/icon/label |

## Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxTreeView, type TreeNode } from "danx-ui";

interface Employee {
  title: string;
}

const tree: TreeNode<Employee>[] = [
  {
    id: "eng",
    label: "Engineering",
    data: { title: "VP Engineering" },
    children: [
      { id: "alice", label: "Alice", data: { title: "Staff Engineer" } },
      { id: "bob", label: "Bob", data: { title: "Senior Engineer" } },
    ],
  },
];

const selected = ref<string | null>(null);
const expanded = ref<string[]>(["eng"]);
</script>

<template>
  <DanxTreeView v-model:selected="selected" v-model:expanded="expanded" :nodes="tree" />
</template>
```
