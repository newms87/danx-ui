<script setup lang="ts">
import { ref, reactive } from "vue";
import { DanxActionButton } from "danx-ui";

const log = ref("");

const saveAction = reactive({
  isApplying: false,
  name: "save",
  trigger: async () => {
    log.value = "Saving...";
    await new Promise((resolve) => setTimeout(resolve, 1000));
    log.value = "Saved successfully!";
    return "ok";
  },
});
</script>

<template>
  <DanxActionButton :action="saveAction" variant="success" icon="save">Save</DanxActionButton>
  <span v-if="log" class="text-sm text-text-muted italic">{{ log }}</span>
</template>
