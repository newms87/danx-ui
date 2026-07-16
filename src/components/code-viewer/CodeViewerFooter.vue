<!--
/**
 * CodeViewerFooter Component
 *
 * Footer bar for CodeViewer showing character count, validation errors,
 * and an edit toggle button. Displays a pencil icon that highlights when
 * the editor is in edit mode.
 *
 * @props
 *   charCount: number - Number of characters in the displayed content
 *   validationError: ValidationError | null - Current parse/validation error, if any
 *   canEdit: boolean - Whether editing is allowed (controls edit button visibility)
 *   isEditing: boolean - Whether currently in edit mode (highlights edit button)
 *   content: string - Raw text content copied to the clipboard by the copy button
 *
 * @emits
 *   toggleEdit - Fired when the edit pencil button is clicked
 *
 * @slots
 *   actions - Custom action buttons inserted next to the edit toggle button
 *
 * @tokens
 *   --dx-code-viewer-footer-bg - Footer background color
 *   --dx-code-viewer-footer-error-bg - Background when a validation error is shown
 *   --dx-code-viewer-footer-error-border - Top border when a validation error is shown
 *   --dx-code-viewer-footer-text - Footer text color
 *   --dx-code-viewer-footer-text-hover - Edit button text color on hover
 *   --dx-code-viewer-footer-error-text - Footer text color when a validation error is shown
 *   --dx-code-viewer-border-radius - Bottom border radius (inherited from viewer)
 *   --dx-code-viewer-light-border - Top border for light theme variant
 *
 * @example
 *   <CodeViewerFooter
 *     :char-count="1234"
 *     :validation-error="null"
 *     :can-edit="true"
 *     :is-editing="false"
 *     @toggle-edit="toggleEdit"
 *   />
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { DanxButton } from "../button";
import { copyToClipboard } from "./clipboardUtils";
import type { CodeViewerFooterProps } from "./types";

const props = defineProps<CodeViewerFooterProps>();

defineEmits<{
  toggleEdit: [];
}>();

const hasError = computed(() => props.validationError !== null);

const justCopied = ref(false);
let copiedTimeout: ReturnType<typeof setTimeout> | undefined;

async function onCopyClick() {
  const succeeded = await copyToClipboard(props.content);
  if (!succeeded) {
    return;
  }
  justCopied.value = true;
  clearTimeout(copiedTimeout);
  copiedTimeout = setTimeout(() => {
    justCopied.value = false;
  }, 1500);
}
</script>

<template>
  <div
    class="code-footer flex items-center justify-between px-2 py-1 flex-shrink-0"
    :class="{ 'has-error': hasError }"
  >
    <div class="code-footer-text text-xs flex-1 min-w-0" :class="{ 'has-error': hasError }">
      <template v-if="validationError">
        <span class="font-medium">
          Error<template v-if="validationError.line"> (line {{ validationError.line }})</template>:
        </span>
        <span class="truncate">{{ validationError.message }}</span>
      </template>
      <template v-else> {{ charCount.toLocaleString() }} chars </template>
    </div>
    <div class="flex items-center gap-1">
      <!-- Consumer-provided footer actions -->
      <slot name="actions" />
      <!-- Copy-to-clipboard button -->
      <DanxButton
        :icon="justCopied ? 'check' : 'copy'"
        size="xs"
        class="code-footer-copy-btn"
        :class="{ 'text-sky-500 hover:text-sky-600': justCopied }"
        :tooltip="justCopied ? 'Copied!' : 'Copy'"
        @click="onCopyClick"
      />
      <!-- Edit toggle button -->
      <DanxButton
        v-if="canEdit"
        icon="pencil"
        size="xs"
        class="code-footer-edit-btn"
        :class="{ 'text-sky-500 hover:text-sky-600': isEditing }"
        @click="$emit('toggleEdit')"
      />
    </div>
  </div>
</template>
