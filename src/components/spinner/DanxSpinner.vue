<!--
/**
 * DanxSpinner Component
 *
 * A standalone loading indicator. Renders as a rotating ring built with pure
 * CSS (no external dependencies). Color follows the shared variant token
 * system, or inherits `currentColor` from its parent when no variant is set.
 *
 * ## Features
 * - Three sizes: sm, md, lg
 * - Variant-based color via the shared variant token system
 * - Inherits `currentColor` when no variant is given (composes with any text color)
 * - Accessible: `role="status"` with a configurable `aria-label`
 * - Respects `prefers-reduced-motion`
 * - Zero external dependencies (pure CSS animation)
 *
 * ## Props
 * | Prop      | Type         | Default   | Description                        |
 * |-----------|--------------|-----------|-------------------------------------|
 * | size      | SpinnerSize  | "md"      | Spinner diameter and border width  |
 * | variant   | VariantType  | ""        | Visual variant (color)             |
 * | ariaLabel | string       | "Loading" | Accessible name                    |
 *
 * ## CSS Tokens
 * | Token                          | Default | Description        |
 * |---------------------------------|---------|--------------------|
 * | --dx-spinner-sm-size            | 1rem    | sm diameter        |
 * | --dx-spinner-sm-border-width    | 2px     | sm ring thickness  |
 * | --dx-spinner-md-size            | 1.5rem  | md diameter        |
 * | --dx-spinner-md-border-width    | 2px     | md ring thickness  |
 * | --dx-spinner-lg-size            | 2rem    | lg diameter        |
 * | --dx-spinner-lg-border-width    | 3px     | lg ring thickness  |
 * | --dx-spinner-animation-duration | 0.6s    | Rotation speed     |
 *
 * Variant colors are provided by the shared variant system. Define custom variants:
 *   :root { --dx-variant-myvariant-text: purple; }
 *   <DanxSpinner variant="myvariant" />
 *
 * ## Usage Examples
 *
 * Default spinner (inherits currentColor):
 *   <DanxSpinner />
 *
 * Sized spinner:
 *   <DanxSpinner size="lg" />
 *
 * Colored spinner:
 *   <DanxSpinner variant="success" />
 *
 * Custom accessible label:
 *   <DanxSpinner aria-label="Saving changes" />
 */
-->

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import type { DanxSpinnerProps } from "./types";

const props = withDefaults(defineProps<DanxSpinnerProps>(), {
  size: "md",
  variant: "",
  ariaLabel: "Loading",
});

const SPINNER_VARIANT_TOKENS = {
  "--dx-spinner-color": "text",
};

const variantStyle = useVariant(toRef(props, "variant"), "spinner", SPINNER_VARIANT_TOKENS);

const spinnerClasses = computed(() => ["danx-spinner", `danx-spinner--${props.size}`]);
</script>

<template>
  <span role="status" :aria-label="ariaLabel" :class="spinnerClasses" :style="variantStyle" />
</template>
