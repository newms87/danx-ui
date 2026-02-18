<!--
/**
 * DanxPopover Component
 *
 * A trigger-anchored floating panel. Wraps a trigger element via #trigger slot
 * and renders a positioned panel anchored to it. The panel teleports to <body>
 * with position: fixed to escape overflow clipping.
 *
 * ## Features
 * - v-model visibility control (v-if removes panel from DOM when hidden)
 * - Trigger slot for inline anchor element
 * - Auto-positioning with placement prop (bottom/top/left/right)
 * - Auto-flip when panel would overflow viewport
 * - Click outside (not on trigger or panel) closes the popover
 * - Escape key closes the popover
 * - Panel teleported to <body> to escape stacking contexts
 * - CSS-only entry animations using @starting-style
 * - Attrs forwarded to panel container (not trigger wrapper)
 * - Three-tier token system for styling (no styling props)
 *
 * ## Props
 * | Prop       | Type              | Default  | Description                       |
 * |------------|-------------------|----------|-----------------------------------|
 * | modelValue | boolean           | false    | Controls visibility via v-model   |
 * | placement  | PopoverPlacement  | "bottom" | Panel placement relative to trigger |
 * | position   | PopoverPosition   | -        | Explicit {x, y} viewport coordinates |
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
 * | --dx-popover-offset        | 0.5rem                   | Gap from trigger   |
 * | --dx-popover-animation-duration | --duration-200      | Animation duration |
 *
 * ## Usage Examples
 *
 * Basic popover:
 *   <DanxPopover v-model="show">
 *     <template #trigger><button>Open</button></template>
 *     Popover content here
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
 */
-->

<script setup lang="ts">
import { onMounted, onUnmounted, ref, toRef } from "vue";
import type { DanxPopoverProps, DanxPopoverSlots } from "./types";
import { useClickOutside } from "./useClickOutside";
import { usePopoverPositioning } from "./usePopoverPositioning";

const props = withDefaults(defineProps<DanxPopoverProps>(), {
  modelValue: false,
  placement: "bottom",
});

const modelValue = defineModel<boolean>({ default: false });

defineSlots<DanxPopoverSlots>();
defineOptions({ inheritAttrs: false });

const triggerRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);

const { style: panelStyle } = usePopoverPositioning(
  triggerRef,
  panelRef,
  toRef(() => props.placement),
  modelValue,
  toRef(() => props.position)
);

useClickOutside(triggerRef, panelRef, close, modelValue);

function close(): void {
  modelValue.value = false;
}

function onKeydown(event: KeyboardEvent): void {
  if (event.key === "Escape" && modelValue.value) {
    close();
  }
}

onMounted(() => {
  document.addEventListener("keydown", onKeydown);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeydown);
});
</script>

<template>
  <div ref="triggerRef" class="danx-popover-trigger">
    <slot name="trigger" />
  </div>
  <Teleport to="body">
    <div
      v-if="modelValue"
      ref="panelRef"
      class="danx-popover"
      :style="panelStyle"
      v-bind="$attrs"
      @wheel.stop
      @mousedown.stop
      @mousemove.stop
      @mouseup.stop
      @pointerdown.stop
      @pointermove.stop
      @pointerup.stop
    >
      <slot />
    </div>
  </Teleport>
</template>
