<script setup lang="ts">
/**
 * DanxScroll - Custom scrollbar container with opt-in infinite scroll
 *
 * A scrollable container that renders custom overlay scrollbars (don't push content).
 * Scrollbars auto-hide with fade after idle, support drag interaction, and adapt
 * to content overflow. Infinite scroll is available as an opt-in feature.
 *
 * ## Architecture
 * Uses a wrapper/viewport pattern: the outer element is a non-scrolling wrapper
 * with position:relative, and a nested viewport div handles actual scrolling.
 * Track elements are siblings of the viewport, positioned absolutely on the
 * wrapper — so they stay fixed while content scrolls.
 *
 * ## Features
 * - Custom overlay scrollbars that don't push content
 * - Auto-hide with configurable fade transition
 * - Draggable thumb with click-to-jump on track
 * - Vertical, horizontal, or both-axis scrolling
 * - Five size presets (xs, sm, md, lg, xl)
 * - Variant coloring via useVariant()
 * - Persistent mode (always visible)
 * - Opt-in infinite scroll with loading/done indicators
 * - CSS token system for full customization
 *
 * @props
 *   tag?: string - HTML tag for container (default: "div")
 *   direction?: "vertical" | "horizontal" | "both" - Scrollable axes (default: "vertical")
 *   size?: "xs" | "sm" | "md" | "lg" | "xl" - Thumb thickness (default: "md")
 *   variant?: VariantType - Color variant for scrollbar (default: "")
 *   persistent?: boolean - Keep scrollbar always visible (default: false)
 *   infiniteScroll?: boolean - Enable infinite scroll (default: false)
 *   distance?: number - Pixel threshold for infinite trigger (default: 200)
 *   infiniteDirection?: "top" | "bottom" | "left" | "right" - Edge for loading (default: "bottom")
 *   canLoadMore?: boolean - Whether more items exist (default: true)
 *   loading?: boolean - Load in progress (default: false)
 *
 * @emits
 *   loadMore - Fired when scroll threshold crossed (only when infiniteScroll=true)
 *
 * @slots
 *   default - Scrollable content
 *   loading - Loading indicator (when infiniteScroll=true and loading=true)
 *   done - Done indicator (when infiniteScroll=true and canLoadMore=false)
 *
 * @tokens
 *   --dx-scroll-thumb-bg - Thumb background color
 *   --dx-scroll-thumb-hover-bg - Thumb hover background
 *   --dx-scroll-track-bg - Track background color
 *   --dx-scroll-border-radius - Thumb border radius
 *   --dx-scroll-fade-duration - Fade transition duration
 *   --dx-scroll-loading-color - Loading text color
 *   --dx-scroll-done-color - Done text color
 *   --dx-scroll-gap - Gap between content and indicators
 *   --dx-scroll-{size}-thumb-thickness - Thumb thickness per size
 *   --dx-scroll-{size}-track-padding - Track padding per size
 *
 * @example
 *   <DanxScroll class="h-64">
 *     <div v-for="i in 100" :key="i">Item {{ i }}</div>
 *   </DanxScroll>
 *
 * @example
 *   <DanxScroll size="sm" variant="info" persistent>
 *     <p>Always-visible info-colored scrollbar</p>
 *   </DanxScroll>
 *
 * @example
 *   <DanxScroll infiniteScroll :loading="isLoading" :canLoadMore="hasMore" @loadMore="fetch">
 *     <div v-for="item in items" :key="item.id">{{ item.name }}</div>
 *   </DanxScroll>
 */
import { computed, ref, toRef } from "vue";
import { useDanxScroll } from "./useDanxScroll";
import { useScrollInfinite } from "./useScrollInfinite";
import { useVariant } from "../../shared/composables/useVariant";
import type { DanxScrollProps, DanxScrollSlots } from "./types";

