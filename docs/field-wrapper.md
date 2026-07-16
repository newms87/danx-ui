# DanxFieldWrapper

Structural wrapper for all form fields. Internal component used by `DanxInput`, `DanxTextarea`, `DanxSelect`, and others to render a consistent label, error message, and helper text around the actual input element. Also exported for building custom form fields.

## Installation

```vue
<script setup lang="ts">
import { DanxFieldWrapper } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxFieldWrapper } from "danx-ui";

const email = ref("");
const id = "custom-email-field";
</script>

<template>
  <DanxFieldWrapper label="Email" :fieldId="id" required>
    <input :id="id" v-model="email" type="email" />
  </DanxFieldWrapper>

  <!-- With an error message -->
  <DanxFieldWrapper label="Email" :fieldId="id" error="Please enter a valid email">
    <input :id="id" v-model="email" type="email" />
  </DanxFieldWrapper>

  <!-- With helper text -->
  <DanxFieldWrapper label="Email" :fieldId="id" helperText="We'll never share your email">
    <input :id="id" v-model="email" type="email" />
  </DanxFieldWrapper>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fieldId` | `string` | required | HTML id for the associated input. Wires the label's `for` attribute. |
| `label` | `string` | — | Label text rendered above the field. |
| `error` | `string \| boolean` | — | Error state. A string shows styling AND the message text; `true` shows error styling only (useful when the consuming app renders its own error messages elsewhere). |
| `helperText` | `string` | — | Helper text rendered below the field. Hidden when an error message is shown. |
| `required` | `boolean` | `false` | Adds a required asterisk to the label. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Field size, affecting label/message typography. |
| `disabled` | `boolean` | `false` | Whether the field is disabled (visual state only — the wrapper renders no interactive control itself). |

## Slots

| Slot | Description |
|------|-------------|
| `default` | The form control (input, textarea, select, etc.) rendered between the label and the error/helper message. |

## Accessibility

- The `<label>` element's `for` attribute is wired to `fieldId`, so clicking the label focuses the associated control.
- The required asterisk (`*`) is `aria-hidden="true"` — pair `required` with `aria-required` on your own control (this is handled automatically for you by `useFormField` if you use it, as `DanxInput`/`DanxTextarea`/`DanxSelect` do).
- The error/helper message renders with `id="{fieldId}-message"` and `role="alert"` when it's an error, so pairing your control's `aria-describedby` with that id (again handled automatically by `useFormField`) announces it to screen readers.

## `useFormField` composable

Every built-in form field (`DanxInput`, `DanxTextarea`, `DanxSelect`) pairs `DanxFieldWrapper` with the `useFormField` composable, which derives the field's `id`, computes `hasError`, and builds the `aria-*` attributes (`aria-invalid`, `aria-required`, `aria-describedby`) to bind onto the native control. Use the same pattern when building a custom field on top of `DanxFieldWrapper`:

```ts
import { useFormField } from "danx-ui";

const { fieldId, hasError, inputAriaAttrs } = useFormField(props);
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-field-wrapper-label-color` | `var(--color-field-label)` | Label text color |
| `--dx-field-wrapper-label-font-size` | `var(--text-sm)` | Label font size |
| `--dx-field-wrapper-label-font-weight` | `var(--font-medium)` | Label font weight |
| `--dx-field-wrapper-label-gap` | `var(--spacing-1-5)` | Gap between label and field |
| `--dx-field-wrapper-message-font-size` | `var(--text-xs)` | Error/helper message font size |
| `--dx-field-wrapper-required-color` | `var(--color-danger)` | Required asterisk color |

```vue
<DanxFieldWrapper
  label="Custom styled"
  :fieldId="id"
  style="--dx-field-wrapper-label-color: oklch(0.7 0.2 320);"
>
  <input :id="id" />
</DanxFieldWrapper>
```

## Dark Mode

Automatic via semantic token references. `--dx-field-wrapper-label-color` resolves to `--color-field-label`, which swaps automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
