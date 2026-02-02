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
  background: var(--color-surface-sunken);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.doc-section__content {
  margin: 0;
  white-space: pre-wrap;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-text);
}
</style>
