<script setup lang="ts">
import { ref } from "vue";
import { DanxTextarea } from "danx-ui";

const bio = ref("A short bio.");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxTextarea
      v-model="bio"
      label="Bio"
      :maxlength="200"
      show-char-count
      placeholder="Write your bio..."
    />
    <DanxTextarea label="Without limit" show-char-count model-value="Just counting characters" />
  </div>
</template>
