<!--
/**
 * DanxActionButton Component
 *
 * A wrapper around DanxButton that integrates with the action system.
 * Handles action triggering, loading states, and optional confirmation dialogs.
 *
 * ## Features
 * - Triggers a ResourceAction on click
 * - Automatic loading state from action.isApplying or target.isSaving
 * - Optional confirmation dialog before triggering
 * - Success/error/always event callbacks
 * - Full DanxButton prop passthrough (type, customType, size, icon, disabled, tooltip)
 *
 * ## Props
 * | Prop        | Type             | Default         | Description                          |
 * |-------------|------------------|-----------------|--------------------------------------|
 * | type        | ButtonType       | ""              | Semantic color type                  |
 * | customType  | string           | ""              | App-defined type (overrides type)    |
 * | size        | ButtonSize       | "md"            | Button size                          |
 * | icon        | Component|string | -               | Icon (name, SVG string, or component)|
 * | disabled    | boolean          | false           | Disables the button                  |
 * | tooltip     | string           | -               | Native title attribute               |
 * | action      | ResourceAction   | -               | Action to trigger on click           |
 * | target      | ActionTarget     | -               | Target passed to action.trigger()    |
 * | input       | object           | -               | Data passed to action.trigger()      |
 * | confirm     | boolean          | false           | Show confirmation before triggering  |
 * | confirmText | string           | "Are you sure?" | Confirmation dialog message          |
 * | saving      | boolean          | -               | Manual loading state override        |
 * | label       | string           | -               | Text label (alternative to slot)     |
 *
 * ## Events
 * | Event   | Payload | Description                                |
 * |---------|---------|----------------------------------------------|
 * | success | unknown | Emitted with response after action succeeds  |
 * | error   | unknown | Emitted with error after action fails        |
 * | always  | none    | Emitted after action completes (either path) |
 *
 * ## Slots
 * | Slot    | Description              |
 * |---------|--------------------------|
 * | default | Button text content      |
 *
 * ## CSS Tokens
 * Inherits all DanxButton CSS tokens.
 *
 * ## Usage Examples
 *
 * Basic action button:
 *   <DanxActionButton :action="deleteAction" :target="item" type="danger" icon="trash">
 *     Delete
 *   </DanxActionButton>
 *
 * With confirmation:
 *   <DanxActionButton :action="deleteAction" :target="item" confirm confirm-text="Delete this item?">
 *     Delete
 *   </DanxActionButton>
 *
 * With callbacks:
 *   <DanxActionButton :action="saveAction" :target="item" @success="onSaved" @error="onError">
 *     Save
 *   </DanxActionButton>
 */
-->

<script setup lang="ts">
import { computed, ref } from "vue";
import { DanxButton } from "./index";
import { DanxDialog } from "../dialog";
import type { DanxActionButtonEmits, DanxActionButtonProps } from "./action-types";

const props = withDefaults(defineProps<DanxActionButtonProps>(), {
  type: "",
  customType: "",
  size: "md",
  disabled: false,
  confirm: false,
  confirmText: "Are you sure?",
});

const emit = defineEmits<DanxActionButtonEmits>();

defineOptions({ inheritAttrs: false });

const showConfirmDialog = ref(false);

const isLoading = computed(() => {
  if (props.saving) return true;
  if (props.action?.isApplying) return true;
  if (props.target && !Array.isArray(props.target)) {
    return props.target.isSaving ?? false;
  }
  return false;
});

async function triggerAction() {
  if (!props.action) return;

  try {
    const response = await props.action.trigger(props.target, props.input);
    emit("success", response);
  } catch (error) {
    emit("error", error);
  } finally {
    emit("always");
  }
}

function handleClick() {
  if (props.confirm) {
    showConfirmDialog.value = true;
    return;
  }
  triggerAction();
}

function handleConfirm() {
  showConfirmDialog.value = false;
  triggerAction();
}
</script>

<template>
  <DanxButton
    v-bind="$attrs"
    :type="type"
    :custom-type="customType"
    :size="size"
    :icon="icon"
    :disabled="disabled"
    :loading="isLoading"
    :tooltip="tooltip"
    :label="label"
    @click="handleClick"
  >
    <slot />
  </DanxButton>

  <DanxDialog
    v-if="confirm"
    v-model="showConfirmDialog"
    title="Confirm"
    :close-button="true"
    :confirm-button="true"
    @confirm="handleConfirm"
  >
    {{ confirmText }}
  </DanxDialog>
</template>
