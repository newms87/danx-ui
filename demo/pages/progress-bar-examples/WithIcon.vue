<script setup lang="ts">
import { DanxProgressBar } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxProgressBar :value="85" icon="check" variant="success" size="lg" />
    <DanxProgressBar :value="45" icon="clock" variant="warning" size="lg" label="Rating" />
  </div>
</template>
