# Tooltip Component

A floating tooltip that anchors to a trigger element with auto-positioning, semantic colors, and flexible trigger binding.

## Features

- **Three Trigger Modes** - Slot content, triggerIcon shortcut, or external target element
- **Panel Icon** - Optional icon at the top-left of the tooltip content
- **Semantic Variants** - 6 color variants: blank (default), danger, success, warning, info, muted
- **Interaction Modes** - Hover (default), click, or focus
- **Auto-Positioning** - 4-direction placement with auto-flip and viewport clamping
- **Interactive Hover** - 200ms close delay allows interacting with tooltip content
- **CSS Tokens** - Full customization via component tokens
- **Zero Dependencies** - Reuses existing popover positioning

## Basic Usage

```vue
<template>
  <DanxTooltip tooltip="Delete this item">
    <template #trigger>
      <button>Hover me</button>
    </template>
  </DanxTooltip>
</template>

<script setup lang="ts">
import { DanxTooltip } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `VariantType` | `""` | Semantic color variant |
| `icon` | `Component \| string` | - | Panel icon at top-left |
| `triggerIcon` | `Component \| string` | - | Shortcut to render DanxIcon as trigger |
| `target` | `string \| HTMLElement` | - | External trigger element (ID or ref) |
| `tooltip` | `string` | - | Simple text content |
| `placement` | `PopoverPlacement` | `"top"` | Panel placement direction |
| `interaction` | `TooltipInteraction` | `"hover"` | Trigger interaction mode |
| `disabled` | `boolean` | `false` | Prevents tooltip from showing |

## Slots

| Slot | Description |
|------|-------------|
| `trigger` | Custom trigger element the tooltip anchors to |
| `default` | Panel content (overrides `tooltip` prop) |

## Trigger Modes

### Slot Trigger

```vue
<DanxTooltip tooltip="Help text">
  <template #trigger>
    <button>Hover me</button>
  </template>
</DanxTooltip>
```

### Trigger Icon Shortcut

```vue
<DanxTooltip triggerIcon="info" tooltip="Helpful information" />
```

### External Target

```vue
<button id="my-button">Click me</button>
<DanxTooltip target="my-button" tooltip="Anchored to external element" />
```

## Interaction Modes

### Hover (default)

Shows on mouseenter, hides on mouseleave with a 200ms delay. The delay allows users to move their mouse into the tooltip panel to interact with content (links, buttons).

### Click

Toggles on click, closes on click-outside.

```vue
<DanxTooltip interaction="click" tooltip="Click to toggle">
  <template #trigger>
    <button>Click me</button>
  </template>
</DanxTooltip>
```

### Focus

Shows on focusin, hides on focusout.

```vue
<DanxTooltip interaction="focus" tooltip="Focus tooltip">
  <template #trigger>
    <input placeholder="Focus me" />
  </template>
</DanxTooltip>
```

## Semantic Variants

| Variant | Description |
|---------|-------------|
| `""` | Default surface background |
| `"danger"` | Destructive/error (red) |
| `"success"` | Positive/complete (green) |
| `"warning"` | Cautionary (amber) |
| `"info"` | Informational (blue) |
| `"muted"` | Neutral/secondary (gray) |

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-tooltip-bg` | `var(--color-surface-elevated)` | Panel background |
| `--dx-tooltip-text` | `var(--color-text)` | Panel text color |
| `--dx-tooltip-border` | `var(--color-border)` | Panel border |
| `--dx-tooltip-border-radius` | `0.375rem` | Corner radius |
| `--dx-tooltip-shadow` | `0 2px 8px rgb(0 0 0 / 0.15)` | Box shadow |
| `--dx-tooltip-padding-x` | `var(--spacing-3)` | Horizontal padding |
| `--dx-tooltip-padding-y` | `var(--spacing-2)` | Vertical padding |
| `--dx-tooltip-font-size` | `var(--text-sm)` | Text size |
| `--dx-tooltip-max-width` | `20rem` | Maximum width |
| `--dx-tooltip-icon-size` | `1.25rem` | Panel icon size |
| `--dx-tooltip-trigger-icon-size` | `1em` | Trigger icon size |
| `--dx-tooltip-gap` | `var(--spacing-2)` | Gap between icon and content |
| `--dx-tooltip-animation-duration` | `var(--duration-150)` | Entry animation |

## Styling

Override tokens on a parent or wrapper element:

```css
.my-tooltip {
  --dx-tooltip-bg: navy;
  --dx-tooltip-text: white;
  --dx-tooltip-max-width: 30rem;
}
```

