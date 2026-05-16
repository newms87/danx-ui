<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const title = ref("Click me and edit");
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxEditableDiv v-model="title" placeholder="Enter a title" />
    <div class="text-sm text-text-muted">Committed: "{{ title }}"</div>
  </div>
</template>
