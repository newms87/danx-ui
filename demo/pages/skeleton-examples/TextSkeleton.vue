<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div class="flex gap-8 items-start">
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">Default (3 lines)</p>
      <DanxSkeleton shape="text" />
    </div>
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">5 lines</p>
      <DanxSkeleton shape="text" :lines="5" />
    </div>
    <div class="flex-1">
      <p class="m-0 mb-2 text-sm text-text-muted">1 line</p>
      <DanxSkeleton shape="text" :lines="1" />
    </div>
  </div>
</template>
