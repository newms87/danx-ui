<!--
/**
 * DanxZoomControls - Slider + readout + reset for DanxZoomable
 *
 * Standalone control bar bound to a zoom v-model. Render it inside
 * DanxZoomable's `controls` slot for an inline overlay, or in a parent
 * toolbar for an out-of-band control. Built on DanxRangeSlider.
 *
 * @props
 *   min?: number - Minimum zoom percent (default 25)
 *   max?: number - Maximum zoom percent (default 400)
 *   step?: number - Zoom step (default 10)
 *   compact?: boolean - Hide readout (default false)
 *
 * @models
 *   zoom: number - Zoom percent (required)
 *
 * @emits
 *   reset - Reset button clicked
 *
 * @tokens
 *   --dx-zoomable-controls-bg - Control bar background
 *   --dx-zoomable-controls-color - Control bar text color
 */
-->

<script setup lang="ts">
import { DanxButton } from "../button";
import { DanxRangeSlider } from "../range-slider";
import type { DanxZoomControlsProps } from "./types";

const props = withDefaults(defineProps<DanxZoomControlsProps>(), {
  min: 25,
  max: 400,
  step: 10,
  compact: false,
});

const emit = defineEmits<{
  (e: "update:zoom", value: number): void;
  (e: "reset"): void;
}>();

const zoom = defineModel<number>("zoom", { required: true });

function onReset() {
  zoom.value = 100;
  emit("reset");
}
</script>

<template>
  <div class="danx-zoom-controls">
    <DanxButton variant="muted" size="sm" icon="search" tooltip="Reset zoom" @click="onReset" />
    <DanxRangeSlider
      v-model="zoom"
      :min="props.min"
      :max="props.max"
      :step="props.step"
      class="danx-zoom-controls__slider"
      aria-label="Zoom"
    />
    <span v-if="!compact" class="danx-zoom-controls__readout">{{ zoom }}%</span>
  </div>
</template>
