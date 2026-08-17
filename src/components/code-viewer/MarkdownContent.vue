<!--
/**
 * MarkdownContent Component
 *
 * A read-only markdown renderer. Tokenizes a markdown string with danx-ui's
 * zero-dependency shared markdown parser and renders the result as real DOM via
 * Vue templates — not a single `v-html` blob. Fenced and auto-detected code
 * blocks become nested CodeViewer instances, so embedded code gets full syntax
 * highlighting, copy support, and JSON/YAML format switching for free.
 *
 * This is the lightest of the three markdown-capable components. It has no
 * contenteditable surface, no toolbar, no context menu, and no popovers — reach
 * for it when you are displaying markdown (chat messages, agent output, release
 * notes, docs panes) rather than authoring it. Use MarkdownEditor when the user
 * must be able to type, and CodeViewer with `format="markdown"` when you want
 * the framed code-viewer chrome (label, footer, copy button, collapse) around
 * the rendered markdown.
 *
 * ## Features
 * - Headings (`#` … `######`, plus setext `===` / `---` underlines)
 * - Paragraphs with soft line breaks (newlines become `<br />`)
 * - Fenced code blocks (```lang) rendered as nested CodeViewer instances
 * - Auto-detected (unfenced) JSON / YAML blocks, also via CodeViewer
 * - Blockquotes, rendered recursively so nested markdown inside them works
 * - Unordered, ordered (with `start` offset), and arbitrarily nested lists
 * - Task lists (`- [ ]` / `- [x]`) as disabled checkboxes
 * - Tables with per-column left/center/right alignment
 * - Definition lists (`Term` followed by `: Definition`)
 * - Horizontal rules (`---`, `***`, `___`)
 * - Footnotes (`[^id]` references collected into a footnotes section with backrefs)
 * - Inline: bold, italic, bold+italic, inline code, links, reference links,
 *   autolinks, images, strikethrough, highlight, superscript, subscript, escapes
 * - Persisted JSON/YAML format preference for auto-detected blocks
 * - No markdown library, and no @vueuse/core or luxon in its import graph
 *   (it shares CodeViewer's `yaml` dependency for structured-data blocks)
 *
 * ## Props
 * | Prop              | Type               | Default | Description                                      |
 * |-------------------|--------------------|---------|--------------------------------------------------|
 * | content           | string             | ""      | Raw markdown string to render                     |
 * | defaultCodeFormat | "json" \| "yaml"   | -       | Default format for embedded structured-data blocks |
 *
 * ## Events
 * None. The component is entirely read-only.
 *
 * ## Slots
 * None. All output is derived from the `content` prop.
 *
 * ## Format Preference
 * Fenced blocks always render in their declared language. Auto-detected
 * (unfenced) JSON/YAML blocks instead honour the user's persisted preference
 * from localStorage (`dx-structured-data-format`, see
 * shared/useStructuredDataPreference.ts). Switching format on an auto-detected
 * block writes the preference, so every auto-detected block in the app follows
 * suit on the next render.
 *
 * ## CSS Tokens
 * No component-specific tokens — everything is inherited:
 * - Nested code blocks use the full `--dx-code-viewer-*` set (code-viewer-tokens.css)
 * - The rendered markdown elements (headings, code spans, blockquotes, links,
 *   rules, marks, tables) use the `--dx-mde-content-*` set defined in
 *   markdown-editor-tokens.css and applied by the shared `.dx-markdown-content`
 *   theme block in markdown-editor.css
 *
 * Both sets are plain custom properties, so overriding them on any ancestor
 * element restyles the rendered markdown.
 *
 * ## Usage Examples
 *
 * Basic rendering:
 *   <MarkdownContent :content="message" />
 *
 * Prefer YAML for embedded structured-data blocks:
 *   <MarkdownContent :content="mdString" default-code-format="yaml" />
 *
 * Rendering a list of chat messages cheaply:
 *   <div v-for="m in messages" :key="m.id">
 *     <MarkdownContent :content="m.body" />
 *   </div>
 *
 * Restyling embedded code blocks via inherited tokens:
 *   <MarkdownContent class="docs-body" :content="doc" />
 *   <style>
 *     .docs-body { --dx-code-viewer-font-size: 0.8125rem; }
 *   </style>
 *
 * ## Security
 * Markdown text is HTML-escaped before parsing, but link and image URL schemes
 * are not currently validated. Sanitize untrusted markdown before passing it in.
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import {
  tokenizeBlocks,
  parseInline,
  renderMarkdown,
  getFootnotes,
  resetParserState,
} from "../../shared/markdown";
import type { BlockToken, ListItem } from "../../shared/markdown";
import CodeViewer from "./CodeViewer.vue";
import { normalizeLanguage } from "./normalizeLanguage";
import type { CodeFormat, MarkdownContentProps } from "./types";
import {
  getPreferredStructuredDataFormat,
  setPreferredStructuredDataFormat,
  isStructuredDataFormat,
} from "../../shared/useStructuredDataPreference";

const props = withDefaults(defineProps<MarkdownContentProps>(), {
  content: "",
});

/**
 * Resolve the display format for a code block token.
 * For auto-detected blocks, applies the user's persisted preference if set.
 */
function resolveCodeFormat(token: { language: string; autoDetected?: boolean }): CodeFormat {
  const normalized = normalizeLanguage(token.language) as CodeFormat;
  if (token.autoDetected && isStructuredDataFormat(normalized)) {
    return getPreferredStructuredDataFormat() ?? normalized;
  }
  return normalized;
}

