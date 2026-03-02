<!--
/**
 * DanxToast - Individual toast notification panel
 *
 * Renders a single toast entry with variant styling, auto-dismiss progress bar,
 * deduplication badge count, and optional close button. Has no positioning
 * knowledge — positioning is handled by the parent region container
 * (DanxToastContainer for screen regions, DanxToastTargetRegion for
 * element-anchored regions).
 *
 * Pauses the auto-dismiss timer on mouseenter and resumes on mouseleave.
 *
 * @props
 *   entry: ToastEntry - The toast entry to render (required)
 *
 * @slots
 *   default - Custom toast content (receives { entry } scope, falls back to entry.message)
 *   icon - Custom icon slot (receives { entry } scope, falls back to variant-default icon)
 *
 * @tokens
 *   --dx-toast-bg - Background color (default: var(--color-surface-elevated))
 *   --dx-toast-text - Text color (default: var(--color-text))
 *   --dx-toast-border - Border color (default: var(--color-border))
 *   --dx-toast-border-radius - Corner radius (default: var(--radius-component))
 *   --dx-toast-shadow - Box shadow (default: var(--shadow-elevated))
 *   --dx-toast-padding-x - Horizontal padding (default: var(--space-md))
 *   --dx-toast-padding-y - Vertical padding (default: var(--space-sm))
 *   --dx-toast-max-width - Maximum width (default: 24rem)
 *   --dx-toast-min-width - Minimum width (default: 16rem)
 *   --dx-toast-gap - Gap between icon, content, and actions (default: var(--space-sm))
 *   --dx-toast-progress-height - Progress bar height (default: 3px)
 *   --dx-toast-progress-bg - Progress bar color (default: var(--color-interactive))
 *
 * @example
 *   <DanxToast :entry="toastEntry" />
 */
-->

<script setup lang="ts">
import { computed, onScopeDispose } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxBadge } from "../badge";
import { DanxIcon } from "../icon";
import type { DanxToastProps, DanxToastSlots } from "./types";
import { registerTimerReset, unregisterTimerReset, useToast } from "./useToast";
import { useToastTimer } from "./useToastTimer";

const props = defineProps<DanxToastProps>();
defineSlots<DanxToastSlots>();

const { dismiss } = useToast();

const TOAST_VARIANT_TOKENS = {
  "--dx-toast-bg": "bg",
  "--dx-toast-text": "text",
  "--dx-toast-border": "border",
};

const variantStyle = useVariant(
  computed(() => props.entry.variant),
  "toast",
  TOAST_VARIANT_TOKENS
);

const duration = computed(() => props.entry.duration);

const { pause, resume, progress, reset } = useToastTimer(duration, () => {
  dismiss(props.entry.id);
});

// Register/unregister the reset callback for deduplication timer resets
registerTimerReset(props.entry.id, reset);
onScopeDispose(() => {
  unregisterTimerReset(props.entry.id);
});

/** Variant-default icon names */
const variantIconMap: Record<string, string> = {
  success: "confirm",
  danger: "cancel",
  warning: "warning-triangle",
  info: "info",
};

const defaultIcon = computed(() => variantIconMap[props.entry.variant] ?? "");

const progressWidth = computed(() => `${(1 - progress.value) * 100}%`);

function onDismiss(): void {
  dismiss(props.entry.id);
}
</script>

<template>
  <div class="danx-toast" :style="variantStyle" @mouseenter="pause" @mouseleave="resume">
    <div class="danx-toast__body">
      <span v-if="defaultIcon || $slots.icon" class="danx-toast__icon">
        <slot name="icon" :entry="entry">
          <DanxIcon v-if="defaultIcon" :icon="defaultIcon" class="h-4 w-4" />
        </slot>
      </span>

      <span class="danx-toast__content">
        <slot :entry="entry">{{ entry.message }}</slot>
      </span>

      <button
        v-if="entry.dismissible"
        class="danx-toast__close"
        aria-label="Dismiss"
        @click="onDismiss"
      >
        <DanxIcon icon="close" class="h-3 w-3" />
      </button>
    </div>

    <DanxBadge
      v-if="entry.count > 1"
      :value="entry.count"
      :variant="entry.variant === 'danger' ? 'warning' : 'danger'"
      class="danx-toast__badge"
    />

    <div v-if="entry.duration > 0" class="danx-toast__progress" :style="{ width: progressWidth }" />
  </div>
</template>
