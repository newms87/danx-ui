<script setup lang="ts">
import { ref } from "vue";
import { DanxChip } from "danx-ui";

const tags = ref(["Vue", "TypeScript", "Tailwind", "Vite"]);

function removeTag(index: number) {
  tags.value.splice(index, 1);
}
</script>

<template>
  <DanxChip v-for="(tag, i) in tags" :key="tag" type="info" removable @remove="removeTag(i)">
    {{ tag }}
  </DanxChip>
  <span v-if="tags.length === 0" style="color: var(--color-text-muted)">All tags removed</span>
</template>
