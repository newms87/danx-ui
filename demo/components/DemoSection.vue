<script setup lang="ts">
/**
 * DemoSection Component
 *
 * Wrapper for live demo examples with title and description.
 */
defineProps<{
  title: string;
  description?: string;
}>();
</script>

<template>
  <div class="demo-section">
    <h3 class="demo-section__title">{{ title }}</h3>
    <p v-if="description" class="demo-section__description">{{ description }}</p>
    <div class="demo-section__content">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  margin: 1.5rem 0;
  padding: 1.5rem;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.demo-section__title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text);
}

.demo-section__description {
  margin: 0 0 1rem;
  color: var(--color-text-muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.demo-section__content {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  align-items: center;
}
</style>
