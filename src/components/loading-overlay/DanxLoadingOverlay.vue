<script setup lang="ts">
/**
 * DanxLoadingOverlay - Semi-transparent overlay for in-place loading states
 *
 * An absolutely-positioned overlay meant to sit inside a `position: relative`
 * container (a card, panel, form, or table) to dim its content and show a
 * centered spinner while an async operation runs. Presentation-only —
 * consumers control visibility via the `show` prop/v-model.
 *
 * ## Features
 * - Scrim background + centered spinner, token-driven, dark-mode aware
 * - Optional message via prop or `message` slot
 * - `show` prop / `v-model:show` toggle with fade transition on enter/leave
 * - Does not trap focus or block keyboard navigation of unrelated content
 * - Zero external dependencies
 *
 * @props
 *   show?: boolean - Controls visibility (use v-model:show) (default: false)
 *   message?: string - Optional text shown beneath the spinner
 *   ariaLabel?: string - Screen reader label (default: "Loading...")
 *
 * @emits
 *   update:show - Emitted when show changes (v-model support)
 *
 * @slots
 *   spinner - Overrides the default spinner markup
 *   message - Overrides the default message text
 *
 * @tokens
 *   --dx-loading-overlay-bg           Scrim background color
 *   --dx-loading-overlay-z            Z-index
 *   --dx-loading-overlay-spinner-size Spinner diameter
 *   --dx-loading-overlay-spinner-color Spinner color
 *   --dx-loading-overlay-text-color   Message text color
 *   --dx-loading-overlay-transition-duration Fade transition duration
 *
 * @example
 *   <div style="position: relative">
 *     <DanxCard>...</DanxCard>
 *     <DanxLoadingOverlay :show="isLoading" message="Saving..." />
 *   </div>
 */
import type { DanxLoadingOverlayProps, DanxLoadingOverlaySlots } from "./types";

withDefaults(defineProps<DanxLoadingOverlayProps>(), {
  show: false,
  message: undefined,
  ariaLabel: "Loading...",
});

defineEmits<{
  "update:show": [value: boolean];
}>();

defineSlots<DanxLoadingOverlaySlots>();
</script>

<template>
  <Transition name="danx-loading-overlay-fade">
    <div
      v-if="show"
      class="danx-loading-overlay"
      role="status"
      aria-live="polite"
      :aria-busy="show"
    >
      <span class="danx-loading-overlay__sr-only">{{ ariaLabel }}</span>
      <span class="danx-loading-overlay__content" aria-hidden="true">
        <slot name="spinner">
          <span class="danx-loading-overlay__spinner" />
        </slot>
        <span v-if="message || $slots.message" class="danx-loading-overlay__message">
          <slot name="message">{{ message }}</slot>
        </span>
      </span>
    </div>
  </Transition>
</template>
