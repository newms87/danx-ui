<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref("Edit in **dark** or *light* theme.");
</script>

<template>
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; width: 100%;">
    <div>
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600;">Dark (default)</p>
      <MarkdownEditor v-model="content" theme="dark" />
    </div>
    <div>
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600;">Light</p>
      <MarkdownEditor v-model="content" theme="light" />
    </div>
  </div>
</template>
