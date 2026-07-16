<!--
/**
 * DanxZoomable - Photoshop-style zoom + pan wrapper
 *
 * Drop-in container that adds Ctrl/Cmd+wheel zoom, Ctrl/Cmd+drag pan,
 * Ctrl/Cmd + `+`/`-`/`=`/`0` keyboard zoom, and dblclick reset to any
 * slotted content. Reusable beyond the file viewer — wrap an image, a
 * canvas, an SVG, a template preview, anything.
 *
 * Zoom and pan are exposed as v-models so consumers can persist or sync
 * them. Keyboard listeners are window-scoped (capture phase) but only act
 * when focus is inside this wrapper, so multiple Zoomables can coexist on
 * a page without fighting.
 *
 * @props
 *   min?: number - Minimum zoom percent (default 25)
 *   max?: number - Maximum zoom percent (default 400)
 *   step?: number - Zoom step percent (default 10)
 *   panDisabled?: boolean - Disable pan drag (default false)
 *   wheelDisabled?: boolean - Disable Ctrl+wheel zoom (default false)
 *   keyboardDisabled?: boolean - Disable Ctrl+/-/= /0 keyboard zoom (default false)
 *   showHint?: boolean - Show modifier-key hint pill (default true)
 *
 * @models
 *   zoom: number - Zoom percent (default 100)
 *   pan: { x: number; y: number } - Pan offset px (default {x:0, y:0})
 *
 * @emits
 *   reset - User triggered dblclick reset
 *
 * @slots
 *   default - Content to be zoomed and panned
 *   controls - Overlay controls (e.g. inline DanxZoomControls)
 *
 * @tokens
 *   --dx-zoomable-bg - Container background
 *   --dx-zoomable-hint-bg / --dx-zoomable-hint-color / --dx-zoomable-hint-border
 *   --dx-zoomable-kbd-bg / --dx-zoomable-kbd-color / --dx-zoomable-kbd-border
 *
 * @example
 *   <DanxZoomable v-model:zoom="zoom">
 *     <img src="diagram.svg" />
 *   </DanxZoomable>
 */
-->

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import type { DanxZoomableEmits, DanxZoomableProps, DanxZoomableSlots, Pan } from "./types";
import { useZoomable } from "./useZoomable";

const props = withDefaults(defineProps<DanxZoomableProps>(), {
  min: 25,
  max: 400,
  step: 10,
  panDisabled: false,
  wheelDisabled: false,
  keyboardDisabled: false,
  showHint: true,
});

defineEmits<DanxZoomableEmits>();
const zoom = defineModel<number>("zoom", { default: 100 });

const pan = defineModel<Pan>("pan", { default: () => ({ x: 0, y: 0 }) });

defineSlots<DanxZoomableSlots>();

const rootRef = ref<HTMLElement | null>(null);

const { isDragging, panInputActive, modifierKeyLabel, onDragStart, onDblClick } = useZoomable({
  zoom,
  pan,
  rootRef,
  min: toRef(props, "min"),
  max: toRef(props, "max"),
  step: toRef(props, "step"),
  panDisabled: toRef(props, "panDisabled"),
  wheelDisabled: toRef(props, "wheelDisabled"),
  keyboardDisabled: toRef(props, "keyboardDisabled"),
});

const contentStyle = computed(() => ({
  transform: `translate(-50%, -50%) translate(${pan.value.x}px, ${pan.value.y}px) scale(${
    zoom.value / 100
  })`,
}));

const isTouchPrimary = computed(
  () => typeof window !== "undefined" && (window.matchMedia?.("(pointer: coarse)").matches ?? false)
);
</script>

<template>
  <div
    ref="rootRef"
    class="danx-zoomable"
    :class="{
      'is-pan-ready': panInputActive && !isDragging,
      'is-dragging': isDragging,
    }"
    tabindex="0"
    @mousedown="onDragStart"
    @dblclick="onDblClick"
  >
    <div
      class="danx-zoomable__content"
      :class="{ 'is-dragging': isDragging }"
      :style="contentStyle"
    >
      <slot />
    </div>

    <!-- Drag overlay — sits above content while modifier key held so the
         slotted content (e.g. iframe) does not steal the drag. -->
    <div
      v-if="panInputActive && !panDisabled"
      class="danx-zoomable__drag-overlay"
      aria-hidden="true"
    />

    <div v-if="$slots.controls" class="danx-zoomable__controls">
      <slot name="controls" />
    </div>

    <div
      v-if="showHint && !keyboardDisabled"
      class="danx-zoomable__hint"
      :class="{ 'is-dragging': isDragging }"
    >
      <template v-if="isTouchPrimary">
        <span v-if="!panDisabled">Pinch to zoom · drag to pan</span>
        <span v-else>Pinch to zoom</span>
      </template>
      <template v-else>
        <kbd class="danx-zoomable__kbd">{{ modifierKeyLabel }}</kbd>
        <span v-if="!panDisabled">+ drag to pan · + scroll to zoom</span>
        <span v-else>+ scroll to zoom</span>
      </template>
    </div>
  </div>
</template>
