# DanxNumberInput

Numeric input with visible stepper buttons, range clamping and decimal-safe stepping. Built on `DanxFieldWrapper` for the same label/error/helper rendering as every other field.

## Why not `<input type="number">`

The native number input's spinners are tiny, inconsistent between browsers, and invisible on touch. `DanxNumberInput` renders its own always-visible +/− buttons in their place, and adds the behavior the native control leaves out: clamping to `min`/`max`, hold-to-repeat, and decimal steps that don't drift.

## Installation

```vue
<script setup lang="ts">
import { DanxNumberInput } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxNumberInput } from "danx-ui";

const quantity = ref(1);
const price = ref(9.99);
</script>

<template>
  <DanxNumberInput v-model="quantity" label="Quantity" :min="0" :max="10" />
  <DanxNumberInput v-model="price" label="Price" :step="0.01" :min="0" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `number \| null` | — | The value (use `v-model`) |
| `label` | `string` | — | Label text above the input |
| `helperText` | `string` | — | Helper text below (hidden while an error shows) |
| `error` | `string \| boolean` | — | Error state or message |
| `disabled` | `boolean` | `false` | Disables the input and both steppers |
| `readonly` | `boolean` | `false` | Read-only input; steppers and arrow keys inert |
| `required` | `boolean` | `false` | Asterisk on the label, `aria-required` on the input |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Field size |
| `placeholder` | `string` | — | Placeholder text |
| `name` | `string` | — | Name attribute |
| `id` | `string` | auto | HTML id (generated when omitted) |
| `min` | `number` | — | Minimum value; steps and blur clamp to it |
| `max` | `number` | — | Maximum value; steps and blur clamp to it |
| `step` | `number` | `1` | Amount added or subtracted per step |
| `autocomplete` | `string` | — | Autocomplete attribute |
| `holdDelay` | `number` | `400` | Ms held before repeat stepping begins |
| `holdInterval` | `number` | `80` | Ms between repeats once stepping has begun |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `number \| null` | The value changed |
| `focus` | `FocusEvent` | The input gained focus |
| `blur` | `FocusEvent` | The input lost focus (value is clamped here) |

## Behavior worth knowing

**Clamping happens on step and on blur, not on every keystroke.** Typing `999` into a field capped at `10` leaves `999` visible while you type — clamping mid-keystroke would fight anyone typing a number whose prefix is out of range (`5` on the way to `50`). The value settles to `10` when the field loses focus.

**Empty is `null`, not `0`.** Clearing the field yields `null` so "no answer" stays distinguishable from "zero". Guard on `value == null` rather than falsiness, or a legitimate `0` reads as empty.

**Decimal steps do not drift.** Stepping `0.1` from `0.2` gives `0.3`, not `0.30000000000000004`. Rounding is done at the step's own decimal precision rather than in raw binary floating point.

**Hold to repeat.** Press and hold a stepper to step continuously: one step immediately, then a `holdDelay` pause, then a step every `holdInterval`. Releasing the button, moving the cursor off it, or unmounting the component all stop the repeat. Repeat is driven by `mousedown`/`mouseup`, so on touch it follows whatever synthetic mouse events the browser emits.

**Keyboard.** ArrowUp and ArrowDown step by `step` and are ignored while disabled or readonly.

## Sizes

```vue
<DanxNumberInput v-model="value" size="sm" label="Small" />
<DanxNumberInput v-model="value" size="md" label="Medium" />
<DanxNumberInput v-model="value" size="lg" label="Large" />
```

## Styling

Every surface is a `--dx-number-input-*` custom property; there are no styling props.

| Token | Description |
|-------|-------------|
| `--dx-number-input-bg` | Input background |
| `--dx-number-input-border` | Default border color |
| `--dx-number-input-border-hover` | Hover border color |
| `--dx-number-input-border-focus` | Focus border color |
| `--dx-number-input-border-error` | Error border color |
| `--dx-number-input-text` | Text color |
| `--dx-number-input-placeholder` | Placeholder color |
| `--dx-number-input-border-radius` | Corner radius |
| `--dx-number-input-transition` | Transition timing |
| `--dx-number-input-stepper-color` | Stepper button color |
| `--dx-number-input-stepper-hover` | Stepper button hover color |
| `--dx-number-input-disabled-bg` | Disabled background |
| `--dx-number-input-disabled-text` | Disabled text color |
| `--dx-number-input-disabled-opacity` | Disabled opacity |
| `--dx-number-input-{size}-height` | Height per size |
| `--dx-number-input-{size}-font-size` | Font size per size |
| `--dx-number-input-{size}-padding-x` | Horizontal padding per size |

```css
.my-quantity-field {
  --dx-number-input-border-radius: 1rem;
  --dx-number-input-stepper-color: var(--color-interactive);
}
```

See `number-input-tokens.css` for the full list.

## Accessibility

The stepper buttons are real `<button>` elements with labels, so they are reachable by keyboard and announced by screen readers — and they are disabled (not merely dimmed) when the value is at a bound or the field is disabled or readonly. The input keeps its native `type="number"` semantics, so assistive tech and mobile keyboards behave as expected.

## Related

- [DanxInput](./input.md) — text and other input types
- [DanxRangeSlider](./range-slider.md) — picking a number on a continuum rather than typing one
- [Form Validation](./form-validation.md) — wiring fields into a validated form
