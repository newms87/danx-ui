<!--
/**
 * DanxBadge Component
 *
 * A wrapper component that overlays a small indicator (count, dot, or label)
 * on any wrapped content. Common use cases: notification counts on buttons,
 * status dots on icons, "NEW" indicators on menu items.
 *
 * Unlike DanxChip (an inline label), DanxBadge wraps content via a default
 * slot and positions the badge indicator absolutely on one of four corners.
 *
 * ## Features
 * - Three display modes: count (number), dot (minimal circle), label (text)
 * - Variant-based coloring via shared variant system (danger default, success, warning, info, muted)
 * - Four corner placements: top-right (default), top-left, bottom-right, bottom-left
 * - Auto-hide when value is 0 (configurable via showZero)
 * - Max overflow display (e.g. "99+")
 * - Auto-color via string hashing for deterministic colors
 * - CSS token system for complete styling control
 * - Zero external dependencies
 *
 * ## Props
 * | Prop       | Type             | Default     | Description                     |
 * |------------|------------------|-------------|---------------------------------|
 * | variant    | VariantType      | "danger"    | Visual variant (danger, etc)    |
 * | value      | number | string  | -           | Count or label text             |
 * | max        | number           | 99          | Overflow threshold for counts   |
 * | dot        | boolean          | false       | Dot-only mode (no text)         |
 * | showZero   | boolean          | false       | Show badge when value is 0      |
 * | hidden     | boolean          | false       | Force-hide the indicator        |
 * | placement  | BadgePlacement   | "top-right" | Corner position                 |
 * | autoColor  | boolean | string | false       | Hash for deterministic color    |
 *
 * ## Slots
 * | Slot    | Description                          |
 * |---------|--------------------------------------|
 * | default | The wrapped content (button, icon)   |
 *
 * ## CSS Tokens
 * | Token                   | Default            | Description              |
 * |-------------------------|--------------------|--------------------------|
 * | --dx-badge-font-size    | 0.625rem           | Count/label font size    |
 * | --dx-badge-font-weight  | --font-bold        | Font weight              |
 * | --dx-badge-min-width    | 1.25rem            | Min width (circular)     |
 * | --dx-badge-height       | 1.25rem            | Badge height             |
 * | --dx-badge-padding-x    | 0.375rem           | Horizontal padding       |
 * | --dx-badge-border-radius| 9999px             | Corner radius            |
 * | --dx-badge-bg           | --color-danger     | Default background       |
 * | --dx-badge-text         | --color-text-inverted | Default text color    |
 * | --dx-badge-dot-size     | 0.5rem             | Dot mode diameter        |
 * | --dx-badge-offset-x     | 0px                | Horizontal offset        |
 * | --dx-badge-offset-y     | 0px                | Vertical offset          |
 * | --dx-badge-border       | none               | Outline border           |
 *
 * Variant tokens (set via --dx-variant-{name}-bg, --dx-variant-{name}-text):
 * Variants are applied automatically via inline styles from the useVariant composable.
 * Define custom variants with --dx-variant-{name}-bg and --dx-variant-{name}-text tokens.
 *
 * ## Usage Examples
 *
 * Count badge on a button:
 *   <DanxBadge :value="5">
 *     <DanxButton>Messages</DanxButton>
 *   </DanxBadge>
 *
 * Dot indicator on an icon:
 *   <DanxBadge dot variant="success">
 *     <DanxIcon icon="mail" />
 *   </DanxBadge>
 *
 * Label badge:
 *   <DanxBadge value="NEW" variant="info">
 *     <span>Feature</span>
 *   </DanxBadge>
 *
 * Max overflow:
 *   <DanxBadge :value="150" :max="99">
 *     <DanxButton>Inbox</DanxButton>
 *   </DanxBadge>
 */
-->

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useAutoColor } from "../../shared/autoColor";
import { useVariant } from "../../shared/composables/useVariant";
import type { DanxBadgeProps, DanxBadgeSlots } from "./types";

const props = withDefaults(defineProps<DanxBadgeProps>(), {
  variant: "danger",
  max: 99,
  dot: false,
  showZero: false,
  hidden: false,
  placement: "top-right",
  autoColor: false,
});

defineSlots<DanxBadgeSlots>();

const BADGE_VARIANT_TOKENS = {
  "--dx-badge-bg": "bg",
  "--dx-badge-text": "text",
};

const variantStyle = useVariant(toRef(props, "variant"), "badge", BADGE_VARIANT_TOKENS);

const isVisible = computed(() => {
  if (props.hidden) return false;
  if (props.dot) return true;
  if (props.value === undefined || props.value === "") return false;
  if (typeof props.value === "number" && props.value === 0) return props.showZero;
  return true;
});

const displayText = computed(() => {
  if (props.dot) return "";
  if (typeof props.value === "string") return props.value;
  const num = typeof props.value === "number" ? props.value : 0;
  return num > props.max ? `${props.max}+` : String(num);
});

const indicatorClasses = computed(() => [
  "danx-badge__indicator",
  `danx-badge__indicator--${props.placement}`,
  props.dot ? "danx-badge__indicator--dot" : null,
]);

const autoColorKey = computed(() =>
  !props.autoColor
    ? ""
    : typeof props.autoColor === "string"
      ? props.autoColor
      : typeof props.value === "string"
        ? props.value
        : ""
);

const { style: autoColorStyle } = useAutoColor(autoColorKey, "--dx-badge");

/** autoColor takes precedence over variant */
const indicatorStyle = computed(() =>
  props.autoColor ? autoColorStyle.value : variantStyle.value
);
</script>

<template>
  <span class="danx-badge">
    <slot />
    <span v-if="isVisible" :class="indicatorClasses" :style="indicatorStyle">{{
      displayText
    }}</span>
  </span>
</template>
