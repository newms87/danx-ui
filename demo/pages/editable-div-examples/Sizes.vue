<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const small = ref("Small");
const medium = ref("Medium");
const large = ref("Large");
</script>

<template>
  <div class="flex flex-col gap-3">
    <DanxEditableDiv v-model="small" size="sm" />
    <DanxEditableDiv v-model="medium" size="md" />
    <DanxEditableDiv v-model="large" size="lg" />
  </div>
</template>
