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
 *
 * @emits
 *   toggle-edit - Fired when the edit pencil button is clicked
 *
 * @tokens
 *   --dx-code-viewer-footer-bg - Footer background color
 *   --dx-code-viewer-footer-error-bg - Background when a validation error is shown
 *   --dx-code-viewer-footer-error-border - Top border when a validation error is shown
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
import { computed } from "vue";
import { DanxButton } from "../button";
import { pencilSvg } from "./icons";
import type { CodeViewerFooterProps } from "./types";

const props = defineProps<CodeViewerFooterProps>();

defineEmits<{
  "toggle-edit": [];
}>();

const hasError = computed(() => props.validationError !== null);
</script>

<template>
  <div
    class="code-footer flex items-center justify-between px-2 py-1 flex-shrink-0"
    :class="{ 'has-error': hasError }"
  >
    <div class="text-xs flex-1 min-w-0" :class="hasError ? 'text-red-400' : 'text-gray-500'">
      <template v-if="validationError">
        <span class="font-medium">
          Error<template v-if="validationError.line"> (line {{ validationError.line }})</template>:
        </span>
        <span class="truncate">{{ validationError.message }}</span>
      </template>
      <template v-else> {{ charCount.toLocaleString() }} chars </template>
    </div>
    <!-- Edit toggle button -->
    <DanxButton
      v-if="canEdit"
      size="xs"
      class="text-gray-500 hover:text-gray-700"
      :class="{ 'text-sky-500 hover:text-sky-600': isEditing }"
      @click="$emit('toggle-edit')"
    >
      <span class="w-3.5 h-3.5" v-html="pencilSvg" />
    </DanxButton>
  </div>
</template>
