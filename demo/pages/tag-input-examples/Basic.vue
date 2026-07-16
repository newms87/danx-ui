<script setup lang="ts">
import { ref } from "vue";
import { DanxTagInput } from "danx-ui";

const tags = ref(["design", "frontend"]);
</script>

<template>
  <DanxTagInput v-model="tags" label="Tags" placeholder="Add a tag, then press Enter or comma..." />
</template>
