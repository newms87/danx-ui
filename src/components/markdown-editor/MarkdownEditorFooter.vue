<template>
  <div class="dx-markdown-editor-footer flex items-center justify-between px-2 py-1">
    <span class="char-count text-xs text-gray-500">
      {{ charCount.toLocaleString() }} chars
    </span>
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

<script setup lang="ts">
import { KeyboardIcon } from "./icons";

export interface MarkdownEditorFooterProps {
  charCount: number;
}

defineProps<MarkdownEditorFooterProps>();

defineEmits<{
  "show-hotkeys": [];
}>();
</script>

<style>
.dx-markdown-editor-footer {
  background-color: #252526;
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
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
