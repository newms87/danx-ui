<script setup lang="ts">
import { ref } from "vue";
import { DanxTagInput } from "danx-ui";

const emails = ref([]);
</script>

<template>
  <DanxTagInput
    v-model="emails"
    label="Notify"
    helper-text="Only valid email addresses are accepted."
    placeholder="name@example.com"
    :validate="(t) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)"
    :transform="(t) => t.toLowerCase()"
  />
</template>
