<script setup lang="ts">
/**
 * MarkdownEditorFooter - Status bar displayed below the editor content
 *
 * Shows the character count, a raw markdown toggle button, and a keyboard
 * shortcuts help button. Hidden when the parent MarkdownEditor has hideFooter
 * set to true.
 *
 * @props
 *   charCount: number - Current character count to display
 *   isRawMode?: boolean - Whether raw markdown mode is active (default: false)
 *
 * @emits
 *   show-hotkeys - Fired when the keyboard shortcuts button is clicked
 *   toggle-raw - Fired when the raw toggle button is clicked
 *
 * @slots
 *   default - Extra content between char count and action buttons (e.g., save indicator)
 *
 * @tokens
 *   --dx-mde-footer-bg - Background color (default: #252526)
 *
 * @example
 *   <MarkdownEditorFooter :char-count="42" :is-raw-mode="false" @show-hotkeys="openHelp" @toggle-raw="toggleRaw" />
 */
import DanxButton from "../button/DanxButton.vue";

export interface MarkdownEditorFooterProps {
  charCount: number;
  isRawMode?: boolean;
}

withDefaults(defineProps<MarkdownEditorFooterProps>(), {
  isRawMode: false,
});

defineEmits<{
  "show-hotkeys": [];
  "toggle-raw": [];
}>();
</script>

<template>
  <div class="dx-markdown-editor-footer flex items-center px-2 py-1">
    <span class="char-count text-xs text-gray-500"> {{ charCount.toLocaleString() }} chars </span>
    <slot />
    <div class="flex-1" />
    <DanxButton
      class="raw-toggle-btn"
      :class="{ 'is-active': isRawMode }"
      icon="code"
      size="xxs"
      :tooltip="isRawMode ? 'Show rendered preview' : 'Show raw markdown'"
      @click="$emit('toggle-raw')"
    />
    <DanxButton
      class="hotkey-help-btn"
      icon="keyboard"
      size="xxs"
      tooltip="Keyboard shortcuts (Ctrl+?)"
      @click="$emit('show-hotkeys')"
    />
  </div>
</template>

<style>
.dx-markdown-editor-footer {
  background-color: var(--dx-mde-footer-bg);
  border-radius: 0 0 0.375rem 0.375rem;
  flex-shrink: 0;

  .raw-toggle-btn,
  .hotkey-help-btn {
    color: var(--dx-mde-popover-dimmed);
    --dx-button-hover-bg: var(--dx-mde-menu-item-hover);
  }

  .raw-toggle-btn.is-active {
    color: var(--dx-mde-color, #e0e0e0);
  }
}
</style>
