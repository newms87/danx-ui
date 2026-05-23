<!--
/**
 * DanxFileViewerToolbar - Optional control bar for DanxFileViewer
 *
 * Renders two independent multi-select toggle buttons (sidebar +
 * continuous scroll) plus optional zoom controls. The toggles are
 * orthogonal: any combination is valid, so the user can mix-and-match
 * a vertical thumbnail sidebar with paged or continuous body.
 *
 * @models
 *   sidebar: boolean      - Render the thumbnail strip as a vertical sidebar
 *   continuous: boolean   - Render the body as a virtualized scroll column
 *   zoom: number          - Current zoom percent (only meaningful when zoomable)
 *
 * @props
 *   layoutToggles: LayoutToggle[] - Which toggle buttons render (subset of ["sidebar","continuous"]).
 *   zoomable: boolean - Show zoom controls
 *   zoomMin?: number / zoomMax?: number / zoomStep?: number - Zoom bounds + step
 *
 * @emits
 *   resetZoom - Zoom reset button clicked
 *
 * @tokens
 *   Inherits viewer header tokens for background + border.
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxButtonGroup } from "../buttonGroup";
import DanxZoomControls from "../zoomable/DanxZoomControls.vue";
import type { LayoutToggle } from "./types";

const props = withDefaults(
  defineProps<{
    layoutToggles: LayoutToggle[];
    zoomable: boolean;
    zoomMin?: number;
    zoomMax?: number;
    zoomStep?: number;
  }>(),
  {
    zoomMin: 25,
    zoomMax: 400,
    zoomStep: 10,
  }
);

const emit = defineEmits<{
  resetZoom: [];
}>();

const sidebar = defineModel<boolean>("sidebar", { default: false });
const continuous = defineModel<boolean>("continuous", { default: false });
const zoom = defineModel<number>("zoom", { default: 100 });

const TOGGLE_LABELS: Record<LayoutToggle, { label: string; icon: string }> = {
  sidebar: { label: "Sidebar", icon: "table-columns" },
  continuous: { label: "Continuous", icon: "bars" },
};

const toggleButtons = computed(() =>
  props.layoutToggles.map((id) => ({
    value: id,
    label: TOGGLE_LABELS[id].label,
    icon: TOGGLE_LABELS[id].icon,
  }))
);

const activeToggles = computed<string[]>({
  get() {
    const result: string[] = [];
    if (sidebar.value) result.push("sidebar");
    if (continuous.value) result.push("continuous");
    return result;
  },
  set(values) {
    sidebar.value = values.includes("sidebar");
    continuous.value = values.includes("continuous");
  },
});

const showToggles = computed(() => props.layoutToggles.length > 0);

function onResetZoom() {
  emit("resetZoom");
}
</script>

<template>
  <div class="danx-file-viewer__toolbar">
    <DanxButtonGroup v-if="showToggles" v-model="activeToggles" :buttons="toggleButtons" multiple />
    <div class="danx-file-viewer__toolbar-spacer" />
    <DanxZoomControls
      v-if="zoomable"
      v-model:zoom="zoom"
      :min="zoomMin"
      :max="zoomMax"
      :step="zoomStep"
      @reset="onResetZoom"
    />
  </div>
</template>
