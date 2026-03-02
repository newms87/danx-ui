<!--
/**
 * DanxDialog Component
 *
 * A fully declarative dialog component built on the native <dialog> element.
 * Uses v-model for state control - no imperative open/close methods.
 *
 * ## Features
 * - Native <dialog> element for accessibility (focus trap, ESC handling, ARIA)
 * - CSS-only animations using @starting-style
 * - Three-tier token system for styling (no styling props)
 * - Optional close/confirm buttons
 * - Full slot customization
 *
 * ## Props
 * | Prop           | Type              | Default   | Description                            |
 * |----------------|-------------------|-----------|----------------------------------------|
 * | modelValue     | boolean           | false     | Controls visibility via v-model        |
 * | title          | string            | undefined | Header title text                      |
 * | subtitle       | string            | undefined | Header subtitle text                   |
 * | width          | number \| string  | undefined | Width (number=vw, string=as-is)        |
 * | height         | number \| string  | undefined | Height (number=vh, string=as-is)       |
 * | persistent     | boolean           | false     | Prevent ESC/backdrop close             |
 * | closeX         | boolean           | false     | Circular X button centered on top-right corner |
 * | closeButton    | boolean \| string | false     | Show close button (true="Close")       |
 * | confirmButton  | boolean \| string | false     | Show confirm button (true="Confirm")   |
 * | isSaving       | boolean           | false     | Loading state for confirm button       |
 * | disabled       | boolean           | false     | Disable confirm button                 |
 * | independent    | boolean           | false     | Opt out of dialog stacking             |
 * | returnOnClose  | boolean           | true      | Reveal previous dialog on close        |
 *
 * ## Events
 * | Event             | Payload | Description                              |
 * |-------------------|---------|------------------------------------------|
 * | update:modelValue | boolean | v-model update when dialog closes        |
 * | close             | none    | Fired on internal close (ESC, backdrop)  |
 * | confirm           | none    | Fired when confirm button clicked        |
 *
 * ## Slots
 * | Slot           | Description                          |
 * |----------------|--------------------------------------|
 * | default        | Main content area                    |
 * | title          | Custom title (replaces title prop)   |
 * | subtitle       | Custom subtitle                      |
 * | actions        | Replace entire footer                |
 * | close-button   | Replace close button only            |
 * | confirm-button | Replace confirm button only          |
 *
 * ## CSS Tokens
 * Override these tokens to customize appearance:
 *
 * | Token                    | Default                  | Description             |
 * |--------------------------|--------------------------|-------------------------|
 * | --dx-dialog-bg              | --color-surface          | Background color        |
 * | --dx-dialog-border-color    | --color-border           | Border color            |
 * | --dx-dialog-border-radius   | --radius-dialog          | Corner radius           |
 * | --dx-dialog-shadow          | --shadow-dialog          | Box shadow              |
 * | --dx-dialog-padding         | --space-lg               | Content padding         |
 * | --dx-dialog-title-color     | --color-text             | Title text color        |
 * | --dx-dialog-title-size      | --text-xl                | Title font size         |
 * | --dx-dialog-subtitle-color  | --color-text-muted       | Subtitle text color     |
 * | --dx-dialog-backdrop        | --color-backdrop         | Backdrop color          |
 * | --dx-dialog-backdrop-blur   | 4px                      | Backdrop blur radius    |
 *
 * The close-x button (when closeX=true) is positioned centered on the
 * top-right corner of the dialog box (half outside). It uses --dx-dialog-bg
 * and --dx-dialog-border-color for its circular background and border.
 *
 * ## Usage Examples
 *
 * Basic dialog:
 *   <DanxDialog v-model="show" title="Hello">Content here</DanxDialog>
 *
 * With buttons:
 *   <DanxDialog v-model="show" close-button confirm-button @confirm="save" />
 *
 * Custom button text:
 *   <DanxDialog v-model="show" close-button="Cancel" confirm-button="Delete" />
 *
 * Fixed size:
 *   <DanxDialog v-model="show" width="400px" height="300px" />
 *
 * Viewport-relative size (80vw x 60vh):
 *   <DanxDialog v-model="show" :width="80" :height="60" />
 *
 * Full screen:
 *   <DanxDialog v-model="show" :width="100" :height="100" />
 *
 * Persistent (no ESC/backdrop close):
 *   <DanxDialog v-model="show" persistent />
 */
-->

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, type StyleValue, useAttrs, watch } from "vue";
import { DanxButton } from "../button";
import { DanxScroll } from "../scroll";
import DialogBreadcrumbs from "./DialogBreadcrumbs.vue";
import type { DanxDialogEmits, DanxDialogProps, DanxDialogSlots } from "./types";
import { useDialogStack } from "./useDialogStack";

const props = withDefaults(defineProps<DanxDialogProps>(), {
  persistent: false,
  closeX: false,
  isSaving: false,
  disabled: false,
  independent: false,
  returnOnClose: true,
});

const emit = defineEmits<DanxDialogEmits>();

const modelValue = defineModel<boolean>({ default: false });

defineSlots<DanxDialogSlots>();

const attrs = useAttrs();

const dialogRef = ref<HTMLDialogElement>();

