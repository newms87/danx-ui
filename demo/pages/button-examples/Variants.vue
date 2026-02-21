<script setup lang="ts">
import { DanxButton } from "danx-ui";
</script>

<template>
  <div class="demo-section">
    <h4>Built-in Variants</h4>
    <div class="button-group">
      <DanxButton icon="edit">Default</DanxButton>
      <DanxButton variant="danger" icon="trash">Danger</DanxButton>
      <DanxButton variant="success" icon="save">Success</DanxButton>
      <DanxButton variant="warning" icon="pause">Warning</DanxButton>
      <DanxButton variant="info" icon="view">Info</DanxButton>
      <DanxButton variant="muted" icon="edit">Muted</DanxButton>
    </div>
  </div>

  <div class="demo-section">
    <h4>Custom Variant</h4>
    <p>
      Define custom variants using CSS tokens. The component looks for
      <code>--dx-variant-{name}-*</code> tokens, or override at the component level with
      <code>--dx-variant-button-{name}-*</code>:
    </p>
    <div class="button-group">
      <DanxButton variant="brand" class="custom-brand-button">Brand</DanxButton>
      <DanxButton variant="brand" icon="star" class="custom-brand-button"
        >Brand with Icon</DanxButton
      >
    </div>
  </div>
</template>

<style scoped>
.demo-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.button-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

h4 {
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-on-surface);
}

p {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-on-surface-variant);
}

code {
  background-color: var(--color-surface-dim);
  padding: 0.2em 0.4em;
  border-radius: 0.25rem;
  font-family: monospace;
  font-size: 0.875em;
}

/* Custom variant definition using CSS tokens */
:root {
  --dx-variant-brand-bg: oklch(0.55 0.2 280);
  --dx-variant-brand-bg-hover: oklch(0.5 0.2 280);
  --dx-variant-brand-bg-active: oklch(0.45 0.2 280);
  --dx-variant-brand-text: white;
  --dx-variant-brand-text-hover: white;
  --dx-variant-brand-border: var(--dx-variant-brand-bg);
}

/* Optional: Component-level override for buttons specifically */
.custom-brand-button {
  --dx-variant-button-brand-bg: oklch(0.6 0.22 290);
  --dx-variant-button-brand-bg-hover: oklch(0.55 0.22 290);
}
</style>
