<!--
/**
 * DanxCodeDiff Component
 *
 * Computes a line-level diff between two text/code values and renders it
 * either unified (single column, +/- prefixed lines) or split (two aligned
 * columns, old | new). Reuses CodeViewer's syntax highlighter per line and
 * the shared --dx-variant-* token system for added/removed line coloring.
 *
 * ## Props
 * | Prop      | Type                | Default    | Description                          |
 * |-----------|---------------------|------------|---------------------------------------|
 * | oldValue  | string              | (required) | Original ("before") text/code         |
 * | newValue  | string              | (required) | Updated ("after") text/code           |
 * | format    | CodeFormat          | "text"     | Syntax highlighting language          |
 * | mode      | "unified"/"split"   | "unified"  | Layout mode                           |
 * | label     | string              | ""         | Label above the diff                  |
 * | theme     | "dark"/"light"      | "dark"     | Color theme                           |
 *
 * ## Usage Examples
 *
 * Unified diff:
 *   <DanxCodeDiff :old-value="before" :new-value="after" format="json" />
 *
 * Split (side-by-side) diff:
 *   <DanxCodeDiff :old-value="before" :new-value="after" format="yaml" mode="split" />
 *
 * ## CSS Tokens
 * See `code-viewer-tokens.css` for `--dx-code-diff-*` tokens.
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import DanxScroll from "../scroll/DanxScroll.vue";
import { highlightSyntax } from "../../shared/syntax-highlighting";
import { computeLineDiff, computeSplitDiff } from "./diffUtils";
import type { CodeFormat, DanxCodeDiffProps, DiffLine } from "./types";

const props = withDefaults(defineProps<DanxCodeDiffProps>(), {
  format: "text",
  mode: "unified",
  label: "",
  theme: "dark",
});

function splitHighlighted(value: string, format: CodeFormat): string[] {
  return highlightSyntax(value, { format }).split("\n");
}

const oldHtmlLines = computed(() => splitHighlighted(props.oldValue, props.format));
const newHtmlLines = computed(() => splitHighlighted(props.newValue, props.format));

const unifiedLines = computed(() => computeLineDiff(props.oldValue, props.newValue));
const splitRows = computed(() => computeSplitDiff(props.oldValue, props.newValue));

function htmlFor(line: DiffLine): string {
  if (line.type === "added") {
    return newHtmlLines.value[line.newLineNumber! - 1]!;
  }
  return oldHtmlLines.value[line.oldLineNumber! - 1]!;
}

function prefixFor(type: DiffLine["type"]): string {
  if (type === "added") return "+";
  if (type === "removed") return "-";
  return " ";
}
</script>

<template>
  <div class="dx-code-diff dx-code-viewer" :class="theme === 'light' ? 'theme-light' : ''">
    <div v-if="label" class="mb-2 text-sm flex-shrink-0">{{ label }}</div>

    <DanxScroll
      v-if="mode === 'unified'"
      direction="both"
      size="xs"
      class="min-h-0 overflow-hidden"
    >
      <div class="diff-content">
        <code :class="'language-' + format">
          <div
            v-for="(line, idx) in unifiedLines"
            :key="idx"
            class="diff-line"
            :class="'diff-line--' + line.type"
          >
            <span class="diff-line-prefix">{{ prefixFor(line.type) }}</span>
            <span class="diff-line-code" v-html="htmlFor(line)"></span>
          </div>
        </code>
      </div>
    </DanxScroll>

    <div v-else class="diff-split">
      <DanxScroll direction="both" size="xs" class="min-h-0 overflow-hidden diff-split-col">
        <div class="diff-content">
          <code :class="'language-' + format">
            <div
              v-for="(row, idx) in splitRows"
              :key="idx"
              class="diff-line"
              :class="row.left ? 'diff-line--' + row.left.type : 'diff-line--empty'"
            >
              <span class="diff-line-code" v-html="row.left ? htmlFor(row.left) : ''"></span>
            </div>
          </code>
        </div>
      </DanxScroll>
      <DanxScroll direction="both" size="xs" class="min-h-0 overflow-hidden diff-split-col">
        <div class="diff-content">
          <code :class="'language-' + format">
            <div
              v-for="(row, idx) in splitRows"
              :key="idx"
              class="diff-line"
              :class="row.right ? 'diff-line--' + row.right.type : 'diff-line--empty'"
            >
              <span class="diff-line-code" v-html="row.right ? htmlFor(row.right) : ''"></span>
            </div>
          </code>
        </div>
      </DanxScroll>
    </div>
  </div>
</template>
