<script setup lang="ts">
/**
 * DanxSkeleton - Content-shaped placeholder for loading states
 *
 * A purely visual placeholder shown while data loads. Reduces perceived
 * load time and prevents layout shift by reserving space with animated
 * placeholder shapes.
 *
 * ## Features
 * - Four shapes: rectangle, circle, text (multi-line), rounded
 * - Two animations: pulse (opacity) and wave (gradient sweep)
 * - Full CSS token system for sizing, colors, and timing
 * - Accessible with role="status", aria-busy, and SR-only label
 * - Dark mode via semantic token references (no component-level overrides)
 * - Zero external dependencies
 *
 * @props
 *   shape?: SkeletonShape - Geometry of the placeholder (default: "rectangle")
 *   animation?: SkeletonAnimation - Animation style (default: "pulse")
 *   lines?: number - Number of text lines for shape="text" (default: 3)
 *   ariaLabel?: string - Screen reader label (default: "Loading...")
 *
 * @emits None
 *
 * @slots None
 *
 * @tokens
 *   --dx-skeleton-bg                Background color (default: --color-surface-placeholder)
 *   --dx-skeleton-highlight         Wave gradient highlight (default: rgb(255 255 255 / 0.4))
 *   --dx-skeleton-border-radius     Radius for "rounded" shape (default: --radius-component)
 *   --dx-skeleton-width             Element width (default: 100%)
 *   --dx-skeleton-height            Element height (default: 1rem)
 *   --dx-skeleton-circle-size       Circle diameter (default: 3rem)
 *   --dx-skeleton-text-line-height  Text line height (default: 0.75rem)
 *   --dx-skeleton-text-gap          Text line gap (default: --space-sm)
 *   --dx-skeleton-text-last-width   Last line width (default: 60%)
 *   --dx-skeleton-pulse-duration    Pulse cycle time (default: 1.5s)
 *   --dx-skeleton-wave-duration     Wave sweep time (default: 1.8s)
 *
 * @example
 *   <DanxSkeleton />
 *   <DanxSkeleton shape="circle" />
 *   <DanxSkeleton shape="text" :lines="4" />
 *   <DanxSkeleton animation="wave" />
 */
import { computed } from "vue";
import type { DanxSkeletonProps } from "./types";

const props = withDefaults(defineProps<DanxSkeletonProps>(), {
  shape: "rectangle",
  animation: "pulse",
  lines: 3,
  ariaLabel: "Loading...",
});

const skeletonClasses = computed(() => {
  const classes = ["danx-skeleton", `danx-skeleton--${props.animation}`];
  if (props.shape !== "rectangle") {
    classes.push(`danx-skeleton--${props.shape}`);
  }
  return classes;
});

const isText = computed(() => props.shape === "text");
</script>

<template>
  <div :class="skeletonClasses" role="status" aria-busy="true">
    <span class="danx-skeleton__sr-only">{{ ariaLabel }}</span>
    <template v-if="isText">
      <div v-for="n in lines" :key="n" class="danx-skeleton__line" />
    </template>
  </div>
</template>
