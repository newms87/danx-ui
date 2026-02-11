# DanxContextMenu

A right-click context menu component with nested submenu support, viewport clamping, and keyboard accessibility.

## Installation

```vue
<script setup lang="ts">
import { DanxContextMenu } from "danx-ui";
import type { ContextMenuItem, ContextMenuPosition } from "danx-ui";
</script>
```

## Basic Usage

The parent controls visibility with `v-if`. Provide viewport coordinates and menu items:

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxContextMenu } from "danx-ui";
import type { ContextMenuItem, ContextMenuPosition } from "danx-ui";

const showMenu = ref(false);
const menuPosition = ref<ContextMenuPosition>({ x: 0, y: 0 });

const items: ContextMenuItem[] = [
  { id: "cut", label: "Cut", shortcut: "Ctrl+X", action: () => cut() },
  { id: "copy", label: "Copy", shortcut: "Ctrl+C", action: () => copy() },
  { id: "paste", label: "Paste", shortcut: "Ctrl+V", action: () => paste() },
];

function onContextMenu(event: MouseEvent) {
  event.preventDefault();
  menuPosition.value = { x: event.clientX, y: event.clientY };
  showMenu.value = true;
}
</script>

<template>
  <div @contextmenu="onContextMenu">
    Right-click for context menu
  </div>

  <DanxContextMenu
    v-if="showMenu"
    :position="menuPosition"
    :items="items"
    @close="showMenu = false"
  />
</template>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `position` | `ContextMenuPosition` | `{ x, y }` viewport coordinates |
| `items` | `ContextMenuItem[]` | Menu items to display |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `close` | none | Menu should close (item click, overlay click, Escape) |
| `action` | `ContextMenuItem` | Fired before executing an item's action callback |

## ContextMenuItem Interface

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier |
| `label` | `string` | Display text |
| `icon` | `string?` | SVG string (rendered via v-html) |
| `shortcut` | `string?` | Keyboard shortcut display text |
| `action` | `() => void?` | Callback on click |
| `disabled` | `boolean?` | Prevents interaction |
| `children` | `ContextMenuItem[]?` | Submenu items |
| `divider` | `boolean?` | Renders as a visual separator |

## Features

### Submenus

Items with `children` render a flyout submenu. Submenus appear on hover (100ms delay) or click. They auto-flip to the left when near the right viewport edge.

```ts
const items: ContextMenuItem[] = [
  {
    id: "insert",
    label: "Insert",
    children: [
      { id: "table", label: "Table", action: () => insertTable() },
      { id: "link", label: "Link", shortcut: "Ctrl+K", action: () => insertLink() },
    ],
  },
];
```

### Dividers

Add visual separators between groups of items:

```ts
const items: ContextMenuItem[] = [
  { id: "cut", label: "Cut", action: () => cut() },
  { id: "copy", label: "Copy", action: () => copy() },
  { id: "div-1", label: "", divider: true },
  { id: "delete", label: "Delete", action: () => deleteItem() },
];
```

### Disabled Items

Disabled items are visible but not clickable:

```ts
const items: ContextMenuItem[] = [
  { id: "paste", label: "Paste", disabled: !hasClipboard, action: () => paste() },
];
```

### Icons

Pass an SVG string as the `icon` field:

```ts
const items: ContextMenuItem[] = [
  { id: "edit", label: "Edit", icon: '<svg viewBox="0 0 24 24">...</svg>', action: () => edit() },
];
```

## CSS Tokens

Override these tokens to customize appearance:

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-context-menu-bg` | `--color-surface-elevated` | Background color |
| `--dx-context-menu-border` | `--color-border` | Border color |
| `--dx-context-menu-shadow` | `rgb(0 0 0 / 0.4)` | Box shadow |
| `--dx-context-menu-text` | `--color-text` | Item text color |
| `--dx-context-menu-text-muted` | `--color-text-muted` | Shortcut/disabled text |
| `--dx-context-menu-item-hover` | `--color-surface-hover` | Item hover background |
| `--dx-context-menu-divider` | `--color-border` | Divider line color |
| `--dx-context-menu-min-width` | `200px` | Minimum menu width |
| `--dx-context-menu-max-width` | `320px` | Maximum menu width |
| `--dx-context-menu-icon-size` | `1rem` | Icon dimensions |
| `--dx-context-menu-border-radius` | `0.375rem` | Corner radius |

> **Note:** Tokens that reference semantic variables (e.g. `--color-surface-elevated`) include hardcoded fallback values (e.g. `#2d2d2d`) so the menu renders correctly even if the semantic token layer is not defined. If you provide your own semantic tokens, those take precedence automatically.

## Keyboard Support

| Key | Action |
|-----|--------|
| Escape | Closes the menu |

## Submenu Behavior

- **Hover**: Submenu appears after 100ms delay
- **Leave**: Submenu closes after 150ms (cancelled if mouse enters submenu)
- **Click**: Toggles submenu on parent items, executes action on leaf items
- **Auto-flip**: Opens to the left when near the right viewport edge
