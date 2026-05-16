# DanxEditableDiv

Inline-edit primitive for plain-text fields. Drop-in replacement for bespoke click-to-edit patterns on title rows, table cells, sidebar labels. Tabbing into the surface enters edit mode directly — there is no hover-pencil or click-to-focus dance.

## Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxEditableDiv } from "@thehammer/danx-ui";

const title = ref("Click me and edit");
</script>

<template>
  <DanxEditableDiv v-model="title" placeholder="Untitled" />
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | required | Two-way bound value. Plain text, NOT html. |
| `readonly` | `boolean` | `false` | Disable edit; component renders inert text. |
| `placeholder` | `string` | `""` | Shown when value empty AND not focused. |
| `mode` | `"single" \| "multi"` | `"single"` | Newline handling. `single` strips newlines and commits on Enter. `multi` allows newlines and requires Ctrl/Cmd+Enter to commit. |
| `maxLength` | `number` | — | Character cap. Over-cap emits `invalid` instead of committing. |
| `minLength` | `number` | — | Empty value rejected when `>= 1`. |
| `validate` | `(next: string) => string \| null` | — | Sync custom validator. Return `null` = OK, string = error message. |
| `commit` | `"blur" \| "debounce" \| "manual"` | `"blur"` | Commit strategy. |
| `debounceMs` | `number` | `400` | Debounce window when `commit="debounce"`. |
| `saving` | `boolean` | `false` | Render spinner overlay; queues commits until cleared. |
| `size` | `"sm" \| "md" \| "lg"` | `"md"` | Visual size. |
| `layout` | `"inline" \| "block"` | `"inline"` | Container layout. `block` stretches to container width. |
| `as` | `"div" \| "span" \| "h1" \| "h2" \| "h3" \| "p"` | `"div"` | Tag for the editable surface. |
| `contentClass` | `string \| string[] \| Record<string, boolean>` | — | Extra classes merged onto the surface. |
| `dataTest` | `string` | — | `data-test` attribute on the surface. |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `value: string` | Fires on commit per the strategy. NOT on every keystroke unless `commit="debounce"`. |
| `change` | `value: string` | Commit AND value actually changed (no-op edits suppressed). |
| `cancel` | — | Edit cancelled via Escape; value reverted, NO update emitted. |
| `invalid` | `message: string` | Validation failed. Message is the validator return OR a built-in (length, required). |
| `focus` | — | Surface received focus. |
| `blur` | — | Surface lost focus. |

## Exposed (imperative)

The component exposes three imperative methods for programmatic control. Bind a `ref` and call them when interaction can't be expressed via props alone (autofocus on mount, manual commit from a parent toolbar, programmatic cancel).

| Method | Description |
|--------|-------------|
| `focus(selectAll = true)` | Focus the surface. Selects all text by default. |
| `commit()` | Force a commit with the current buffer (honors `validate`). |
| `cancel()` | Cancel the in-flight edit, restore `modelValue`, blur. |

```vue
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { DanxEditableDiv, type DanxEditableDivExpose } from "@thehammer/danx-ui";

const editor = ref<DanxEditableDivExpose | null>(null);
const title = ref("New issue");

onMounted(() => editor.value?.focus());
</script>

<template>
  <DanxEditableDiv ref="editor" v-model="title" />
</template>
```

## Commit strategies

| Strategy | Trigger | Use case |
|----------|---------|----------|
| `blur` (default) | Blur, Enter (single), Ctrl/Cmd+Enter (multi) | Edit-then-save flows. |
| `debounce` | After `debounceMs` of quiet typing | Autosave. |
| `manual` | Caller invokes `commit()` | Custom save buttons or batched edits. |

Enter and Escape always fire their per-mode actions regardless of strategy.

## Validation order

1. **Required** — `minLength >= 1` rejects empty values.
2. **Max length** — `maxLength` rejects over-cap values.
3. **Custom** — `validate` callback runs last.

On any failure: `invalid` fires with the message, `update:modelValue` is suppressed, an error ring is rendered (`aria-invalid="true"`), and the buffer stays dirty so the user can fix without losing input.

## External value sync

`modelValue` is the committed source of truth. The component maintains an internal buffer so external `modelValue` updates (an SSE patch arriving mid-edit) do NOT clobber the user's typing — external updates apply only when the surface is NOT focused.

## Saving queue

When `saving="true"`, the surface dims and a spinner overlays it. The surface stays focused and accepts keystrokes; commits queue until `saving` flips back to `false`, then the most recent buffer is flushed.

## Accessibility

- `role="textbox"` with `aria-multiline` matching `mode`.
- `aria-invalid` reflects validation state.
- `aria-readonly` when `readonly`.
- Keyboard focusable via Tab; the contenteditable surface enters edit on focus.

## CSS tokens

Override these on the wrapping element or globally on `:root`/`.dark` to theme the component.

| Token | Purpose |
|-------|---------|
| `--dx-editable-div-bg` | Resting background (transparent). |
| `--dx-editable-div-bg-hover` | Hover background tint. |
| `--dx-editable-div-bg-focus` | Focus background. |
| `--dx-editable-div-text` | Text color. |
| `--dx-editable-div-placeholder` | Placeholder color. |
| `--dx-editable-div-ring-hover` | Hover ring color. |
| `--dx-editable-div-ring-focus` | Focus ring color. |
| `--dx-editable-div-ring-invalid` | Invalid ring color. |
| `--dx-editable-div-border-radius` | Corner radius. |
| `--dx-editable-div-transition` | Transition timing. |
| `--dx-editable-div-spinner-color` | Spinner glyph color. |
| `--dx-editable-div-{sm,md,lg}-font-size` | Font size per size. |
| `--dx-editable-div-{sm,md,lg}-padding` | Padding per size. |

## Out of scope

- **Async validation.** Use sync `validate` + caller PATCH for server-side checks.
- **Rich text.** Plain text only. Use `MarkdownEditor` for markdown.
- **Auto-resize for multi mode.** Set `max-height` + `overflow` on the container if needed; the component does not measure or animate height.
