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
  <div class="flex flex-col gap-6 w-full">
    <div>
      <p class="mb-2 text-sm font-semibold">
        --dx-mde-min-height: 60px
      </p>
      <MarkdownEditor v-model="shortContent" style="--dx-mde-min-height: 60px" />
    </div>
    <div>
      <p class="mb-2 text-sm font-semibold">
        --dx-mde-max-height: 150px
      </p>
      <MarkdownEditor v-model="tallContent" style="--dx-mde-max-height: 150px" />
    </div>
  </div>
</template>
