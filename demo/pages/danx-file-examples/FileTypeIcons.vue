<script setup lang="ts">
import { ref } from "vue";
import { DanxFile } from "danx-ui";

const pdf = ref({
  id: "6",
  name: "report.pdf",
  size: 524288,
  type: "application/pdf",
  url: "",
  children: [],
});

const zip = ref({
  id: "7",
  name: "archive.zip",
  size: 1048576,
  type: "application/zip",
  url: "",
  children: [],
});

const text = ref({
  id: "8",
  name: "readme.txt",
  size: 2048,
  type: "text/plain",
  url: "",
  children: [],
});
</script>

<template>
  <div class="flex gap-6 items-end flex-wrap">
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="pdf" size="xs" />
      <span class="text-xs text-text-muted">xs (PDF)</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="pdf" size="sm" />
      <span class="text-xs text-text-muted">sm (PDF)</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="pdf" size="md" />
      <span class="text-xs text-text-muted">md (PDF)</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="zip" size="lg" />
      <span class="text-xs text-text-muted">lg (ZIP)</span>
    </div>
    <div class="flex flex-col items-center gap-1">
      <DanxFile :file="text" size="xl" />
      <span class="text-xs text-text-muted">xl (TXT)</span>
    </div>
  </div>
</template>
