<script setup lang="ts">
import { ref, reactive } from "vue";
import { DanxActionButton } from "danx-ui";

const savingManual = ref(false);
const manualAction = reactive({
  isApplying: false,
  name: "manual-save",
  trigger: async () => {
    savingManual.value = true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    savingManual.value = false;
    return "ok";
  },
});

const applyingAction = reactive({
  isApplying: false,
  name: "apply",
  trigger: async () => {
    applyingAction.isApplying = true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    applyingAction.isApplying = false;
    return "ok";
  },
});

const targetItem = reactive({ isSaving: false });
const targetAction = reactive({
  isApplying: false,
  name: "target-save",
  trigger: async () => {
    targetItem.isSaving = true;
    await new Promise((resolve) => setTimeout(resolve, 1500));
    targetItem.isSaving = false;
    return "ok";
  },
});
</script>

<template>
  <div style="display: flex; gap: 2rem; flex-wrap: wrap">
    <div>
      <p style="font-size: 0.75rem; color: gray; font-family: monospace; margin: 0 0 0.5rem">
        saving prop
      </p>
      <DanxActionButton :action="manualAction" :saving="savingManual" variant="success" icon="save">
        Save
      </DanxActionButton>
    </div>
    <div>
      <p style="font-size: 0.75rem; color: gray; font-family: monospace; margin: 0 0 0.5rem">
        action.isApplying
      </p>
      <DanxActionButton :action="applyingAction" variant="info" icon="refresh"
        >Apply</DanxActionButton
      >
    </div>
    <div>
      <p style="font-size: 0.75rem; color: gray; font-family: monospace; margin: 0 0 0.5rem">
        target.isSaving
      </p>
      <DanxActionButton :action="targetAction" :target="targetItem" variant="warning" icon="save">
        Update
      </DanxActionButton>
    </div>
  </div>
</template>
