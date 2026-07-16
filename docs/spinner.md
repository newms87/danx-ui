# Spinner Component

A standalone loading indicator built with pure CSS (no external dependencies).

## Features

- **Three Sizes** - sm, md, lg
- **Semantic Variants** - Color via the shared variant token system
- **Inherits currentColor** - Composes with any text color when no variant is set
- **Accessible** - `role="status"` with a configurable `aria-label`
- **Reduced Motion** - Degrades to a static, dimmed ring
- **CSS Tokens** - Full customization via component tokens

## Basic Usage

```vue
<template>
  <DanxSpinner />
</template>

<script setup lang="ts">
import { DanxSpinner } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `size` | `SpinnerSize` | `"md"` | Spinner diameter and border thickness |
| `variant` | `VariantType` | `""` | Semantic color variant |
| `ariaLabel` | `string` | `"Loading"` | Accessible name |

## Sizes

```vue
<DanxSpinner size="sm" />
<DanxSpinner size="md" />
<DanxSpinner size="lg" />
```

## Semantic Variants

| Variant | Description |
|---------|-------------|
| `""` | Inherits `currentColor` from the parent (default) |
| `"danger"` | Error/notification |
| `"success"` | Positive/complete |
| `"warning"` | Cautionary |
| `"info"` | Informational |
| `"muted"` | Neutral/secondary |

```vue
<DanxSpinner variant="success" />
```

## Usage in Buttons

`DanxButton` renders `DanxSpinner` internally for its `loading` state, sized to
match the button's text via `1lh` and colored via `currentColor`.

```vue
<DanxButton variant="success" :loading="isSaving">Save</DanxButton>
```

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-spinner-sm-size` | `1rem` | sm diameter |
| `--dx-spinner-sm-border-width` | `2px` | sm ring thickness |
| `--dx-spinner-md-size` | `1.5rem` | md diameter |
| `--dx-spinner-md-border-width` | `2px` | md ring thickness |
| `--dx-spinner-lg-size` | `2rem` | lg diameter |
| `--dx-spinner-lg-border-width` | `3px` | lg ring thickness |
| `--dx-spinner-animation-duration` | `0.6s` | Rotation speed |

Variant-specific tokens follow the pattern `--dx-variant-spinner-{variant}-text`
or the shared `--dx-variant-{variant}-text` fallback.
