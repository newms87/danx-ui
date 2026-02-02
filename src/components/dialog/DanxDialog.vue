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
 * | --dialog-bg              | --color-surface          | Background color        |
 * | --dialog-border-color    | --color-border           | Border color            |
 * | --dialog-border-radius   | --radius-dialog          | Corner radius           |
 * | --dialog-shadow          | --shadow-dialog          | Box shadow              |
 * | --dialog-padding         | --space-lg               | Content padding         |
 * | --dialog-title-color     | --color-text             | Title text color        |
 * | --dialog-title-size      | --text-xl                | Title font size         |
 * | --dialog-subtitle-color  | --color-text-muted       | Subtitle text color     |
 * | --dialog-backdrop        | --color-backdrop         | Backdrop color          |
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
import type { DanxDialogProps } from "./types";

const props = withDefaults(defineProps<DanxDialogProps>(), {
  persistent: false,
  isSaving: false,
  disabled: false,
});

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void;
  (e: "confirm"): void;
}>();

const modelValue = defineModel<boolean>({ default: false });

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
const closeButtonText = computed(() =>
  props.closeButton === true ? "Close" : props.closeButton
);

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
  >
    <!-- Visible dialog box -->
    <div class="danx-dialog__box" :style="dialogStyle">
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
            <button
              type="button"
              class="danx-dialog__button danx-dialog__button--secondary"
              @click="handleClose"
            >
              {{ closeButtonText }}
            </button>
          </slot>

          <!-- Confirm Button -->
          <slot v-if="confirmButton" name="confirm-button">
            <button
              type="button"
              class="danx-dialog__button danx-dialog__button--primary"
              :disabled="disabled || isSaving"
              @click="handleConfirm"
            >
              <span v-if="isSaving" class="danx-dialog__spinner" />
              {{ confirmButtonText }}
            </button>
          </slot>
        </slot>
      </footer>
    </div>
  </dialog>
</template>
