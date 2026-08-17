# MarkdownContent Component

A read-only markdown renderer. Give it a markdown string, get real DOM — headings, lists, tables, blockquotes, footnotes, and syntax-highlighted code blocks — with no editing surface, no toolbar, and no external markdown library.

## Features

- **No Markdown Library** - Uses danx-ui's own tokenizer; no `marked`, and no `@vueuse/core` or `luxon` anywhere in its import graph (it shares CodeViewer's `yaml` dependency for structured-data blocks)
- **Real DOM, Not One `v-html` Blob** - Block structure is rendered through Vue templates, so headings, lists, tables, and rules are genuine elements
- **Code Blocks via CodeViewer** - Fenced blocks become nested CodeViewer instances with syntax highlighting and a copy button
- **Auto-Detected JSON/YAML** - Unfenced structured data is detected and rendered as a code block, honoring a persisted format preference
- **Full Block Coverage** - Headings, paragraphs, blockquotes, lists (ordered / unordered / task / nested), tables with alignment, definition lists, horizontal rules, footnotes
- **Full Inline Coverage** - Bold, italic, bold+italic, inline code, links, reference links, autolinks, images, strikethrough, highlight, superscript, subscript, escapes
- **Light Per Instance** - No contenteditable, no context menu, no popovers — cheap enough to render hundreds of blocks (chat transcripts, agent output, log panes)

## Basic Usage

```vue
<template>
  <MarkdownContent :content="message" />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { MarkdownContent } from "danx-ui";

const message = ref("# Hello\n\nSome **bold** text and a [link](https://example.com).");
</script>
```

### Rendering a list of messages

```vue
<template>
  <div v-for="m in messages" :key="m.id" class="message">
    <MarkdownContent :content="m.body" />
  </div>
</template>
```

### Preferring YAML for embedded structured data

```vue
<MarkdownContent :content="agentOutput" default-code-format="yaml" />
```

## Props

| Prop                | Type               | Default | Description                                                                              |
| ------------------- | ------------------ | ------- | ---------------------------------------------------------------------------------------- |
| `content`           | `string`           | `""`    | Raw markdown string to render                                                            |
| `defaultCodeFormat` | `"json" \| "yaml"` | -       | Default format passed to nested CodeViewer instances for embedded structured-data blocks |

## Events

None. The component is entirely read-only — it never mutates or emits its content.

## Slots

None. All output is derived from `content`.

## What It Renders

### Blocks

| Markdown                         | Rendered As                                                                             |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| `# Title` … `###### Title`       | `<h1>` … `<h6>`                                                                         |
| Setext underlines (`===`, `---`) | `<h1>` / `<h2>`                                                                         |
| Plain prose                      | `<p>`, with single newlines becoming `<br />`                                           |
| ` ```lang … ``` `                | Nested `<CodeViewer>` in `lang`                                                         |
| Unfenced JSON / YAML             | Nested `<CodeViewer>` (auto-detected, see below)                                        |
| `> quoted`                       | `<blockquote>` with its inner markdown rendered recursively                             |
| `- item` / `* item` / `+ item`   | `<ul><li>`                                                                              |
| `1. item`                        | `<ol><li>`, honoring a non-1 start number                                               |
| Indented sub-items               | Nested `<ul>` / `<ol>` inside the parent `<li>`, to any depth                           |
| `- [ ]` / `- [x]`                | `<ul class="task-list">` with disabled checkboxes                                       |
| `\| a \| b \|` + `\|---\|`       | `<table>` with `thead` / `tbody` and per-column `text-align`                            |
| `Term` + `: Definition`          | `<dl><dt><dd>`                                                                          |
| `---`, `***`, `___`              | `<hr>`                                                                                  |
| `[^1]` + `[^1]: note`            | A `.footnotes` section with an ordered list and `↩` backrefs, sorted by reference order |

### Inline

| Markdown                     | Rendered As           |
| ---------------------------- | --------------------- |
| `**bold**`, `__bold__`       | `<strong>`            |
| `*italic*`, `_italic_`       | `<em>`                |
| `***both***`                 | `<strong><em>`        |
| `` `code` ``                 | `<code>`              |
| `[text](url)`, `[text][ref]` | `<a href>`            |
| `<https://example.com>`      | Autolinked `<a href>` |
| `![alt](url)`                | `<img src alt>`       |
| `~~struck~~`                 | `<del>`               |
| `==highlight==`              | `<mark>`              |
| `X^2^`, `H~2~O`              | `<sup>` / `<sub>`     |
| `\*`, `\_`, `\~`             | The literal character |

## Code Blocks and the Format Preference

Code blocks are rendered as nested `CodeViewer` instances configured for display only: `canEdit` false, `collapsible` false, footer hidden, `allowAnyLanguage` on. Languages are normalized (`js` → `javascript`, `yml` → `yaml`, and so on) before being handed to the viewer.

Blocks arrive two ways, and they behave differently:

