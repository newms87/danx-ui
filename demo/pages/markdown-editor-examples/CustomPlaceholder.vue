<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref("");
</script>

<template>
  <div class="w-full">
    <MarkdownEditor v-model="content" placeholder="Write your release notes here..." />
  </div>
</template>
