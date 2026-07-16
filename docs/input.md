# DanxInput

Text input component with label, error, and helper text. Handles all text-like HTML input types (`text`, `password`, `email`, `url`, `tel`, `number`, `search`, `date`, `time`, `datetime-local`). Built on `DanxFieldWrapper` for consistent label/error/helper rendering.

## Installation

```vue
<script setup lang="ts">
import { DanxInput } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxInput } from "danx-ui";

const name = ref("");
const email = ref("");
const password = ref("");
const query = ref("");
</script>

<template>
  <!-- Basic text input -->
  <DanxInput v-model="name" label="Name" placeholder="Enter your name" />

  <!-- With an error -->
  <DanxInput v-model="email" label="Email" type="email" error="Invalid email" />

  <!-- Password with built-in reveal toggle -->
  <DanxInput v-model="password" label="Password" type="password" show-strength />

  <!-- Search with auto clear + magnifying-glass prefix -->
  <DanxInput v-model="query" type="search" placeholder="Search..." />

  <!-- Character count -->
  <DanxInput v-model="name" label="Bio" :maxlength="140" show-char-count />
</template>
```

## Props

`DanxInput` accepts all shared form field props (`label`, `helperText`, `error`, `disabled`, `readonly`, `required`, `size`, `placeholder`, `name`, `id`) plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `"text" \| "password" \| "email" \| "url" \| "tel" \| "number" \| "search" \| "date" \| "time" \| "datetime-local"` | `"text"` | HTML input type. |
| `clearable` | `boolean` | `false` | Shows a clear button when the field has a value. Defaults to `true` for `type="search"` regardless of this prop. |
| `showCharCount` | `boolean` | `false` | Shows a character count below the input. |
| `maxlength` | `number` | — | Maximum character length (HTML `maxlength` attribute). |
| `min` | `number \| string` | — | Minimum value (`number`/`date` types). |
| `max` | `number \| string` | — | Maximum value (`number`/`date` types). |
| `step` | `number \| string` | — | Step increment (`number`/`date` types). |
| `autocomplete` | `string` | — | Autocomplete attribute. |
| `showStrength` | `boolean` | `false` | Shows a password strength bar/label below the field, computed via the shared `passwordStrength` function. Only takes effect for `type="password"`, and only once the field is non-empty. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number \| null` | Emitted via `defineModel` on native input. |
| `focus` | `FocusEvent` | Emitted when the input receives focus. |
| `blur` | `FocusEvent` | Emitted when the input loses focus. |
| `clear` | — | Emitted when the clear button is clicked. |

## Slots

| Slot | Description |
|------|-------------|
| `prefix` | Content rendered before the native input (replaces the auto search icon for `type="search"`). |
| `suffix` | Content rendered after the native input. |

```vue
<DanxInput v-model="amount" label="Amount">
  <template #prefix>$</template>
  <template #suffix>USD</template>
</DanxInput>
```

## Behavior

### Password type

- `type="password"` renders a built-in reveal/hide toggle button that swaps the native `type` between `password` and `text`.
- `showStrength` adds a 4-segment strength bar plus a text label below the field, computed from the current value via the shared `passwordStrength` helper. It only renders once the field has a value.

### Search type

- `type="search"` automatically renders a magnifying-glass icon in the prefix slot position (unless a custom `prefix` slot is provided) and is clearable by default even without setting the `clearable` prop.

### Clear button

- Shown when `clearable` is true (or `type="search"`) and the field has a value. Clearing sets the model to `null` for `type="number"`, or `""` otherwise, and emits `clear`.

## Accessibility

- Full `aria-invalid`, `aria-required`, and `aria-describedby` wiring via `useFormField`, matching the error/helper message rendered by `DanxFieldWrapper`.
- The label's `for` attribute is wired to the input's `id` (auto-generated if `id` is omitted).
- The reveal/hide toggle carries an accessible `aria-label` ("Show password" / "Hide password").
- The clear button carries `aria-label="Clear"`.

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-input-bg` | `var(--color-field-bg)` | Input background |
| `--dx-input-border` | `var(--color-field-border)` | Default border color |
| `--dx-input-border-hover` | `var(--color-field-border-hover)` | Hover border color |
| `--dx-input-border-focus` | `var(--color-field-border-focus)` | Focus border color |
| `--dx-input-border-error` | `var(--color-field-border-error)` | Error border color |
| `--dx-input-text` | `var(--color-field-text)` | Input text color |
| `--dx-input-placeholder` | `var(--color-field-placeholder)` | Placeholder text color |
| `--dx-input-border-radius` | `var(--radius-field)` | Corner radius |
| `--dx-input-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-input-clear-color` | `var(--color-text-subtle)` | Clear button color |
| `--dx-input-clear-hover` | `var(--color-text)` | Clear button hover color |
| `--dx-input-disabled-bg` | `var(--color-field-disabled-bg)` | Disabled background |
| `--dx-input-disabled-text` | `var(--color-field-disabled-text)` | Disabled text color |
| `--dx-input-disabled-opacity` | `var(--opacity-field-disabled)` | Disabled opacity |
| `--dx-input-{size}-height` | sm/md/lg via `--field-{size}-height` | Height per size |
| `--dx-input-{size}-font-size` | sm/md/lg via `--field-{size}-font-size` | Font size per size |
| `--dx-input-{size}-padding-x` | sm/md/lg via `--field-{size}-padding-x` | Horizontal padding per size |

```vue
<!-- Custom brand focus color -->
<DanxInput
  v-model="name"
  label="Branded"
  style="--dx-input-border-focus: oklch(0.7 0.2 320);"
/>
```

## Dark Mode

Automatic via semantic token references. `--dx-input-bg` resolves to `--color-field-bg`, `--dx-input-border` to `--color-field-border`, etc. — all swap automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
