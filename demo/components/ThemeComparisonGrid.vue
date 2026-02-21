<script setup lang="ts">
/**
 * ThemeComparisonGrid - Side-by-side light/dark theme comparison layout
 *
 * Renders a two-column grid with "Light" and "Dark" panels. The dark panel
 * wraps its content in a `.dark` class so all CSS variable-driven tokens
 * shift to their dark theme values automatically.
 *
 * @slots
 *   light - Content rendered in the light (normal) panel
 *   dark - Content rendered in the dark-themed panel
 */
</script>

<template>
  <div class="theme-comparison-grid">
    <div class="theme-comparison-grid__panel">
      <h4 class="theme-comparison-grid__label">Light</h4>
      <slot name="light" />
    </div>
    <div class="theme-comparison-grid__panel dark">
      <h4 class="theme-comparison-grid__label">Dark</h4>
      <slot name="dark" />
    </div>
  </div>
</template>

<style scoped>
.theme-comparison-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
}

.theme-comparison-grid__panel {
  padding: 1.25rem;
  border-radius: var(--radius-xl);
  background: var(--color-surface);
  border: 1px solid var(--color-border);
}

.theme-comparison-grid__label {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-subtle);
}
</style>
