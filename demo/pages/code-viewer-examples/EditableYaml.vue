<script setup lang="ts">
import { ref } from "vue";
import { CodeViewer } from "danx-ui";

const data = ref({
  server: {
    host: "localhost",
    port: 3000,
    cors: true,
  },
  database: {
    driver: "postgres",
    name: "app_db",
  },
});
</script>

<template>
  <CodeViewer
    :model-value="data"
    can-edit
    editable
    @update:model-value="data = $event"
  />
</template>
