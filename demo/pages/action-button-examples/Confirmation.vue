<script setup lang="ts">
import { ref, reactive } from "vue";
import { DanxActionButton } from "danx-ui";

const log = ref("");

const deleteAction = reactive({
  isApplying: false,
  name: "delete",
  trigger: async () => {
    log.value = "Deleting...";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    log.value = "Deleted!";
    return "ok";
  },
});
</script>

<template>
  <DanxActionButton
    :action="deleteAction"
    variant="danger"
    icon="trash"
    confirm
    confirm-text="Are you sure you want to delete this item?"
  >
    Delete
  </DanxActionButton>
  <span v-if="log" style="font-size: 0.875rem; color: gray; font-style: italic">{{ log }}</span>
</template>
