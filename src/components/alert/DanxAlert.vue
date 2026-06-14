<!--
/**
 * DanxAlert Component
 *
 * An inline status/error banner that renders in normal document flow where
 * placed. Use it for persistent, contextual messaging (form errors, status
 * notices) — NOT for transient toasts (no portal, no auto-dismiss, no
 * stacking; reach for DanxToast for those).
 *
 * Composes DanxIcon for both the leading status glyph and the optional dismiss
 * affordance, and draws its colors entirely from the shared --dx-variant-*
 * token system (danger/warning/success/info) so it stays consistent with
 * DanxButton, DanxChip, DanxBadge, and DanxDialog.
 *
 * ## Features
 * - Four semantic variants (danger, warning, success, info) via shared tokens
 * - Optional bold title line above the body
 * - Default slot for arbitrary body content
 * - Optional dismiss button that emits `dismiss`
 * - Accessible role: "alert" for danger/warning, "status" for success/info
 * - Light + dark theming inherited from the semantic token layer
 * - Zero external dependencies
 *
 * ## Props
 * | Prop        | Type        | Default | Description                          |
 * |-------------|-------------|---------|--------------------------------------|
 * | variant     | VariantType | "info"  | Color scheme (danger/warning/...)    |
 * | title       | string      | -       | Optional bold heading line           |
 * | dismissible | boolean     | false   | Show close affordance, emit dismiss  |
 *
 * ## Events
 * | Event   | Payload | Description                          |
 * |---------|---------|--------------------------------------|
 * | dismiss | -       | Fired when the close button is clicked |
 *
 * ## Slots
 * | Slot    | Description                          |
 * |---------|--------------------------------------|
 * | default | Body content (text or markup)        |
 * | icon    | Override the leading status icon     |
 *
 * ## CSS Tokens
 * | Token                   | Default               | Description           |
 * |-------------------------|-----------------------|-----------------------|
 * | --dx-alert-bg           | --color-surface       | Background (variant)  |
 * | --dx-alert-text         | --color-text          | Text color (variant)  |
 * | --dx-alert-border       | --color-border        | Border color (variant)|
 * | --dx-alert-padding-y    | 0.75rem               | Vertical padding      |
 * | --dx-alert-padding-x    | 1rem                  | Horizontal padding    |
 * | --dx-alert-gap          | 0.625rem              | Gap between elements  |
 * | --dx-alert-border-width | 1px                   | Border width          |
 * | --dx-alert-border-radius| 0.5rem                | Corner radius         |
 * | --dx-alert-font-size    | 0.875rem              | Body font size        |
 * | --dx-alert-title-weight | --font-semibold       | Title font weight     |
 * | --dx-alert-icon-size    | 1.125rem              | Leading/dismiss size  |
 *
 * Variant colors are applied automatically via inline styles from the
 * useVariant composable. Per-variant overrides live in the shared
 * --dx-variant-alert-* tokens (variant-tokens.css), tuned so the danger
 * variant matches the conventional tinted red error banner.
 *
 * ## Usage Examples
 *
 * Basic info banner:
 *   <DanxAlert>Changes saved automatically.</DanxAlert>
 *
 * Error banner with title:
 *   <DanxAlert variant="danger" title="Save failed">
 *     The server rejected the request. Try again.
 *   </DanxAlert>
 *
 * Dismissible success banner:
 *   <DanxAlert variant="success" dismissible @dismiss="show = false">
 *     Your profile was updated.
 *   </DanxAlert>
 */
-->

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxIcon } from "../icon";
import type { IconName } from "../icon/icons";
import type { DanxAlertEmits, DanxAlertProps, DanxAlertSlots } from "./types";

const props = withDefaults(defineProps<DanxAlertProps>(), {
  variant: "info",
  dismissible: false,
});

const emit = defineEmits<DanxAlertEmits>();

defineSlots<DanxAlertSlots>();

const ALERT_VARIANT_TOKENS = {
  "--dx-alert-bg": "bg",
  "--dx-alert-text": "text",
  "--dx-alert-border": "border",
};

const variantStyle = useVariant(toRef(props, "variant"), "alert", ALERT_VARIANT_TOKENS);

/** Status icons rendered before the content, keyed by built-in variant. */
const VARIANT_ICONS: Record<string, IconName> = {
  danger: "warning-triangle",
  warning: "warning-triangle",
  success: "confirm",
  info: "info",
};

const statusIcon = computed<IconName>(() => VARIANT_ICONS[props.variant] ?? "info");

/**
 * danger/warning are assertive (role="alert"); success/info and any custom
 * variant are polite (role="status").
 */
const role = computed(() =>
  props.variant === "danger" || props.variant === "warning" ? "alert" : "status"
);

function handleDismiss() {
  emit("dismiss");
}
</script>

<template>
  <div class="danx-alert" :style="variantStyle" :role="role">
    <span class="danx-alert__icon">
      <slot name="icon">
        <DanxIcon :icon="statusIcon" />
      </slot>
    </span>
    <div class="danx-alert__body">
      <p v-if="title" class="danx-alert__title">{{ title }}</p>
      <div class="danx-alert__content"><slot /></div>
    </div>
    <button
      v-if="dismissible"
      type="button"
      class="danx-alert__dismiss"
      aria-label="Dismiss"
      @click="handleDismiss"
    >
      <DanxIcon icon="close" />
    </button>
  </div>
</template>
