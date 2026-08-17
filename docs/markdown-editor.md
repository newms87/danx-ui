# Markdown Editor

A rich contenteditable markdown editor with live preview, syntax highlighting, and keyboard shortcuts.

## Features

- **Live Preview** - Markdown renders as styled HTML in real-time
- **Code Blocks** - Syntax-highlighted code with language selection (via CodeViewer)
- **Tables** - Insert and edit tables with column alignment controls
- **Inline Formatting** - Bold, italic, strikethrough, inline code, highlight, subscript/superscript
- **Lists** - Ordered, unordered, and task lists with nesting
- **Links** - Insert/edit links via popover with URL validation
- **Blockquotes** - Toggle blockquote on any block
- **Horizontal Rules** - Insert `---` dividers
- **Context Menu** - Right-click menu with context-aware actions
- **Keyboard Shortcuts** - Comprehensive hotkey support with help popover
- **Custom Token Renderers** - Extend with custom inline patterns (e.g., `{{123}}`)
- **Dark/Light Themes** - Full token-based theming

## Basic Usage

```vue
<template>
  <MarkdownEditor v-model="content" placeholder="Write something..." />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MarkdownEditor } from 'danx-ui';

const content = ref('# Hello World\n\nStart editing...');
</script>
```

## Pasting Content

Pasting into the editor is intercepted rather than left to the browser's default rich-paste behavior:

