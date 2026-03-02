# DanxTabs

Connected tab buttons with a smooth sliding animated indicator. Each tab can have an icon, label, count badge, and per-tab active color.

## Features

- Sliding animated indicator that transitions position and color
- Per-tab active color with CSS token fallback
- Optional icons via DanxIcon (name string, SVG string, or Component)
- Optional count badges
- v-model for active tab selection
- Full CSS token system for styling
- Light and dark theme support

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxTabs } from "danx-ui";
import type { DanxTab } from "danx-ui";

const activeTab = ref("overview");

const tabs: DanxTab[] = [
  { value: "overview", label: "Overview", icon: "list" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings" },
];
</script>

<template>
  <DanxTabs v-model="activeTab" :tabs="tabs" />
</template>
```

## Props

| Prop       | Type          | Required | Default | Description                |
|------------|---------------|----------|---------|----------------------------|
| modelValue | `string`      | Yes      | -       | Active tab value (v-model) |
| tabs       | `DanxTab[]`   | Yes      | -       | Array of tab items         |
| variant    | `VariantType` | No       | `""`    | Color variant              |

## DanxTab Interface

| Property    | Type                              | Required | Description                      |
|-------------|-----------------------------------|----------|----------------------------------|
| value       | `string`                          | Yes      | Unique identifier for v-model    |
| label       | `string`                          | Yes      | Display text                     |
| icon        | `Component \| IconName \| string` | No       | Icon (name, SVG, or component)   |
| count       | `number`                          | No       | Count badge after label          |
| activeColor | `string`                          | No       | CSS color for active indicator   |

## Events

| Event             | Payload  | Description                |
|-------------------|----------|----------------------------|
| update:modelValue | `string` | Emitted when a tab is clicked |

## Slots

All slots receive scoped props `{ tab: DanxTab, isActive: boolean }`.

| Slot    | Description                                      |
|---------|--------------------------------------------------|
| default | Replaces icon + label entirely (count still renders) |
| icon    | Replaces icon area only                          |
| label   | Replaces label text only                         |

### Slot Examples

Custom label with active styling:

```vue
<DanxTabs v-model="activeTab" :tabs="tabs">
  <template #label="{ tab, isActive }">
    <span :class="isActive ? 'font-bold' : ''">{{ tab.label }}</span>
  </template>
</DanxTabs>
```

Fully custom tab content:

```vue
<DanxTabs v-model="activeTab" :tabs="tabs">
  <template #default="{ tab, isActive }">
    <div class="flex flex-col items-center">
      <span class="text-xs">{{ isActive ? 'Viewing' : 'View' }}</span>
      <span class="font-semibold">{{ tab.label }}</span>
    </div>
  </template>
</DanxTabs>
```

## Variants

DanxTabs supports the shared variant system. Pass a variant name to apply semantic colors:

```vue
<DanxTabs v-model="activeTab" :tabs="tabs" variant="danger" />
```

Available variants: `danger`, `success`, `warning`, `info`, `muted`, or any custom variant defined via `--dx-variant-{name}-*` CSS tokens.

The variant maps these component tokens:

| Component Token        | Variant Suffix |
|------------------------|----------------|
| --dx-tabs-bg           | bg             |
| --dx-tabs-text         | text           |
| --dx-tabs-active-color | bg             |

## CSS Tokens

### Container

| Token                   | Default                | Description         |
|-------------------------|------------------------|---------------------|
| --dx-tabs-bg            | --color-surface-sunken | Background          |
| --dx-tabs-border        | --color-border         | Border color        |
| --dx-tabs-border-radius | --radius-component     | Corner radius       |

### Typography

| Token                | Default       | Description |
|----------------------|---------------|-------------|
| --dx-tabs-font-size  | --text-sm     | Font size   |
| --dx-tabs-font-weight| --font-medium | Font weight |

### Layout

| Token              | Default      | Description      |
|--------------------|--------------|------------------|
| --dx-tabs-padding-x| --spacing-3  | Horizontal pad   |
| --dx-tabs-padding-y| --spacing-1-5| Vertical pad     |
| --dx-tabs-gap      | --spacing-1-5| Icon-label gap   |
| --dx-tabs-icon-size| 0.875rem     | Icon dimensions  |

### Colors

| Token                  | Default                | Description           |
|------------------------|------------------------|-----------------------|
| --dx-tabs-text         | --color-text-muted     | Inactive text         |
| --dx-tabs-text-active  | --color-text-inverted  | Active text           |
| --dx-tabs-text-hover   | --color-text           | Hover text            |
| --dx-tabs-active-color | --color-interactive    | Indicator fallback    |
| --dx-tabs-divider      | --color-border         | Divider between tabs  |

### Animation

| Token                          | Default          | Description           |
|--------------------------------|------------------|-----------------------|
| --dx-tabs-transition           | --transition-fast| Text color transition |
| --dx-tabs-indicator-transition | 300ms ease-out   | Indicator slide       |

### Count

| Token                   | Default | Description         |
|-------------------------|---------|---------------------|
| --dx-tabs-count-opacity | 0.7     | Count badge opacity |

## Styling Examples

### Compact tabs

```css
.compact-tabs {
  --dx-tabs-padding-x: 0.5rem;
  --dx-tabs-padding-y: 0.25rem;
  --dx-tabs-font-size: 0.75rem;
}
```

### Custom indicator color

```css
.brand-tabs {
  --dx-tabs-active-color: #8b5cf6;
  --dx-tabs-text-active: white;
}
```