| Block kind                                                                 | Format used                                                                   |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| **Fenced** (` ```json `)                                                   | Always the declared language. Never overridden.                               |
| **Auto-detected** (a bare JSON object or YAML mapping between blank lines) | The user's persisted preference if one exists, otherwise the detected format. |

The preference is stored in `localStorage` under the key `dx-structured-data-format` as a JSON-encoded `"json"` or `"yaml"` (see `shared/useStructuredDataPreference.ts`). When a reader clicks the language badge on an **auto-detected** block and switches JSON ⇄ YAML, that choice is written to the preference and every auto-detected block in the app follows it on the next render. Switching format on a _fenced_ block is a local, one-off view change and is never persisted.

This is what makes a stream of agent or API output feel consistent: the reader picks JSON or YAML once, and all the loosely-formatted payloads in the transcript settle into that shape.

`defaultCodeFormat` is passed straight through to each nested CodeViewer and controls its own default for markdown-nested code; it does not override the persisted preference.

## CSS Tokens

MarkdownContent defines **no tokens of its own**. It inherits two sets, both plain custom properties that can be overridden on any ancestor element.

### Rendered markdown elements

Applied by the shared `.dx-markdown-content` theme block (`markdown-editor.css`), defaults in `markdown-editor-tokens.css`:

| Token                                                              | Styles                     |
| ------------------------------------------------------------------ | -------------------------- |
| `--dx-mde-color`                                                   | Body text color            |
| `--dx-mde-content-code-bg` / `--dx-mde-content-code-color`         | Inline `<code>` spans      |
| `--dx-mde-content-pre-bg`                                          | `<pre>` background         |
| `--dx-mde-content-blockquote-border` / `-bg` / `-text`             | Blockquotes                |
| `--dx-mde-content-link`                                            | Link color                 |
| `--dx-mde-content-hr`                                              | Horizontal rule color      |
| `--dx-mde-content-mark-bg`                                         | `==highlight==` background |
| `--dx-mde-content-table-border` / `-table-th-bg` / `-table-stripe` | Table chrome               |

### Nested code blocks

Embedded code blocks inherit the entire `--dx-code-viewer-*` set (see [code-viewer.md](./code-viewer.md) and `code-viewer-tokens.css`) — font family, font size, line height, padding, radius, and all content colors.

```vue
<template>
  <MarkdownContent class="docs-body" :content="doc" />
</template>

<style>
.docs-body {
  --dx-mde-content-link: #2563eb;
  --dx-code-viewer-font-size: 0.8125rem;
}
</style>
```

The token defaults sit on `:root` and are tuned for a dark surface. The light palette in `markdown-editor-tokens.css` is scoped to `.dx-markdown-editor.theme-light`, so a standalone MarkdownContent on a light background should override the `--dx-mde-content-*` tokens it cares about (as above) rather than expecting an automatic light theme.

## MarkdownContent vs MarkdownEditor vs CodeViewer

All three can put rendered markdown on the screen. They are not interchangeable.

|                         | MarkdownContent                                                                                                                 | MarkdownEditor                                     | CodeViewer (`format="markdown"`)                                                                                     |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Purpose**             | Display markdown                                                                                                                | Author markdown                                    | Display markdown inside code-viewer chrome                                                                           |
| **Editable**            | Never                                                                                                                           | Yes (WYSIWYG contenteditable)                      | Optional, edits the raw markdown source                                                                              |
| **Chrome**              | None — bare rendered content                                                                                                    | Toolbar, footer, context menu, link/table popovers | Label, footer with char count and copy, collapse toggle                                                              |
| **Emits**               | Nothing                                                                                                                         | `update:modelValue`, `keydown`, `paste`            | `update:modelValue`, `update:format`, `update:editable`, …                                                           |
| **Weight per instance** | Lightest                                                                                                                        | Heaviest                                           | Middle                                                                                                               |
| **Reach for it when**   | Rendering many blocks of markdown you did not author in place: chat messages, agent output, release notes, docs panes, previews | The user must type markdown                        | You want a framed, copyable, collapsible block and the markdown is one of several formats the same viewer might show |

Rules of thumb:

- **Never use `MarkdownEditor` with `readonly` as a renderer.** It still mounts a contenteditable surface, a context menu, and popovers per instance. It is an editor wearing a costume; in a list of fifty messages the cost is real.
- **Use `CodeViewer` when markdown is one of several possible formats** for the same slot (a payload viewer that might show JSON, YAML, or markdown). Its language badge lets the reader switch.
- **Use `MarkdownContent` everywhere else you are only showing markdown.** It is what `CodeViewer` itself renders internally for `format="markdown"`, minus the frame.

## Security

Markdown text is HTML-escaped before parsing, so raw HTML in the source cannot inject elements. However, link and image **URL schemes are not currently validated** — a `[click](javascript:…)` link renders with that href intact. Sanitize or allowlist untrusted markdown before passing it to `content`.

## TypeScript Types

```typescript
interface MarkdownContentProps {
  /** Raw markdown string to render. */
  content: string;
  /** Default format for embedded code blocks. */
  defaultCodeFormat?: "json" | "yaml";
}
```

## Related

- [code-viewer.md](./code-viewer.md) — the component that renders embedded code blocks
- [markdown-editor.md](./markdown-editor.md) — the authoring counterpart
