<script setup>
import { ref } from "vue";
import { DanxStepper } from "danx-ui";

const activeStep = ref(0);

const steps = [
  { label: "Account", description: "Create your account" },
  { label: "Profile", description: "Add profile details" },
  { label: "Confirm", description: "Review and submit" },
];
</script>

<template>
  <DanxStepper v-model="activeStep" :steps="steps" />
  <p class="mt-4 text-text-muted">Active step: {{ activeStep + 1 }}</p>
</template>
