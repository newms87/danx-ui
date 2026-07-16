# DanxBreadcrumbs

A general-purpose navigation breadcrumb trail. Renders an `items` array as an accessible trail inside a semantic `<nav>`, with the last item (or an explicit `current` item) marked as the current page.

## Features

- Renders items as a link (`href`), a button (`onClick`), or inert text (`disabled` or current)
- Last item is rendered inert with `aria-current="page"` unless another item explicitly sets `current`
- Customizable separator via `separator` prop or `separator` slot
- Optional overflow collapsing via `maxItems` — keeps the first and last items, collapsing the middle behind an ellipsis
- Optional icons via DanxIcon (name string, SVG string, or Component)

## Basic Usage

```vue
<script setup lang="ts">
import { DanxBreadcrumbs } from "danx-ui";
import type { DanxBreadcrumbItem } from "danx-ui";

const items: DanxBreadcrumbItem[] = [
  { label: "Home", href: "/" },
  { label: "Projects", href: "/projects" },
  { label: "danx-ui" },
];
</script>

<template>
  <DanxBreadcrumbs :items="items" />
</template>
```

## Props

| Prop      | Type                   | Required | Default | Description                              |
|-----------|------------------------|----------|---------|-------------------------------------------|
| items     | `DanxBreadcrumbItem[]` | Yes      | -       | Ordered trail of breadcrumb items, root first |
| separator | `string`               | No       | `"/"`   | Separator rendered between items           |
| maxItems  | `number`               | No       | -       | Collapse the middle of the trail when exceeded |

## DanxBreadcrumbItem Interface

| Property | Type                              | Required | Description                                                        |
|----------|-----------------------------------|----------|----------------------------------------------------------------------|
| label    | `string`                          | Yes      | Display text                                                        |
| icon     | `Component \| IconName \| string` | No       | Icon (name, SVG, or component)                                      |
| href     | `string`                          | No       | Renders the item as an `<a>`. Ignored when `disabled` or `current`  |
| onClick  | `() => void`                      | No       | Called when the item is activated. Ignored when `disabled` or `current` |
| disabled | `boolean`                         | No       | Renders the item as inert text regardless of `href`/`onClick`       |
| current  | `boolean`                         | No       | Marks the item as the current page (`aria-current="page"`). Defaults to the last item |

## Slots

| Slot      | Description                                  |
|-----------|-----------------------------------------------|
| separator | Replaces the default separator text between items |

### Custom Separator Slot Example

```vue
<DanxBreadcrumbs :items="items">
  <template #separator>
    <DanxIcon icon="chevron-right" />
  </template>
</DanxBreadcrumbs>
```

## Click Handlers

Use `onClick` instead of `href` for programmatic navigation (e.g. client-side routing):

```vue
<DanxBreadcrumbs
  :items="[
    { label: 'Root', onClick: () => goTo('root') },
    { label: 'Folder', onClick: () => goTo('folder') },
    { label: 'Current' },
  ]"
/>
```

## Overflow Collapsing

Set `maxItems` to collapse the middle of a long trail behind an ellipsis, always keeping the first item and the last `maxItems - 1` items visible:

```vue
<DanxBreadcrumbs :items="items" :max-items="4" />
```

## CSS Tokens

| Token                             | Default              | Description                          |
|------------------------------------|-----------------------|---------------------------------------|
| --dx-breadcrumbs-gap               | --space-xs            | Gap between items and separators      |
| --dx-breadcrumbs-font-size         | --text-xs             | Item font size                        |
| --dx-breadcrumbs-color             | --color-text-muted    | Inactive item text color              |
| --dx-breadcrumbs-hover-color       | --color-text          | Hover state for interactive items     |
| --dx-breadcrumbs-current-color     | --color-text          | Current item text color               |
| --dx-breadcrumbs-separator-color   | --color-text-muted    | Separator color                       |
| --dx-breadcrumbs-disabled-color    | --color-text-muted    | Disabled item text color              |

## Styling Example

```css
.compact-breadcrumbs {
  --dx-breadcrumbs-gap: 0.25rem;
  --dx-breadcrumbs-font-size: 0.7rem;
}
```
