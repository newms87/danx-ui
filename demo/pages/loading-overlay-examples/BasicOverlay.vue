<script setup lang="ts">
import { ref } from "vue";
import { DanxLoadingOverlay, DanxButton } from "danx-ui";

const isLoading = ref(false);

function toggle() {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
}
</script>

<template>
  <div class="flex flex-col gap-3 items-start">
    <DanxButton @click="toggle">Trigger loading</DanxButton>
    <div style="position: relative; width: 16rem; height: 8rem" class="border rounded">
      <p class="p-4 m-0">Card content that stays in place while loading.</p>
      <DanxLoadingOverlay :show="isLoading" />
    </div>
  </div>
</template>
