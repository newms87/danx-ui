<script setup lang="ts">
import { DanxCard } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxCard variant="elevated" title="Elevated">Background + shadow, no border.</DanxCard>
    <DanxCard variant="outlined" title="Outlined">Background + border, no shadow.</DanxCard>
    <DanxCard variant="flat" title="Flat">Background only, no border or shadow.</DanxCard>
  </div>
</template>
