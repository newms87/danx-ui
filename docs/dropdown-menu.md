# DanxDropdownMenu

A button-triggered action menu. Composes `DanxPopover` (anchoring) and `DanxContextMenu` (item rendering, keyboard navigation, submenus) so any slotted trigger — usually a `DanxButton` — opens a positioned menu with no extra wiring.

## Installation

```vue
<script setup lang="ts">
import { DanxDropdownMenu } from "danx-ui";
import type { DropdownMenuItem } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { DanxButton, DanxDropdownMenu } from "danx-ui";
import type { DropdownMenuItem } from "danx-ui";

const items: DropdownMenuItem[] = [
  { label: "New File", action: () => createFile() },
  { label: "New Folder", action: () => createFolder() },
  { label: "", separator: true },
  { label: "Delete", action: () => deleteItem() },
];
</script>

<template>
  <DanxDropdownMenu :items="items">
    <DanxButton>Actions</DanxButton>
  </DanxDropdownMenu>
</template>
```

The slotted trigger (usually a `DanxButton`) opens the menu on click — no `v-model` or click handler required. Bind `v-model:open` yourself only if you need to control visibility programmatically.

## Props

| Prop | Type | Description |
|------|------|-------------|
| `items` | `DropdownMenuItem[]` | Menu items to display |
| `placement` | `PopoverPlacement?` | Panel placement relative to the trigger; defaults to `"bottom"` |

## Models

| Model | Type | Default | Description |
|-------|------|---------|-------------|
| `open` | `boolean` | `false` | Menu visibility |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `select` | `DropdownMenuItem` | Fired with the chosen item before executing its `action`. Not fired for items that open a submenu. |

> **Note:** `items` has no `id` field — ids are derived from each item's position in the tree. Keep the array's shape (length/order/nesting) stable while the menu can be open; reordering, inserting, or removing items can carry keyboard focus/active-item state onto the wrong item. Updating a field in place (`disabled`, `label`, etc.) is fine.

## DropdownMenuItem Interface

| Field | Type | Description |
|-------|------|-------------|
| `label` | `string` | Display text |
| `icon` | `Component \| IconName \| string?` | Built-in icon name, raw SVG string, or Vue component |
| `action` | `() => void?` | Callback on selection |
| `disabled` | `boolean?` | Prevents interaction |
| `separator` | `boolean?` | Renders as a visual divider |
| `shortcut` | `string?` | Keyboard shortcut hint, right-aligned on the item |
| `active` | `boolean?` | Leading check glyph + active style — for a menu that represents a current choice |
| `children` | `DropdownMenuItem[]?` | Submenu items |

### Action menu vs picker

Most dropdowns are a list of *actions*: pick one, something happens. Setting `active` turns the same menu into a *picker* — a list of choices where one is currently in effect, marked with a check. A submenu parent shows as active when any of its children is.

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxDropdownMenu } from "danx-ui";
import type { DropdownMenuItem } from "danx-ui";

const model = ref("opus");

const items = computed<DropdownMenuItem[]>(() =>
  [
    { id: "sonnet", label: "Sonnet" },
    { id: "opus", label: "Opus" },
    { id: "haiku", label: "Haiku" },
  ].map((m, i) => ({
    label: m.label,
    shortcut: String(i + 1),
    active: model.value === m.id,
    action: () => (model.value = m.id),
  }))
);
</script>

<template>
  <DanxDropdownMenu :items="items">
    <DanxButton size="sm" variant="muted">{{ model }}</DanxButton>
  </DanxDropdownMenu>
</template>
```

`shortcut` is a **hint only** — it renders the text but binds nothing. Register the actual key with `useHotkeys` so the binding and the label cannot drift apart.

## Features

### Submenus

Items with `children` render a flyout submenu, opened via hover or click:

```ts
const items: DropdownMenuItem[] = [
  {
    label: "Share",
    children: [
      { label: "Email", action: () => shareViaEmail() },
      { label: "Slack", action: () => shareViaSlack() },
    ],
  },
];
```

### Separators

```ts
const items: DropdownMenuItem[] = [
  { label: "Cut", action: () => cut() },
  { label: "Copy", action: () => copy() },
  { label: "", separator: true },
  { label: "Delete", action: () => deleteItem() },
];
```

### Disabled Items

```ts
const items: DropdownMenuItem[] = [{ label: "Archive", disabled: true }];
```

### Icons

```ts
const items: DropdownMenuItem[] = [
  { label: "Edit", icon: '<svg viewBox="0 0 24 24">...</svg>', action: () => edit() },
];
```

## Keyboard Support

| Key | Action |
|-----|--------|
| Up / Down | Move between items |
| Enter / Space | Select the focused item (native `<button>` activation) |
| Escape | Close the menu |
| Right | Open a focused item's submenu |
| Left | Close the open submenu and return focus to its parent |

## CSS Tokens

`DanxDropdownMenu` renders through `DanxContextMenu`, so it shares the same tokens — see [Context Menu CSS Tokens](./context-menu.md#css-tokens).
