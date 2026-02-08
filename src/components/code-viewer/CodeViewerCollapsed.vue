<!--
/**
 * CodeViewerCollapsed Component
 *
 * Renders the collapsed single-line preview of a CodeViewer.
 * Shows an expand icon, truncated content preview, and a language badge.
 * Clicking the row expands back to the full code view.
 */
-->

<script setup lang="ts">
import { chevronRightSvg } from "./icons";
import LanguageBadge from "./LanguageBadge.vue";
import type { CodeViewerCollapsedProps } from "./types";

withDefaults(defineProps<CodeViewerCollapsedProps>(), {
  availableFormats: () => [],
  allowAnyLanguage: false,
});

defineEmits<{
  expand: [];
  "format-change": [format: string];
}>();
</script>

<template>
  <div class="code-collapsed relative flex items-center cursor-pointer" @click="$emit('expand')">
    <span class="w-3 h-3 mr-2 flex-shrink-0 text-gray-500" v-html="chevronRightSvg" />
    <code class="code-collapsed-preview flex-1 min-w-0 truncate" v-html="preview" />

    <!-- Language badge - stop propagation to prevent expand when clicking -->
    <LanguageBadge
      :format="format"
      :available-formats="availableFormats"
      :toggleable="(availableFormats?.length ?? 0) > 1"
      :allow-any-language="allowAnyLanguage"
      @click.stop
      @change="(fmt: string) => $emit('format-change', fmt)"
    />
  </div>
</template>
