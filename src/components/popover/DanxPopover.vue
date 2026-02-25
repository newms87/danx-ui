<!--
/**
 * DanxPopover Component
 *
 * A trigger-anchored floating panel using the native HTML Popover API.
 * The panel renders in the browser's top layer (above all stacking contexts,
 * including dialog elements) and uses JS-based positioning for placement.
 *
 * ## Features
 * - v-model visibility via v-if (completely removed from DOM when hidden)
 * - Native top layer rendering via popover="auto" (above dialogs)
 * - JS positioning with auto-flip and scroll/resize tracking
 * - Light dismiss (click outside) via useClickOutside, Escape-to-close via keydown
 * - Trigger slot for inline anchor element
 * - Click/hover/focus/manual trigger modes
 * - Attrs forwarded to panel container (not trigger wrapper)
 *
 * ## Props
 * | Prop       | Type              | Default  | Description                       |
 * |------------|-------------------|----------|-----------------------------------|
 * | modelValue | boolean           | false    | Controls visibility via v-model   |
 * | placement  | PopoverPlacement  | "bottom" | Panel placement relative to trigger |
 * | position   | PopoverPosition   | -        | Explicit {x, y} viewport coordinates |
 * | trigger    | PopoverTrigger    | "manual" | How popover opens: manual/click/hover/focus |
 * | hoverDelay | number            | 200      | Close delay (ms) for hover mode   |
 * | variant    | VariantType       | ""       | Visual variant (danger, success, etc.) |
 *
 * ## Events
 * | Event             | Payload | Description                              |
 * |-------------------|---------|------------------------------------------|
 * | update:modelValue | boolean | v-model update when popover closes       |
 *
 * ## Slots
 * | Slot    | Description                              |
 * |---------|------------------------------------------|
 * | trigger | Inline anchor element for positioning    |
 * | default | Panel content                            |
 *
 * ## CSS Tokens
 * Override these tokens to customize appearance:
 *
 * | Token                   | Default                  | Description        |
 * |-------------------------|--------------------------|--------------------|
 * | --dx-popover-bg            | --color-surface-elevated | Background color   |
 * | --dx-popover-border        | --color-border           | Border color       |
 * | --dx-popover-border-radius | 0.5rem                   | Corner radius      |
 * | --dx-popover-shadow        | rgb(0 0 0 / 0.5)        | Box shadow color   |
 * | --dx-popover-text          | --color-text             | Body text color    |
 *
 * ## Usage Examples
 *
 * Basic popover:
 *   <DanxPopover v-model="show">
 *     <template #trigger><button>Open</button></template>
 *     Popover content here
 *   </DanxPopover>
 *
 * Click trigger (auto open/close):
 *   <DanxPopover trigger="click">
 *     <template #trigger><button>Click me</button></template>
 *     Content
 *   </DanxPopover>
 *
 * Top placement:
 *   <DanxPopover v-model="show" placement="top">
 *     <template #trigger><button>Open above</button></template>
 *     Content above trigger
 *   </DanxPopover>
 *
 * Explicit position (e.g. context menu at cursor):
 *   <DanxPopover v-model="show" :position="{ x: 300, y: 200 }">
 *     <template #trigger><div @contextmenu.prevent="show = true">Right-click me</div></template>
 *     Context menu content
 *   </DanxPopover>
 *
 * Danger variant:
 *   <DanxPopover trigger="hover" variant="danger">
 *     <template #trigger><span>Hover for error</span></template>
 *     Something went wrong!
 *   </DanxPopover>
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import type { DanxPopoverProps, DanxPopoverSlots } from "./types";
import { useClickOutside } from "./useClickOutside";
import { useEscapeKey } from "./useEscapeKey";
import { usePopoverPositioning } from "./usePopoverPositioning";
import { usePopoverTrigger } from "./usePopoverTrigger";

const props = withDefaults(defineProps<DanxPopoverProps>(), {
  placement: "bottom",
  trigger: "manual",
  hoverDelay: 200,
  variant: "",
});

const modelValue = defineModel<boolean>({ default: false });

defineSlots<DanxPopoverSlots>();

const variantStyle = useVariant(
  computed(() => props.variant),
  "popover",
  {
    "--dx-popover-bg": "bg",
    "--dx-popover-border": "bg",
    "--dx-popover-text": "text",
  }
);

defineOptions({ inheritAttrs: false });

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

/** JS-based positioning: measures trigger, places panel with auto-flip */
const { style: panelStyle } = usePopoverPositioning(
  triggerRef,
  panelRef,
  toRef(() => props.placement),
  modelValue,
  computed(() => props.position)
);

/**
 * When the panel element mounts (via v-if), call showPopover() to promote it
 * to the top layer. Uses popover="manual" so we control dismiss ourselves.
 */
watch(
  panelRef,
  (el) => {
    if (el && !el.matches(":popover-open")) {
      el.showPopover();
    }
  },
  { flush: "post" }
);

/** Click outside closes the popover (light dismiss replacement) */
useClickOutside(
  triggerRef,
  panelRef,
  () => {
    modelValue.value = false;
  },
  modelValue
);

/** Escape key closes the popover */
useEscapeKey(() => {
  modelValue.value = false;
}, modelValue);

// Trigger mode (click/hover/focus)
usePopoverTrigger(
  triggerRef,
  panelRef,
  modelValue,
  toRef(() => props.trigger),
  toRef(() => props.hoverDelay)
);
</script>

<template>
  <div ref="triggerRef" class="danx-popover-trigger">
    <slot name="trigger" />
  </div>
  <div
    v-if="modelValue"
    ref="panelRef"
    popover="manual"
    class="danx-popover"
    :data-placement="placement"
    :style="[panelStyle, variantStyle]"
    v-bind="$attrs"
    @wheel.stop
    @keydown.stop
    @keyup.stop
    @keypress.stop
    @mousedown.stop
    @mousemove.stop
    @mouseup.stop
    @pointerdown.stop
    @pointermove.stop
    @pointerup.stop
    @touchstart.stop
    @touchmove.stop
    @touchend.stop
    @contextmenu.stop
    @click.stop
  >
    <slot />
  </div>
</template>
