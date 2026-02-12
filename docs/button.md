# Button Component

A button component with semantic color types and decoupled icons.

## Features

- **Semantic Types** - 6 color types: blank (default), danger, success, warning, info, muted
- **Built-in Icons** - 24 icons available by name (e.g. `icon="trash"`), no imports needed
- **Five Sizes** - xxs, xs, sm, md, lg
- **Text-Only Buttons** - Omit icon for text-only buttons
- **Loading State** - Spinner and disabled state during async operations
- **CSS Tokens** - Full customization via component tokens
- **Zero Dependencies** - Inline SVG icons, no external icon library

## Basic Usage

```vue
<template>
  <DanxButton type="success" icon="save" @click="handleSave">Save</DanxButton>
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
| `type` | `ButtonType` | `""` | Semantic color type (blank = no bg) |
| `size` | `ButtonSize` | `"md"` | Button size |
| `icon` | `Component \| string` | - | Icon name, raw SVG string, or component |
| `disabled` | `boolean` | `false` | Disables the button |
| `loading` | `boolean` | `false` | Shows spinner, prevents clicks |
| `tooltip` | `string` | - | Native title attribute |
| `label` | `string` | - | Text label (alternative to slot) |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `click` | `MouseEvent` | Fired when clicked (not when disabled/loading) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Button text content |
| `icon` | Override icon rendering |

## Semantic Types

| Type | Color | Use For |
|------|-------|---------|
| `""` (default) | Transparent | Unstyled buttons, inherit from context |
| `danger` | Red | Destructive actions (delete, stop, close) |
| `success` | Green | Constructive actions (save, create, confirm) |
| `warning` | Amber | Cautionary actions (pause, schedule) |
| `info` | Blue | Informational actions (view, details) |
| `muted` | Gray | Neutral/secondary actions (cancel, back, edit) |

## Icons

### By Name (recommended)

Use a built-in icon by name — no imports needed:

```vue
<DanxButton type="danger" icon="trash">Delete</DanxButton>
<DanxButton type="success" icon="save">Save</DanxButton>
<DanxButton type="muted" icon="edit">Edit</DanxButton>
```

Available names: `trash`, `stop`, `close`, `save`, `create`, `confirm`, `check`, `pause`, `clock`, `view`, `document`, `users`, `database`, `folder`, `cancel`, `back`, `edit`, `copy`, `refresh`, `export`, `import`, `minus`, `merge`, `restart`, `play`.

### By Import

Icons are also exported as named constants for use outside the component:

```typescript
import { trashIcon, saveIcon, editIcon } from 'danx-ui';
```

## Text-Only Button

Omit the `icon` prop for a text-only button:

```vue
<DanxButton type="success">Save</DanxButton>
<DanxButton type="danger">Delete</DanxButton>
```

## Sizes

```vue
<DanxButton type="success" icon="save" size="xxs">XXS</DanxButton>
<DanxButton type="success" icon="save" size="xs">XS</DanxButton>
<DanxButton type="success" icon="save" size="sm">SM</DanxButton>
<DanxButton type="success" icon="save" size="md">MD (default)</DanxButton>
<DanxButton type="success" icon="save" size="lg">LG</DanxButton>
```

## Icon-Only Button

Omit the default slot content for an icon-only button. Use `tooltip` for accessibility.

```vue
<DanxButton type="danger" icon="trash" tooltip="Delete item" />
```

## Loading State

```vue
<DanxButton type="success" icon="save" :loading="isSaving" @click="save">
  Save
</DanxButton>
```

When loading:
- Shows spinner instead of icon
- Button is disabled
- Click events are prevented

## Custom Icon

### Via Prop (SVG string)

```vue
<script setup lang="ts">
import { DanxButton } from 'danx-ui';
import starIcon from 'danx-icon/src/fontawesome/solid/star.svg?raw';
</script>

<template>
  <DanxButton type="success" :icon="starIcon">Star</DanxButton>
</template>
```

### Via Slot

```vue
<DanxButton type="success">
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
  --dx-button-border-radius: 9999px;
}

/* Scoped override - change success button color */
.my-save-button {
  --dx-button-success-bg: #7c3aed;
  --dx-button-success-bg-hover: #6d28d9;
  --dx-button-success-text: white;
}
```

### Available Tokens

#### Global Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-button-font-family` | `--font-sans` | Font family |
| `--dx-button-border-radius` | `--radius-button` | Corner radius |
| `--dx-button-transition` | `--transition-fast` | Transition timing |
| `--dx-button-disabled-opacity` | `0.5` | Disabled opacity |

#### Size Tokens

For each size (`xxs`, `xs`, `sm`, `md`, `lg`):

| Token Pattern | Description |
|---------------|-------------|
| `--dx-button-{size}-padding-x` | Horizontal padding |
| `--dx-button-{size}-padding-y` | Vertical padding |
| `--dx-button-{size}-icon-size` | Icon dimensions |
| `--dx-button-{size}-font-size` | Font size |
| `--dx-button-{size}-gap` | Icon-text gap |

#### Type Tokens

For each named type (`danger`, `success`, `warning`, `info`, `muted`; blank has no tokens):

| Token Pattern | Description |
|---------------|-------------|
| `--dx-button-{type}-bg` | Background color |
| `--dx-button-{type}-bg-hover` | Hover background |
| `--dx-button-{type}-text` | Text/icon color |

## TypeScript Types

```typescript
import type { ButtonType, ButtonSize, DanxButtonProps } from 'danx-ui';

// ButtonType: "" | "danger" | "success" | "warning" | "info" | "muted"
const type: ButtonType = 'success';

// ButtonSize for sizing
const size: ButtonSize = 'md';
```

## Accessibility

- Uses native `<button>` element
- `type="button"` prevents form submission
- Tooltip via native `title` attribute
- `disabled` attribute properly set when disabled/loading
- Focus ring visible with `:focus-visible`
