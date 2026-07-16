<!--
/**
 * DanxCard Component
 *
 * A generic surface/container primitive with header, body, and footer
 * slots. Foundational layout building block for other display components
 * (EmptyState, media tiles, forms) that need a bordered/elevated box
 * without duplicating padding, border, radius, and shadow tokens ad hoc.
 *
 * ## Features
 * - header / default (body) / footer slots — any subset may be present
 * - Optional title/subtitle props as a convenience for the header
 * - Three variants: elevated, outlined (default), flat
 * - Three padding densities: compact, comfortable (default), spacious
 * - Purely declarative — no styling props, only component tokens
 *
 * ## Props
 * | Prop     | Type         | Default       | Description                    |
 * |----------|--------------|---------------|---------------------------------|
 * | variant  | CardVariant  | "outlined"    | elevated / outlined / flat      |
 * | padding  | CardPadding  | "comfortable" | compact / comfortable / spacious|
 * | title    | string       | -             | Convenience header heading      |
 * | subtitle | string       | -             | Convenience header subheading   |
 *
 * ## Slots
 * | Slot    | Description                                          |
 * |---------|-------------------------------------------------------|
 * | header  | Header region; falls back to title/subtitle when omitted |
 * | default | Body content                                          |
 * | footer  | Footer region (e.g. actions)                          |
 *
 * ## Usage Examples
 *
 * Body only:
 *   <DanxCard>Plain content.</DanxCard>
 *
 * Title/subtitle convenience props:
 *   <DanxCard title="Team members" subtitle="12 active">...</DanxCard>
 *
 * Full slots, elevated + spacious:
 *   <DanxCard variant="elevated" padding="spacious">
 *     <template #header>Custom header</template>
 *     Body content
 *     <template #footer><DanxButton>Save</DanxButton></template>
 *   </DanxCard>
 */
-->

<script setup lang="ts">
import type { DanxCardProps, DanxCardSlots } from "./types";

withDefaults(defineProps<DanxCardProps>(), {
  variant: "outlined",
  padding: "comfortable",
});

const slots = defineSlots<DanxCardSlots>();
</script>

<template>
  <div :class="['danx-card', `danx-card--${variant}`, `danx-card--padding-${padding}`]">
    <div v-if="slots.header || title || subtitle" class="danx-card__header">
      <slot name="header">
        <h3 v-if="title" class="danx-card__title">{{ title }}</h3>
        <p v-if="subtitle" class="danx-card__subtitle">{{ subtitle }}</p>
      </slot>
    </div>
    <div v-if="slots.default" class="danx-card__body">
      <slot />
    </div>
    <div v-if="slots.footer" class="danx-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>
