<script setup lang="ts">
/**
 * DocSection Component
 *
 * Renders markdown documentation content.
 * Currently displays raw markdown in a pre tag as a placeholder.
 * Can be upgraded to use a proper markdown renderer later.
 */
defineProps<{
  content: string;
}>();
</script>

<template>
  <div class="doc-section">
    <pre class="doc-section__content">{{ content }}</pre>
  </div>
</template>

<style scoped>
.doc-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

:global(.dark) .doc-section {
  background: #1a1a2e;
  border-color: #0f3460;
}

.doc-section__content {
  margin: 0;
  white-space: pre-wrap;
  font-family: "Fira Code", "Consolas", monospace;
  font-size: 0.875rem;
  line-height: 1.6;
}
</style>
