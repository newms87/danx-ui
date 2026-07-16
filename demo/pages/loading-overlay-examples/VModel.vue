<script setup lang="ts">
import { ref } from "vue";
import { DanxLoadingOverlay, DanxButton } from "danx-ui";

const isLoading = ref(false);
</script>

<template>
  <div class="flex flex-col gap-3 items-start">
    <DanxButton @click="isLoading = !isLoading">Toggle overlay</DanxButton>
    <div style="position: relative; width: 16rem; height: 8rem" class="border rounded">
      <p class="p-4 m-0">Table rows go here.</p>
      <DanxLoadingOverlay v-model:show="isLoading" />
    </div>
  </div>
</template>
