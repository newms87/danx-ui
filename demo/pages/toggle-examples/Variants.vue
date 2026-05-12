<script setup>
import { ref } from "vue";
import { DanxToggle } from "danx-ui";

const danger = ref(true);
const success = ref(true);
const warning = ref(true);
const info = ref(true);
const muted = ref(true);
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxToggle v-model="danger" variant="danger">Danger</DanxToggle>
    <DanxToggle v-model="success" variant="success">Success</DanxToggle>
    <DanxToggle v-model="warning" variant="warning">Warning</DanxToggle>
    <DanxToggle v-model="info" variant="info">Info</DanxToggle>
    <DanxToggle v-model="muted" variant="muted">Muted</DanxToggle>
  </div>
</template>
