# DanxCheckbox

Accessible boolean checkbox with `v-model`, sized variants, disabled state, indeterminate (mixed) state, and an optional clickable label. Wraps a visually-hidden native `<input type="checkbox">` so form submission and the accessibility tree still work; a styled square box with a checkmark (or dash, when indeterminate) is rendered on top. Renders inside `DanxFieldWrapper` for label/error/helper-text support.

## Installation

```vue
<script setup lang="ts">
import { DanxCheckbox } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxCheckbox } from "danx-ui";

const agreed = ref(false);
</script>

<template>
  <!-- Bare checkbox -->
  <DanxCheckbox v-model="agreed" />

  <!-- With a clickable inline label -->
  <DanxCheckbox v-model="agreed">Accept the terms and conditions</DanxCheckbox>

  <!-- Sized variants -->
  <DanxCheckbox v-model="agreed" size="sm" />
  <DanxCheckbox v-model="agreed" size="lg" />

  <!-- Disabled -->
  <DanxCheckbox v-model="agreed" disabled />

  <!-- Variant -->
  <DanxCheckbox v-model="agreed" variant="success" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `boolean` | `false` | v-model boolean. Use `v-model="checked"`. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Box + checkmark dimensions. |
| `disabled` | `boolean` | `false` | Locks interaction; visually dims via the disabled token. |
| `readonly` | `boolean` | `false` | Keeps the checkbox focusable but blocks value changes. |
| `variant` | `VariantType` | `""` | Checked-state box color (`danger`, `success`, `warning`, `info`, `muted`, or any custom variant name). Blank = default `--color-interactive` box. |
| `indeterminate` | `boolean` | `false` | Mixed visual state — shows a dash instead of a checkmark and sets `aria-checked="mixed"`. |
| `ariaLabel` | `string` | — | Accessible name for the underlying checkbox when no default slot/label is provided. |
| `label` | `string` | — | Label text rendered above the field via `DanxFieldWrapper`. |
| `error` | `string \| boolean` | — | Error state/message (string shows message, `true` shows styling only). |
| `helperText` | `string` | — | Helper text below the field (hidden when error is shown). |
| `required` | `boolean` | `false` | Adds a required asterisk to the label + `aria-required`. |
| `id` | `string` | auto-generated | HTML id for the native checkbox. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `boolean` | Emitted via `defineModel` whenever the boolean flips. |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Optional inline label rendered next to the box. Wrapping `<label>` makes the entire slot clickable. |

## Indeterminate

The `indeterminate` prop sets the native checkbox's `.indeterminate` DOM property (there is no HTML attribute for it) via a template ref + watcher. Useful for a "select all" checkbox controlling a set of children:

```vue
<script setup lang="ts">
import { computed, ref } from "vue";
import { DanxCheckbox } from "danx-ui";

const options = ref([false, true, false]);

const allChecked = computed({
  get: () => options.value.every(Boolean),
  set: (value: boolean) => (options.value = options.value.map(() => value)),
});

const isIndeterminate = computed(
  () => options.value.some(Boolean) && !options.value.every(Boolean)
);
</script>

<template>
  <DanxCheckbox v-model="allChecked" :indeterminate="isIndeterminate">Select all</DanxCheckbox>
</template>
```

## Accessibility

- Underlying control is a visually-hidden `<input type="checkbox">` — keyboard semantics (`Space` toggles), form submission, and the accessibility tree work out of the box.
- `aria-checked` mirrors the boolean, or is `"mixed"` when `indeterminate` is true. `aria-disabled` is set when `disabled` is true. The visual `<span>` box is `aria-hidden="true"` so screen readers never announce it as a separate control.
- Focus ring is drawn around the box when the hidden input is `:focus-visible`.
- **`ariaLabel` (or `label`) is required when no default slot is provided** — without one of the three, the checkbox has no accessible name.

```vue
<!-- Bare checkbox MUST have ariaLabel for screen readers -->
<DanxCheckbox v-model="subscribed" ariaLabel="Subscribe to the newsletter" />
```

## Variants

The checked-state box color wires through the shared `useVariant` composable. Pass a built-in name (`danger`, `success`, `warning`, `info`, `muted`) or any custom variant string for which you've defined `--dx-variant-{name}-bg` tokens.

```vue
<DanxCheckbox v-model="critical" variant="danger" />
<DanxCheckbox v-model="agreed" variant="success" />
<DanxCheckbox v-model="experimental" variant="muted" />

<!-- Custom variant -->
<DanxCheckbox v-model="brandedSetting" variant="brand-x" />
```

## Using DanxFieldWrapper

Passing `label`, `error`, or `helperText` renders the checkbox inside `DanxFieldWrapper`, matching the other form field components:

```vue
<DanxCheckbox v-model="agreed" label="Accept terms" error="You must accept the terms" />
<DanxCheckbox v-model="agreed" label="Accept terms" helper-text="Optional, but recommended." />
<DanxCheckbox v-model="agreed" label="Accept terms" required />
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-checkbox-font-family` | `var(--font-sans)` | Label font family |
| `--dx-checkbox-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-checkbox-box-bg` | `var(--color-surface)` | Off-state box background |
| `--dx-checkbox-box-bg-on` | `var(--color-interactive)` | On-state box background |
| `--dx-checkbox-box-border` | `var(--color-border)` | Off-state box border color |
| `--dx-checkbox-box-border-on` | `var(--color-interactive)` | On-state box border color |
| `--dx-checkbox-check-color` | `var(--color-text-on-color)` | Checkmark/dash color |
| `--dx-checkbox-disabled-opacity` | `0.5` | Opacity applied when disabled |
| `--dx-checkbox-focus-ring` | `var(--color-focus-ring)` | Focus-visible outline color |
| `--dx-checkbox-{size}-box-size` | sm `14px` / md `18px` / lg `22px` | Box width/height |
| `--dx-checkbox-{size}-radius` | sm/md `sm` / lg `md` | Box corner radius |
| `--dx-checkbox-{size}-font-size` | sm `xs` / md `sm` / lg `base` | Label font size |
| `--dx-checkbox-{size}-gap` | sm `0.5rem` / md `0.625rem` / lg `0.75rem` | Gap between box and label |

```vue
<!-- Custom brand color -->
<DanxCheckbox
  v-model="agreed"
  style="--dx-checkbox-box-bg-on: oklch(0.7 0.2 320)"
/>
```

## Dark Mode

Automatic via semantic token references. `--dx-checkbox-box-bg` resolves to `--color-surface`, `--dx-checkbox-box-bg-on` to `--color-interactive`, and `--dx-checkbox-box-border` to `--color-border` — all swap automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
