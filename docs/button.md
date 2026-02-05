# Button Component

A semantic button component where the type determines both icon and color.

## Features

- **Semantic Types** - 24 button types with predefined icons and colors
- **Five Sizes** - xxs, xs, sm, md, lg
- **Loading State** - Spinner and disabled state during async operations
- **CSS Tokens** - Full customization via component tokens
- **Zero Dependencies** - Inline SVG icons, no external icon library

## Basic Usage

```vue
<template>
  <DanxButton type="save" @click="handleSave">Save</DanxButton>
</template>

<script setup lang="ts">
import { DanxButton } from 'danx-ui';

function handleSave() {
  console.log('Saved!');
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `ButtonType` | - | Semantic type (determines icon/color) |
| `size` | `ButtonSize` | `"md"` | Button size |
| `icon` | `Component` | - | Custom icon component |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows spinner, prevents clicks |
| `tooltip` | `string` | - | Native title attribute |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Fired when clicked (not when disabled/loading) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Button text content |
| `icon` | Override icon rendering |

## Button Types

### Destructive (Danger)

| Type | Icon | Color |
|------|------|-------|
| `trash` | Trash can | Danger red |
| `stop` | Stop circle | Danger red |
| `close` | X | Danger red |

### Constructive (Success)

| Type | Icon | Color |
|------|------|-------|
| `save` | Floppy disk | Success green |
| `create` | Plus circle | Success green |
| `confirm` | Checkmark | Success green |
| `check` | Checkmark | Success green |

### Warning

| Type | Icon | Color |
|------|------|-------|
| `pause` | Pause bars | Warning amber |
| `clock` | Clock | Warning amber |

### Informational (Interactive)

| Type | Icon | Color |
|------|------|-------|
| `view` | Eye | Interactive blue |
| `document` | Document | Interactive blue |
| `users` | Users | Interactive blue |
| `database` | Database | Interactive blue |
| `folder` | Folder | Interactive blue |

### Neutral (Muted)

| Type | Icon | Color |
|------|------|-------|
| `cancel` | X | Muted gray |
| `back` | Arrow left | Muted gray |
| `edit` | Pencil | Muted gray |
| `copy` | Copy | Muted gray |
| `refresh` | Refresh arrows | Muted gray |
| `export` | Upload arrow | Muted gray |
| `import` | Download arrow | Muted gray |
| `minus` | Minus | Muted gray |
| `merge` | Merge | Muted gray |
| `restart` | Restart arrow | Muted gray |
| `play` | Play triangle | Muted gray |

## Sizes

```vue
<DanxButton type="save" size="xxs">XXS</DanxButton>
<DanxButton type="save" size="xs">XS</DanxButton>
<DanxButton type="save" size="sm">SM</DanxButton>
<DanxButton type="save" size="md">MD (default)</DanxButton>
<DanxButton type="save" size="lg">LG</DanxButton>
```

## Icon-Only Button

Omit the default slot content for an icon-only button. Use `tooltip` for accessibility.

```vue
<DanxButton type="trash" tooltip="Delete item" />
```

## Loading State

```vue
<DanxButton type="save" :loading="isSaving" @click="save">
  Save
</DanxButton>
```

When loading:
- Shows spinner instead of icon
- Button is disabled
- Click events are prevented

## Custom Icon

### Via Prop

```vue
<DanxButton type="save" :icon="MyCustomIcon">Save</DanxButton>
```

### Via Slot

```vue
<DanxButton type="save">
  <template #icon>
    <MyCustomIcon />
  </template>
  Save
</DanxButton>
```

## Styling

### CSS Token Overrides

```css
/* Global override */
:root {
  --button-border-radius: 9999px;
}

/* Scoped override - change save button color */
.my-save-button {
  --button-save-bg: #7c3aed;
  --button-save-bg-hover: #6d28d9;
  --button-save-text: white;
}
```

### Available Tokens

#### Global Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--button-font-family` | `--font-sans` | Font family |
| `--button-border-radius` | `--radius-button` | Corner radius |
| `--button-transition` | `--transition-fast` | Transition timing |
| `--button-disabled-opacity` | `0.5` | Disabled opacity |

#### Size Tokens

For each size (`xxs`, `xs`, `sm`, `md`, `lg`):

| Token Pattern | Description |
|---------------|-------------|
| `--button-{size}-padding-x` | Horizontal padding |
| `--button-{size}-padding-y` | Vertical padding |
| `--button-{size}-icon-size` | Icon dimensions |
| `--button-{size}-font-size` | Font size |
| `--button-{size}-gap` | Icon-text gap |

#### Type Tokens

For each button type:

| Token Pattern | Description |
|---------------|-------------|
| `--button-{type}-bg` | Background color |
| `--button-{type}-bg-hover` | Hover background |
| `--button-{type}-text` | Text/icon color |

## TypeScript Types

```typescript
import type { ButtonType, ButtonSize, DanxButtonProps } from 'danx-ui';

// ButtonType includes all 24 semantic types
const type: ButtonType = 'save';

// ButtonSize for sizing
const size: ButtonSize = 'md';
```

## Accessibility

- Uses native `<button>` element
- `type="button"` prevents form submission
- Tooltip via native `title` attribute
- `disabled` attribute properly set when disabled/loading
- Focus ring visible with `:focus-visible`
