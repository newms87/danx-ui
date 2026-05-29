# File Explorer

A recursive, expandable file/folder tree. `DanxFileExplorer` renders nested
`FileNode`s to any depth, with folder/file icons, single selection,
expand/collapse, folders-only filtering, custom slots, and optional
localStorage persistence.

It is intentionally container-agnostic — it fills its parent and overflows
naturally, so it drops cleanly into a [Split Panel](./split-panel.md) panel (or
any sidebar) without producing its own scrollbar.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `nodes` | `FileNode[]` | required | Root nodes of the tree |
| `foldersOnly` | `boolean` | `false` | Hide file nodes, show only folders |
| `defaultExpanded` | `boolean` | `false` | Expand every folder on first render |
| `storageKey` | `string` | — | localStorage key for persisting expanded IDs |
| `selectable` | `boolean` | `true` | Whether clicking a row selects it |

### FileNode

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (selection, expansion, v-for key) |
| `name` | `string` | Display name |
| `type` | `"file" \| "folder"` | Optional — inferred as `folder` when `children` is present, else `file` |
| `children` | `FileNode[]` | Child nodes (presence implies folder) |
| `icon` | `string` | Icon override (built-in icon name or raw SVG) |
| `disabled` | `boolean` | Render dimmed and non-selectable |
| `meta` | `Record<string, unknown>` | Arbitrary consumer data (returned via events/slots) |

A node is a **folder** when `type: "folder"` OR it has a `children` array (even
an empty one). Set `type: "folder"` with no `children` to render an empty
folder. Everything else is a **file**.

## v-model

| Binding | Type | Description |
|---------|------|-------------|
| `v-model:selected` | `string \| null` | Selected node ID (single selection) |
| `v-model:expanded` | `string[]` | Expanded folder IDs (controllable) |

Both are optional. `expanded` is the source of truth for which folders are
open — pass it to control expansion externally, or let the component manage it.

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `select` | `(node: FileNode)` | A row was activated (files and folders) |
| `toggle` | `(node: FileNode, expanded: boolean)` | A folder expanded/collapsed |

## Slots

| Slot | Bindings | Description |
|------|----------|-------------|
| `node` | `{ node, depth, isFolder, expanded, selected }` | Replaces a row's icon + label |
| `actions` | `{ node, depth, isFolder, expanded, selected }` | Trailing row content (revealed on hover/selection) |
| `empty` | — | Shown when there are no visible nodes |

All slots are forwarded recursively to every node at every depth.

## Persistence

When `storageKey` is set, the set of expanded folder IDs is saved to
`localStorage` and restored on mount. Restored state takes precedence over
`v-model:expanded` and `defaultExpanded`. Invalid or unavailable storage is
ignored silently.

## Folders-only mode

`foldersOnly` filters file nodes out of every level. A folder whose only
descendants are files renders as an empty folder (no expand chevron). This is
the typical setup for a folder picker.

## CSS Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-file-explorer-bg` | `transparent` | Tree background |
| `--dx-file-explorer-text` | `var(--color-text)` | Row text color |
| `--dx-file-explorer-indent` | `1.25rem` | Indent per depth level |
| `--dx-file-explorer-row-height` | `1.875rem` | Row min height |
| `--dx-file-explorer-row-radius` | `var(--radius-sm)` | Row corner radius |
| `--dx-file-explorer-row-hover-bg` | `var(--color-surface-sunken)` | Row hover background |
| `--dx-file-explorer-row-selected-bg` | `var(--color-interactive-subtle)` | Selected row background |
| `--dx-file-explorer-row-selected-text` | `var(--color-interactive)` | Selected row text |
| `--dx-file-explorer-icon-color` | `var(--color-text-subtle)` | Folder/file icon color |
| `--dx-file-explorer-icon-size` | `1rem` | Icon size |
| `--dx-file-explorer-gap` | `0.375rem` | Gap between chevron/icon/label |

## Example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxFileExplorer, type FileNode } from "danx-ui";

const tree: FileNode[] = [
  {
    id: "src",
    name: "src",
    children: [
      { id: "index.ts", name: "index.ts" },
      { id: "main.ts", name: "main.ts" },
    ],
  },
  { id: "package.json", name: "package.json" },
];

const selected = ref<string | null>(null);
const expanded = ref<string[]>(["src"]);
</script>

<template>
  <DanxFileExplorer
    v-model:selected="selected"
    v-model:expanded="expanded"
    :nodes="tree"
    storage-key="my-explorer"
  />
</template>
```
