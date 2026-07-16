<script setup>
import { ref } from "vue";
import { DanxStepper } from "danx-ui";

const activeStep = ref(2);

const steps = [{ label: "Upload" }, { label: "Validate", status: "error" }, { label: "Publish" }];
</script>

<template>
  <DanxStepper v-model="activeStep" :steps="steps" />
</template>
