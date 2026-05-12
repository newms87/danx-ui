# DanxToggle

Accessible boolean switch with `v-model`, sized variants, disabled state, and an optional clickable label. Wraps a visually-hidden native `<input type="checkbox">` so form submission and the accessibility tree still work; the styled track + thumb are rendered on top.

## Installation

```vue
<script setup lang="ts">
import { DanxToggle } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxToggle } from "danx-ui";

const enabled = ref(false);
</script>

<template>
  <!-- Bare toggle -->
  <DanxToggle v-model="enabled" />

  <!-- With a clickable label -->
  <DanxToggle v-model="enabled">Always on</DanxToggle>

  <!-- Sized variants -->
  <DanxToggle v-model="enabled" size="sm" />
  <DanxToggle v-model="enabled" size="lg" />

  <!-- Disabled -->
  <DanxToggle v-model="enabled" disabled />

  <!-- Variant -->
  <DanxToggle v-model="enabled" variant="success" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | required | v-model boolean. Use `v-model="enabled"`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Track + thumb dimensions. |
| `disabled` | `boolean` | `false` | Locks interaction; visually dims via the disabled token. |
| `variant` | `VariantType` | `""` | On-state track color (`danger`, `success`, `warning`, `info`, `muted`, or any custom variant name). Blank = default `--color-interactive` track. |
| `ariaLabel` | `string` | — | Accessible name for the underlying checkbox when no default slot is provided. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted via `defineModel` whenever the boolean flips. |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Optional label rendered next to the switch. Wrapping `<label>` makes the entire slot clickable. |

## Accessibility

- Root element is a native `<label>` so clicking the slot label toggles the checkbox.
- Underlying control is a visually-hidden `<input type="checkbox">` — keyboard semantics (`Space` toggles), form submission, and the accessibility tree work out of the box.
- The focusable `<input>` carries `role="switch"` (overrides the implicit checkbox role), `aria-checked` mirrors the boolean, and `aria-disabled` is set when `disabled` is true. The visual `<span>` track is `aria-hidden="true"` so screen readers never announce it as a separate control.
- Focus ring is drawn around the track when the hidden input is `:focus-visible`.
- **`ariaLabel` is required when no default slot is provided** — without either, the toggle has no accessible name.

```vue
<!-- Bare toggle MUST have ariaLabel for screen readers -->
<DanxToggle v-model="alwaysOn" ariaLabel="24/7 master switch" />
```

## Variants

The on-state track color wires through the shared `useVariant` composable. Pass a built-in name (`danger`, `success`, `warning`, `info`, `muted`) or any custom variant string for which you've defined `--dx-variant-{name}-bg` and `--dx-variant-{name}-text` tokens.

```vue
<DanxToggle v-model="critical" variant="danger" />
<DanxToggle v-model="enabled" variant="success" />
<DanxToggle v-model="experimental" variant="muted" />

<!-- Custom variant -->
<DanxToggle v-model="brandedSetting" variant="brand-x" />
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-toggle-font-family` | `var(--font-sans)` | Label font family |
| `--dx-toggle-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-toggle-track-bg` | `var(--color-surface-placeholder)` | Off-state track background |
| `--dx-toggle-track-bg-on` | `var(--color-interactive)` | On-state track background |
| `--dx-toggle-thumb-bg` | `var(--color-text-on-color)` | Thumb background color |
| `--dx-toggle-thumb-shadow` | `var(--shadow-sm)` | Thumb drop shadow |
| `--dx-toggle-disabled-opacity` | `0.5` | Opacity applied when disabled |
| `--dx-toggle-focus-ring` | `var(--color-focus-ring)` | Focus-visible outline color |
| `--dx-toggle-{size}-track-w` | sm `28px` / md `36px` / lg `48px` | Track width |
| `--dx-toggle-{size}-track-h` | sm `16px` / md `20px` / lg `26px` | Track height |
| `--dx-toggle-{size}-thumb-size` | sm `12px` / md `16px` / lg `22px` | Thumb diameter |
| `--dx-toggle-{size}-thumb-inset` | `2px` | Inset between thumb edge and track edge |
| `--dx-toggle-{size}-font-size` | sm `xs` / md `sm` / lg `base` | Label font size |
| `--dx-toggle-{size}-gap` | sm `0.5rem` / md `0.625rem` / lg `0.75rem` | Gap between toggle and label |

```vue
<!-- Custom brand color -->
<DanxToggle
  v-model="enabled"
  style="--dx-toggle-track-bg-on: oklch(0.7 0.2 320)"
/>

<!-- Resized -->
<DanxToggle
  v-model="enabled"
  style="
    --dx-toggle-md-track-w: 56px;
    --dx-toggle-md-track-h: 28px;
    --dx-toggle-md-thumb-size: 22px;
  "
/>
```

## Dark Mode

Automatic via semantic token references. `--dx-toggle-track-bg` resolves to `--color-surface-placeholder`, `--dx-toggle-track-bg-on` to `--color-interactive`, and `--dx-toggle-thumb-bg` to `--color-text-on-color` — all three swap automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
