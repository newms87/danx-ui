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
  margin: 2rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

:global(.dark) .demo-section {
  background: #16213e;
  border-color: #0f3460;
}

.demo-section__title {
  margin: 0 0 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
}

.demo-section__description {
  margin: 0 0 1rem;
  color: #666;
  font-size: 0.875rem;
}

:global(.dark) .demo-section__description {
  color: #aaa;
}

.demo-section__content {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
