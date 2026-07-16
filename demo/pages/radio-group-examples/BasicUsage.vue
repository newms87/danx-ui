<script setup lang="ts">
import { ref } from "vue";
import { DanxRadioGroup } from "danx-ui";

const plan = ref("free");

const options = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];
</script>

<template>
  <DanxRadioGroup v-model="plan" :options="options" label="Plan" />
</template>
