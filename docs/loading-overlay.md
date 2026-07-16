# DanxLoadingOverlay

Semi-transparent overlay for showing a loading state on top of existing content. Meant to sit inside a `position: relative` container (a card, panel, form, or table) to dim it and show a centered spinner while an async operation runs. Presentation-only — you control visibility via the `show` prop.

## Installation

```vue
<script setup lang="ts">
import { DanxLoadingOverlay } from "danx-ui";
</script>
```

## Basic Usage

Wrap the overlay and its target content in a `position: relative` container:

```vue
<div style="position: relative">
  <DanxCard>...</DanxCard>
  <DanxLoadingOverlay :show="isLoading" />
</div>
```

## With a Message

```vue
<DanxLoadingOverlay :show="isSaving" message="Saving..." />
```

## v-model

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxLoadingOverlay } from "danx-ui";

const isLoading = ref(false);
</script>

<template>
  <DanxLoadingOverlay v-model:show="isLoading" />
</template>
```

## Custom Spinner / Message via Slots

```vue
<DanxLoadingOverlay :show="isLoading">
  <template #spinner>
    <DanxSpinner size="lg" />
  </template>
  <template #message>
    <strong>Almost there…</strong>
  </template>
</DanxLoadingOverlay>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `show` | `boolean` | `false` | Controls visibility. Use with `v-model:show`. |
| `message` | `string` | - | Optional text shown beneath the spinner. Ignored when the `message` slot is used. |
| `ariaLabel` | `string` | `"Loading..."` | Screen reader label. |

## Slots

| Slot | Description |
|------|-------------|
| `spinner` | Overrides the default spinner markup. |
| `message` | Overrides the default message text. |

## Accessibility

- The overlay renders with `role="status"` and `aria-live="polite"` so screen readers announce the loading state.
- Visible content is duplicated by a screen-reader-only label (`ariaLabel`) to avoid noisy narration of the spinner/message markup.
- The overlay uses `pointer-events: none` — it never traps focus or blocks keyboard navigation of unrelated page content. It is purely visual dimming; disable interactive elements in the wrapped content yourself if the loading state should also prevent interaction.

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-loading-overlay-bg` | `var(--color-backdrop)` | Scrim background color |
| `--dx-loading-overlay-z` | `10` | Z-index |
| `--dx-loading-overlay-spinner-size` | `2rem` | Spinner diameter |
| `--dx-loading-overlay-spinner-color` | `var(--color-interactive)` | Spinner color |
| `--dx-loading-overlay-text-color` | `var(--color-text)` | Message text color |
| `--dx-loading-overlay-transition-duration` | `0.2s` | Fade transition duration |

```vue
<DanxLoadingOverlay :show="isLoading" style="--dx-loading-overlay-spinner-size: 3rem" />
```
