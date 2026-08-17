<script setup lang="ts">
import { MarkdownContent } from "danx-ui";

const content = `## Headings

### Third level

#### Fourth level

## Lists

- Unordered item
- Another item
  - Nested child
    - Deeply nested child

1. First
2. Second
   1. Sub-step one
   2. Sub-step two

- [x] Task lists render as disabled checkboxes
- [ ] Unchecked items too

## Table

| Component        | Editable | Weight |
|:-----------------|:--------:|-------:|
| MarkdownContent  | No       | Light  |
| MarkdownEditor   | Yes      | Heavy  |
| CodeViewer       | Optional | Medium |

## Definition List

Tokenizer
: Splits raw markdown into block tokens.

Renderer
: Turns block tokens into real DOM via Vue templates.

## Blockquote

> Blockquotes render their **inner markdown** recursively,
> so \`code\`, *emphasis*, and lists all work inside them.

---

## Footnotes

Footnotes are collected into a section at the end[^1] with backrefs[^2].

[^1]: Sorted by the order they are referenced.
[^2]: Click the arrow to jump back to the reference.
`;
</script>

<template>
  <MarkdownContent :content="content" />
</template>
