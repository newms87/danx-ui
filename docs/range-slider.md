# DanxRangeSlider

Accessible single or dual-handle range slider with `v-model`, step rounding, cross-prevention, keyboard support, pointer drag, click-to-jump on the track, and a formatter slot for the bubble label.

Mode is auto-inferred from the v-model shape:

- `number` → single-handle
- `[number, number]` → dual-handle (tuple is `[min, max]`)

## Installation

```vue
<script setup lang="ts">
import { DanxRangeSlider } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxRangeSlider } from "danx-ui";

const value = ref(50);
const window = ref([540, 1020]); // 09:00-17:00 minutes-of-day
</script>

<template>
  <!-- Single-handle -->
  <DanxRangeSlider v-model="value" :min="0" :max="100" :step="1" ariaLabel="Volume" />

  <!-- Dual-handle -->
  <DanxRangeSlider v-model="window" :min="0" :max="1440" :step="15" ariaLabel="Hours" />

  <!-- With formatter slot -->
  <DanxRangeSlider v-model="window" :min="0" :max="1440" :step="15" ariaLabel="Hours">
    <template #value="{ value }">{{ formatHHMM(value) }}</template>
  </DanxRangeSlider>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| [number, number]` | `0` | v-model. `number` → single-handle, `[number, number]` → dual-handle. |
| `min` | `number` | `0` | Minimum bound (inclusive). |
| `max` | `number` | `100` | Maximum bound (inclusive). |
| `step` | `number` | `1` | Increment between selectable values. Every emitted value is `min + n * step` rounded to nearest. |
| `disabled` | `boolean` | `false` | Locks all pointer + keyboard interaction. Applies the disabled-opacity token. |
| `variant` | `VariantType` | `""` | Variant for fill + handle color (`danger`, `success`, `warning`, `info`, `muted`, or any custom variant name). Blank = default `--color-interactive`. |
| `ariaLabel` | `string` | — | Accessible name for the slider group container. **Required** — without it the slider has no accessible name. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number \| [number, number]` | Emitted via `defineModel` when a handle moves. Payload matches the v-model shape. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `value` | `{ value: number, handle: "single" \| "min" \| "max" }` | Format the bubble label above each handle. Defaults to `String(value)`. The `handle` discriminator lets you render differently for min vs max in dual mode. |

```vue
<DanxRangeSlider v-model="window" :min="0" :max="1440" :step="15" ariaLabel="Hours">
  <template #value="{ value, handle }">
    <span :class="handle === 'min' ? 'text-blue-600' : 'text-blue-400'">
      {{ formatHHMM(value) }}
    </span>
  </template>
</DanxRangeSlider>
```

## Behavior

### Step rounding

Every emitted value is `min + n * step` rounded to nearest within `[min, max]`. Dragging produces only valid stepped values; clicking the track jumps the nearest handle to the stepped position closest to the click.

### Cross-prevention (dual mode)

- `min ≤ max` at all times. A handle can touch its sibling exactly (no enforced gap on equality).
- Trying to drag one handle past the other clamps it to one step away from the sibling.
- Keyboard input applies the same cross-prevention.

### Keyboard

| Key | Action |
|-----|--------|
| `←` `→` | Step the focused handle by `step`. |
| `↑` `↓` | Same as left/right (matches ARIA slider pattern). |
| `PageUp` | Step up by `10 × step`. |
| `PageDown` | Step down by `10 × step`. |
| `Home` | Jump to `min`. |
| `End` | Jump to `max`. |

### Pointer

- `pointerdown` on a handle initiates drag (uses pointer capture for reliable on-document tracking).
- `pointerdown` on the track (NOT on a handle) jumps the nearest handle to the click position.
- `pointercancel` releases the drag identically to `pointerup`.

## Accessibility

- The container has `role="group"` with `aria-label` set from the `ariaLabel` prop (required).
- Each handle is a `<button>` with `role="slider"`, `aria-orientation="horizontal"`, and `aria-valuemin` / `aria-valuemax` / `aria-valuenow` reflecting the current state.
- `aria-disabled` is set on the container and each handle when `disabled` is true.
- Disabled handles get `tabindex="-1"` so they are skipped in the focus order.
- Focus ring is drawn around each focused handle when `:focus-visible`.

## Variants

The fill + handle color wires through the shared `useVariant` composable. Pass a built-in name (`danger`, `success`, `warning`, `info`, `muted`) or any custom variant string for which you've defined `--dx-variant-{name}-bg` tokens.

```vue
<DanxRangeSlider v-model="critical" variant="danger" :min="0" :max="100" ariaLabel="Critical level" />
<DanxRangeSlider v-model="happy" variant="success" :min="0" :max="100" ariaLabel="Happy level" />

