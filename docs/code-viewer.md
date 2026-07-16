# CodeViewer Component

A rich code display and editing component with syntax highlighting, format switching, collapsible preview, markdown rendering, and inline annotations.

## Features

- **Syntax Highlighting** - JSON, YAML, HTML, CSS, JavaScript, TypeScript, Bash, Vue
- **Format Switching** - Bidirectional JSON/YAML conversion via language badge
- **Inline Editing** - Contenteditable with smart indentation and debounced validation
- **Collapsible Preview** - Single-line collapsed view that expands on click
- **Markdown Rendering** - Full markdown with nested code blocks
- **Inline Annotations** - Highlight property paths with error/warning/info tooltips
- **Nested JSON Toggle** - Auto-detect and expand JSON strings inside values
- **Themes** - Dark (default) and light via CSS tokens
- **Keyboard Shortcuts** - Format cycling, save, exit, select-all

## Basic Usage

```vue
<template>
  <CodeViewer :model-value="data" format="yaml" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CodeViewer } from 'danx-ui';

const data = ref({ name: 'Example', version: '1.0' });
</script>
```

### Editable

```vue
<CodeViewer
  v-model="data"
  format="json"
  can-edit
  editable
/>
```

### Collapsible

```vue
<CodeViewer
  :model-value="data"
  collapsible
  :default-collapsed="true"
/>
```

### Markdown

```vue
<CodeViewer :model-value="markdownString" format="markdown" />
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `object \| string \| null` | `null` | Data to display |
| `format` | `CodeFormat` | `"yaml"` | Display format |
| `label` | `string` | `""` | Label above the viewer |
| `canEdit` | `boolean` | `false` | Enable edit toggle |
| `editable` | `boolean` | `false` | Start in edit mode |
| `collapsible` | `boolean` | `false` | Enable collapse |
| `defaultCollapsed` | `boolean` | `true` | Start collapsed |
| `defaultCodeFormat` | `"json" \| "yaml"` | - | Default for markdown code blocks |
| `allowAnyLanguage` | `boolean` | `false` | Show language search in badge |
| `theme` | `"dark" \| "light"` | `"dark"` | Color theme |
| `hideFooter` | `boolean` | `false` | Hide the footer bar |
| `debounceMs` | `number` | `300` | Debounce delay for v-model emit (0 = immediate) |
| `annotations` | `CodeAnnotation[]` | `[]` | Inline annotations for property paths |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `object \| string \| null` | Edited value |
| `update:format` | `CodeFormat` | Format changed via badge |
| `update:editable` | `boolean` | Edit mode toggled |
| `update:valid` | `boolean` | Validation state changed |
| `exit` | - | Ctrl+Enter pressed |
| `delete` | - | Backspace/Delete on empty content |

## Slots

| Slot | Description |
|------|-------------|
| `footer-actions` | Custom actions in the footer bar (next to edit button) |

## Inline Annotations

Highlight specific property paths with colored markers and hover tooltips. Annotations work with JSON and YAML formats.

```vue
<template>
  <CodeViewer
    :model-value="data"
    format="json"
    :annotations="annotations"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { CodeViewer } from 'danx-ui';
import type { CodeAnnotation } from 'danx-ui';

const data = ref({ name: '', theme: 'invalid' });

const annotations = ref<CodeAnnotation[]>([
  { path: 'name', message: 'Name is required', type: 'error' },
  { path: 'theme', message: 'Must be "dark" or "light"', type: 'warning' },
]);
</script>
```

### Annotation Types

| Type | Color | Use Case |
|------|-------|----------|
| `error` | Red | Validation errors, required fields |
| `warning` | Amber | Non-blocking issues, suggestions |
| `info` | Blue | Informational highlights |

### Path Syntax

Paths use dot notation with array index support:

- `"name"` - Top-level key
- `"config.theme"` - Nested key
- `"items[2]"` or `"items.2"` - Array element
- `"items[0].type"` - Key inside array element

## DanxCodeDiff

A companion component that computes a line-level diff between two text/code values and renders it either unified (single column, +/- prefixed lines) or split (two aligned columns). Reuses CodeViewer's syntax highlighter per line and the shared `--dx-variant-*` token system for added/removed line coloring.

```vue
<template>
  <DanxCodeDiff :old-value="before" :new-value="after" format="json" />
