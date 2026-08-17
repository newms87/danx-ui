<!--
/**
 * DanxUsageMeter Component
 *
 * A segmented usage/quota meter: one track split into N labelled segments
 * plus a formatted "used / total (percent)" readout.
 *
 * Use it wherever a single number hides the interesting part of the story —
 * disk or storage quota broken down by category, budget burn-down by cost
 * center, API rate-limit consumption by endpoint, an LLM context window by
 * message role, or release capacity by workstream. Where DanxProgressBar
 * answers "how far along?", DanxUsageMeter answers "what is the capacity
 * made of?".
 *
 * ## Features
 * - Any number of stacked segments in one track, each independently colored
 * - Semantic variants per segment via the shared variant system, or explicit
 *   `color` values for data-driven palettes
 * - Meter-level `variant` as the fallback color for plain segments
 * - Formatted readout with pluggable `formatValue` (default abbreviates
 *   355400 → "355.4k" using native Intl — zero peer dependencies)
 * - Per-segment hover tooltip with label, value, and share of the track
 * - Three sizes: sm, md, lg
 * - Safe math: zero total, negative values, and NaN never render NaN%
 * - Over-capacity handling: the track stays full and proportional while the
 *   readout reports the true >100% consumption
 * - ARIA progressbar semantics with aria-valuenow/min/max/valuetext
 * - Respects prefers-reduced-motion
 * - CSS token system for complete styling control
 *
 * ## Props
 * | Prop             | Type                       | Default | Description                          |
 * |------------------|----------------------------|---------|--------------------------------------|
 * | segments         | UsageMeterSegment[]        | []      | Stacked consumption categories       |
 * | total            | number                     | 0       | Capacity denominator                 |
 * | label            | string                     | -       | Heading text above the track         |
 * | size             | UsageMeterSize             | "md"    | Meter size (sm, md, lg)              |
 * | variant          | VariantType                | ""      | Fallback color for plain segments    |
 * | formatValue      | (value: number) => string  | -       | Number formatter (default abbreviates)|
 * | showReadout      | boolean                    | true    | Show the used/total readout          |
 * | showTooltips     | boolean                    | true    | Show per-segment hover tooltips      |
 * | tooltipPlacement | PopoverPlacement           | "top"   | Tooltip side                         |
 * | ariaLabel        | string                     | -       | Accessible name (falls back to label)|
 *
 * ## Emits
 * None — the meter is a read-only display component.
 *
 * ## Slots
 * | Slot    | Props                | Description                              |
 * |---------|----------------------|------------------------------------------|
 * | label   | UsageMeterSummary    | Replace the heading text                 |
 * | readout | UsageMeterSummary    | Replace the used/total readout           |
 * | tooltip | { segment }          | Replace the body of every segment tooltip|
 *
 * ## CSS Tokens
 * See usage-meter-tokens.css for the complete list of customizable tokens.
 *
 * ## Usage Examples
 *
 * Disk usage by category:
 *   <DanxUsageMeter
 *     label="Storage"
 *     :total="512000000000"
 *     :segments="[
 *       { id: 'photos', label: 'Photos', value: 180000000000, variant: 'info' },
 *       { id: 'video', label: 'Video', value: 120000000000, variant: 'warning' },
 *       { id: 'system', label: 'System', value: 40000000000, variant: 'muted' },
 *     ]"
 *   />
 *
 * API rate limit with a custom formatter:
 *   <DanxUsageMeter
 *     label="Requests this hour"
 *     :total="10000"
 *     :segments="[{ id: 'reads', label: 'Reads', value: 6200 }]"
 *     :format-value="(n) => n.toLocaleString()"
 *   />
 *
 * Custom readout:
 *   <DanxUsageMeter :total="100" :segments="segments">
 *     <template #readout="{ formattedRemaining }">{{ formattedRemaining }} left</template>
 *   </DanxUsageMeter>
 */
-->

<script setup lang="ts">
import { computed, useSlots } from "vue";
import type { DanxUsageMeterProps, DanxUsageMeterSlots } from "./types";
import { useUsageMeter } from "./useUsageMeter";
import UsageMeterSegment from "./UsageMeterSegment.vue";

const props = withDefaults(defineProps<DanxUsageMeterProps>(), {
  segments: () => [],
  total: 0,
  size: "md",
  variant: "",
  showReadout: true,
  showTooltips: true,
  tooltipPlacement: "top",
});

defineSlots<DanxUsageMeterSlots>();

const slots = useSlots();

const {
  segments: meterSegments,
  summary,
  remainingWidth,
} = useUsageMeter({
  segments: () => props.segments,
  total: () => props.total,
  formatValue: computed(() => props.formatValue),
  variant: () => props.variant,
});

const hasLabel = computed(() => !!props.label || !!slots.label);

const hasHeader = computed(() => hasLabel.value || props.showReadout);

/** A progressbar always needs an accessible name — fall back through label. */
const resolvedAriaLabel = computed(() => props.ariaLabel || props.label || "Usage");

const meterClasses = computed(() => [
  "danx-usage-meter",
  `danx-usage-meter--${props.size}`,
  { "danx-usage-meter--over-capacity": summary.value.isOverCapacity },
]);
</script>

<template>
  <div :class="meterClasses">
    <div v-if="hasHeader" class="danx-usage-meter__header">
      <span v-if="hasLabel" class="danx-usage-meter__label">
        <slot name="label" v-bind="summary">{{ label }}</slot>
      </span>

      <span v-if="showReadout" class="danx-usage-meter__readout">
        <slot name="readout" v-bind="summary">{{ summary.readout }}</slot>
      </span>
    </div>

    <div
      class="danx-usage-meter__track"
      role="progressbar"
      :aria-label="resolvedAriaLabel"
      :aria-valuenow="summary.used"
      :aria-valuemin="0"
      :aria-valuemax="summary.total"
      :aria-valuetext="summary.readout"
    >
      <UsageMeterSegment
        v-for="segment in meterSegments"
        :key="segment.id"
        :segment="segment"
        :show-tooltip="showTooltips"
        :tooltip-placement="tooltipPlacement"
      >
        <template v-if="$slots.tooltip" #tooltip="tooltipProps">
          <slot name="tooltip" v-bind="tooltipProps" />
        </template>
      </UsageMeterSegment>

      <div class="danx-usage-meter__remaining" :style="{ width: remainingWidth }" />
    </div>
  </div>
</template>
