# Badge Component

A wrapper component that overlays a small indicator (count, dot, or label) on any content.

## Features

- **Three Display Modes** - Count (number), dot (circle), label (text like "NEW")
- **Semantic Variants** - 6 color variants: danger (default), success, warning, info, muted, blank
- **Four Placements** - top-right (default), top-left, bottom-right, bottom-left
- **Auto-hide** - Hides when value is 0 (configurable via `showZero`)
- **Max Overflow** - Shows "99+" when exceeding threshold
- **Auto-color** - Deterministic colors from string hashing
- **CSS Tokens** - Full customization via component tokens

## Basic Usage

```vue
<template>
  <DanxBadge :value="5">
    <DanxButton>Messages</DanxButton>
  </DanxBadge>
</template>

<script setup lang="ts">
import { DanxBadge, DanxButton } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `VariantType` | `"danger"` | Semantic color variant |
| `value` | `number \| string` | - | Count or label text |
| `max` | `number` | `99` | Overflow threshold |
| `dot` | `boolean` | `false` | Dot-only mode |
| `showZero` | `boolean` | `false` | Show badge when value is 0 |
| `hidden` | `boolean` | `false` | Force-hide indicator |
| `placement` | `BadgePlacement` | `"top-right"` | Corner position |
| `autoColor` | `boolean \| string` | `false` | Hash for deterministic color |

## Slots

| Slot | Description |
|------|-------------|
| `default` | The wrapped content (button, icon, etc.) |

## Display Modes

### Count Mode (default)

Pass a number to `value`. Automatically hides at 0 (use `showZero` to override). Shows `{max}+` when exceeding the `max` prop.

```vue
<DanxBadge :value="42">
  <DanxButton>Inbox</DanxButton>
</DanxBadge>

<!-- Overflow: shows "99+" -->
<DanxBadge :value="150" :max="99">
  <DanxButton>Inbox</DanxButton>
</DanxBadge>
```

### Dot Mode

Minimal status indicator with no text. Ignores `value` and `max`.

```vue
<DanxBadge dot variant="success">
  <DanxIcon icon="mail" />
</DanxBadge>
```

### Label Mode

Pass a string to `value` for arbitrary text.

```vue
<DanxBadge value="NEW" variant="info">
  <span>Feature</span>
</DanxBadge>
```

## Semantic Variants

| Variant | Description |
|---------|-------------|
| `"danger"` | Error/notification (default) |
| `"success"` | Positive/complete |
| `"warning"` | Cautionary |
| `"info"` | Informational |
| `"muted"` | Neutral/secondary |
| `""` | Default surface colors |

## Placement

Control which corner the badge anchors to:

```vue
<DanxBadge :value="1" placement="top-left">...</DanxBadge>
<DanxBadge :value="1" placement="top-right">...</DanxBadge>
<DanxBadge :value="1" placement="bottom-left">...</DanxBadge>
<DanxBadge :value="1" placement="bottom-right">...</DanxBadge>
```

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-badge-font-size` | `0.625rem` | Count/label font size |
| `--dx-badge-font-weight` | `--font-bold` | Font weight |
| `--dx-badge-min-width` | `1.25rem` | Min width (circular) |
| `--dx-badge-height` | `1.25rem` | Badge height |
| `--dx-badge-padding-x` | `0.375rem` | Horizontal padding |
| `--dx-badge-border-radius` | `9999px` | Corner radius |
| `--dx-badge-bg` | `--color-danger` | Default background |
| `--dx-badge-text` | `--color-text-inverted` | Default text |
| `--dx-badge-dot-size` | `0.5rem` | Dot mode diameter |
| `--dx-badge-offset-x` | `0px` | Horizontal offset |
| `--dx-badge-offset-y` | `0px` | Vertical offset |
| `--dx-badge-border` | `none` | Outline border |

Variant-specific tokens follow the pattern `--dx-badge-{variant}-bg` and `--dx-badge-{variant}-text`.
