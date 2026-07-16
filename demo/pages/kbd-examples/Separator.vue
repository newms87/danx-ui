<script setup lang="ts">
import { DanxKbd } from "danx-ui";
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <DanxKbd :keys="['ctrl', 'k']" separator="then" />
    <DanxKbd :keys="['ctrl', 'shift', 's']" separator=" / " />
  </div>
</template>
