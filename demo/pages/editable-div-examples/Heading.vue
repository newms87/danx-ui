<script setup>
import { ref } from "vue";
import { DanxEditableDiv } from "danx-ui";

const title = ref("Edit this heading");
</script>

<template>
  <DanxEditableDiv v-model="title" as="h2" size="lg" :min-length="1" />
</template>
