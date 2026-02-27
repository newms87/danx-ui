<script setup lang="ts">
import { DanxTextarea } from "danx-ui";
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxTextarea label="2 rows" :rows="2" placeholder="Short textarea" />
    <DanxTextarea label="3 rows (default)" :rows="3" placeholder="Default textarea" />
    <DanxTextarea label="6 rows" :rows="6" placeholder="Tall textarea" />
  </div>
</template>
