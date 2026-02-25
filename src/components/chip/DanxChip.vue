<!--
/**
 * DanxChip Component
 *
 * A pill-shaped label component with semantic color types and optional icons.
 * Chips are labels, not controls — they use a <span> root element and have no
 * disabled/loading states. Native clicks pass through via Vue fallthrough attrs.
 *
 * ## Features
 * - Variant-based coloring via shared variant system (danger, success, warning, info, muted)
 * - Six sizes (xxs, xs, sm, md, lg, xl)
 * - Icons via prop (name string, SVG string, or Component) or slot
 * - Removable with X button that emits remove event
 * - Native click passthrough (no click prevention)
 * - CSS token system for complete styling control
 * - Zero external dependencies (inline SVG icons)
 *
 * ## Props
 * | Prop      | Type       | Default | Description                           |
 * |-----------|------------|---------|---------------------------------------|
 * | variant    | VariantType     | ""      | Visual variant (danger, success, etc) |
 * | size      | ChipSize        | "md"    | Chip size                             |
 * | icon      | Component|string| -       | Icon (name, SVG, or component)        |
 * | label     | string          | -       | Text label (alternative to slot)      |
 * | autoColor | boolean|string  | false   | Hash label/key for deterministic color|
 * | removable | boolean         | false   | Shows remove (X) button               |
 * | tooltip   | string          | -       | Hover tooltip via DanxTooltip         |
 *
 * ## Events
 * | Event  | Payload | Description                              |
 * |--------|---------|------------------------------------------|
 * | remove | -       | Fired when remove button is clicked      |
 *
 * ## Slots
 * | Slot    | Description                    |
 * |---------|--------------------------------|
 * | icon    | Override icon rendering         |
 * | default | Chip text content              |
 *
 * ## CSS Tokens
 * Override these tokens to customize appearance:
 *
 * Global tokens:
 * | Token                    | Default      | Description       |
 * |--------------------------|--------------|-------------------|
 * | --dx-chip-font-family    | --font-sans  | Font family       |
 * | --dx-chip-border-radius  | 9999px       | Corner radius     |
 * | --dx-chip-transition     | --transition-fast | Transition   |
 * | --dx-chip-bg             | --color-surface-sunken | Default bg |
 * | --dx-chip-text           | --color-text | Default text      |
 *
 * Size tokens (per size: xxs, xs, sm, md, lg, xl):
 * | Token                       | Description        |
 * |-----------------------------|--------------------|
 * | --dx-chip-{size}-padding-x  | Horizontal padding |
 * | --dx-chip-{size}-padding-y  | Vertical padding   |
 * | --dx-chip-{size}-icon-size  | Icon dimensions    |
 * | --dx-chip-{size}-font-size  | Font size          |
 * | --dx-chip-{size}-gap        | Icon-text gap      |
 *
 * Variant tokens (set via --dx-variant-{name}-bg, --dx-variant-{name}-text):
 * Variants are applied automatically via inline styles from the useVariant composable.
 * Define custom variants with --dx-variant-{name}-bg and --dx-variant-{name}-text tokens.
 *
 * Remove button tokens:
 * | Token                      | Default           | Description          |
 * |----------------------------|-------------------|----------------------|
 * | --dx-chip-remove-size      | 1em               | Remove icon size     |
 * | --dx-chip-remove-hover-bg  | rgb(0 0 0 / 0.1) | Remove hover bg      |
 *
 * ## Usage Examples
 *
 * Default chip:
 *   <DanxChip>Active</DanxChip>
 *
 * Colored chip with icon:
 *   <DanxChip variant="success" icon="confirm">Approved</DanxChip>
 *
 * Removable chip:
 *   <DanxChip removable @remove="handleRemove">Tag</DanxChip>
 *
 * Different sizes:
 *   <DanxChip size="xs">Small</DanxChip>
 *   <DanxChip size="lg">Large</DanxChip>
 *
 * Using label prop:
 *   <DanxChip variant="info" icon="document" label="Draft" />
 */
-->

<script setup lang="ts">
import { computed, toRef } from "vue";
import { useAutoColor } from "../../shared/autoColor";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxIcon } from "../icon";
import { DanxTooltip } from "../tooltip";
import type { DanxChipEmits, DanxChipProps, DanxChipSlots } from "./types";

const props = withDefaults(defineProps<DanxChipProps>(), {
  variant: "",
  size: "md",
  autoColor: false,
  removable: false,
});

const emit = defineEmits<DanxChipEmits>();

defineSlots<DanxChipSlots>();

const CHIP_VARIANT_TOKENS = {
  "--dx-chip-bg": "bg",
  "--dx-chip-text": "text",
};

const variantStyle = useVariant(toRef(props, "variant"), "chip", CHIP_VARIANT_TOKENS);

const chipClasses = computed(() => ["danx-chip", `danx-chip--${props.size}`]);

const autoColorKey = computed(() =>
  !props.autoColor
    ? ""
    : typeof props.autoColor === "string"
      ? props.autoColor
      : (props.label ?? "")
);

const { style: autoColorStyle } = useAutoColor(autoColorKey);

/** autoColor takes precedence over variant (inline styles override the same tokens) */
const chipStyle = computed(() => (props.autoColor ? autoColorStyle.value : variantStyle.value));

function handleRemove() {
  emit("remove");
}
</script>

<template>
  <DanxTooltip v-if="tooltip" :tooltip="tooltip" placement="top">
    <template #trigger>
      <span :class="chipClasses" :style="chipStyle">
        <span v-if="$slots.icon || icon" class="danx-chip__icon">
          <slot name="icon">
            <DanxIcon :icon="icon!" />
          </slot>
        </span>
        <slot>{{ label }}</slot>
        <button
          v-if="removable"
          type="button"
          class="danx-chip__remove"
          aria-label="Remove"
          @click.stop="handleRemove"
        >
          <DanxIcon icon="close" />
        </button>
      </span>
    </template>
  </DanxTooltip>
  <span v-else :class="chipClasses" :style="chipStyle">
    <!-- Icon (only rendered when icon prop or icon slot is provided) -->
    <span v-if="$slots.icon || icon" class="danx-chip__icon">
      <slot name="icon">
        <DanxIcon :icon="icon!" />
      </slot>
    </span>

    <!-- Content -->
    <slot>{{ label }}</slot>

    <!-- Remove button -->
    <button
      v-if="removable"
      type="button"
      class="danx-chip__remove"
      aria-label="Remove"
      @click.stop="handleRemove"
    >
      <DanxIcon icon="close" />
    </button>
  </span>
</template>
