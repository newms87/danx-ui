<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const note = ref("Type multiple lines.\nPress Ctrl+Enter to commit.");
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxEditableDiv v-model="note" mode="multi" layout="block" />
    <pre class="text-sm text-text-muted whitespace-pre-wrap">{{ note }}</pre>
  </div>
</template>
