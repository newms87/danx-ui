# DanxRating

Accessible star rating widget with `v-model`, hover-preview, half-step increments, keyboard support, read-only display mode, and variant theming.

## Installation

```vue
<script setup lang="ts">
import { DanxRating } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxRating } from "danx-ui";

const value = ref(3);
</script>

<template>
  <DanxRating v-model="value" ariaLabel="Rating" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number` | `0` | v-model. The committed rating value. |
| `icon` | `Component \| IconName \| string` | `"star"` | Icon rendered per star. Same resolution as `DanxIcon` (built-in name, raw SVG string, or Vue component). |
| `max` | `number` | `5` | Number of stars rendered. |
| `allowHalf` | `boolean` | `false` | Enables 0.5-increment steps on hover-preview, click, and keyboard input. |
| `readonly` | `boolean` | `false` | Renders the current value (including partial fill) with no pointer/keyboard interaction and no hover-preview. |
| `disabled` | `boolean` | `false` | Same interaction lock as `readonly`, plus the disabled-opacity dimming token. |
| `variant` | `VariantType` | `""` | Variant for the filled-star color (`danger`, `success`, `warning`, `info`, `muted`, or any custom variant name). Blank = default `--color-interactive`. |
| `ariaLabel` | `string` | — | Accessible name for the rating group container. **Required** — without it the rating has no accessible name. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number` | Emitted via `defineModel` when the committed rating changes (click or keyboard). Hover-preview does NOT emit. |

## Behavior

### Hover-preview

Hovering over a star previews the value that would be selected on click — the display updates but `modelValue` is untouched until the click actually lands. Moving the pointer off the rating restores the display to the committed value. `readonly` and `disabled` disable hover-preview entirely.

### Half-step increments

When `allowHalf` is set, hovering/clicking the left half of a star selects `n - 0.5`; the right half selects `n`. Half-fills render via `clip-path` on a stacked filled-icon layer — no dedicated half-star icon asset is required.

### Read-only vs disabled

Both lock pointer + keyboard interaction and hover-preview. `readonly` renders the value with no dimming (useful for read-only summaries, e.g. average ratings). `disabled` additionally applies the `--dx-rating-disabled-opacity` token to communicate the control is unavailable.

### Keyboard

| Key | Action |
|-----|--------|
| `←` `↓` | Decrease by `allowHalf ? 0.5 : 1`. |
| `→` `↑` | Increase by `allowHalf ? 0.5 : 1`. |
| `Home` | Jump to `0`. |
| `End` | Jump to `max`. |

## Accessibility

- The container has `role="slider"` with `aria-label` set from the `ariaLabel` prop (required), plus `aria-valuemin="0"`, `aria-valuemax`, and `aria-valuenow` reflecting the current committed value.
- The container is focusable (`tabindex="0"`) unless `disabled` or `readonly`, in which case `tabindex="-1"`.
- `aria-disabled` / `aria-readonly` are set on the container to reflect `disabled` / `readonly`.
- Individual star buttons are `aria-hidden` — the container's `role="slider"` is the single accessible control, matching the range-slider's per-widget ARIA pattern.

## Variants

The filled-star color wires through the shared `useVariant` composable. Pass a built-in name (`danger`, `success`, `warning`, `info`, `muted`) or any custom variant string for which you've defined `--dx-variant-{name}-bg` tokens.

```vue
<DanxRating v-model="critical" variant="danger" ariaLabel="Critical rating" />
<DanxRating v-model="happy" variant="success" ariaLabel="Happy rating" />

<!-- Custom variant -->
<DanxRating v-model="brand" variant="brand-x" ariaLabel="Brand rating" />
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-rating-gap` | `0.25rem` | Gap between stars |
| `--dx-rating-size` | `1.25rem` | Star icon size |
| `--dx-rating-empty-color` | `var(--color-surface-placeholder)` | Empty-star color |
| `--dx-rating-filled-color` | `var(--color-interactive)` | Filled-star color |
| `--dx-rating-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-rating-disabled-opacity` | `0.5` | Opacity applied when disabled |
| `--dx-rating-focus-ring` | `var(--color-focus-ring)` | Focus-visible outline color |

```vue
<!-- Larger stars -->
<DanxRating v-model="value" ariaLabel="Bigger" style="--dx-rating-size: 2rem;" />

<!-- Custom brand color -->
<DanxRating
  v-model="value"
  ariaLabel="Branded"
  style="--dx-rating-filled-color: oklch(0.7 0.2 320);"
/>
```

## Composable: `useRating`

The rating math (clamping, step rounding, per-star fill percent) is extracted into a pure composable so it can be tested independently of the DOM. The component subscribes via `defineModel` and the composable handles the rest.

```ts
import { useRating } from "danx-ui";

const { step, clamp, roundToStep, valueAtStarPosition, fillPercent } = useRating({
  max: 5,
  allowHalf: true,
});
```

| Return | Type | Description |
|--------|------|-------------|
| `step` | `ComputedRef<number>` | `0.5` when `allowHalf`, else `1`. |
| `clamp(v)` | `(v: number) => number` | Clamp to `[0, max]`. |
| `roundToStep(v)` | `(v: number) => number` | Round to the nearest step, then clamp. |
| `valueAtStarPosition(starIndex, fraction)` | `(starIndex: number, fraction: number) => number` | Convert a 1-based star index + fractional pointer position (0-1, left-to-right) within that star into a stepped + clamped rating value. |
| `fillPercent(value, starIndex)` | `(value: number, starIndex: number) => number` | Fill percent (0-100) for a single star at `starIndex` given the current `value`. |

## Dark Mode

Automatic via semantic token references — `--dx-rating-empty-color` resolves to `--color-surface-placeholder`, `--dx-rating-filled-color` to `--color-interactive`, etc. — all swap automatically when the `.dark` class is applied.
