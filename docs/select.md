# DanxSelect

Feature-rich dropdown select component. Built on `DanxPopover` for the floating panel, `DanxChip` for option/tag rendering, and the shared form field infrastructure for label/error/helper text. The trigger matches `DanxInput` styling by default.

## Installation

```vue
<script setup lang="ts">
import { DanxSelect } from "danx-ui";
</script>
```

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const colors = [
  { value: "red", label: "Red" },
  { value: "green", label: "Green" },
  { value: "blue", label: "Blue" },
];

const color = ref<string | null>(null);
const tags = ref<(string | number)[]>([]);
const status = ref<string | null>(null);
</script>

<template>
  <!-- Basic select -->
  <DanxSelect v-model="color" :options="colors" label="Color" />

  <!-- Multi-select -->
  <DanxSelect v-model="tags" :options="colors" multiple label="Tags" />

  <!-- Filterable with variant -->
  <DanxSelect v-model="status" :options="colors" filterable variant="info" label="Status" />

  <!-- Clearable -->
  <DanxSelect v-model="color" :options="colors" clearable label="Color" />
</template>
```

## Props

`DanxSelect` accepts all shared form field props (`label`, `helperText`, `error`, `disabled`, `readonly`, `required`, `size`, `placeholder`, `name`, `id`) plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `options` | `SelectOption[]` | required | Available options to choose from. |
| `multiple` | `boolean` | `false` | Enables multi-select mode (model becomes an array). |
| `filterable` | `boolean` | `false` | Shows a search input in the dropdown to filter options. |
| `clearable` | `boolean` | `false` | Shows a clear button when a value is selected. |
| `variant` | `VariantType` | `""` | Visual variant applied to trigger and popover (`danger`, `success`, `warning`, `info`, `muted`, or any custom variant name). |
| `optionLabel` | `string` | `"label"` | Key to use for the option label when options are plain objects. |
| `optionValue` | `string` | `"value"` | Key to use for the option value when options are plain objects. |
| `maxSelectedLabels` | `number` | `3` | Max number of selected chips shown before collapsing into "+N more" (multi-select). |
| `filterPlaceholder` | `string` | `"Search..."` | Placeholder text for the filter input. |
| `filterDebounceMs` | `number` | `250` | Debounce delay (ms) before the `filter` event is emitted after a keystroke. Set to `0` to emit synchronously on every keystroke. |
| `emptyMessage` | `string` | `"No options"` | Message shown when the `options` array is empty. |
| `emptyFilterMessage` | `string` | `"No results"` | Message shown when the filter matches nothing. |
| `loading` | `boolean` | `false` | Shows a loading indicator in the dropdown. |
| `creatable` | `boolean` | `false` | Allows creating new options from the current filter text. |
| `placement` | `PopoverPlacement` | `"bottom"` | Dropdown placement direction. |

### `SelectOption`

```ts
interface SelectOption {
  value: string | number;
  label: string;
  icon?: Component | IconName | string;
  description?: string;
  disabled?: boolean;
  group?: string;
}
```

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string \| number \| (string \| number)[] \| null` | Emitted via `defineModel` when the selection changes. Shape follows `multiple`. |
| `focus` | `FocusEvent` | Emitted when the trigger receives focus. |
| `blur` | `FocusEvent` | Emitted when the trigger loses focus. |
| `clear` | — | Emitted when the clear button is clicked. |
| `filter` | `string` | Emitted with the current filter text (debounced per `filterDebounceMs`), for server-side filtering. |
| `create` | `string` | Emitted with the new value text when creating an option via `creatable` mode. |

## Slots

| Slot | Scope | Description |
|------|-------|-------------|
| `option` | `{ option: SelectOption, selected: boolean, highlighted: boolean }` | Custom rendering for each option in the dropdown. |
| `selected` | `{ option: SelectOption }` | Custom rendering for the selected value in the trigger (single-select only). |
| `empty` | — | Custom empty state content. |
| `header` | — | Content rendered above the option list. |
| `footer` | — | Content rendered below the option list. |

```vue
<DanxSelect v-model="status" :options="statuses" label="Status">
  <template #option="{ option, selected }">
    <strong :class="{ 'text-blue-600': selected }">{{ option.label }}</strong>
  </template>
</DanxSelect>
```

## Behavior