// Computed styles for width/height
const dialogStyle = computed(() => {
  const style: Record<string, string> = {};

  if (props.width !== undefined) {
    style.width = typeof props.width === "number" ? `${props.width}vw` : props.width;
  }

  if (props.height !== undefined) {
    style.height = typeof props.height === "number" ? `${props.height}vh` : props.height;
  }

  return style;
});

// Button text computed - only called when button is rendered (truthy prop)
const closeButtonText = computed(() => (props.closeButton === true ? "Close" : props.closeButton));

const confirmButtonText = computed(() =>
  props.confirmButton === true ? "Confirm" : props.confirmButton
);

// Show footer if any button is enabled or actions slot is used
const showFooter = computed(() => props.closeButton || props.confirmButton);

// --- Dialog Stack Integration ---
const { stack, register, unregister, isTopOfStack, stackSize } = useDialogStack();

/** Whether this dialog participates in the stack (has a title and is not independent) */
const isStackable = computed(() => !props.independent && !!props.title);

/** Current stack registration id (null when not registered) */
const stackId = ref<string | null>(null);

/** Whether this dialog is registered but not the topmost in the stack */
const isStacked = computed(() => {
  if (!stackId.value) return false;
  return !isTopOfStack(stackId.value);
});

/** Whether to show breadcrumbs (top of stack and stack has multiple entries) */
const showBreadcrumbs = computed(() => {
  if (!stackId.value) return false;
  return isTopOfStack(stackId.value) && stackSize.value > 1;
});

/** Clear this dialog's stack registration (used on close and unmount) */
function unregisterFromStack() {
  if (stackId.value) {
    const id = stackId.value;
    stackId.value = null;
    unregister(id);
  }
}

// Show modal when modelValue becomes true
// nextTick ensures the dialog element exists after v-if renders it
watch(
  modelValue,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      dialogRef.value?.showModal();

      // Register with stack if this dialog is stackable
      if (isStackable.value && !stackId.value) {
        stackId.value = register(
          () => props.title!,
          () => {
            modelValue.value = false;
          }
        );
      }
    } else {
      unregisterFromStack();
    }
  },
  { immediate: true }
);

// Safety net: unregister if the component is unmounted while still open
onBeforeUnmount(unregisterFromStack);

// Handle internal close (ESC key, backdrop click, close button)
function handleClose() {
  emit("close");

  // When returnOnClose is false and we're in a stack, tear down the entire stack
  if (!props.returnOnClose && stackId.value) {
    const entries = [...stack.value].reverse();
    for (const entry of entries) {
      entry.close();
    }
    return;
  }

  modelValue.value = false;
}

// Handle backdrop click
// Using @click.self so only direct clicks on dialog (not children) trigger this
function handleBackdropClick() {
  if (props.persistent) return;
  handleClose();
}

// Handle ESC key via dialog's cancel event
function handleCancel(event: Event) {
  if (props.persistent) {
    event.preventDefault();
    return;
  }
  handleClose();
}

// Handle native dialog close event
// Re-open if closed unexpectedly while in persistent mode
function handleNativeClose() {
  if (props.persistent && modelValue.value) {
    nextTick(() => {
      dialogRef.value?.showModal();
    });
  }
}

// Handle confirm button click
function handleConfirm() {
  emit("confirm");
}
</script>

<template>
  <Teleport to="body">
    <dialog
      v-if="modelValue"
      ref="dialogRef"
      :class="['danx-dialog', { 'danx-dialog--stacked': isStacked }, attrs.class]"
      :style="attrs.style as StyleValue"
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
      <!-- Box wrapper (relative container for close-x positioning) -->
      <div class="danx-dialog__wrapper">
        <!-- Close X Button (outside box to avoid overflow clipping) -->
        <DanxButton
          v-if="props.closeX"
          icon="close"
          size="xs"
          class="danx-dialog__close-x"
          aria-label="Close dialog"
          @click="handleClose"
        />

        <!-- Visible dialog box -->
        <div class="danx-dialog__box" :style="dialogStyle">
          <!-- Header -->
          <header
            v-if="title || subtitle || $slots.title || $slots.subtitle || showBreadcrumbs"
            class="danx-dialog__header"
          >
            <DialogBreadcrumbs v-if="showBreadcrumbs" />
            <div v-if="title || $slots.title" class="danx-dialog__title">
              <slot name="title">{{ title }}</slot>
            </div>
            <div v-if="subtitle || $slots.subtitle" class="danx-dialog__subtitle">
              <slot name="subtitle">{{ subtitle }}</slot>
            </div>
          </header>

          <!-- Content -->
          <DanxScroll class="danx-dialog__content" size="sm">
            <slot />
          </DanxScroll>

          <!-- Footer/Actions -->
          <footer v-if="showFooter || $slots.actions" class="danx-dialog__footer">
            <slot name="actions">
              <!-- Close Button -->
              <slot v-if="closeButton" name="close-button">
                <DanxButton class="danx-dialog__button--secondary" @click="handleClose">
                  {{ closeButtonText }}
                </DanxButton>
              </slot>

              <!-- Confirm Button -->
              <slot v-if="confirmButton" name="confirm-button">
                <DanxButton
                  type="info"
                  class="danx-dialog__button--primary"
                  :disabled="disabled"
                  :loading="isSaving"
                  @click="handleConfirm"
                >
                  {{ confirmButtonText }}
                </DanxButton>
              </slot>
            </slot>
          </footer>
        </div>
      </div>
    </dialog>
  </Teleport>
</template>
