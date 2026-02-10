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
 * | closeX         | boolean           | false     | Show X close button in top-right       |
 * | closeButton    | boolean \| string | false     | Show close button (true="Close")       |
 * | confirmButton  | boolean \| string | false     | Show confirm button (true="Confirm")   |
 * | isSaving       | boolean           | false     | Loading state for confirm button       |
 * | disabled       | boolean           | false     | Disable confirm button                 |
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
import { computed, nextTick, ref, watch } from "vue";
import { DanxButton } from "../button";
import type { DanxDialogEmits, DanxDialogProps, DanxDialogSlots } from "./types";

const props = withDefaults(defineProps<DanxDialogProps>(), {
  persistent: false,
  closeX: false,
  isSaving: false,
  disabled: false,
});

const emit = defineEmits<DanxDialogEmits>();
const modelValue = defineModel<boolean>({ default: false });

defineSlots<DanxDialogSlots>();

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

// Show modal when modelValue becomes true
// nextTick ensures the dialog element exists after v-if renders it
watch(
  modelValue,
  async (isOpen) => {
    if (isOpen) {
      await nextTick();
      dialogRef.value?.showModal();
    }
  },
  { immediate: true }
);

// Handle internal close (ESC key, backdrop click, close button)
function handleClose() {
  emit("close");
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
  <dialog
    v-if="modelValue"
    ref="dialogRef"
    class="danx-dialog"
    @click.self="handleBackdropClick"
    @cancel="handleCancel"
    @close="handleNativeClose"
  >
    <!-- Visible dialog box -->
    <div class="danx-dialog__box" :style="dialogStyle">
      <!-- Close X Button -->
      <DanxButton
        v-if="props.closeX"
        icon="close"
        size="xs"
        class="danx-dialog__close-x"
        aria-label="Close dialog"
        @click="handleClose"
      />

      <!-- Header -->
      <header
        v-if="title || subtitle || $slots.title || $slots.subtitle"
        class="danx-dialog__header"
      >
        <div v-if="title || $slots.title" class="danx-dialog__title">
          <slot name="title">{{ title }}</slot>
        </div>
        <div v-if="subtitle || $slots.subtitle" class="danx-dialog__subtitle">
          <slot name="subtitle">{{ subtitle }}</slot>
        </div>
      </header>

      <!-- Content -->
      <div class="danx-dialog__content">
        <slot />
      </div>

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
  </dialog>
</template>
