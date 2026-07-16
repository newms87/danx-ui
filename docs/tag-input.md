# Tag Input Component

A chip-entry multi-value form field. Renders an array of string tags as
removable `DanxChip` pills inline with an editable native text input.

## Features

- **Array v-model** - Bound to a `string[]` of tags via `defineModel`
- **Commit on Enter or comma** - Trims the draft text and adds it as a tag
- **Backspace removal** - Removes the last tag when the draft input is empty
- **Chip removal** - Click a chip's remove (X) button to remove that tag
- **Duplicate prevention** - On by default, opt out via `allowDuplicates`
- **Validate hook** - Reject a candidate tag before it commits
- **Transform hook** - Normalize a candidate tag (e.g. lower-case) before it commits
- **DanxFieldWrapper integration** - Label, error, helper text, and required asterisk

## Basic Usage

```vue
<template>
  <DanxTagInput v-model="tags" label="Tags" placeholder="Add a tag..." />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DanxTagInput } from 'danx-ui';

const tags = ref<string[]>(['design', 'frontend']);
</script>
```

## Props

| Prop             | Type                          | Default | Description                                              |
|-------------------|-------------------------------|---------|------------------------------------------------------------|
| `label`             | `string`                    | -       | Label text above the field                                 |
| `helperText`        | `string`                    | -       | Helper text below the field (hidden when error shown)      |
| `error`             | `string \| boolean`         | -       | Error state/message                                        |
| `disabled`          | `boolean`                   | `false` | Disables the field                                          |
| `readonly`          | `boolean`                   | `false` | Makes the field read-only                                   |
| `required`          | `boolean`                   | `false` | Marks as required (asterisk on label, aria-required)        |
| `size`              | `InputSize`                 | `"md"`  | `"sm" \| "md" \| "lg"`                                       |
| `placeholder`       | `string`                    | -       | Placeholder text for the draft input                        |
| `name`              | `string`                    | -       | Name attribute                                               |
| `id`                | `string`                    | -       | HTML id (auto-generated if omitted)                          |
| `maxlength`         | `number`                    | -       | Max character length for the draft input                    |
| `allowDuplicates`   | `boolean`                   | `false` | Allow duplicate tag values                                   |
| `validate`          | `(tag: string) => boolean`  | -       | Reject a candidate tag (return `false`, or throw)             |
| `transform`         | `(tag: string) => string`   | -       | Transform a candidate tag before duplicate-check/validate/commit |

## Events

| Event   | Payload      | Description                              |
|---------|--------------|-------------------------------------------|
| `add`     | `tag: string`  | Fired when a tag is successfully committed |
| `remove`  | `tag: string`  | Fired when a tag is removed                |
| `focus`   | `FocusEvent`   | Fired when the draft input is focused      |
| `blur`    | `FocusEvent`   | Fired when the draft input is blurred      |

## Slots

| Slot     | Description                              |
|----------|--------------------------------------------|
| `prefix`   | Content rendered before the tags/input     |
| `suffix`   | Content rendered after the tags/input      |

## Committing Tags

Press **Enter** or type a **comma** to commit the current draft text as a
tag. Whitespace-only or empty drafts are ignored. Press **Backspace** with
an empty draft to remove the most recently added tag.

## Duplicate Prevention

By default, a tag matching an existing tag (case-sensitive) is not added:

```vue
<DanxTagInput v-model="tags" />
<!-- typing "design" twice only adds it once -->
```

Opt out with `allowDuplicates`:

```vue
<DanxTagInput v-model="tags" allow-duplicates />
```

## Validation & Transform

```vue
<DanxTagInput
  v-model="emails"
  label="Notify"
  helper-text="Only valid email addresses are accepted."
  :validate="(t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)"
  :transform="(t) => t.toLowerCase()"
/>
```

`transform` runs first on the trimmed candidate, then the duplicate check,
then `validate`. A `validate` hook that returns `false` (or throws) prevents
the tag from being added and leaves the draft text in place.

## CSS Tokens

Global tokens:

| Token                                | Default                    | Description         |
|----------------------------------------|-------------------------------|----------------------|
| `--dx-tag-input-bg`                    | `--color-field-bg`            | Container background |
| `--dx-tag-input-border`                | `--color-field-border`        | Default border color |
| `--dx-tag-input-border-hover`          | `--color-field-border-hover`  | Hover border color   |
| `--dx-tag-input-border-focus`          | `--color-field-border-focus`  | Focus border color   |
| `--dx-tag-input-border-error`          | `--color-field-border-error`  | Error border color   |
| `--dx-tag-input-text`                  | `--color-field-text`          | Draft input text     |
| `--dx-tag-input-placeholder`           | `--color-field-placeholder`   | Placeholder color    |
| `--dx-tag-input-disabled-bg`           | `--color-field-disabled-bg`   | Disabled background  |
| `--dx-tag-input-disabled-text`         | `--color-field-disabled-text` | Disabled text color  |
| `--dx-tag-input-disabled-opacity`      | `--opacity-field-disabled`    | Disabled opacity     |
| `--dx-tag-input-border-radius`         | `--radius-field`              | Corner radius        |
| `--dx-tag-input-gap`                   | `--spacing-1`                 | Gap between chips/input |

Size tokens (for each size: `sm`, `md`, `lg`):

| Token                                       | Description                  |
|-----------------------------------------------|--------------------------------|
| `--dx-tag-input-{size}-min-height`            | Minimum container height       |
| `--dx-tag-input-{size}-font-size`             | Font size                      |
| `--dx-tag-input-{size}-padding-x`             | Horizontal padding             |

See the [Theming Guide](./theming.md) for the full three-tier token system.
