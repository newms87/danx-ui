<script setup lang="ts">
import { DanxAlert } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxAlert variant="info">Inline notice with no title — just body content.</DanxAlert>
    <DanxAlert variant="danger">
      Markup works too: <strong>3 fields</strong> need attention.
    </DanxAlert>
  </div>
</template>
