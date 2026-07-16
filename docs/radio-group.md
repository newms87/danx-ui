# DanxRadioGroup

Accessible single-select group of native `<input type="radio">` controls sharing one `name`, wrapped in a `role="radiogroup"` container. Each radio is visually hidden + styled as a dot; the styled dot fills when checked. Supports keyboard roving-focus navigation per the WAI-ARIA radiogroup pattern. Renders inside `DanxFieldWrapper` for label/error/helper-text support.

## Installation

```vue
<script setup lang="ts">
import { DanxRadioGroup } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxRadioGroup } from "danx-ui";

const plan = ref("free");

const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];
</script>

<template>
  <DanxRadioGroup v-model="plan" :options="options" label="Plan" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string \| number \| null` | `null` | v-model of the selected option's value. |
| `options` | `RadioGroupOption[]` | required | The selectable options: `{ value, label, disabled? }`. |
| `orientation` | `"horizontal" \| "vertical"` | `"vertical"` | Layout direction of the option list. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Dot dimensions + typography. |
| `disabled` | `boolean` | `false` | Disables every option in the group. |
| `variant` | `VariantType` | `""` | Checked-state dot color (`danger`, `success`, `warning`, `info`, `muted`, or any custom variant name). |
| `label` | `string` | — | Label text rendered above the field via `DanxFieldWrapper`. |
| `error` | `string \| boolean` | — | Error state/message (string shows message, `true` shows styling only). |
| `helperText` | `string` | — | Helper text below the field (hidden when error is shown). |
| `required` | `boolean` | `false` | Adds a required asterisk to the label + `aria-required`. |
| `id` | `string` | auto-generated | HTML id used to derive per-option ids. |
| `name` | `string` | auto-generated | Shared `name` attribute for the group's radio inputs. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number \| null` | Emitted via `defineModel` whenever the selected value changes. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `option` | `{ option, checked, disabled }` | Replaces the default label text for each option with fully custom content. |

```vue
<DanxRadioGroup v-model="method" :options="options" label="Payment method">
  <template #option="{ option, checked }">
    <span :class="{ 'font-semibold': checked }">{{ option.label }}</span>
  </template>
</DanxRadioGroup>
```

## Orientation

```vue
<DanxRadioGroup v-model="size" :options="options" />
<DanxRadioGroup v-model="size" :options="options" orientation="horizontal" />
```

## Disabled Options

Individual options can be disabled without disabling the whole group:

```vue
<DanxRadioGroup
  v-model="plan"
  :options="[
    { value: 'free', label: 'Free' },
    { value: 'enterprise', label: 'Enterprise (unavailable)', disabled: true },
  ]"
/>

<!-- Or disable every option -->
<DanxRadioGroup v-model="plan" :options="options" disabled />
```

## Accessibility

- Root option container carries `role="radiogroup"`.
- Underlying controls are visually-hidden native `<input type="radio">` elements sharing one `name` — form submission and the accessibility tree work out of the box.
- Keyboard: `ArrowDown`/`ArrowRight` moves to the next enabled option (wrapping to the first), `ArrowUp`/`ArrowLeft` moves to the previous enabled option (wrapping to the last). The newly selected radio also receives focus, matching the WAI-ARIA radiogroup roving-tabindex pattern.
- Disabled options are skipped during keyboard navigation.
- Focus ring is drawn around the dot when the hidden input is `:focus-visible`.

## Variants

The checked-state dot color wires through the shared `useVariant` composable. Pass a built-in name (`danger`, `success`, `warning`, `info`, `muted`) or any custom variant string for which you've defined `--dx-variant-{name}-bg` tokens.

```vue
<DanxRadioGroup v-model="risk" :options="options" variant="danger" />
<DanxRadioGroup v-model="plan" :options="options" variant="success" />
```

## Using DanxFieldWrapper

Passing `label`, `error`, or `helperText` renders the group inside `DanxFieldWrapper`, matching the other form field components:

```vue
<DanxRadioGroup v-model="plan" :options="options" label="Plan" error="Please choose one" />
<DanxRadioGroup v-model="plan" :options="options" label="Plan" helper-text="You can change this later." />
<DanxRadioGroup v-model="plan" :options="options" label="Plan" required />
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-radio-group-font-family` | `var(--font-sans)` | Label font family |
| `--dx-radio-group-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-radio-group-gap` | `var(--spacing-2-5)` | Gap between options |
| `--dx-radio-dot-bg` | `var(--color-surface)` | Off-state dot background |
| `--dx-radio-dot-border` | `var(--color-border)` | Off-state dot border color |
| `--dx-radio-dot-bg-on` | `var(--color-interactive)` | On-state dot fill color |
| `--dx-radio-dot-border-on` | `var(--color-interactive)` | On-state dot border color |
| `--dx-radio-disabled-opacity` | `0.5` | Opacity applied when disabled |
| `--dx-radio-focus-ring` | `var(--color-focus-ring)` | Focus-visible outline color |
| `--dx-radio-{size}-dot-size` | sm `14px` / md `18px` / lg `22px` | Dot diameter |
| `--dx-radio-{size}-dot-inner-size` | sm `6px` / md `8px` / lg `10px` | Inner filled-dot diameter |
| `--dx-radio-{size}-font-size` | sm `xs` / md `sm` / lg `base` | Label font size |
| `--dx-radio-{size}-gap` | sm `0.5rem` / md `0.625rem` / lg `0.75rem` | Gap between dot and label |

```vue
<!-- Custom brand color -->
<DanxRadioGroup
  v-model="plan"
  :options="options"
  style="--dx-radio-dot-bg-on: oklch(0.7 0.2 320)"
/>
```

## Dark Mode

Automatic via semantic token references. `--dx-radio-dot-bg` resolves to `--color-surface`, `--dx-radio-dot-bg-on` to `--color-interactive`, and `--dx-radio-dot-border` to `--color-border` — all swap automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
