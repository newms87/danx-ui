<script setup lang="ts">
import { ref } from "vue";
import { DanxButton } from "danx-ui";

const isLoading = ref(false);

async function handleLoadingClick() {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 1500));
  isLoading.value = false;
}
</script>

<template>
  <DanxButton variant="success" icon="save" :loading="isLoading" @click="handleLoadingClick">
    {{ isLoading ? "Saving..." : "Save" }}
  </DanxButton>
</template>