- **Single vs multi-select** — `multiple` switches the model between a scalar and an array. Selecting an option in single mode closes the dropdown; in multi mode it toggles the option in/out of the array.
- **Grouping** — options with a shared `group` string render under a group header, in order of first appearance.
- **Filtering** — with `filterable`, typing narrows options by case-insensitive label match. The `filter` event fires (debounced by `filterDebounceMs`) so consumers can drive server-side search.
- **Creatable** — with `creatable`, a "Create '{text}'" row appears when the current filter text doesn't match any existing option label; selecting it emits `create`.
- **Overflow chips** — in multi-select, only the first `maxSelectedLabels` selections render as chips; the rest collapse into a "+N more" chip.

## Keyboard

| Key | Action |
|-----|--------|
| `↑` `↓` | Move the highlighted option. |
| `Enter` / `Space` | Select the highlighted option (or open the dropdown if closed). |
| `Escape` | Close the dropdown. |
| `Home` / `End` | Jump to the first/last option. |

## Accessibility

- The trigger carries `role="combobox"` with `aria-expanded`, `aria-haspopup="listbox"`, `aria-controls`, and `aria-activedescendant` reflecting the open/highlighted state.
- Each option carries `role="option"` with `aria-selected` and `aria-disabled`.
- The listbox container carries `role="listbox"` and `aria-multiselectable` when `multiple`.
- Full `aria-invalid`, `aria-required`, and `aria-describedby` wiring via `useFormField`, matching the error/helper message rendered by `DanxFieldWrapper`.

## Variants

The trigger + panel color wires through the shared `useVariant` composable. Pass a built-in name (`danger`, `success`, `warning`, `info`, `muted`) or any custom variant string for which you've defined `--dx-variant-{name}-bg`/`--dx-variant-{name}-text` tokens.

```vue
<DanxSelect v-model="critical" :options="levels" variant="danger" label="Critical level" />

<!-- Custom variant -->
<DanxSelect v-model="brand" :options="options" variant="brand-x" label="Brand setting" />
```

## CSS Tokens

Override these custom properties to customize appearance:

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-select-trigger-bg` | `var(--color-field-bg)` | Trigger background (matches field bg) |
| `--dx-select-trigger-text` | `var(--color-field-text)` | Trigger text color |
| `--dx-select-trigger-border` | `var(--color-field-border)` | Trigger border (matches field border) |
| `--dx-select-trigger-border-hover` | `var(--color-field-border-hover)` | Hover border color |
| `--dx-select-trigger-border-focus` | `var(--color-field-border-focus)` | Focus/open border color |
| `--dx-select-trigger-border-error` | `var(--color-field-border-error)` | Error border color |
| `--dx-select-placeholder` | `var(--color-field-placeholder)` | Placeholder color |
| `--dx-select-chevron-color` | `var(--color-text-subtle)` | Chevron icon color |
| `--dx-select-option-bg-hover` | `var(--color-surface-sunken)` | Option hover background |
| `--dx-select-option-bg-selected` | `var(--color-interactive-subtle)` | Selected option background |
| `--dx-select-option-check` | `var(--color-interactive)` | Checkmark/checkbox color |
| `--dx-select-panel-max-height` | `16rem` | Max dropdown height |
| `--dx-select-disabled-opacity` | `var(--opacity-field-disabled)` | Disabled opacity |
| `--dx-select-border-radius` | `var(--radius-field)` | Corner radius |
| `--dx-select-transition` | `var(--transition-fast)` | Transition timing |
| `--dx-select-clear-color` | `var(--color-text-subtle)` | Clear button color |
| `--dx-select-clear-hover` | `var(--color-text)` | Clear button hover color |
| `--dx-select-{size}-height` | sm/md/lg via `--field-{size}-height` | Trigger height per size |
| `--dx-select-{size}-font-size` | sm/md/lg via `--field-{size}-font-size` | Font size per size |
| `--dx-select-{size}-padding-x` | sm/md/lg via `--field-{size}-padding-x` | Horizontal padding per size |

```vue
<!-- Custom brand color -->
<DanxSelect
  v-model="color"
  :options="colors"
  label="Branded"
  style="--dx-select-trigger-border-focus: oklch(0.7 0.2 320);"
/>
```

## Composable: `useSelect`

The trigger/dropdown state, option normalization, filtering, grouping, and ARIA wiring are extracted into `useSelect`; keyboard navigation is delegated further to `useSelectKeyboard`. Both are internal composables backing `DanxSelect` — reach for them only if you're building a fully custom select on the same primitives.

## Dark Mode

Automatic via semantic token references. `--dx-select-trigger-bg` resolves to `--color-field-bg`, `--dx-select-option-bg-hover` to `--color-surface-sunken`, etc. — all swap automatically when the `.dark` class is applied. No component-level dark mode overrides needed.
