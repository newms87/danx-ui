<script setup lang="ts">
/**
 * StructuredData - Demo for auto-detected JSON and YAML blocks
 *
 * Shows the MarkdownEditor rendering unfenced JSON objects, JSON arrays,
 * and YAML key-value blocks with syntax highlighting via CodeViewer.
 */
import { ref } from "vue";
import { MarkdownEditor } from "danx-ui";

const content = ref(`## Structured Data Detection

The editor auto-detects unfenced JSON and YAML blocks and renders them with syntax highlighting.

### JSON Array

[{"name": ["Dr.", "John", "Smith"], "age": 42},
{"name": ["Ms.", "Jane", "Doe"], "age": 37}]

### JSON Object

{"server": "localhost", "port": 3000, "debug": true}

### YAML Block

name: John Smith
age: 42
roles:
  - admin
  - editor

Fenced code blocks still work as usual:

\`\`\`json
{"fenced": true}
\`\`\``);
</script>

<template>
  <div class="w-full">
    <MarkdownEditor v-model="content" />
  </div>
</template>
