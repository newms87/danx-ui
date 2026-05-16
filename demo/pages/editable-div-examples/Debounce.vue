<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const value = ref("");
const commits = ref(0);

function onUpdate() {
  commits.value += 1;
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxEditableDiv
      v-model="value"
      commit="debounce"
      :debounce-ms="400"
      placeholder="Type and pause to commit"
      @update:model-value="onUpdate"
    />
    <div class="text-sm text-text-muted">Commits: {{ commits }}</div>
  </div>
</template>
