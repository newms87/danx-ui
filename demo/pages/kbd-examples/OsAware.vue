<script setup lang="ts">
import { DanxKbd } from "danx-ui";
</script>

<template>
  <div class="flex flex-wrap items-center gap-4">
    <div class="flex items-center gap-2">
      <span class="text-sm">Mac:</span>
      <DanxKbd :keys="['meta', 's']" os="mac" />
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm">Other:</span>
      <DanxKbd :keys="['meta', 's']" os="other" />
    </div>
    <div class="flex items-center gap-2">
      <span class="text-sm">Auto-detected:</span>
      <DanxKbd :keys="['ctrl', 'alt', 'delete']" />
    </div>
  </div>
</template>
