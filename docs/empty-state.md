# Empty State Component

A declarative placeholder for empty lists, empty search results, and zero-data states.

## Features

- **Icon** - Optional icon shown above the title, rendered through `DanxIcon`
- **Illustration Slot** - Replace the icon entirely with a custom SVG/image
- **Title / Description** - Required heading plus optional supporting copy
- **Actions Slot** - Calls-to-action shown below the description
- **Three Sizes** - `sm`, `md`, `lg`
- **CSS Tokens** - Full customization via component tokens

## Basic Usage

```vue
<template>
  <DanxEmptyState title="No results" />
</template>

<script setup lang="ts">
import { DanxEmptyState } from 'danx-ui';
</script>
```

## Props

| Prop        | Type                             | Default | Description                                    |
|-------------|-----------------------------------|---------|-------------------------------------------------|
| `title`       | `string`                        | -       | Heading text (required)                          |
| `description` | `string`                        | -       | Supporting copy shown below the title            |
| `icon`        | `Component \| IconName \| string` | -     | Icon shown above the title (ignored when the `illustration` slot is populated) |
| `size`        | `EmptyStateSize`                | `"md"`  | `"sm" \| "md" \| "lg"`                           |

## Slots

| Slot           | Description                                             |
|----------------|-----------------------------------------------------------|
| `illustration` | Custom illustration (SVG/image), replaces the `icon` prop entirely |
| `actions`      | Action buttons shown below the description                |

## Icon

```vue
<DanxEmptyState icon="search" title="No results" description="Try a different search term." />
```

## Custom Illustration Slot

Override the icon entirely via the `illustration` slot — useful for a custom SVG or image:

```vue
<DanxEmptyState title="No results">
  <template #illustration>
    <MyCustomIllustration />
  </template>
</DanxEmptyState>
```

## Actions

Pair with `DanxButton` (or any content) via the `actions` slot:

```vue
<DanxEmptyState icon="folder" title="No files yet" description="Upload your first file to get started.">
  <template #actions>
    <DanxButton variant="success">Upload a file</DanxButton>
  </template>
</DanxEmptyState>
```

## Sizes

```vue
<DanxEmptyState size="sm" icon="search" title="No results" />
<DanxEmptyState size="md" icon="search" title="No results" />
<DanxEmptyState size="lg" icon="search" title="No results" />
```

## CSS Tokens

Global tokens:

| Token                                | Default              | Description         |
|----------------------------------------|-----------------------|----------------------|
| `--dx-empty-state-font-family`         | `--font-sans`         | Font family          |
| `--dx-empty-state-title-weight`        | `--font-medium`       | Title font weight    |
| `--dx-empty-state-title-color`         | `--color-text`        | Title color          |
| `--dx-empty-state-description-color`   | `--color-text-muted`  | Description color    |

Size tokens (for each size: `sm`, `md`, `lg`):

| Token                                       | Description                  |
|-----------------------------------------------|--------------------------------|
| `--dx-empty-state-{size}-icon-size`           | Icon/illustration size         |
| `--dx-empty-state-{size}-gap`                 | Vertical gap between blocks    |
| `--dx-empty-state-{size}-padding`             | Outer padding                  |
| `--dx-empty-state-{size}-title-size`          | Title font size                |
| `--dx-empty-state-{size}-description-size`    | Description font size          |

See the [Theming Guide](./theming.md) for the full three-tier token system.
