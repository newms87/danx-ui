<!--
/**
 * CodeViewerFooter Component
 *
 * Footer bar for CodeViewer showing character count, validation errors,
 * and an edit toggle button. Replaces QBtn with DanxButton.
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
