<script setup lang="ts">
import { ref } from "vue";
import { DanxInput } from "danx-ui";

const bio = ref("Hello!");
const tweet = ref("");
</script>

<template>
  <div class="flex flex-col gap-4">
    <DanxInput v-model="bio" label="Bio (no limit)" show-char-count />
    <DanxInput
      v-model="tweet"
      label="Tweet (max 280)"
      :maxlength="280"
      show-char-count
      placeholder="What's happening?"
    />
  </div>
</template>
