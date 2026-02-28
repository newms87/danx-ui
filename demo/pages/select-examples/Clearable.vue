<script setup lang="ts">
import { ref } from "vue";
import { DanxSelect } from "danx-ui";

const single = ref("b");
const multi = ref(["vue", "react"]);
const singleOptions = [
  { value: "a", label: "Alpha" },
  { value: "b", label: "Beta" },
  { value: "c", label: "Charlie" },
];
const multiOptions = [
  { value: "vue", label: "Vue" },
  { value: "react", label: "React" },
  { value: "angular", label: "Angular" },
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxSelect v-model="single" :options="singleOptions" clearable label="Single (clearable)" />
    <DanxSelect
      v-model="multi"
      :options="multiOptions"
      clearable
      multiple
      label="Multi (clearable)"
    />
  </div>
</template>
