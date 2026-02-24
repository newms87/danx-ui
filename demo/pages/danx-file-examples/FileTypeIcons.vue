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
  <div class="flex gap-4 items-start">
    <div class="w-[120px] h-[100px]">
      <DanxFile :file="pdf" />
    </div>
    <div class="w-[120px] h-[100px]">
      <DanxFile :file="zip" />
    </div>
    <div class="w-[120px] h-[100px]">
      <DanxFile :file="text" />
    </div>
  </div>
</template>