- **Rich paste (`Ctrl+V` / `Cmd+V`)** - HTML from the clipboard (e.g. copied from Word, Google Docs, or a web page) is normalized before insertion: conditional comments, MS Office XML namespaced elements (`<o:p>`, `<w:sdt>`, etc.), and `<meta>`/`<script>`/`<style>`/`<link>` tags are stripped, along with inline `style`/`class` attributes and `on*` event handlers. The cleaned markup is inserted at the caret and converted through the same markdown pipeline as any other edit.
- **Plain-text paste (hold `Shift` while pasting)** - Bypasses HTML normalization entirely and inserts the clipboard's plain text verbatim. Use this when the source formatting should not carry over at all.
- **No HTML on the clipboard** - Falls back automatically to inserting the plain text.
- **Host interception** - A component embedding the editor can claim the paste before any
  of the above runs via the `paste` event (see [Hosting the Editor in Another Input
  Surface](#hosting-the-editor-in-another-input-surface)).

> Pasted images are not yet supported and are dropped; this is a documented follow-up (see `htmlToMarkdown` has no `<img>` handling).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `string` | `""` | Markdown content (use v-model) |
| `placeholder` | `string` | `"Start typing..."` | Placeholder text when empty |
| `readonly` | `boolean` | `false` | Disables editing |
| `hideFooter` | `boolean` | `false` | Hides the character count footer |
| `tokenRenderers` | `TokenRenderer[]` | `[]` | Custom inline token renderers |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `string` | v-model update when content changes |
| `keydown` | `KeyboardEvent` | Fired before the editor handles the key. Call `preventDefault()` to suppress the editor's own handling. |
| `paste` | `ClipboardEvent` | Fired before the editor normalizes the paste. Call `preventDefault()` to suppress the editor's own handling. |

## Hosting the Editor in Another Input Surface

`keydown` and `paste` exist so a host component (a chat composer, a comment box, an inline
form field) can embed the editor and pre-empt its built-in behavior.

**The host's listener runs first.** Both events are emitted *before* the editor's own
handler runs, so calling `event.preventDefault()` inside the host listener suppresses the
editor's handling of that event entirely. Doing nothing leaves the editor's default
behavior exactly as it is — the events are purely observational unless you prevent them.

### Enter to Submit, Shift+Enter for a Newline

```vue
<template>
  <MarkdownEditor v-model="draft" @keydown="onEditorKeyDown" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MarkdownEditor } from 'danx-ui';

const draft = ref('');

function onEditorKeyDown(event: KeyboardEvent) {
  // Shift+Enter (and every other key) falls through to the editor untouched
  if (event.key !== 'Enter' || event.shiftKey) return;

  // Suppresses the editor's Enter handling (list continuation, table rows, code fences)
  event.preventDefault();
  submit(draft.value);
}
</script>
```

Without `preventDefault()`, the editor's Enter handling would still run after the host
listener — continuing a list, adding a table row, or opening a code fence.

### Intercepting a Paste

```vue
<template>
  <MarkdownEditor v-model="draft" @paste="onEditorPaste" />
</template>

<script setup lang="ts">
function onEditorPaste(event: ClipboardEvent) {
  const files = Array.from(event.clipboardData?.files ?? []);
  const text = event.clipboardData?.getData('text/plain') ?? '';

  // Turn pasted images (or an oversized text paste) into an attachment instead
  if (!files.length && text.length < 10_000) return; // editor pastes as usual

  event.preventDefault(); // suppresses the editor's HTML normalization
  attachAsFile(files, text);
}
</script>
```

### Notes

- Because `keydown` and `paste` are declared component emits, a host's `@keydown` /
  `@paste` no longer falls through as a native DOM listener on the editor's root element.
  This is what makes the host run *before* the editor instead of after it via bubbling.
- Both events fire only for the rich contenteditable surface. In raw markdown mode (the
  footer's raw toggle) the editor renders a plain `<pre>` and neither event is emitted.
- `preventDefault()` is the suppression signal. `stopPropagation()` does not suppress the
  editor, since the host listener already runs inside the editor's own handler.

## Slots

| Slot | Description |
|------|-------------|
| `badge` | Overlay content at top-right of editor (e.g., share button) |
| `footer` | Extra content in footer bar between char count and hotkey button |

## Themes

### Dark Theme (Default)

```vue
<MarkdownEditor v-model="content" />
```

### Light Theme

```vue
<MarkdownEditor v-model="content" class="theme-light" />
```

## Keyboard Shortcuts

### Formatting

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Bold |
| `Ctrl+I` | Italic |
| `Ctrl+E` | Inline code |
| `Ctrl+Shift+S` | Strikethrough |
| `Ctrl+Shift+H` | Highlight |

### Block Formatting

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+K` | Toggle code block |
| `Ctrl+Shift+.` | Toggle blockquote |
| `Ctrl+1` through `Ctrl+6` | Set heading level |
| `Ctrl+Shift+=` | Increase heading level |
| `Ctrl+Shift+-` | Decrease heading level |

### Lists

| Shortcut | Action |
|----------|--------|
| `Ctrl+Shift+8` | Toggle unordered list |
| `Ctrl+Shift+9` | Toggle ordered list |
| `Ctrl+Shift+0` | Toggle task list |
| `Tab` | Increase list indent |
| `Shift+Tab` | Decrease list indent |

### Insertion

| Shortcut | Action |
|----------|--------|
| `Ctrl+K` | Insert/edit link |
| `Ctrl+Shift+T` | Insert table |
| `Ctrl+Enter` | Insert horizontal rule |

### Navigation

| Shortcut | Action |
|----------|--------|
| `Enter` | New line / continue list |
| `Ctrl+Alt+L` | Cycle code block language |
| `Ctrl+?` | Toggle keyboard shortcuts help |
| Hold `Shift` while pasting | Paste as plain text, bypassing HTML normalization |

## Custom Token Renderers

Extend the editor with custom inline patterns:

```vue
<template>
  <MarkdownEditor v-model="content" :token-renderers="renderers" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MarkdownEditor, TokenRenderer } from 'danx-ui';
import MyBadge from './MyBadge.vue';

const content = ref('Check out {{42}} for details.');

const renderers: TokenRenderer[] = [
  {
    id: 'badge',
    pattern: /\{\{(\d+)\}\}/g,
    toHtml: (match, groups) =>
      `<span data-token-id="tok-${crypto.randomUUID()}"
             data-token-renderer="badge"
             data-token-groups='${JSON.stringify(groups)}'
             contenteditable="false">
        <span class="token-mount-point"></span>
      </span>`,
    component: MyBadge,
    getProps: (groups) => ({ id: Number(groups[0]) }),
    toMarkdown: (el) => `{{${el.getAttribute('data-token-groups')?.replace(/[\[\]"]/g, '') || ''}}}`,
  },
];
</script>
```

## Styling

### CSS Token Overrides

Override any token on the `.dx-markdown-editor` element or a parent:

```css
.my-editor {
  --dx-mde-bg: #0d1117;
  --dx-mde-color: #c9d1d9;
  --dx-mde-border-focus: rgba(56, 139, 253, 0.6);
}
```

### Available Tokens

#### Editor Chrome

| Token | Default (Dark) | Description |
|-------|----------------|-------------|
| `--dx-mde-bg` | `#1e1e1e` | Editor background |
| `--dx-mde-color` | `#d4d4d4` | Editor text color |
| `--dx-mde-caret` | `#d4d4d4` | Caret color |
| `--dx-mde-border-focus` | `rgba(86,156,214,0.6)` | Border on focus |
| `--dx-mde-border-hover` | `rgba(86,156,214,0.3)` | Border on hover |
| `--dx-mde-placeholder` | `#6b7280` | Placeholder text color |
| `--dx-mde-footer-bg` | `#252526` | Footer background |

#### Popover / Overlay

| Token | Default (Dark) | Description |
|-------|----------------|-------------|
| `--dx-mde-overlay-bg` | `rgba(0,0,0,0.3)` | Overlay backdrop |
| `--dx-mde-popover-bg` | `#2d2d2d` | Popover background |
| `--dx-mde-popover-border` | `#404040` | Popover border |
| `--dx-mde-popover-shadow` | `rgba(0,0,0,0.5)` | Popover shadow |
| `--dx-mde-popover-text` | `#d4d4d4` | Popover text |

#### Inputs and Buttons

| Token | Default (Dark) | Description |
|-------|----------------|-------------|
| `--dx-mde-input-bg` | `#1e1e1e` | Input background |
| `--dx-mde-input-border` | `#404040` | Input border |
| `--dx-mde-input-border-focus` | `#60a5fa` | Input border on focus |
| `--dx-mde-btn-primary-bg` | `#3b82f6` | Primary button background |
| `--dx-mde-btn-primary-hover` | `#2563eb` | Primary button hover |
| `--dx-mde-btn-cancel-border` | `#404040` | Cancel button border |

#### Code Blocks

| Token | Default (Dark) | Description |
|-------|----------------|-------------|
| `--dx-mde-codeblock-bg` | `#0d1117` | Code block background |
| `--dx-mde-codeblock-border` | `#30363d` | Code block border |
| `--dx-mde-codeblock-footer-bg` | `#161b22` | Code block footer |

#### Content Rendering

| Token | Default (Dark) | Description |
|-------|----------------|-------------|
| `--dx-mde-content-code-bg` | `rgba(255,255,255,0.1)` | Inline code background |
| `--dx-mde-content-link` | `#60a5fa` | Link color |
| `--dx-mde-content-blockquote-border` | `rgba(255,255,255,0.3)` | Blockquote border |
| `--dx-mde-content-table-border` | `rgba(255,255,255,0.2)` | Table border |

## Readonly Mode

```vue
<MarkdownEditor v-model="content" readonly />
```

In readonly mode, the editor renders the markdown as styled HTML but disables editing, hides the border interaction states, and suppresses the context menu.

## Size Constraints

Control the content area size via CSS tokens:

```css
.my-editor {
  --dx-mde-min-height: 200px;
  --dx-mde-max-height: 500px;
}
```
