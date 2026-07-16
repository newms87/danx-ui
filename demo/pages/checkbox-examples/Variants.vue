<script setup lang="ts">
import { ref } from "vue";
import { DanxCheckbox } from "danx-ui";

const checked = ref(true);
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxCheckbox v-model="checked" variant="danger">Danger</DanxCheckbox>
    <DanxCheckbox v-model="checked" variant="success">Success</DanxCheckbox>
    <DanxCheckbox v-model="checked" variant="warning">Warning</DanxCheckbox>
    <DanxCheckbox v-model="checked" variant="info">Info</DanxCheckbox>
    <DanxCheckbox v-model="checked" variant="muted">Muted</DanxCheckbox>
  </div>
</template>
