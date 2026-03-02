<!--
/**
 * DanxToastTargetRegion - Internal region wrapper for element-targeted toasts
 *
 * Creates a popover="manual" region positioned relative to a target DOM element
 * using usePopoverPositioning. Toasts inside stack via the same flexbox layout
 * as screen-anchored regions — this is the unified rendering path.
 *
 * Not exported publicly — used only by DanxToastContainer.
 *
 * @props
 *   target: HTMLElement - The DOM element to anchor the region to
 *   placement: PopoverPlacement - Placement relative to target (top, bottom, left, right)
 *   toasts: ToastEntry[] - Toast entries to render inside this region
 *
 * @tokens
 *   Inherits all --dx-toast-* tokens from toast-tokens.css
 */
-->

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import type { PopoverPlacement } from "../popover/types";
import { usePopoverPositioning } from "../popover/usePopoverPositioning";
import DanxToast from "./DanxToast.vue";
import type { ToastEntry } from "./types";

const props = defineProps<{
  target: HTMLElement;
  placement: PopoverPlacement;
  toasts: ToastEntry[];
}>();

const regionRef = ref<HTMLElement | null>(null);
const targetRef = ref<HTMLElement>(props.target);
const placementRef = ref<PopoverPlacement>(props.placement);
const positioningActive = ref(false);

const { style: positionStyle } = usePopoverPositioning(
  targetRef,
  regionRef,
  placementRef,
  positioningActive
);

/**
 * Top/left placements stack away from the target (column-reverse),
 * bottom/right stack toward it (column).
 */
const flexDirection = computed(() => {
  return props.placement === "top" || props.placement === "left" ? "column-reverse" : "column";
});

/**
 * Show the popover first so it has dimensions, then activate positioning.
 * popover="manual" elements have zero dimensions until shown.
 */
onMounted(() => {
  if (regionRef.value) {
    regionRef.value.showPopover();
    positioningActive.value = true;
  }
});
</script>

<template>
  <div
    ref="regionRef"
    popover="manual"
    class="danx-toast-region danx-toast-region--targeted"
    :style="{ ...positionStyle, flexDirection }"
  >
    <DanxToast v-for="entry in toasts" :key="entry.id" :entry="entry" />
  </div>
</template>
