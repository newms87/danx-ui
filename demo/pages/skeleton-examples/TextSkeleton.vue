<script setup lang="ts">
import { DanxSkeleton } from "danx-ui";
</script>

<template>
  <div style="display: flex; gap: 2rem; align-items: start">
    <div style="flex: 1">
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">Default (3 lines)</p>
      <DanxSkeleton shape="text" />
    </div>
    <div style="flex: 1">
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">5 lines</p>
      <DanxSkeleton shape="text" :lines="5" />
    </div>
    <div style="flex: 1">
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; color: gray">1 line</p>
      <DanxSkeleton shape="text" :lines="1" />
    </div>
  </div>
</template>
