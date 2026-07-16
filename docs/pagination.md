# DanxPagination

Prev/next buttons with a numbered page window and ellipsis truncation for large page counts. Binds `page` and `perPage` via `defineModel()` so it drops in directly onto a `ListController` pager.

## Features

- Prev/next navigation buttons
- Numbered page buttons with ellipsis truncation for large page counts
- Dual v-model: `page` and `perPage`
- Optional per-page selector dropdown
- Optional go-to-page numeric input + jump button
- Declarative only — no imperative API, just model updates
- Full CSS token system for styling
- Light and dark theme support

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxPagination } from "danx-ui";

const page = ref(1);
const perPage = ref(10);
const total = 237;
</script>

<template>
  <DanxPagination v-model:page="page" v-model:perPage="perPage" :total="total" />
</template>
```

## With Per-Page Selector and Go-To-Page

```vue
<DanxPagination
  v-model:page="page"
  v-model:perPage="perPage"
  :total="total"
  show-per-page-selector
  show-go-to-page
  :per-page-options="[10, 25, 50, 100]"
/>
```

## Composing with ListController

`DanxPagination`'s `total` prop and `page`/`perPage` models line up with a
`ListController`'s pager shape (`pagedItems.meta.total`, `pager.page`,
`pager.perPage`):

```vue
<DanxPagination
  v-model:page="controller.pagination.value.page"
  v-model:perPage="controller.pagination.value.perPage"
  :total="controller.pagedItems.value?.meta?.total ?? 0"
/>
```

## Props

| Prop                | Type       | Required | Default              | Description                                                     |
|---------------------|------------|----------|-----------------------|-------------------------------------------------------------------|
| total               | `number`   | Yes      | -                     | Total item count across all pages                                |
| perPageOptions      | `number[]` | No       | `[10, 25, 50, 100]`  | Page-size choices for the per-page selector                      |
| showPerPageSelector | `boolean`  | No       | `false`               | Show the per-page selector dropdown                              |
| showGoToPage        | `boolean`  | No       | `false`               | Show the go-to-page numeric input + jump button                  |
| maxVisiblePages     | `number`   | No       | `7`                   | Sliding window width around the current page before truncation   |
| disabled            | `boolean`  | No       | `false`               | Disable all interactive controls                                 |

## Models

| Model   | Type     | Description                    |
|---------|----------|---------------------------------|
| page    | `number` | Current 1-based page (`v-model:page`) |
| perPage | `number` | Items per page (`v-model:perPage`)    |

Changing `perPage` resets `page` to `1`.

## Events

DanxPagination is declarative only: it never emits imperative events beyond
the standard `update:page` / `update:perPage` model events fired by
`defineModel()`.

## Page Window Algorithm

The page-button window always shows the first and last page. When
`totalPages` fits within `maxVisiblePages`, every page number is shown with
no ellipsis. Otherwise a sliding window is centered on the current page,
clamped to the valid range, with an ellipsis marker inserted wherever the
window skips pages — e.g. `1 … 8 9 10 11 12 … 20`.

Edge cases:

- `total` is `0` → no page buttons render, both nav buttons are disabled
- A single page → only page `1` renders, both nav buttons are disabled
- `totalPages <= maxVisiblePages` → every page renders, no ellipsis
- Current page near the start/end → only one ellipsis is shown

## CSS Tokens

### Layout

| Token                          | Default     | Description                     |
|---------------------------------|-------------|----------------------------------|
| --dx-pagination-gap             | --spacing-1 | Gap between page buttons        |
| --dx-pagination-button-size     | 2rem        | Width/height of nav/page buttons |
| --dx-pagination-font-size       | --text-sm   | Button label font size          |
| --dx-pagination-border-radius   | --radius-component | Corner radius            |
| --dx-pagination-controls-gap    | --spacing-4 | Gap between control groups       |

### Colors

| Token                          | Default                | Description                |
|---------------------------------|-------------------------|-----------------------------|
| --dx-pagination-border          | --color-border          | Button border color        |
| --dx-pagination-bg              | transparent              | Default button background  |
| --dx-pagination-bg-hover        | --color-surface-sunken   | Hover button background     |
| --dx-pagination-bg-active       | --color-interactive      | Active page button background |
| --dx-pagination-text            | --color-text             | Default button text color   |
| --dx-pagination-text-active     | --color-text-inverted    | Active page button text     |
| --dx-pagination-text-disabled   | --color-text-muted       | Disabled button text color   |

### Animation

| Token                    | Default            | Description                    |
|---------------------------|---------------------|----------------------------------|
| --dx-pagination-transition | --transition-fast  | Color/background transition     |

## Styling Examples

### Compact pagination

```css
.compact-pagination {
  --dx-pagination-button-size: 1.5rem;
  --dx-pagination-font-size: 0.75rem;
}
```

### Custom active color

```css
.brand-pagination {
  --dx-pagination-bg-active: #8b5cf6;
  --dx-pagination-text-active: white;
}
```
