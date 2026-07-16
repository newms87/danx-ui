# DanxTextarea

Multi-line text input with label, error, and helper text. Supports auto-resize, clearable, and character count. Built on `DanxFieldWrapper` for consistent label/error/helper rendering.

## Installation

```vue
<script setup lang="ts">
import { DanxTextarea } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxTextarea } from "danx-ui";

const text = ref("");
const bio = ref("");
</script>

<template>
  <!-- Basic textarea -->
  <DanxTextarea v-model="text" label="Description" placeholder="Enter description..." />

  <!-- Auto-resize -->
  <DanxTextarea v-model="text" label="Notes" auto-resize :rows="2" />

  <!-- Character count -->
  <DanxTextarea v-model="bio" label="Bio" :maxlength="200" show-char-count />

  <!-- Clearable -->
  <DanxTextarea v-model="text" label="Comment" clearable />
</template>
```

## Props

`DanxTextarea` accepts all shared form field props (`label`, `helperText`, `error`, `disabled`, `readonly`, `required`, `size`, `placeholder`, `name`, `id`) plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `rows` | `number` | `3` | Number of visible text rows. |
| `maxlength` | `number` | — | Maximum character length (HTML `maxlength` attribute). |
| `showCharCount` | `boolean` | `false` | Shows a character count inside the textarea container. |
| `clearable` | `boolean` | `false` | Shows a clear button when the field has a value. |
| `autocomplete` | `string` | — | Autocomplete attribute. |
| `resize` | `"none" \| "vertical" \| "both"` | `"vertical"` | CSS resize behavior. Ignored when `autoResize` is true. |
| `autoResize` | `boolean` | `false` | Auto-grows the textarea to fit its content. `rows` becomes the minimum height and the resize handle is hidden. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| null` | Emitted via `defineModel` on native input. |
| `focus` | `FocusEvent` | Emitted when the textarea receives focus. |
| `blur` | `FocusEvent` | Emitted when the textarea loses focus. |
| `clear` | — | Emitted when the clear button is clicked. |

## Behavior

### Auto-resize

When `autoResize` is true, the textarea's height is recalculated on every input by collapsing it to `0` then setting it to `scrollHeight`, so it grows AND shrinks with content. `rows` still sets the initial/minimum row count, and the CSS `resize` handle is hidden (native resize handles conflict with auto-fit height).

### Resize

When `autoResize` is false, `resize` controls the native CSS `resize` property on the textarea: `"none"` disables manual resizing, `"vertical"` (default) allows vertical-only, `"both"` allows both directions.

### Clear button

Rendered as a top-right overlay button when `clearable` is true and the field has a value. Clears the model to `""` and emits `clear`.

## Accessibility

- Full `aria-invalid`, `aria-required`, and `aria-describedby` wiring via `useFormField`, matching the error/helper message rendered by `DanxFieldWrapper`.
- The label's `for` attribute is wired to the textarea's `id` (auto-generated if `id` is omitted).
- The clear button carries `aria-label="Clear"`.

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-textarea-bg` | `var(--color-field-bg)` | Textarea background |
| `--dx-textarea-border` | `var(--color-field-border)` | Default border color |
| `--dx-textarea-border-hover` | `var(--color-field-border-hover)` | Hover border color |
| `--dx-textarea-border-focus` | `var(--color-field-border-focus)` | Focus border color |
| `--dx-textarea-border-error` | `var(--color-field-border-error)` | Error border color |
| `--dx-textarea-text` | `var(--color-field-text)` | Textarea text color |
| `--dx-textarea-placeholder` | `var(--color-field-placeholder)` | Placeholder text color |
| `--dx-textarea-border-radius` | `var(--radius-field)` | Corner radius |
| `--dx-textarea-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-textarea-clear-color` | `var(--color-text-subtle)` | Clear button color |
| `--dx-textarea-clear-hover` | `var(--color-text)` | Clear button hover color |
| `--dx-textarea-disabled-bg` | `var(--color-field-disabled-bg)` | Disabled background |
| `--dx-textarea-disabled-text` | `var(--color-field-disabled-text)` | Disabled text color |
| `--dx-textarea-disabled-opacity` | `var(--opacity-field-disabled)` | Disabled opacity |
| `--dx-textarea-{size}-font-size` | sm/md/lg via `--field-{size}-font-size` | Font size per size |
| `--dx-textarea-{size}-padding` | sm/md/lg via `--field-{size}-padding-x` | Padding (all sides) per size |

```vue
<!-- Taller padding, custom focus color -->
<DanxTextarea
  v-model="text"
  label="Branded"
  style="--dx-textarea-border-focus: oklch(0.7 0.2 320);"
/>
```

## Dark Mode

Automatic via semantic token references. `--dx-textarea-bg` resolves to `--color-field-bg`, `--dx-textarea-border` to `--color-field-border`, etc. — all swap automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
