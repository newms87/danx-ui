# Divider Component

A thin line separating content, with optional inset margin and an optional label.

## Features

- **Orientation** - Horizontal (default) or vertical
- **Inset** - Optional margin along the cross-axis
- **Label** - Optional text projected into the line (e.g. "OR"), horizontal only
- **CSS Tokens** - Full customization via component tokens
- **Zero external dependencies**

## Basic Usage

```vue
<template>
  <p>Content above</p>
  <DanxDivider />
  <p>Content below</p>
</template>

<script setup lang="ts">
import { DanxDivider } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `orientation` | `DividerOrientation` | `"horizontal"` | Line direction |
| `inset` | `boolean` | `false` | Adds cross-axis margin |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Label content projected into the line (horizontal only) |

## Orientation

```vue
<DanxDivider orientation="horizontal" />
<DanxDivider orientation="vertical" />
```

Vertical dividers take their height from their container (`height: 100%`), so
they're commonly used inside a flex row between two items.

## Inset

```vue
<DanxDivider inset />
```

## Label

```vue
<DanxDivider>OR</DanxDivider>
```

The label slot is only rendered when `orientation` is `"horizontal"`.

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-divider-color` | `--color-border` | Line color |
| `--dx-divider-thickness` | `1px` | Line thickness |
| `--dx-divider-inset` | `1rem` | Inset margin |
| `--dx-divider-label-color` | `--color-text-muted` | Label text color |
| `--dx-divider-label-font-size` | `0.875rem` | Label font size |
| `--dx-divider-label-gap` | `0.75rem` | Gap between line and label |
