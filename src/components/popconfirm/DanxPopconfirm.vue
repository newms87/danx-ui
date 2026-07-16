<!--
/**
 * DanxPopconfirm Component
 *
 * A lightweight inline confirmation popover — wraps DanxPopover with a
 * title/message and confirm/cancel buttons. A packaged alternative to a
 * full DanxDialog confirm for common destructive-action patterns.
 *
 * ## Features
 * - Anchors to a slotted trigger; opens on click (no manual v-model wiring required)
 * - Title + message content, semantic confirm/cancel button variants
 * - Closes on cancel, Escape, and outside-click (inherited from DanxPopover)
 * - Async confirm: when the confirm handler returns a promise, shows a
 *   loading spinner on the confirm button and keeps the panel open until
 *   the promise settles
 *
 * ## Props
 * | Prop           | Type             | Default    | Description                       |
 * |----------------|------------------|------------|------------------------------------|
 * | modelValue     | boolean          | false      | Controls visibility via v-model (optional) |
 * | title          | string           | -          | Title shown above the message     |
 * | message        | string           | -          | Confirmation body text            |
 * | confirmText    | string           | "Confirm"  | Confirm button label               |
 * | cancelText     | string           | "Cancel"   | Cancel button label                |
 * | confirmVariant | VariantType      | "danger"   | Confirm button variant             |
 * | cancelVariant  | VariantType      | ""         | Cancel button variant              |
 * | placement      | PopoverPlacement | "bottom"   | Panel placement relative to trigger |
 *
 * ## Events
 * | Event   | Payload | Description                                        |
 * |---------|---------|-----------------------------------------------------|
 * | confirm | none    | Fired when the confirm button is clicked. May return a promise. |
 * | cancel  | none    | Fired on cancel button, Escape, or outside-click.  |
 *
 * ## Slots
 * | Slot    | Description                              |
 * |---------|-------------------------------------------|
 * | trigger | Inline anchor element for positioning     |
 *
 * ## Usage Examples
 *
 * Basic confirm:
 *   <DanxPopconfirm title="Delete item?" message="This cannot be undone." @confirm="remove">
 *     <template #trigger><DanxButton variant="danger" icon="trash" /></template>
 *   </DanxPopconfirm>
 *
 * Async confirm (loading spinner shown until the promise settles):
 *   <DanxPopconfirm message="Delete this record?" @confirm="async () => await deleteRecord(id)">
 *     <template #trigger><DanxButton variant="danger">Delete</DanxButton></template>
 *   </DanxPopconfirm>
 */
-->

<script setup lang="ts">
import { ref, watch } from "vue";
import { DanxButton } from "../button";
import { DanxPopover } from "../popover";
import type { DanxPopconfirmProps, DanxPopconfirmSlots } from "./types";

const props = withDefaults(defineProps<DanxPopconfirmProps>(), {
  confirmText: "Confirm",
  cancelText: "Cancel",
  confirmVariant: "danger",
  cancelVariant: "",
  placement: "bottom",
});

const open = defineModel<boolean>({ default: false });

defineSlots<DanxPopconfirmSlots>();

const loading = ref(false);

/** Set right before a confirm-triggered close, so the close watcher below skips onCancel */
let suppressNextCancel = false;

watch(open, (isOpen, wasOpen) => {
  if (wasOpen && !isOpen) {
    if (suppressNextCancel) {
      suppressNextCancel = false;
    } else {
      props.onCancel?.();
    }
  }
});

function handleCancel() {
  open.value = false;
}

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
  return !!value && typeof (value as PromiseLike<unknown>).then === "function";
}

async function handleConfirm() {
  if (loading.value) return;

  const result = props.onConfirm?.();

  if (!isPromiseLike(result)) {
    suppressNextCancel = true;
    open.value = false;
    return;
  }

  loading.value = true;
  try {
    await result;
    suppressNextCancel = true;
    open.value = false;
  } catch (error) {
    // Keep the panel open so the user can retry; surface the failure instead of swallowing it.
    console.error("DanxPopconfirm: confirm handler rejected", error);
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <DanxPopover v-model="open" :placement="placement" trigger="click" class="danx-popconfirm">
    <template #trigger>
      <slot name="trigger" />
    </template>

    <div v-if="title" class="danx-popconfirm__title">{{ title }}</div>
    <div v-if="message" class="danx-popconfirm__message">{{ message }}</div>
    <div class="danx-popconfirm__actions">
      <DanxButton size="sm" :variant="cancelVariant" :disabled="loading" @click="handleCancel">
        {{ cancelText }}
      </DanxButton>
      <DanxButton size="sm" :variant="confirmVariant" :loading="loading" @click="handleConfirm">
        {{ confirmText }}
      </DanxButton>
    </div>
  </DanxPopover>
</template>