<!-- Custom variant -->
<DanxRangeSlider v-model="brand" variant="brand-x" :min="0" :max="100" ariaLabel="Brand setting" />
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-range-slider-font-family` | `var(--font-sans)` | Bubble label font family |
| `--dx-range-slider-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-range-slider-track-bg` | `var(--color-surface-placeholder)` | Off-state (un-filled) track background |
| `--dx-range-slider-track-fill-bg` | `var(--color-interactive)` | Filled segment background |
| `--dx-range-slider-handle-bg` | `var(--color-text-on-color)` | Handle background |
| `--dx-range-slider-handle-border` | `var(--color-interactive)` | Handle border color |
| `--dx-range-slider-handle-shadow` | `var(--shadow-sm)` | Handle drop shadow |
| `--dx-range-slider-bubble-color` | `var(--color-text)` | Bubble label text color |
| `--dx-range-slider-bubble-bg` | `transparent` | Bubble label background |
| `--dx-range-slider-bubble-font-size` | `var(--text-xs)` | Bubble label font size |
| `--dx-range-slider-disabled-opacity` | `0.5` | Opacity applied when disabled |
| `--dx-range-slider-focus-ring` | `var(--color-focus-ring)` | Focus-visible outline color |
| `--dx-range-slider-track-h` | `4px` | Track height |
| `--dx-range-slider-handle-size` | `16px` | Handle diameter |
| `--dx-range-slider-track-radius` | `9999px` | Track border-radius |
| `--dx-range-slider-handle-radius` | `9999px` | Handle border-radius |
| `--dx-range-slider-padding-y` | `calc(var(--dx-range-slider-handle-size) / 2)` | Vertical padding (prevents handle clipping) |

```vue
<!-- Taller track + larger handle -->
<DanxRangeSlider
  v-model="value"
  ariaLabel="Bigger"
  style="--dx-range-slider-track-h: 8px; --dx-range-slider-handle-size: 24px;"
/>

<!-- Custom brand color -->
<DanxRangeSlider
  v-model="value"
  ariaLabel="Branded"
  style="
    --dx-range-slider-track-fill-bg: oklch(0.7 0.2 320);
    --dx-range-slider-handle-border: oklch(0.7 0.2 320);
  "
/>
```

## Composable: `useRangeSlider`

The slider math (clamping, step rounding, percent computation, cross-prevention) is extracted into a pure composable so it can be tested independently of the DOM. The component subscribes via `defineModel` and the composable handles the rest.

```ts
import { ref } from "vue";
import { useRangeSlider } from "danx-ui";

const model = ref<number | [number, number]>([540, 1020]);
const {
  isDual,
  singleValue,
  minValue,
  maxValue,
  percent,
  percentMin,
  percentMax,
  setSingle,
  setMin,
  setMax,
  clamp,
  roundToStep,
  valueAtPercent,
} = useRangeSlider(model, { min: 0, max: 1440, step: 15 });
```

| Return | Type | Description |
|--------|------|-------------|
| `isDual` | `ComputedRef<boolean>` | `true` when the model is a `[number, number]` tuple. |
| `singleValue` | `ComputedRef<number>` | Single-handle mode value. Falls back to global min in dual mode. |
| `minValue` / `maxValue` | `ComputedRef<number>` | Lower / upper handle in dual mode. Fall back to global bounds in single mode. |
| `percent` | `ComputedRef<number>` | Percent (0-100) of `singleValue`. |
| `percentMin` / `percentMax` | `ComputedRef<number>` | Percent of `minValue` / `maxValue`. |
| `setSingle(v)` | `(v: number) => void` | Clamp + step + write the single-handle model. No-op in dual mode. |
| `setMin(v)` / `setMax(v)` | `(v: number) => void` | Clamp + step + cross-prevent + write the dual-handle tuple. No-op in single mode. |
| `clamp(v)` | `(v: number) => number` | Clamp to `[min, max]`. |
| `roundToStep(v)` | `(v: number) => number` | Round to the nearest `min + n*step` value. |
| `valueAtPercent(p)` | `(p: number) => number` | Convert a percent (0-100) along the track to a stepped + clamped value. |

## Dark Mode

Automatic via semantic token references — `--dx-range-slider-track-bg` resolves to `--color-surface-placeholder`, `--dx-range-slider-track-fill-bg` to `--color-interactive`, etc. — all swap automatically when the `.dark` class is applied.
