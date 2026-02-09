<template>
  <div
    ref="containerRef"
    class="dx-markdown-editor-content dx-markdown-content"
    :class="{ 'is-readonly': readonly, 'is-empty': isContentEmpty }"
    :contenteditable="!readonly"
    :data-placeholder="placeholder"
    @input="onInput"
    @keydown="$emit('keydown', $event)"
    @blur="$emit('blur')"
    @click="handleClick"
    v-html="html"
  />
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { findLinkAncestor } from "./blockUtils";

export interface MarkdownEditorContentProps {
  html: string;
  readonly?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<MarkdownEditorContentProps>(), {
  readonly: false,
  placeholder: "Start typing..."
});

const emit = defineEmits<{
  input: [];
  keydown: [event: KeyboardEvent];
  blur: [];
}>();

const containerRef = ref<HTMLElement | null>(null);
const isContentEmpty = ref(true);

/**
 * Check if the editor content is empty by examining the actual DOM text content.
 * This is needed because contenteditable changes the DOM directly without updating props.
 */
function checkIfEmpty(): void {
  if (containerRef.value) {
    const textContent = containerRef.value.textContent?.trim() || "";
    isContentEmpty.value = textContent.length === 0;
  }
}

/**
 * Handle input events - check if content is empty and emit the input event.
 */
function onInput(): void {
  checkIfEmpty();
  emit("input");
}

// Watch for external HTML changes (e.g., from parent component)
watch(() => props.html, () => {
  nextTick(() => checkIfEmpty());
}, { immediate: true });

/**
 * Handle clicks in the editor content.
 * Ctrl+Click (or Cmd+Click on Mac) opens links in a new tab.
 */
function handleClick(event: MouseEvent): void {
  // Check if Ctrl (Windows/Linux) or Cmd (Mac) is held
  const isModifierHeld = event.ctrlKey || event.metaKey;
  if (!isModifierHeld) return;

  // Find if the click was on or inside a link
  if (!containerRef.value) return;
  const link = findLinkAncestor(event.target as Node, containerRef.value);
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  // Prevent default behavior and open the link in a new tab
  event.preventDefault();
  event.stopPropagation();
  window.open(href, "_blank", "noopener,noreferrer");
}

// Expose containerRef for parent component
defineExpose({ containerRef });
</script>

<style>
.dx-markdown-editor-content {
  min-height: 100px;
  outline: none;
  cursor: text;
  border: 2px solid transparent;
  border-radius: 0.375rem 0.375rem 0 0;
  padding: 1rem;
  background-color: #1e1e1e;
  color: #d4d4d4;
  transition: border-color 0.2s ease;
  overflow: auto;
  caret-color: #d4d4d4;
}

.dx-markdown-editor-content:focus {
  border-color: rgba(86, 156, 214, 0.6);
}

.dx-markdown-editor-content:hover:not(:focus):not(.is-readonly) {
  border-color: rgba(86, 156, 214, 0.3);
}

.dx-markdown-editor-content.is-readonly {
  cursor: default;
  border-color: transparent;
}

/* Placeholder styling when empty */
.dx-markdown-editor-content.is-empty::before {
  content: attr(data-placeholder);
  color: #6b7280;
  pointer-events: none;
  position: absolute;
}

.dx-markdown-editor-content.is-empty {
  position: relative;
}

/* Link styling - show pointer cursor and hint for Ctrl+Click */
.dx-markdown-editor-content a {
  cursor: pointer;
  position: relative;
}

.dx-markdown-editor-content a:hover::after {
  content: "Ctrl+Click to open";
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: #374151;
  color: #d1d5db;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  white-space: nowrap;
  z-index: 10;
  pointer-events: none;
  opacity: 0;
  animation: fadeIn 0.2s ease 0.5s forwards;
}

@keyframes fadeIn {
  to {
    opacity: 1;
  }
}

/* Alternating styles for nested ordered lists */
/* Level 1: decimal (1, 2, 3) */
.dx-markdown-editor-content ol {
  list-style-type: decimal;
}

/* Level 2: lower-roman (i, ii, iii) */
.dx-markdown-editor-content ol ol {
  list-style-type: lower-roman;
}

/* Level 3: lower-alpha (a, b, c) */
.dx-markdown-editor-content ol ol ol {
  list-style-type: lower-alpha;
}

/* Level 4+: cycle back to decimal */
.dx-markdown-editor-content ol ol ol ol {
  list-style-type: decimal;
}

.dx-markdown-editor-content ol ol ol ol ol {
  list-style-type: lower-roman;
}

.dx-markdown-editor-content ol ol ol ol ol ol {
  list-style-type: lower-alpha;
}

/* Alternating styles for nested unordered lists */
/* Level 1: disc */
.dx-markdown-editor-content ul {
  list-style-type: disc;
}

/* Level 2: circle */
.dx-markdown-editor-content ul ul {
  list-style-type: circle;
}

/* Level 3: square */
.dx-markdown-editor-content ul ul ul {
  list-style-type: square;
}

/* Level 4+: cycle back to disc */
.dx-markdown-editor-content ul ul ul ul {
  list-style-type: disc;
}

.dx-markdown-editor-content ul ul ul ul ul {
  list-style-type: circle;
}

.dx-markdown-editor-content ul ul ul ul ul ul {
  list-style-type: square;
}

/* Code block wrapper styling - distinct background to separate from editor content */
.dx-markdown-editor-content .code-block-wrapper {
  background: #0d1117;
  border-radius: 0.375rem;
  margin: 0.5rem 0;
  border: 1px solid #30363d;
}

/* Override CodeViewer backgrounds to be transparent so wrapper controls it */
.dx-markdown-editor-content .code-block-wrapper .dx-code-viewer .code-content {
  background: transparent;
  border-radius: 0.375rem 0.375rem 0 0;
}

.dx-markdown-editor-content .code-block-wrapper .dx-code-viewer .code-footer {
  background: #161b22;
  border-radius: 0 0 0.375rem 0.375rem;
}

/* ==========================================
   LIGHT THEME VARIANT
   ========================================== */
.dx-markdown-editor.theme-light .dx-markdown-editor-content {
  background-color: #f8fafc;
  color: #1e293b;
  caret-color: #1e293b;
}

.dx-markdown-editor.theme-light .dx-markdown-editor-content:focus {
  border-color: rgba(14, 165, 233, 0.6);
}

.dx-markdown-editor.theme-light .dx-markdown-editor-content:hover:not(:focus):not(.is-readonly) {
  border-color: rgba(14, 165, 233, 0.3);
}

/* Placeholder styling - light theme */
.dx-markdown-editor.theme-light .dx-markdown-editor-content.is-empty::before {
  color: #94a3b8;
}

/* Link tooltip - light theme */
.dx-markdown-editor.theme-light .dx-markdown-editor-content a:hover::after {
  background: #e2e8f0;
  color: #1e293b;
}

/* Code block wrapper - light theme */
.dx-markdown-editor.theme-light .dx-markdown-editor-content .code-block-wrapper {
  background: #f1f5f9;
  border-color: #e2e8f0;
}

.dx-markdown-editor.theme-light .dx-markdown-editor-content .code-block-wrapper .dx-code-viewer .code-footer {
  background: #e2e8f0;
}
</style>