</template>

<script setup lang="ts">
import { DanxCodeDiff } from 'danx-ui';

const before = `{
  "name": "widget",
  "version": "1.0.0"
}`;

const after = `{
  "name": "widget",
  "version": "1.1.0",
  "beta": true
}`;
</script>
```

### Split View

```vue
<DanxCodeDiff :old-value="before" :new-value="after" format="yaml" mode="split" />
```

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `oldValue` | `string` | (required) | Original ("before") text/code |
| `newValue` | `string` | (required) | Updated ("after") text/code |
| `format` | `CodeFormat` | `"text"` | Syntax highlighting language |
| `mode` | `"unified" \| "split"` | `"unified"` | Layout mode |
| `label` | `string` | `""` | Label above the diff |
| `theme` | `"dark" \| "light"` | `"dark"` | Color theme |

### Diff Utilities

`computeLineDiff` and `computeSplitDiff` are also exported directly for computing a diff without rendering it:

```typescript
import { computeLineDiff, computeSplitDiff } from 'danx-ui';

const lines = computeLineDiff(before, after);
// [{ type: "unchanged" | "added" | "removed", content, oldLineNumber, newLineNumber }, ...]

const rows = computeSplitDiff(before, after);
// [{ left: DiffLine | null, right: DiffLine | null }, ...]
```

### Diff Tokens

| Token | Description |
|-------|-------------|
| `--dx-code-diff-added-bg` | Added line background (falls back to `--dx-variant-success-bg-selected`) |
| `--dx-code-diff-added-border` | Added line left border (falls back to `--dx-variant-success-border`) |
| `--dx-code-diff-removed-bg` | Removed line background (falls back to `--dx-variant-danger-bg-selected`) |
| `--dx-code-diff-removed-border` | Removed line left border (falls back to `--dx-variant-danger-border`) |

## TypeScript Types

```typescript
type CodeFormat =
  | 'json' | 'yaml' | 'text' | 'markdown'
  | 'html' | 'css' | 'javascript'
  | 'typescript' | 'bash' | 'vue';

interface CodeAnnotation {
  path: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
}
```

## CSS Tokens

See `code-viewer-tokens.css` for the full list of customizable tokens. Key categories:

### Layout

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-code-viewer-font-family` | Consolas, Monaco, ... | Monospace font |
| `--dx-code-viewer-font-size` | `0.875rem` | Font size |
| `--dx-code-viewer-line-height` | `1.6` | Line height |
| `--dx-code-viewer-padding` | `1rem` | Content padding |
| `--dx-code-viewer-border-radius` | `0.375rem` | Corner radius |

### Colors (Dark Theme Defaults)

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-code-viewer-content-bg` | `#1e1e1e` | Content background |
| `--dx-code-viewer-content-text` | `#d4d4d4` | Content text |
| `--dx-code-viewer-footer-bg` | `#252526` | Footer background |

### Annotation Tokens

| Token | Description |
|-------|-------------|
| `--dx-code-viewer-annotation-error-bg` | Error highlight background |
| `--dx-code-viewer-annotation-error-border` | Error left border |
| `--dx-code-viewer-annotation-warning-bg` | Warning highlight background |
| `--dx-code-viewer-annotation-warning-border` | Warning left border |
| `--dx-code-viewer-annotation-info-bg` | Info highlight background |
| `--dx-code-viewer-annotation-info-border` | Info left border |
| `--dx-code-viewer-annotation-tooltip-*-bg` | Tooltip background per type |
| `--dx-code-viewer-annotation-tooltip-text` | Tooltip text color |

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+Alt+L` | Cycle format (JSON/YAML) |
| `Ctrl+Alt+Shift+L` | Open language search |
| `Ctrl+Enter` | Exit code block (emits `exit`) |
| `Ctrl+S` | Save (blur + emit) |
| `Ctrl+A` | Select all within code |
| `Escape` | Exit edit mode |
| `Tab` | Insert 2 spaces |
