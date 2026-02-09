<script setup lang="ts">
/**
 * MarkdownEditorFooter - Status bar displayed below the editor content
 *
 * Shows the character count and a keyboard shortcuts help button.
 * Hidden when the parent MarkdownEditor has hideFooter set to true.
 *
 * @props
 *   charCount: number - Current character count to display
 *
 * @emits
 *   show-hotkeys - Fired when the keyboard shortcuts button is clicked
 *
 * @slots
 *   default - Extra content between char count and hotkey button (e.g., save indicator)
 *
 * @tokens
 *   --dx-mde-footer-bg - Background color (default: #252526)
 *
 * @example
 *   <MarkdownEditorFooter :char-count="42" @show-hotkeys="openHelp" />
 */
import { KeyboardIcon } from "./icons";

export interface MarkdownEditorFooterProps {
  charCount: number;
}

defineProps<MarkdownEditorFooterProps>();

defineEmits<{
  "show-hotkeys": [];
}>();
</script>

<template>
  <div class="dx-markdown-editor-footer flex items-center px-2 py-1">
    <span class="char-count text-xs text-gray-500"> {{ charCount.toLocaleString() }} chars </span>
    <slot />
    <div class="flex-1" />
    <button
      class="hotkey-help-btn text-gray-500 hover:text-gray-300 transition-colors p-1 rounded"
      title="Keyboard shortcuts (Ctrl+?)"
      type="button"
      @click="$emit('show-hotkeys')"
    >
      <span class="w-4 h-4" v-html="KeyboardIcon" />
    </button>
  </div>
</template>

<style>
.dx-markdown-editor-footer {
  background-color: var(--dx-mde-footer-bg);
  border-radius: 0 0 0.375rem 0.375rem;
  flex-shrink: 0;
}

.dx-markdown-editor-footer .hotkey-help-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  cursor: pointer;
}

.dx-markdown-editor-footer .hotkey-help-btn:hover {
  background-color: var(--dx-mde-menu-item-hover);
}
</style>
