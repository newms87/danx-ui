<script setup lang="ts">
/**
 * CreateNewWithNameDialog - Name-capture dialog for create actions
 *
 * Renders a DanxDialog with a text input so the user can supply a name for
 * the new item before the create action is dispatched.  Opens immediately on
 * mount (always inside an `activeActionVnode` context).
 *
 * Used by `withDefaultActions` for the `create-with-name` action.
 * Consumers can use it directly:
 *   ```ts
 *   vnode: () => h(CreateNewWithNameDialog, { title: "Create Campaign" })
 *   ```
 *
 * @props
 *   title: string - Dialog title ("Create <Entity>")
 *
 * @emits
 *   confirm - User clicked Create; payload is `{ name: string }`
 *   cancel  - User cancelled or closed the dialog
 *
 * @tokens
 *   Inherits all --dx-dialog-* tokens from DanxDialog
 *   Inherits all --dx-input-* tokens from DanxInput
 */

import { ref } from "vue";
import { DanxDialog } from "../dialog";
import { DanxInput } from "../input";

const props = defineProps<{
  title: string;
}>();

const emit = defineEmits<{
  confirm: [input: { name: string }];
  cancel: [];
}>();

const isOpen = ref(true);
const name = ref("");

function handleConfirm() {
  if (!name.value.trim()) return;
  isOpen.value = false;
  emit("confirm", { name: name.value.trim() });
}

function handleCancel() {
  isOpen.value = false;
  emit("cancel");
}
</script>

<template>
  <DanxDialog
    v-model="isOpen"
    :title="props.title"
    persistent
    close-button="Cancel"
    confirm-button="Create"
    :disabled="!name.trim()"
    @close="handleCancel"
    @confirm="handleConfirm"
  >
    <DanxInput
      v-model="name"
      label="Name"
      placeholder="Enter a name…"
      class="w-full"
      @keydown.enter="handleConfirm"
    />
  </DanxDialog>
</template>