/**
 * Handle format changes from CodeViewer. Persists the preference for auto-detected blocks.
 */
function onCodeFormatUpdate(format: CodeFormat, autoDetected?: boolean) {
  if (autoDetected && isStructuredDataFormat(format)) {
    setPreferredStructuredDataFormat(format);
  }
}

const tokens = computed<BlockToken[]>(() => {
  if (!props.content) return [];
  resetParserState();
  return tokenizeBlocks(props.content);
});

const footnotes = computed(() => {
  // Force dependency on tokens to ensure tokenizeBlocks runs first
  tokens.value;
  return getFootnotes();
});

const hasFootnotes = computed(() => Object.keys(footnotes.value).length > 0);

const sortedFootnotes = computed(() => {
  return Object.entries(footnotes.value)
    .sort((a, b) => a[1].index - b[1].index)
    .map(([id, fn]) => ({ id, content: fn.content, index: fn.index }));
});

function parseInlineContent(text: string): string {
  return parseInline(text, true);
}

function renderListItem(item: ListItem): string {
  let html = parseInline(item.content, true);
  if (item.children && item.children.length > 0) {
    for (const child of item.children) {
      if (child.type === "ul") {
        const items = child.items.map((i) => `<li>${renderListItem(i)}</li>`).join("");
        html += `<ul>${items}</ul>`;
      } else if (child.type === "ol") {
        const items = child.items.map((i) => `<li>${renderListItem(i)}</li>`).join("");
        const startAttr = child.start !== 1 ? ` start="${child.start}"` : "";
        html += `<ol${startAttr}>${items}</ol>`;
      }
    }
  }
  return html;
}

function renderBlockquote(content: string): string {
  return renderMarkdown(content, { preserveState: true });
}
</script>

<template>
  <div class="dx-markdown-content">
    <template v-for="(token, index) in tokens" :key="index">
      <!-- Headings -->
      <component
        v-if="token.type === 'heading'"
        :is="'h' + token.level"
        v-html="parseInlineContent(token.content)"
      />

      <!-- Code blocks with syntax highlighting -->
      <CodeViewer
        v-else-if="token.type === 'code_block'"
        :model-value="token.content"
        :format="resolveCodeFormat(token)"
        :default-code-format="defaultCodeFormat"
        :can-edit="false"
        :collapsible="false"
        hide-footer
        allow-any-language
        class="markdown-code-block"
        @update:format="onCodeFormatUpdate($event, token.autoDetected)"
      />

      <!-- Blockquotes (recursive) -->
      <blockquote
        v-else-if="token.type === 'blockquote'"
        v-html="renderBlockquote(token.content)"
      />

      <!-- Unordered lists -->
      <ul v-else-if="token.type === 'ul'">
        <li
          v-for="(item, itemIndex) in token.items"
          :key="itemIndex"
          v-html="renderListItem(item)"
        />
      </ul>

      <!-- Ordered lists -->
      <ol v-else-if="token.type === 'ol'" :start="token.start">
        <li
          v-for="(item, itemIndex) in token.items"
          :key="itemIndex"
          v-html="renderListItem(item)"
        />
      </ol>

      <!-- Task lists -->
      <ul v-else-if="token.type === 'task_list'" class="task-list">
        <li v-for="(item, itemIndex) in token.items" :key="itemIndex" class="task-list-item">
          <input type="checkbox" :checked="item.checked" disabled />
          <span v-html="parseInlineContent(item.content)" />
        </li>
      </ul>

      <!-- Tables -->
      <table v-else-if="token.type === 'table'">
        <thead>
          <tr>
            <th
              v-for="(header, hIndex) in token.headers"
              :key="hIndex"
              :style="token.alignments[hIndex] ? { textAlign: token.alignments[hIndex] } : {}"
              v-html="parseInlineContent(header)"
            />
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, rIndex) in token.rows" :key="rIndex">
            <td
              v-for="(cell, cIndex) in row"
              :key="cIndex"
              :style="token.alignments[cIndex] ? { textAlign: token.alignments[cIndex] } : {}"
              v-html="parseInlineContent(cell)"
            />
          </tr>
        </tbody>
      </table>

      <!-- Definition lists -->
      <dl v-else-if="token.type === 'dl'">
        <template v-for="(item, itemIndex) in token.items" :key="itemIndex">
          <dt v-html="parseInlineContent(item.term)" />
          <dd
            v-for="(def, defIndex) in item.definitions"
            :key="'def-' + defIndex"
            v-html="parseInlineContent(def)"
          />
        </template>
      </dl>

      <!-- Horizontal rules -->
      <hr v-else-if="token.type === 'hr'" />

      <!-- Paragraphs -->
      <p
        v-else-if="token.type === 'paragraph'"
        v-html="parseInlineContent(token.content).replace(/\n/g, '<br />')"
      />
    </template>

    <!-- Footnotes section -->
    <section v-if="hasFootnotes" class="footnotes">
      <hr />
      <ol class="footnote-list">
        <li v-for="fn in sortedFootnotes" :key="fn.id" :id="'fn-' + fn.id" class="footnote-item">
          <span v-html="parseInlineContent(fn.content)" />
          <a :href="'#fnref-' + fn.id" class="footnote-backref">&#8617;</a>
        </li>
      </ol>
    </section>
  </div>
</template>