const props = withDefaults(defineProps<DanxScrollProps>(), {
  tag: "div",
  direction: "vertical",
  size: "md",
  variant: "",
  persistent: false,
  infiniteScroll: false,
  distance: 200,
  infiniteDirection: "bottom",
  canLoadMore: true,
  loading: false,
});

const emit = defineEmits<{
  loadMore: [];
}>();

defineSlots<DanxScrollSlots>();

const SCROLL_VARIANT_TOKENS = {
  "--dx-scroll-thumb-bg": "bg",
  "--dx-scroll-thumb-hover-bg": "bg-hover",
};

const viewportRef = ref<HTMLElement | null>(null);

const variantStyle = useVariant(toRef(props, "variant"), "scroll", SCROLL_VARIANT_TOKENS);

const {
  verticalThumbStyle,
  horizontalThumbStyle,
  isVerticalVisible,
  isHorizontalVisible,
  hasVerticalOverflow,
  hasHorizontalOverflow,
  onVerticalThumbMouseDown,
  onHorizontalThumbMouseDown,
  onVerticalTrackClick,
  onHorizontalTrackClick,
  onTrackMouseEnter,
  onTrackMouseLeave,
} = useDanxScroll(viewportRef, { persistent: props.persistent });

// Opt-in infinite scroll
if (props.infiniteScroll) {
  useScrollInfinite(viewportRef, {
    distance: props.distance,
    direction: props.infiniteDirection,
    canLoadMore: toRef(props, "canLoadMore"),
    loading: toRef(props, "loading"),
    onLoadMore: () => emit("loadMore"),
  });
}

const showVerticalTrack = computed(
  () => hasVerticalOverflow.value && (props.direction === "vertical" || props.direction === "both")
);
const showHorizontalTrack = computed(
  () =>
    hasHorizontalOverflow.value && (props.direction === "horizontal" || props.direction === "both")
);

const isBeforeContent = computed(
  () => props.infiniteDirection === "top" || props.infiniteDirection === "left"
);

const wrapperClasses = computed(() => [
  "danx-scroll",
  `danx-scroll--${props.direction}`,
  `danx-scroll--${props.size}`,
]);
</script>

<template>
  <component :is="tag" :class="wrapperClasses" :style="variantStyle">
    <!-- Scrollable viewport -->
    <div ref="viewportRef" class="danx-scroll__viewport">
      <slot />

      <!-- Infinite scroll indicators (CSS order: -1 positions before content for top/left) -->
      <template v-if="infiniteScroll">
        <div
          v-if="loading"
          :class="['danx-scroll__loading', { 'is-before-content': isBeforeContent }]"
        >
          <slot name="loading">
            <span>Loading...</span>
          </slot>
        </div>

        <div
          v-if="!canLoadMore"
          :class="['danx-scroll__done', { 'is-before-content': isBeforeContent }]"
        >
          <slot name="done">
            <span>No more items</span>
          </slot>
        </div>
      </template>
    </div>

    <!-- Vertical scrollbar track (outside viewport, stays fixed) -->
    <div
      v-if="showVerticalTrack"
      :class="['danx-scroll__track--vertical', { 'is-visible': isVerticalVisible }]"
      @click.self="onVerticalTrackClick"
      @mouseenter="onTrackMouseEnter"
      @mouseleave="onTrackMouseLeave"
    >
      <div
        class="danx-scroll__thumb"
        :style="verticalThumbStyle"
        @mousedown="onVerticalThumbMouseDown"
      />
    </div>

    <!-- Horizontal scrollbar track (outside viewport, stays fixed) -->
    <div
      v-if="showHorizontalTrack"
      :class="['danx-scroll__track--horizontal', { 'is-visible': isHorizontalVisible }]"
      @click.self="onHorizontalTrackClick"
      @mouseenter="onTrackMouseEnter"
      @mouseleave="onTrackMouseLeave"
    >
      <div
        class="danx-scroll__thumb"
        :style="horizontalThumbStyle"
        @mousedown="onHorizontalThumbMouseDown"
      />
    </div>
  </component>
</template>
