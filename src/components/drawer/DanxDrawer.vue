<!--
/**
 * DanxDrawer Component
 *
 * A v-model-controlled slide-out overlay panel anchored to an edge of the
 * viewport (left/right/top/bottom). Built on the native <dialog> element,
 * reusing DanxDialog's overlay/focus/ESC/backdrop conventions plus a
 * reusable CSS slide transition and a body scroll lock.
 *
 * ## Props
 * | Prop        | Type              | Default | Description                          |
 * |-------------|-------------------|---------|---------------------------------------|
 * | modelValue  | boolean           | false   | Controls visibility via v-model       |
 * | side        | DrawerSide        | "right" | Edge to slide in from                 |
 * | title       | string            | undefined | Header title text                   |
 * | size        | number \| string  | undefined | Width/height (number=vw/vh, string=as-is) |
 * | persistent  | boolean           | false   | Prevent ESC/backdrop close            |
 *
 * ## Events
 * | Event             | Payload | Description                              |
 * |-------------------|---------|-------------------------------------------|
 * | update:modelValue | boolean | v-model update when drawer closes         |
 * | close             | none    | Fired on internal close (ESC, backdrop)   |
 *
 * ## Slots
 * | Slot     | Description                          |
 * |----------|---------------------------------------|
 * | default  | Main content area (body)              |
 * | title    | Custom title (replaces title prop)    |
 * | header   | Replace entire header                 |
 * | footer   | Footer/actions area                   |
 */
-->

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, type StyleValue, useAttrs, watch } from "vue";
import { DanxButton } from "../button";
import DanxScroll from "../scroll/DanxScroll.vue";
import { lockBodyScroll, unlockBodyScroll } from "./bodyScrollLock";
import type { DanxDrawerEmits, DanxDrawerProps, DanxDrawerSlots } from "./types";

const props = withDefaults(defineProps<DanxDrawerProps>(), {
  side: "right",
  persistent: false,
});

const emit = defineEmits<DanxDrawerEmits>();

const modelValue = defineModel<boolean>({ default: false });

defineSlots<DanxDrawerSlots>();

const attrs = useAttrs();

const dialogRef = ref<HTMLDialogElement>();

/** Element focused before the drawer opened, restored to on close. */
let triggerEl: HTMLElement | null = null;

const boxStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.size !== undefined) {
    const isVertical = props.side === "top" || props.side === "bottom";
    const unit = isVertical ? "vh" : "vw";
    const dimension = isVertical ? "height" : "width";
    style[dimension] = typeof props.size === "number" ? `${props.size}${unit}` : props.size;
  }

  return style;
});

watch(
  modelValue,
  async (isOpen) => {
    if (isOpen) {
      triggerEl = document.activeElement as HTMLElement | null;
      lockBodyScroll();
      await nextTick();
      dialogRef.value?.showModal();
    } else {
      unlockBodyScroll();
      triggerEl?.focus();
      triggerEl = null;
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  if (modelValue.value) unlockBodyScroll();
});

function handleClose() {
  emit("close");
  modelValue.value = false;
}

function handleBackdropClick() {
  if (props.persistent) return;
  handleClose();
}

function handleCancel(event: Event) {
  if (props.persistent) {
    event.preventDefault();
    return;
  }
  handleClose();
}

function handleNativeClose() {
  if (props.persistent && modelValue.value) {
    nextTick(() => {
      dialogRef.value?.showModal();
    });
  }
}
</script>

<template>
  <Teleport to="body">
    <dialog
      v-if="modelValue"
      ref="dialogRef"
      :class="['danx-drawer', attrs.class]"
      :style="attrs.style as StyleValue"
      :data-side="side"
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
      @click.self="handleBackdropClick"
      @cancel="handleCancel"
      @close="handleNativeClose"
    >
      <div class="danx-drawer__box dx-slide-transition" :data-side="side" :style="boxStyle">
        <slot name="header">
          <header v-if="title || $slots.title" class="danx-drawer__header">
            <div class="danx-drawer__title">
              <slot name="title">{{ title }}</slot>
            </div>
            <DanxButton
              icon="close"
              size="xs"
              class="danx-drawer__close"
              aria-label="Close drawer"
              @click="handleClose"
            />
          </header>
        </slot>

        <DanxScroll class="danx-drawer__content" size="sm">
          <slot />
        </DanxScroll>

        <footer v-if="$slots.footer" class="danx-drawer__footer">
          <slot name="footer" />
        </footer>
      </div>
    </dialog>
  </Teleport>
</template>
