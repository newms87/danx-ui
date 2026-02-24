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

The editor auto-detects unfenced JSON and YAML blocks and renders them with syntax highlighting. Switching an auto-detected block between JSON and YAML via the language badge persists your preference — all future auto-detected blocks will display in that format.

### JSON Array

[{"name": ["Dr.", "John", "Smith"], "age": 42},
{"name": ["Ms.", "Jane", "Doe"], "age": 37}]

### JSON Object

{"server": "localhost", "port": 3000, "debug": true}

### Inline JSON (No Blank Line)

JSON blocks are detected even without a preceding blank line.
Example for name="Dr. John Smith":
[{"name": ["Dr.", "John", "Smith"]}]

### YAML Block

name: John Smith
age: 42
roles:
  - admin
  - editor

Fenced code blocks still work as usual:

\`\`\`json
{"fenced": true}
\`\`\`

Use the code button in the footer to toggle raw markdown view.`);
</script>

<template>
  <div class="w-full">
    <MarkdownEditor v-model="content" />
  </div>
</template>
