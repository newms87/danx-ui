<!--
/**
 * MarkdownContent Component
 *
 * Renders parsed markdown as structured HTML using Vue template rendering.
 * Supports headings, code blocks (via CodeViewer), blockquotes, lists (ordered,
 * unordered, task lists), tables, definition lists, horizontal rules, footnotes,
 * and inline formatting (bold, italic, links, images, code spans).
 *
 * Uses the shared markdown tokenizer/parser from danx-ui's shared utilities.
 * Code blocks are rendered as nested CodeViewer instances.
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

const props = withDefaults(defineProps<MarkdownContentProps>(), {
  content: "",
});

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
        :format="normalizeLanguage(token.language) as CodeFormat"
        :default-code-format="defaultCodeFormat"
        :can-edit="false"
        :collapsible="false"
        hide-footer
        allow-any-language
        class="markdown-code-block"
      />

      <!-- Blockquotes (recursive) -->
      <blockquote
        v-else-if="token.type === 'blockquote'"
        v-html="renderBlockquote(token.content)"
      />

      <!-- Unordered lists -->
      <ul v-else-if="token.type === 'ul'">
        <li v-for="(item, itemIndex) in token.items" :key="itemIndex">
          <span v-html="parseInlineContent(item.content)" />
          <template v-if="item.children && item.children.length > 0">
            <template v-for="(child, childIndex) in item.children" :key="'child-' + childIndex">
              <ul v-if="child.type === 'ul'">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ul>
              <ol v-else-if="child.type === 'ol'" :start="child.start">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ol>
            </template>
          </template>
        </li>
      </ul>

      <!-- Ordered lists -->
      <ol v-else-if="token.type === 'ol'" :start="token.start">
        <li v-for="(item, itemIndex) in token.items" :key="itemIndex">
          <span v-html="parseInlineContent(item.content)" />
          <template v-if="item.children && item.children.length > 0">
            <template v-for="(child, childIndex) in item.children" :key="'child-' + childIndex">
              <ul v-if="child.type === 'ul'">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ul>
              <ol v-else-if="child.type === 'ol'" :start="child.start">
                <li
                  v-for="(nestedItem, nestedIndex) in child.items"
                  :key="nestedIndex"
                  v-html="renderListItem(nestedItem)"
                />
              </ol>
            </template>
          </template>
        </li>
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
