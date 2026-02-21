<!--
/**
 * DanxProgressBar Component
 *
 * A progress bar component with visual effects, icon support, and token-based theming.
 * Shows determinate or indeterminate progress with optional text labels, buffer bars,
 * and decorative effects (stripes, glow, shimmer, gradient).
 *
 * ## Features
 * - Determinate (0–100%) and indeterminate modes
 * - Buffer bar for secondary progress indication
 * - Six color types: blank (default), danger, success, warning, info, muted
 * - Three sizes: sm, md, lg
 * - Five visual effects: striped, animated stripes, glow, shimmer, gradient
 * - Three text positions: inside, above, beside
 * - Icon support via prop or slot
 * - Custom text via label prop or default slot
 * - Full ARIA accessibility
 * - CSS token system for complete styling control
 * - Zero external dependencies
 *
 * ## Props
 * | Prop           | Type                    | Default  | Description                       |
 * |----------------|-------------------------|----------|-----------------------------------|
 * | value          | number                  | 0        | Current progress value            |
 * | max            | number                  | 100      | Maximum value (100%)              |
 * | buffer         | number                  | 0        | Buffer bar value                  |
 * | indeterminate  | boolean                 | false    | Indeterminate animation mode      |
 * | type           | ProgressBarType         | ""       | Semantic color type               |
 * | customType     | string                  | ""       | App-defined type (overrides type) |
 * | size           | ProgressBarSize         | "md"     | Bar size (sm, md, lg)             |
 * | icon           | Component | string      | -        | Icon in fill area                 |
 * | striped        | boolean                 | false    | Striped overlay effect            |
 * | animateStripes | boolean                 | false    | Animate stripes                   |
 * | glow           | boolean                 | false    | Pulsing glow effect               |
 * | shimmer        | boolean                 | false    | Shimmer sweep effect              |
 * | gradient       | boolean                 | false    | Gradient fill                     |
 * | showText       | boolean                 | true     | Show text label                   |
 * | textPosition   | ProgressBarTextPosition | "inside" | Text label position               |
 * | textAlign      | ProgressBarTextAlign    | "center" | Text alignment                    |
 * | label          | string                  | -        | Custom label text                 |
 * | ariaLabel      | string                  | -        | Accessible label                  |
 *
 * ## Slots
 * | Slot    | Props                      | Description                |
 * |---------|----------------------------|----------------------------|
 * | default | { value, max, percent }    | Custom text content        |
 * | icon    | -                          | Override icon rendering    |
 *
 * ## CSS Tokens
 * See progress-bar-tokens.css for the complete list of customizable tokens.
 *
 * ## Usage Examples
 *
 * Basic usage:
 *   <DanxProgressBar :value="65" />
 *
 * With type and effects:
 *   <DanxProgressBar :value="75" type="success" striped shimmer />
 *
 * Indeterminate loading:
 *   <DanxProgressBar indeterminate type="info" />
 *
 * Custom label:
 *   <DanxProgressBar :value="3" :max="10" label="3 of 10 files" />
 *
 * Slot-based text:
 *   <DanxProgressBar :value="42">
 *     <template #default="{ percent }">{{ percent }}% complete</template>
 *   </DanxProgressBar>
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxIcon } from "../icon";
import type { DanxProgressBarProps, DanxProgressBarSlots } from "./types";

const props = withDefaults(defineProps<DanxProgressBarProps>(), {
  value: 0,
  max: 100,
  buffer: 0,
  indeterminate: false,
  type: "",
  customType: "",
  size: "md",
  striped: false,
  animateStripes: false,
  glow: false,
  shimmer: false,
  gradient: false,
  showText: true,
  textPosition: "inside",
  textAlign: "center",
});

defineSlots<DanxProgressBarSlots>();

const effectiveType = computed(() => props.customType || props.type);

const percent = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(100, Math.max(0, (props.value / props.max) * 100));
});

const bufferPercent = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(100, Math.max(0, (props.buffer / props.max) * 100));
});

const effectiveTextPosition = computed(() => {
  if (props.size === "sm") return "beside";
  return props.textPosition;
});

const displayText = computed(() => {
  if (props.label !== undefined) return props.label;
  return `${Math.round(percent.value)}%`;
});

const barClasses = computed(() => [
  "danx-progress-bar",
  `danx-progress-bar--${props.size}`,
  `danx-progress-bar--text-${props.textAlign}`,
  `danx-progress-bar--text-${effectiveTextPosition.value}`,
  effectiveType.value ? `danx-progress-bar--${effectiveType.value}` : null,
  {
    "danx-progress-bar--striped": props.striped,
    "danx-progress-bar--animate-stripes": props.animateStripes,
    "danx-progress-bar--glow": props.glow,
    "danx-progress-bar--shimmer": props.shimmer,
    "danx-progress-bar--gradient": props.gradient,
  },
]);

const slotProps = computed(() => ({
  value: props.value,
  max: props.max,
  percent: percent.value,
}));
</script>

<template>
  <div
    :class="barClasses"
    role="progressbar"
    :aria-valuenow="indeterminate ? undefined : value"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-label="ariaLabel"
  >
    <!-- Text above -->
    <span
      v-if="showText && effectiveTextPosition === 'above'"
      class="danx-progress-bar__text--above"
    >
      <slot v-bind="slotProps">{{ displayText }}</slot>
    </span>

    <!-- Track -->
    <div class="danx-progress-bar__track">
      <template v-if="!indeterminate">
        <!-- Buffer -->
        <div
          v-if="buffer > 0"
          class="danx-progress-bar__buffer"
          :style="{ width: `${bufferPercent}%` }"
        />

        <!-- Fill -->
        <div class="danx-progress-bar__fill" :style="{ width: `${percent}%` }">
          <!-- Text inside (with optional icon) -->
          <span
            v-if="showText && effectiveTextPosition === 'inside'"
            class="danx-progress-bar__text--inside"
          >
            <span v-if="$slots.icon || icon" class="danx-progress-bar__icon">
              <slot name="icon">
                <DanxIcon :icon="icon!" />
              </slot>
            </span>
            <slot v-bind="slotProps">{{ displayText }}</slot>
          </span>

          <!-- Icon only (when text is not inside) -->
          <span v-else-if="$slots.icon || icon" class="danx-progress-bar__icon">
            <slot name="icon">
              <DanxIcon :icon="icon!" />
            </slot>
          </span>
        </div>
      </template>

      <!-- Indeterminate -->
      <div v-else class="danx-progress-bar__indeterminate" />
    </div>

    <!-- Text beside -->
    <span
      v-if="showText && effectiveTextPosition === 'beside'"
      class="danx-progress-bar__text--beside"
    >
      <slot v-bind="slotProps">{{ displayText }}</slot>
    </span>
  </div>
</template>
