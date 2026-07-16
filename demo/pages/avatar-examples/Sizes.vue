<script setup lang="ts">
import { DanxAvatar } from "danx-ui";
</script>

<template>
  <div class="flex items-center gap-3">
    <DanxAvatar name="Ada Lovelace" size="xs" />
    <DanxAvatar name="Ada Lovelace" size="sm" />
    <DanxAvatar name="Ada Lovelace" size="md" />
    <DanxAvatar name="Ada Lovelace" size="lg" />
    <DanxAvatar name="Ada Lovelace" size="xl" />
    <DanxAvatar name="Ada Lovelace" :size="72" />
  </div>
</template>
