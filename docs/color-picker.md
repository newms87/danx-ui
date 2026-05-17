# DanxColorPicker

Themed color input with a paired swatch button that opens a fully featured color picker panel — HSV saturation/value surface, hue strip, optional alpha strip, HEX / RGB / HSL numeric tabs, preset palette grid, persistent recent-colors strip, and an optional native Eyedropper button.

Back-compat with v0.7.x: `modelValue` (hex), `label`, `disabled`, `testId`, `placeholder`, and the `suffix` slot keep their original behavior. The swatch button now opens a styled panel instead of the OS color picker.

## Installation

```vue
<script setup lang="ts">
import { DanxColorPicker } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxColorPicker } from "danx-ui";

const color = ref("#3b82f6");
</script>

<template>
  <DanxColorPicker v-model="color" label="Brand" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | — | v-model. Hex / rgb() / rgba() / hsl() / hsla() accepted on input; output format set by `output`. |
| `label` | `string` | — | Optional inline label rendered to the LEFT of the swatch trigger. |
| `disabled` | `boolean` | `false` | Disables every interactive control. |
| `testId` | `string` | — | Prefix for `data-test` attributes on every interactive sub-element. |
| `placeholder` | `string` | `"#aabbcc"` | Text input placeholder when value is empty. |
| `swatches` | `string[]` | curated 24-color set | Preset palette colors. Each entry can be any color string `parseColor` accepts. |
| `paletteCols` | `number` | `8` | Palette grid columns. |
| `alpha` | `boolean` | `false` | Render alpha strip + alpha numeric input. Emitted format auto-carries alpha. |
| `output` | `"hex" \| "rgb" \| "rgba" \| "hsl" \| "hsla"` | `"hex"` | Output format for committed values. |
| `clearable` | `boolean` | `false` | Render a Clear button inside the panel. |
| `clearValue` | `string` | `""` | Value emitted when Clear is pressed. |
| `storageKey` | `string` | — | Persist recents in `localStorage` under `danx-color-picker:recent:<storageKey>`. Omit to disable persistence. |
| `recentLimit` | `number` | `8` | Max recent colors tracked. |
| `variant` | `VariantType` | `""` | Accent variant (`danger`, `success`, `warning`, `info`, `muted`, or any custom variant name). Drives the active-tab underline + accent token. |
| `placement` | `PopoverPlacement` | `"bottom"` | Where the panel anchors relative to the trigger. |
| `panelDisabled` | `boolean` | `false` | Disable the popover panel — useful when you only want the text input for direct entry. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | Emitted on every committed color (text blur/Enter, palette click, recent click, panel input commit, alpha release, eyedropper success, Clear). Format matches `output`. |
| `open` | — | Panel opened. |
| `close` | — | Panel closed. |

## Slots

| Slot | Description |
|------|-------------|
| `suffix` | Rendered AFTER the swatch + text input in the trigger row. |

## Behavior

### Text input — focus-gated commit

The hex text input commits on **blur** or **Enter** when the draft parses as a valid color. **Escape** reverts to the bound value. Invalid drafts surface as an inline error without touching parent state. Parent v-model patches (SSE, sibling edits) landing while the operator is typing do NOT clobber the in-progress draft — the re-seed only fires when the input is not focused.

### Panel — HSV + hue + alpha

The saturation/value surface, hue strip, and alpha strip all share an internal HSV representation so dragging stays smooth (no round-trip through RGB on every frame). Commits fire on pointer-up or on every keyboard tick.

### Palette + recents

Clicking a palette swatch commits immediately and prepends the value to the recents strip. Recents dedupe case-insensitively, cap at `recentLimit`, and persist to `localStorage` when `storageKey` is set.

### Eyedropper

The Eyedropper button only renders when the browser exposes the native `EyeDropper` API (Chrome / Edge / Opera as of writing). Cancellation surfaces an inline message rather than crashing.

### Format tabs

The HEX / RGB / HSL tabs share state — editing any tab commits via the parent's `output` format, regardless of which tab the operator used.

## Keyboard

| Element | Key | Action |
|---------|-----|--------|
| Trigger swatch | `Enter` / `Space` | Toggle panel. |
| Text input | `Enter` | Commit if valid. |
| Text input | `Escape` | Revert to bound value. |
| HSV surface thumb | `← → ↑ ↓` | Step saturation / value by 1 (Shift = 10). |
| Hue thumb | `← → ↑ ↓` | Step hue by 1° (Shift = 10°). |
| Alpha thumb | `← → ↑ ↓` | Step alpha by 0.01 (Shift = 0.1). |
| Palette cell | `← →` | Move focus along row (wraps). |
| Palette cell | `↑ ↓` | Move focus by row (`paletteCols` step). |
| Palette cell | `Home` / `End` | Jump to first / last swatch. |
| Palette cell | `Enter` / `Space` | Commit focused swatch. |

## Accessibility

- The panel has `role="dialog"` with `aria-label="Color picker"`.
- The HSV / hue / alpha thumbs each expose `role="slider"` with `aria-valuemin` / `aria-valuemax` / `aria-valuenow` / `aria-valuetext`.
- Format tabs are wired with `role="tab"` / `aria-selected`.
- Every interactive element has a visible label or `aria-label`.
- `aria-expanded` on the swatch trigger reflects panel open state.
- Focus rings on every focusable element via `:focus-visible`.

## Variants

The accent (active tab underline + variant token) wires through the shared `useVariant` composable. Pass a built-in name or any custom variant string for which you've defined `--dx-variant-{name}-bg` tokens.

```vue
<DanxColorPicker v-model="critical" variant="danger" label="Critical" />
<DanxColorPicker v-model="brand" variant="brand-x" label="Brand" />
```

## CSS Tokens

Override these custom properties to customize appearance:

### Trigger row

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-color-picker-font-family` | `var(--font-mono)` | Text input font |
| `--dx-color-picker-gap` | `0.5rem` | Gap between swatch + input + suffix |
| `--dx-color-picker-label-color` | `var(--color-text-muted)` | Label color |
| `--dx-color-picker-label-size` | `0.75rem` | Label font size |
| `--dx-color-picker-swatch-size` | `1.75rem` | Swatch button size |
| `--dx-color-picker-swatch-radius` | `0.25rem` | Swatch border radius |
| `--dx-color-picker-swatch-border` | `var(--color-border)` | Swatch border color |
| `--dx-color-picker-input-bg` | `var(--color-surface)` | Text input background |
| `--dx-color-picker-input-border` | `var(--color-border)` | Text input border |
| `--dx-color-picker-input-border-error` | `var(--color-danger)` | Border in error state |
| `--dx-color-picker-input-text` | `var(--color-text)` | Text input color |
| `--dx-color-picker-input-radius` | `0.25rem` | Text input border radius |
| `--dx-color-picker-input-width` | `7rem` | Text input width |
| `--dx-color-picker-input-padding-x` | `0.5rem` | Horizontal padding |
| `--dx-color-picker-input-padding-y` | `0.25rem` | Vertical padding |
| `--dx-color-picker-input-font-size` | `0.75rem` | Text input font size |
| `--dx-color-picker-error-color` | `var(--color-danger)` | Inline error color |
| `--dx-color-picker-error-size` | `0.6875rem` | Inline error font size |
| `--dx-color-picker-disabled-opacity` | `0.5` | Opacity when disabled |

