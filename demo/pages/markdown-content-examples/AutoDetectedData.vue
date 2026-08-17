<script setup lang="ts">
import { MarkdownContent } from "danx-ui";

// Unfenced structured data is auto-detected and rendered as a code block.
// Switching the language badge on an auto-detected block persists the choice
// to localStorage, so every auto-detected block follows it. Fenced blocks
// (bottom) always keep their declared language.
const content = `Agent output often contains bare payloads with no fences:

{"tool": "search", "query": "markdown renderer", "results": 12}

...and bare YAML mappings:

server: localhost
port: 3000
retries: 5

Switch the language badge on either block above — the choice is remembered for
all auto-detected blocks. This fenced block ignores that preference:

\`\`\`json
{ "fenced": true, "alwaysJson": true }
\`\`\`
`;
</script>

<template>
  <MarkdownContent :content="content" default-code-format="yaml" />
</template>
