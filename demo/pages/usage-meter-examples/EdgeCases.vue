<script setup lang="ts">
import { DanxUsageMeter } from "danx-ui";

const messy = [
  { id: "negative", label: "Negative", value: -50 },
  { id: "invalid", label: "Not a number", value: Number.NaN },
  { id: "valid", label: "Valid", value: 25, variant: "info" },
];

const overspent = [
  { id: "cloud", label: "Cloud", value: 90000, variant: "warning" },
  { id: "contractors", label: "Contractors", value: 75000, variant: "danger" },
];
</script>

<template>
  <div class="flex flex-col gap-6 w-full">
    <DanxUsageMeter label="Zero total" :total="0" :segments="[]" />

    <DanxUsageMeter label="Negative and NaN values are clamped" :total="100" :segments="messy" />

    <DanxUsageMeter label="Over capacity" :total="120000" :segments="overspent" />

    <DanxUsageMeter
      label="No tooltips, no readout"
      :total="100"
      :segments="messy"
      :show-tooltips="false"
      :show-readout="false"
    />
  </div>
</template>
