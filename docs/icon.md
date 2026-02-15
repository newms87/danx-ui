# Icon Component

A standardized icon renderer that resolves built-in icon names, raw SVG strings, and Vue components into a consistently sized flex container.

## Features

- **Built-in Registry** - 31 icons available by name (e.g. `icon="trash"`)
- **Raw SVG Strings** - Pass any SVG string via `?raw` import or inline
- **Vue Components** - Pass a component reference via `:icon`
- **Consistent Sizing** - SVG always fills its container, controlled by CSS
- **Flex Layout** - `inline-flex` display with `flex-shrink: 0`
- **Zero Dependencies** - All icons inlined at build time via Vite

## Basic Usage

```vue
<template>
  <DanxIcon icon="trash" />
</template>

<script setup lang="ts">
import { DanxIcon } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `icon` | `Component \| IconName \| string` | Icon name, raw SVG, or component (required) |

## Icon Registry

All built-in names available for the `icon` prop:

| Category | Names |
|----------|-------|
| Destructive | `trash`, `stop`, `close` |
| Constructive | `save`, `create`, `confirm`, `check` |
| Warning | `pause`, `clock` |
| Informational | `view`, `document`, `users`, `database`, `folder`, `search` |
| Neutral | `cancel`, `back`, `edit`, `copy`, `refresh`, `export`, `import`, `minus`, `merge`, `restart`, `play`, `download`, `pencil`, `keyboard` |
| Chevrons | `chevron-down`, `chevron-right`, `chevron-up`, `chevron-left` |

## Sizing

DanxIcon defaults to `1em` square. Override with Tailwind classes or the `--dx-icon-size` token:

```vue
<!-- Tailwind classes -->
<DanxIcon icon="edit" class="w-6 h-6" />

<!-- CSS token -->
<DanxIcon icon="edit" style="--dx-icon-size: 2rem" />
```

## Custom SVGs

Import any SVG file with Vite's `?raw` suffix:

```vue
<script setup lang="ts">
import { DanxIcon } from 'danx-ui';
import starIcon from 'danx-icon/src/fontawesome/solid/star.svg?raw';
</script>

<template>
  <DanxIcon :icon="starIcon" class="w-5 h-5" />
</template>
```

Or pass an inline SVG string:

```vue
<DanxIcon icon='<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>' />
```

## Vue Component

Pass a Vue component reference for custom icon rendering:

```vue
<script setup lang="ts">
import { DanxIcon } from 'danx-ui';
import { defineComponent, h } from 'vue';

const HeartIcon = defineComponent({
  render: () => h('svg', { viewBox: '0 0 24 24', fill: 'currentColor' },
    [h('path', { d: 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z' })]
  ),
});
</script>

<template>
  <DanxIcon :icon="HeartIcon" class="w-6 h-6" />
</template>
```

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-icon-size` | `1em` | Width and height of the icon |

## Used By

DanxIcon is used internally by:

- **DanxButton** - Renders the `icon` prop
- **DanxChip** - Renders the `icon` prop and remove button
- **DanxContextMenu** - Renders menu item icons
- **CodeViewer** - Collapse/expand chevrons, edit pencil, search icon
- **MarkdownEditor** - Keyboard shortcuts icon
