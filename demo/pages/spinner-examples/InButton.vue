<script setup lang="ts">
import { ref } from "vue";
import { DanxButton } from "danx-ui";

const loading = ref(true);
</script>

<template>
  <DanxButton variant="success" :loading="loading">Save</DanxButton>
</template>
