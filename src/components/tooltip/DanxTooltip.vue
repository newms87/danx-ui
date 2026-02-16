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
 *   icon?: Component | IconName | string - Panel icon at top-left
 *   triggerIcon?: Component | IconName | string - Shortcut to render DanxIcon as trigger
 *   target?: string | HTMLElement - External trigger element (ID or ref)
 *   tooltip?: string - Simple text content (alternative to default slot)
 *   placement?: PopoverPlacement - Panel placement direction (default: "top")
 *   interaction?: TooltipInteraction - Trigger interaction mode (default: "hover")
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
 *   <DanxTooltip target="my-element-id" placement="bottom">
 *     <p>Rich tooltip content</p>
 *   </DanxTooltip>
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, useSlots } from "vue";
import { DanxIcon } from "../icon";
import { usePopoverPositioning } from "../popover/usePopoverPositioning";
import type { DanxTooltipProps, DanxTooltipSlots } from "./types";
import { useTooltipInteraction } from "./useTooltipInteraction";

const props = withDefaults(defineProps<DanxTooltipProps>(), {
  type: "",
  placement: "top",
  interaction: "hover",
  disabled: false,
});

defineSlots<DanxTooltipSlots>();

defineOptions({ inheritAttrs: false });

const slots = useSlots();

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

/** Resolve the actual trigger element from target prop, triggerRef, or nothing */
const resolvedTrigger = computed<HTMLElement | null>(() => {
  if (props.target) {
    if (typeof props.target === "string") {
      return document.getElementById(props.target);
    }
    return props.target;
  }
  return triggerRef.value;
});

/** Whether the component renders an inline trigger element */
const hasInlineTrigger = computed(() => !props.target);

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
  disabled: toRef(props, "disabled"),
  resolvedTrigger,
  panelRef,
  hasExternalTarget: computed(() => !!props.target),
});

const placementRef = toRef(props, "placement");
const { style: panelStyle } = usePopoverPositioning(
  computed(() => resolvedTrigger.value),
  panelRef,
  placementRef,
  isOpen
);

/** CSS classes for the panel element */
const panelClasses = computed(() => {
  const classes = ["danx-tooltip"];
  if (props.type) {
    classes.push(`danx-tooltip--${props.type}`);
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
  </Teleport>
</template>
