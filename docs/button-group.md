# DanxButtonGroup

Toggle button group with single or multi-select. Visually similar to DanxTabs but designed for toggling values on/off rather than navigating between views.

## Features

- Single-select and multi-select modes
- Required mode prevents empty selection
- Per-button click callbacks
- Auto-color with active and inactive color states
- Optional icons via DanxIcon (name string, SVG string, or Component)
- Optional count badges
- v-model for selection state
- Full CSS token system for styling
- Light and dark theme support

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxButtonGroup } from "danx-ui";
import type { DanxButtonGroupItem } from "danx-ui";

const selected = ref("overview");

const buttons: DanxButtonGroupItem[] = [
  { value: "overview", label: "Overview", icon: "document" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings" },
];
</script>

<template>
  <DanxButtonGroup v-model="selected" :buttons="buttons" />
</template>
```

## Multi-Select

```vue
<DanxButtonGroup v-model="selected" :buttons="buttons" multiple />
```

When `multiple` is true, `modelValue` is a `string[]`. Clicking a button toggles it in/out of the array.

## Required Mode

```vue
<DanxButtonGroup v-model="selected" :buttons="buttons" required />
```

Prevents deselecting the last remaining button. In single-select, the active button cannot be toggled off. In multi-select, the last selected button cannot be removed.

## Props

| Prop          | Type                  | Required | Description                   |
|---------------|-----------------------|----------|-------------------------------|
| modelValue    | `string\|string[]\|null` | No    | Selected value(s) (v-model)   |
| buttons       | `DanxButtonGroupItem[]` | Yes    | Array of button items         |
| multiple      | `boolean`             | No       | Allow multi-select            |
| required      | `boolean`             | No       | Prevent empty selection       |
| autoColor     | `boolean\|string`     | No       | Hash label/key for color      |
| autoColorMode | `AutoColorMode`       | No       | When to apply auto-color      |

## DanxButtonGroupItem Interface

| Property    | Type                              | Required | Description                      |
|-------------|-----------------------------------|----------|----------------------------------|
| value       | `string`                          | Yes      | Unique identifier for v-model    |
| label       | `string`                          | Yes      | Display text                     |
| icon        | `Component \| IconName \| string` | No       | Icon (name, SVG, or component)   |
| count       | `number`                          | No       | Count badge after label          |
| activeColor | `string`                          | No       | CSS color for active background  |
| onClick     | `() => void`                      | No       | Callback when button is clicked  |

## Events

| Event             | Payload  | Description                      |
|-------------------|----------|----------------------------------|
| update:modelValue | varies   | Emitted when selection changes   |
| select            | `string` | Emitted when a button is selected |
| deselect          | `string` | Emitted when a button is deselected |

## Auto Color

Auto-color deterministically assigns colors to buttons based on their labels.

### Active-Only Mode (default)

Only selected buttons get colored backgrounds. Inactive buttons use default styling.

```vue
<DanxButtonGroup v-model="selected" :buttons="buttons" auto-color />
```

### Always Mode

Both active and inactive buttons get colors. Active buttons use vibrant colors, inactive buttons use muted/faded variants.

```vue
<DanxButtonGroup v-model="selected" :buttons="buttons" auto-color auto-color-mode="always" />
```

### Custom Hash Key

Pass a string to `autoColor` to use it as the hash key instead of each button's label:

```vue
<DanxButtonGroup v-model="selected" :buttons="buttons" auto-color="status-group" />
```

## CSS Tokens

### Container

| Token                           | Default                | Description    |
|---------------------------------|------------------------|----------------|
| --dx-button-group-bg            | --color-surface-sunken | Background     |
| --dx-button-group-border        | --color-border         | Border color   |
| --dx-button-group-border-radius | --radius-component     | Corner radius  |

### Typography

| Token                        | Default       | Description |
|------------------------------|---------------|-------------|
| --dx-button-group-font-size  | --text-sm     | Font size   |
| --dx-button-group-font-weight| --font-medium | Font weight |

### Layout

| Token                      | Default      | Description    |
|----------------------------|--------------|----------------|
| --dx-button-group-padding-x| --spacing-3  | Horizontal pad |
| --dx-button-group-padding-y| --spacing-1-5| Vertical pad   |
| --dx-button-group-gap      | --spacing-1-5| Icon-label gap |
| --dx-button-group-icon-size| 0.875rem     | Icon dimensions|

### Colors

| Token                          | Default                | Description        |
|--------------------------------|------------------------|--------------------|
| --dx-button-group-text         | --color-text-muted     | Inactive text      |
| --dx-button-group-text-active  | --color-text-inverted  | Active text        |
| --dx-button-group-text-hover   | --color-text           | Hover text         |
| --dx-button-group-active-bg    | --color-interactive    | Active background  |
| --dx-button-group-inactive-bg  | none                   | Inactive background|
| --dx-button-group-divider      | --color-border         | Divider color      |

### Animation

| Token                        | Default          | Description      |
|------------------------------|------------------|------------------|
| --dx-button-group-transition | --transition-fast | Color transition |

### Count

| Token                          | Default | Description        |
|--------------------------------|---------|--------------------|
| --dx-button-group-count-opacity| 0.7     | Count badge opacity|

## Styling Examples

### Compact button group

```css
.compact-buttons {
  --dx-button-group-padding-x: 0.5rem;
  --dx-button-group-padding-y: 0.25rem;
  --dx-button-group-font-size: 0.75rem;
}
```

### Custom active color

```css
.brand-buttons {
  --dx-button-group-active-bg: #8b5cf6;
  --dx-button-group-text-active: white;
}
```
