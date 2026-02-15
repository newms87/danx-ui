<script setup lang="ts">
import { ref } from "vue";
import { CodeViewer } from "danx-ui";

const data = ref({
  id: 42,
  type: "api_response",
  payload:
    '{"message":"Hello, world!","actions":["save","delete"],"metadata":{"source":"api","priority":1}}',
  headers: '{"Content-Type":"application/json","Authorization":"Bearer ***"}',
  nested_array: '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]',
  plain_string: "This is just a normal string, not JSON",
});
</script>

<template>
  <CodeViewer :model-value="data" />
</template>
