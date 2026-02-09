<script setup lang="ts">
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const shortContent = ref("A compact editor with min-height.");
const tallContent = ref(`This editor has a max-height constraint.

Add more lines to see the scrollbar appear when content exceeds the maximum height.

- Line one
- Line two
- Line three
- Line four
- Line five`);
</script>

<template>
  <div style="display: flex; flex-direction: column; gap: 1.5rem; width: 100%;">
    <div>
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600;">minHeight="60px"</p>
      <MarkdownEditor v-model="shortContent" min-height="60px" />
    </div>
    <div>
      <p style="margin: 0 0 0.5rem; font-size: 0.875rem; font-weight: 600;">maxHeight="150px"</p>
      <MarkdownEditor v-model="tallContent" max-height="150px" />
    </div>
  </div>
</template>
