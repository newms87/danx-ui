<script setup lang="ts">
/**
 * ConfirmActionDialog - Confirmation prompt rendered inside an action vnode
 *
 * Renders a DanxDialog asking the user to confirm a destructive or irreversible
 * action.  The dialog is opened immediately on mount (it is always inside an
 * active `activeActionVnode` context where showing it is the intent).
 *
 * Used by `withDefaultActions` to gate the built-in `delete-with-confirm`
 * action.  Consumers can use it directly as an `action.vnode` factory:
 *   ```ts
 *   vnode: (target) => h(ConfirmActionDialog, { action: "Delete", label: "Item", target })
 *   ```
 *
 * The destructive (danger) styling of the confirm button comes from the
 * dialog's `variant="danger"` — no styling props (danx-ui convention).
 *
 * @props
 *   action: string - Verb displayed in the title ("Delete", "Archive", …)
 *   label: string - Noun for the item being acted on ("Campaign", "User", …)
 *   target: unknown - The action target (forwarded by the action system)
 *
 * @emits
 *   confirm - User clicked the confirm button; payload is {} (no extra input)
 *   cancel  - User cancelled or closed the dialog
 *
 * @tokens
 *   Inherits all --dx-dialog-* tokens from DanxDialog
 */

import { ref } from "vue";
import { DanxDialog } from "../dialog";

const props = withDefaults(
  defineProps<{
    action: string;
    label: string;
    target?: unknown;
  }>(),
  {
    target: undefined,
  }
);

const emit = defineEmits<{
  confirm: [input: Record<string, never>];
  cancel: [];
}>();

const isOpen = ref(true);

function handleConfirm() {
  isOpen.value = false;
  emit("confirm", {});
}

function handleCancel() {
  isOpen.value = false;
  emit("cancel");
}
</script>

<template>
  <DanxDialog
    v-model="isOpen"
    :title="`${props.action} ${props.label}`"
    persistent
    close-button="Cancel"
    :confirm-button="props.action"
    variant="danger"
    @close="handleCancel"
    @confirm="handleConfirm"
  >
    <p class="text-sm">
      Are you sure you want to {{ props.action.toLowerCase() }} this
      {{ props.label.toLowerCase() }}? This action cannot be undone.
    </p>
  </DanxDialog>
</template>
