<script setup lang="ts">
/**
 * DanxToastContainer - App-level container for positioning toasts
 *
 * Mount once in your App.vue. Teleports to body and creates region containers
 * for all toasts. Screen-anchored toasts use 9 fixed-position CSS regions.
 * Element-targeted toasts use DanxToastTargetRegion (positioned via
 * usePopoverPositioning). Both region types stack toasts via flexbox.
 *
 * Reads from the singleton useToast() composable — no props needed.
 * Sets the containerMounted flag on mount so useToast() can detect missing containers.
 *
 * @props None
 *
 * @slots None
 *
 * @tokens
 *   Inherits all --dx-toast-* tokens from toast-tokens.css
 *
 * @example
 *   <DanxToastContainer />
 */

import { computed, type Directive, onMounted, onUnmounted } from "vue";
import type { PopoverPlacement } from "../popover/types";
import type { ToastEntry, ToastPosition } from "./types";
import { useToast } from "./useToast";
import DanxToast from "./DanxToast.vue";
import DanxToastTargetRegion from "./DanxToastTargetRegion.vue";

/**
 * Custom directive to show a popover region on mount.
 * Regions use popover="manual" for top-layer rendering,
 * so we need to call showPopover() when the element enters the DOM.
 */
const vPopoverRegion: Directive<HTMLElement> = {
  mounted(el) {
    el.showPopover();
  },
};

const { toasts, containerMounted } = useToast();

onMounted(() => {
  containerMounted.value = true;
});

onUnmounted(() => {
  containerMounted.value = false;
});

/** All 9 screen positions */
const POSITIONS: ToastPosition[] = [
  "top-left",
  "top-center",
  "top-right",
  "center-left",
  "center-center",
  "center-right",
  "bottom-left",
  "bottom-center",
  "bottom-right",
];

/** Screen-anchored toasts grouped by position */
const regionMap = computed(() => {
  const map = new Map<ToastPosition, ToastEntry[]>();
  for (const entry of toasts.value) {
    if (entry.target) continue;
    const list = map.get(entry.position);
    if (list) {
      list.push(entry);
    } else {
      map.set(entry.position, [entry]);
    }
  }
  return map;
});

/**
 * Element-targeted toasts grouped by target element.
 * Each unique target gets its own region, positioned by usePopoverPositioning.
 * Uses a WeakMap to assign stable IDs to target elements.
 */
const targetIds = new WeakMap<HTMLElement, string>();
let nextTargetRegionId = 0;

function getTargetId(el: HTMLElement): string {
  let id = targetIds.get(el);
  if (!id) {
    id = `target-region-${nextTargetRegionId++}`;
    targetIds.set(el, id);
  }
  return id;
}

interface TargetRegion {
  id: string;
  target: HTMLElement;
  placement: PopoverPlacement;
  toasts: ToastEntry[];
}

const targetRegions = computed<TargetRegion[]>(() => {
  const regions: TargetRegion[] = [];
  const targetMap = new Map<HTMLElement, TargetRegion>();
  for (const entry of toasts.value) {
    if (!entry.target) continue;
    let region = targetMap.get(entry.target);
    if (!region) {
      region = {
        id: getTargetId(entry.target),
        target: entry.target,
        placement: entry.targetPlacement,
        toasts: [],
      };
      targetMap.set(entry.target, region);
      regions.push(region);
    }
    region.toasts.push(entry);
  }
  return regions;
});

/** Only positions that have toasts */
const activePositions = computed(() => POSITIONS.filter((p) => regionMap.value.has(p)));
</script>

<template>
  <Teleport to="body">
    <div class="danx-toast-container">
      <!-- Screen-position regions (popover="manual" for top-layer rendering) -->
      <div
        v-for="position in activePositions"
        :key="position"
        v-popover-region
        popover="manual"
        :class="['danx-toast-region', `danx-toast-region--${position}`]"
      >
        <DanxToast v-for="entry in regionMap.get(position)" :key="entry.id" :entry="entry" />
      </div>

      <!-- Element-targeted regions (one per unique target, positioned by usePopoverPositioning) -->
      <DanxToastTargetRegion
        v-for="region in targetRegions"
        :key="region.id"
        :target="region.target"
        :placement="region.placement"
        :toasts="region.toasts"
      />
    </div>
  </Teleport>
</template>
