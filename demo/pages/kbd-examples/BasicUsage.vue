<script setup lang="ts">
import { DanxKbd } from "danx-ui";
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <DanxKbd :keys="['esc']" />
    <DanxKbd :keys="['ctrl', 'k']" />
    <DanxKbd :keys="['ctrl', 'shift', 'p']" />
  </div>
</template>
