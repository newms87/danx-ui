<!--
/**
 * UsageMeterSegment - One colored slice of a DanxUsageMeter track
 *
 * Internal building block of DanxUsageMeter. Renders a single segment at the
 * width computed by `useUsageMeter`, colored by its `color` value or its
 * semantic `variant`, and anchors an optional hover tooltip to it.
 *
 * The tooltip uses DanxTooltip's external-target mode (`:target`), so the
 * tooltip contributes no wrapper element to the flex track — segment widths
 * stay exactly what the geometry says they are. The target element only
 * exists after the first render pass, hence the `v-if` on the ref.
 *
 * Not exported from the library root: consumers compose DanxUsageMeter,
 * which owns segment ordering and geometry.
 *
 * @props
 *   segment: UsageMeterSegmentGeometry - Resolved geometry for this slice
 *   showTooltip?: boolean - Render the hover tooltip (default: true)
 *   tooltipPlacement?: PopoverPlacement - Tooltip side (default: "top")
 *
 * @slots
 *   tooltip - Replace the tooltip body. Receives { segment }
 *
 * @tokens
 *   --dx-usage-meter-segment-bg - Slice background color
 *   --dx-usage-meter-segment-radius - Slice corner radius
 *   --dx-usage-meter-transition - Width transition (disabled under reduced motion)
 *
 * @example
 *   <UsageMeterSegment :segment="geometry[0]" tooltip-placement="bottom" />
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxTooltip } from "../tooltip";
import type { UsageMeterSegmentProps, UsageMeterSegmentSlots } from "./types";

const props = withDefaults(defineProps<UsageMeterSegmentProps>(), {
  showTooltip: true,
  tooltipPlacement: "top",
});

defineSlots<UsageMeterSegmentSlots>();

// Fragment root (segment + teleported tooltip) — attrs cannot auto-inherit.
defineOptions({ inheritAttrs: false });

const USAGE_METER_VARIANT_TOKENS = {
  "--dx-usage-meter-segment-bg": "bg",
};

const variantStyle = useVariant(
  () => props.segment.variant ?? "",
  "usage-meter",
  USAGE_METER_VARIANT_TOKENS
);

/** An explicit `color` wins over the semantic variant mapping. */
const segmentStyle = computed(() => ({
  ...variantStyle.value,
  ...(props.segment.color ? { "--dx-usage-meter-segment-bg": props.segment.color } : {}),
  width: props.segment.width,
}));

const segmentEl = ref<HTMLElement | null>(null);
</script>

<template>
  <div ref="segmentEl" class="danx-usage-meter__segment" :style="segmentStyle" />

  <DanxTooltip
    v-if="showTooltip && segmentEl"
    :target="segmentEl!"
    :placement="tooltipPlacement"
    class="danx-usage-meter__tooltip"
  >
    <slot name="tooltip" :segment="segment">
      <div class="danx-usage-meter__tooltip-body">
        <span class="danx-usage-meter__tooltip-label">{{ segment.label }}</span>
        <span class="danx-usage-meter__tooltip-value">
          {{ segment.formattedValue }} ({{ segment.percentLabel }})
        </span>
      </div>
    </slot>
  </DanxTooltip>
</template>
