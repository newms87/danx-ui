<!--
/**
 * DanxFileViewerToolbar - Optional control bar for DanxFileViewer
 *
 * Renders a layout-mode toggle (button group) and zoom controls when the
 * parent viewer opts into either feature. Sits beneath the header.
 *
 * Layout toggle only renders the modes listed in `availableLayouts`. If
 * only one mode is available, the toggle is hidden (no point picking from
 * a list of one). Zoom controls only render when `zoomable=true`.
 *
 * @props
 *   layout: Layout - Current layout (v-model)
 *   zoom: number - Current zoom percent (v-model, only used when zoomable)
 *   availableLayouts: Layout[] - Modes the user can switch between
 *   zoomable: boolean - Show zoom controls
 *   zoomMin?: number - Minimum zoom percent (default 25)
 *   zoomMax?: number - Maximum zoom percent (default 400)
 *   zoomStep?: number - Zoom step (default 10)
 *
 * @emits
 *   update:layout(layout) - Layout toggle changed
 *   update:zoom(value)    - Zoom slider changed
 *   resetZoom            - Zoom reset button clicked
 *
 * @tokens
 *   Inherits viewer header tokens for background + border.
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxButtonGroup } from "../buttonGroup";
import DanxZoomControls from "../zoomable/DanxZoomControls.vue";
import type { Layout } from "./types";

const props = withDefaults(
  defineProps<{
    availableLayouts: Layout[];
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
  "update:layout": [layout: Layout];
  "update:zoom": [value: number];
  resetZoom: [];
}>();

const layout = defineModel<Layout>("layout", { required: true });
const zoom = defineModel<number>("zoom", { default: 100 });

const showLayoutToggle = computed(() => props.availableLayouts.length > 1);

const LAYOUT_LABELS: Record<Layout, { label: string; icon: string }> = {
  horizontal: { label: "Carousel", icon: "image" },
  vertical: { label: "Vertical", icon: "list" },
  continuous: { label: "Continuous", icon: "menu" },
};

const layoutButtons = computed(() =>
  props.availableLayouts.map((id) => ({
    value: id,
    label: LAYOUT_LABELS[id].label,
    icon: LAYOUT_LABELS[id].icon,
  }))
);

function onLayoutSelect(value: string) {
  layout.value = value as Layout;
  emit("update:layout", value as Layout);
}

function onResetZoom() {
  emit("resetZoom");
}
</script>

<template>
  <div class="danx-file-viewer__toolbar">
    <DanxButtonGroup
      v-if="showLayoutToggle"
      :model-value="layout"
      :buttons="layoutButtons"
      required
      @select="onLayoutSelect"
    />
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
