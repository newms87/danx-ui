<!--
/**
 * CodeViewerCollapsed Component
 *
 * Renders the collapsed single-line preview of a CodeViewer.
 * Shows a chevron-right expand icon, truncated content preview,
 * and a LanguageBadge for format switching. Clicking anywhere on
 * the row (except the badge) emits expand to restore the full view.
 *
 * @props
 *   preview: string - HTML string showing a collapsed preview of the content
 *   format: string - Current format/language displayed in the badge
 *   availableFormats?: string[] - Formats available for quick switching (default: [])
 *   allowAnyLanguage?: boolean - Whether to show the language search panel (default: false)
 *
 * @emits
 *   expand - Fired when the collapsed row is clicked to restore full view
 *   format-change(format: string) - Fired when a different language is selected via the badge
 *
 * @tokens
 *   --dx-code-viewer-collapsed-bg - Background color of the collapsed row
 *   --dx-code-viewer-collapsed-bg-hover - Background color on hover
 *   --dx-code-viewer-collapsed-text - Text color of the preview content
 *   --dx-code-viewer-border-radius - Border radius (inherited from viewer)
 *   --dx-code-viewer-font-family - Font family (inherited from viewer)
 *   --dx-code-viewer-font-size - Font size (inherited from viewer)
 *
 * @example
 *   <CodeViewerCollapsed
 *     preview="<span>{ &quot;key&quot;: &quot;value&quot; }</span>"
 *     format="json"
 *     :available-formats="['json', 'yaml']"
 *     @expand="isCollapsed = false"
 *     @format-change="onFormatChange"
 *   />
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
