<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxUsageMeter } from "danx-ui";

const total = 60;

const segments = ref([
  { id: "platform", label: "Platform", value: 22, variant: "info" },
  { id: "growth", label: "Growth", value: 12, variant: "success" },
  { id: "bugfix", label: "Bugfix", value: 6, variant: "warning" },
]);

function commit(id, points) {
  segments.value = segments.value.map((segment) =>
    segment.id === id ? { ...segment, value: Math.max(0, segment.value + points) } : segment
  );
}

function reset() {
  segments.value = [
    { id: "platform", label: "Platform", value: 22, variant: "info" },
    { id: "growth", label: "Growth", value: 12, variant: "success" },
    { id: "bugfix", label: "Bugfix", value: 6, variant: "warning" },
  ];
}
</script>

<template>
  <div class="flex flex-col gap-4 w-full">
    <DanxUsageMeter
      label="Sprint capacity (story points)"
      size="lg"
      :total="total"
      :segments="segments"
    />

    <div class="flex flex-wrap gap-2">
      <DanxButton size="sm" @click="commit('platform', 5)">+5 Platform</DanxButton>
      <DanxButton size="sm" @click="commit('growth', 5)">+5 Growth</DanxButton>
      <DanxButton size="sm" @click="commit('bugfix', 5)">+5 Bugfix</DanxButton>
      <DanxButton size="sm" variant="muted" @click="reset()">Reset</DanxButton>
    </div>

    <p class="text-sm text-slate-500 dark:text-slate-400">
      Keep committing past 60 points: the track stays proportional and the readout turns red to
      report the real over-commitment.
    </p>
  </div>
</template>