### Panel

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-color-picker-panel-bg` | `var(--color-surface-elevated)` | Panel background |
| `--dx-color-picker-panel-border` | `var(--color-border)` | Panel border |
| `--dx-color-picker-panel-radius` | `0.625rem` | Panel border radius |
| `--dx-color-picker-panel-padding` | `0.75rem` | Panel padding |
| `--dx-color-picker-panel-gap` | `0.625rem` | Vertical gap between panel sections |
| `--dx-color-picker-panel-width` | `17rem` | Panel width |
| `--dx-color-picker-panel-shadow` | `var(--shadow-md)` | Panel drop shadow |
| `--dx-color-picker-surface-h` | `9rem` | HSV surface height |
| `--dx-color-picker-surface-radius` | `0.375rem` | HSV surface border radius |
| `--dx-color-picker-thumb-size` | `14px` | Thumb diameter (surface / hue / alpha) |
| `--dx-color-picker-thumb-border` | `var(--color-text-on-color)` | Thumb border color |
| `--dx-color-picker-thumb-shadow` | `var(--shadow-sm)` | Thumb shadow |
| `--dx-color-picker-strip-h` | `0.625rem` | Hue + alpha strip height |
| `--dx-color-picker-strip-radius` | `9999px` | Hue + alpha strip border radius |
| `--dx-color-picker-preview-size` | `1.75rem` | Color preview circle size |
| `--dx-color-picker-preview-radius` | `9999px` | Preview circle border radius |

### Tabs + numeric inputs + palette + actions

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-color-picker-tab-color` | `var(--color-text-muted)` | Tab text color |
| `--dx-color-picker-tab-active-color` | `var(--color-text)` | Active tab text color |
| `--dx-color-picker-tab-active-bar` | `var(--color-interactive)` | Active tab underline (variant-driven) |
| `--dx-color-picker-tab-size` | `0.6875rem` | Tab label font size |
| `--dx-color-picker-number-bg` | `var(--color-surface)` | Numeric input background |
| `--dx-color-picker-number-border` | `var(--color-border)` | Numeric input border |
| `--dx-color-picker-number-text` | `var(--color-text)` | Numeric input color |
| `--dx-color-picker-number-radius` | `0.25rem` | Numeric input radius |
| `--dx-color-picker-number-size` | `0.75rem` | Numeric input font size |
| `--dx-color-picker-palette-gap` | `0.25rem` | Gap between palette swatches |
| `--dx-color-picker-section-label-color` | `var(--color-text-subtle)` | Section label color |
| `--dx-color-picker-section-label-size` | `0.625rem` | Section label font size |
| `--dx-color-picker-cell-size` | `1.25rem` | Palette swatch cell size |
| `--dx-color-picker-cell-radius` | `0.25rem` | Palette swatch cell radius |
| `--dx-color-picker-cell-border` | `var(--color-border-subtle)` | Palette swatch cell border |
| `--dx-color-picker-action-bg` | `var(--color-surface)` | Action button background |
| `--dx-color-picker-action-border` | `var(--color-border)` | Action button border |
| `--dx-color-picker-action-text` | `var(--color-text)` | Action button color |
| `--dx-color-picker-action-radius` | `0.25rem` | Action button radius |
| `--dx-color-picker-action-size` | `0.75rem` | Action button font size |
| `--dx-color-picker-focus-ring` | `var(--color-focus-ring)` | Focus ring color |
| `--dx-color-picker-accent` | `var(--color-interactive)` | Variant-driven accent token |

## Dark Mode

Automatic via semantic token references — every component token resolves to `--color-*` semantics that swap when the `.dark` class is applied.

## Composable: `useRecentColors`

The recents persistence logic is extracted as a sibling composable so consumers can manage their own recents lists (e.g., shared across multiple pickers).

```ts
import { useRecentColors } from "danx-ui";

const { colors, push, clear } = useRecentColors({
  storageKey: "brand-colors",
  limit: 12,
});

push("#3b82f6");
console.log(colors.value); // ["#3b82f6", ...]
```

## Color utilities

The component ships a small zero-dependency color-conversion module reachable via the top-level package:

```ts
import {
  parseColor,
  formatColor,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  isHex,
  DEFAULT_SWATCHES,
} from "danx-ui";
```

All conversions round-trip losslessly within 8-bit RGB precision.
