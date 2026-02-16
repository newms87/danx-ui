<!--
/**
 * DanxTooltip - Floating tooltip anchored to a trigger element
 *
 * Displays styled, auto-positioning content near a trigger element.
 * Supports three trigger modes: slot content, triggerIcon shortcut, or
 * external target element. Reuses usePopoverPositioning for placement
 * with auto-flip and viewport clamping.
 *
 * @props
 *   type?: TooltipType - Semantic color type for the panel (default: "")
 *   customType?: string - App-defined type, overrides type for class generation (default: "")
 *   icon?: Component | IconName | string - Panel icon at top-left
 *   triggerIcon?: Component | IconName | string - Shortcut to render DanxIcon as trigger
 *   targetId?: string - External trigger element by ID (looked up after mount)
 *   target?: HTMLElement - External trigger element as HTMLElement reference
 *   tooltip?: string - Simple text content (alternative to default slot)
 *   placement?: PopoverPlacement - Panel placement direction (default: "top")
 *   interaction?: TooltipInteraction - Trigger interaction mode (default: "hover")
 *   enterable?: boolean - Whether cursor can enter the tooltip panel (default: false)
 *   disabled?: boolean - Prevents tooltip from showing (default: false)
 *
 * @slots
 *   trigger - Custom trigger element the tooltip anchors to
 *   default - Panel content rendered inside the floating tooltip
 *
 * @tokens
 *   --dx-tooltip-bg - Panel background color
 *   --dx-tooltip-text - Panel text color
 *   --dx-tooltip-border - Panel border color
 *   --dx-tooltip-border-radius - Panel corner radius
 *   --dx-tooltip-shadow - Panel box shadow
 *   --dx-tooltip-padding-x - Horizontal padding
 *   --dx-tooltip-padding-y - Vertical padding
 *   --dx-tooltip-font-size - Text size
 *   --dx-tooltip-max-width - Maximum panel width
 *   --dx-tooltip-icon-size - Panel icon size
 *   --dx-tooltip-trigger-icon-size - Trigger icon size
 *   --dx-tooltip-gap - Gap between panel icon and content
 *   --dx-tooltip-animation-duration - Entry animation duration
 *   --dx-tooltip-{type}-bg - Per-type background color
 *   --dx-tooltip-{type}-text - Per-type text color
 *
 * @example
 *   <DanxTooltip tooltip="Delete this item">
 *     <template #trigger>
 *       <button>Hover me</button>
 *     </template>
 *   </DanxTooltip>
 *
 * @example
 *   <DanxTooltip triggerIcon="info" type="info" tooltip="Helpful information" />
 *
 * @example
 *   <DanxTooltip targetId="my-element-id" placement="bottom">
 *     <p>Rich tooltip content</p>
 *   </DanxTooltip>
 */
-->

<script setup lang="ts">
import { computed, onMounted, ref, toRef, useSlots, watch } from "vue";
import { DanxIcon } from "../icon";
import { usePopoverPositioning } from "../popover/usePopoverPositioning";
import type { DanxTooltipProps, DanxTooltipSlots } from "./types";
import { useTooltipInteraction } from "./useTooltipInteraction";

const props = withDefaults(defineProps<DanxTooltipProps>(), {
  type: "",
  customType: "",
  placement: "top",
  interaction: "hover",
  enterable: false,
  disabled: false,
});

defineSlots<DanxTooltipSlots>();

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

/**
 * Resolve the actual trigger element. Uses a ref (not computed) so that
 * targetId string lookups via getElementById happen after DOM renders.
 */
const resolvedTrigger = ref<HTMLElement | null>(null);

function updateResolvedTrigger() {
  if (props.targetId) {
    resolvedTrigger.value = document.getElementById(props.targetId);
  } else if (props.target) {
    resolvedTrigger.value = props.target;
  } else {
    resolvedTrigger.value = triggerRef.value;
  }
}

// Re-resolve when targetId, target, or triggerRef changes
watch([() => props.targetId, () => props.target, triggerRef], updateResolvedTrigger);
onMounted(updateResolvedTrigger);

/** Whether the component renders an inline trigger element */
const hasInlineTrigger = computed(() => !props.target && !props.targetId);

const {
  isOpen,
  onInlineMouseenter,
  onInlineMouseleave,
  onInlineClick,
  onInlineFocusin,
  onInlineFocusout,
  onPanelMouseenter,
  onPanelMouseleave,
} = useTooltipInteraction({
  interaction: toRef(props, "interaction"),
  enterable: toRef(props, "enterable"),
  disabled: toRef(props, "disabled"),
  resolvedTrigger,
  panelRef,
  hasExternalTarget: computed(() => !!props.target || !!props.targetId),
});

const placementRef = toRef(props, "placement");
const { style: panelStyle } = usePopoverPositioning(
  computed(() => resolvedTrigger.value),
  panelRef,
  placementRef,
  isOpen
);

const effectiveType = computed(() => props.customType || props.type);

/** CSS classes for the panel element */
const panelClasses = computed(() => {
  const classes = ["danx-tooltip"];
  if (effectiveType.value) {
    classes.push(`danx-tooltip--${effectiveType.value}`);
  }
  return classes;
});

/** Whether the panel has icon + content flex layout */
const hasPanelIcon = computed(() => !!props.icon);
</script>

<template>
  <!-- Inline trigger (only when not using target prop) -->
  <span
    v-if="hasInlineTrigger"
    ref="triggerRef"
    class="danx-tooltip-trigger"
    @mouseenter="onInlineMouseenter"
    @mouseleave="onInlineMouseleave"
    @click="onInlineClick"
    @focusin="onInlineFocusin"
    @focusout="onInlineFocusout"
  >
    <slot name="trigger">
      <DanxIcon v-if="triggerIcon" :icon="triggerIcon" />
    </slot>
  </span>

  <!-- Floating panel -->
  <Teleport to="body">
    <Transition name="danx-tooltip-fade">
      <div
        v-if="isOpen && !disabled"
        ref="panelRef"
        :class="panelClasses"
        :style="panelStyle"
        v-bind="$attrs"
        @mouseenter="onPanelMouseenter"
        @mouseleave="onPanelMouseleave"
      >
        <span v-if="hasPanelIcon" class="danx-tooltip__icon">
          <DanxIcon :icon="icon!" />
        </span>
        <div v-if="hasPanelIcon || slots.default" class="danx-tooltip__content">
          <slot>{{ tooltip }}</slot>
        </div>
        <template v-else>
          <slot>{{ tooltip }}</slot>
        </template>
      </div>
    </Transition>
  </Teleport>
</template>
