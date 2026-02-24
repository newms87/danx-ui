<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxProgressBar indeterminate />
    <DanxProgressBar indeterminate variant="success" />
    <DanxProgressBar indeterminate variant="danger" size="lg" />
  </div>
</template>
