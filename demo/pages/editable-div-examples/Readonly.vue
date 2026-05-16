<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const value = ref("Read-only — no edit affordance");
</script>

<template>
  <DanxEditableDiv v-model="value" readonly />
</template>
