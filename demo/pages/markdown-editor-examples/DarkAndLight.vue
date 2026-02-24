<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref("Edit in **dark** or *light* theme.");
</script>

<template>
  <div class="grid grid-cols-2 gap-4 w-full">
    <div>
      <p class="mb-2 text-sm font-semibold">Dark (default)</p>
      <MarkdownEditor v-model="content" />
    </div>
    <div>
      <p class="mb-2 text-sm font-semibold">Light</p>
      <MarkdownEditor v-model="content" class="theme-light" />
    </div>
  </div>
</template>
