<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref("");
</script>

<template>
  <div style="width: 100%;">
    <MarkdownEditor v-model="content" placeholder="Write your release notes here..." />
  </div>
</template>
