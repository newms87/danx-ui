<script setup lang="ts">
/**
 * MarkdownEditorContent - Contenteditable container for the markdown editor
 *
 * Wraps a contenteditable div that displays rendered HTML from the markdown editor.
 * Handles empty state detection for placeholder display, Ctrl+Click link opening,
 * and forwards input/keydown/blur events to the parent editor.
 *
 * @props
 *   html: string - The rendered HTML content to display
 *   readonly?: boolean - Disables editing (default: false)
 *   placeholder?: string - Placeholder text when content is empty (default: "Start typing...")
 *
 * @emits
 *   input - Fired when content changes via user input
 *   keydown - Fired on keydown with the KeyboardEvent
 *   blur - Fired when the editor loses focus
 *   container-mounted - Fired on mount with the contenteditable HTMLElement reference
 *
 * @tokens
 *   --dx-mde-content-bg - Background color (default: #1e1e1e)
 *   --dx-mde-content-color - Text color (default: #d4d4d4)
 *   --dx-mde-content-border-focus - Border color on focus (default: rgba(86,156,214,0.6))
 *   --dx-mde-content-border-hover - Border color on hover (default: rgba(86,156,214,0.3))
 *   --dx-mde-content-caret - Caret color (default: #d4d4d4)
 *   --dx-mde-placeholder-color - Placeholder text color (default: #6b7280)
 *
 * @example
 *   <MarkdownEditorContent
 *     :html="renderedHtml"
 *     :readonly="false"
 *     placeholder="Type here..."
 *     @input="onInput"
 *     @keydown="onKeyDown"
 *     @blur="onBlur"
 *     @container-mounted="(el) => (contentEl = el)"
 *   />
 */
import { nextTick, onMounted, ref, watch } from "vue";
import { findLinkAncestor } from "./blockUtils";

export interface MarkdownEditorContentProps {
  html: string;
  readonly?: boolean;
  placeholder?: string;
}

const props = withDefaults(defineProps<MarkdownEditorContentProps>(), {
  readonly: false,
  placeholder: "Start typing...",
});

const emit = defineEmits<{
  input: [];
  keydown: [event: KeyboardEvent];
  blur: [];
  "container-mounted": [element: HTMLElement];
}>();

const containerRef = ref<HTMLElement | null>(null);
const isContentEmpty = ref(true);

/**
 * Check if the editor content is empty by examining the actual DOM text content.
 * This is needed because contenteditable changes the DOM directly without updating props.
 */
function checkIfEmpty(): void {
  // containerRef is always set when called (mounted component, event handlers, nextTick after watch)
  const textContent = containerRef.value!.textContent?.trim() || "";
  isContentEmpty.value = textContent.length === 0;
}

/**
 * Handle input events - check if content is empty and emit the input event.
 */
function onInput(): void {
  checkIfEmpty();
  emit("input");
}

// Watch for external HTML changes (e.g., from parent component)
watch(
  () => props.html,
  () => {
    nextTick(() => checkIfEmpty());
  },
  { immediate: true }
);

/**
 * Handle clicks in the editor content.
 * Ctrl+Click (or Cmd+Click on Mac) opens links in a new tab.
 */
function handleClick(event: MouseEvent): void {
  // Check if Ctrl (Windows/Linux) or Cmd (Mac) is held
  const isModifierHeld = event.ctrlKey || event.metaKey;
  if (!isModifierHeld) return;

  // containerRef is always set in template event handlers
  const link = findLinkAncestor(event.target as Node, containerRef.value!);
  if (!link) return;

  const href = link.getAttribute("href");
  if (!href) return;

  // Prevent default behavior and open the link in a new tab
  event.preventDefault();
  event.stopPropagation();
  window.open(href, "_blank", "noopener,noreferrer");
}

// Emit the container element on mount so the parent can pass it to composables
onMounted(() => {
  // containerRef is guaranteed set in onMounted
  emit("container-mounted", containerRef.value!);
});
</script>

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
