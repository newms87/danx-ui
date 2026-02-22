<script setup lang="ts">
import { DanxButton, DanxChip, DanxBadge } from "danx-ui";

/* Define custom variant tokens as inline styles.
   In your app, you'd put these in a :root CSS block:
     :root {
       --dx-variant-brand-bg: oklch(0.55 0.2 280);
       --dx-variant-brand-bg-hover: oklch(0.5 0.22 280);
       --dx-variant-brand-text: white;
     }
*/
var brandTokens = {
  /* Background color for the variant */
  "--dx-variant-brand-bg": "oklch(0.55 0.2 280)",
  /* Hover state — slightly lighter or darker */
  "--dx-variant-brand-bg-hover": "oklch(0.5 0.22 280)",
  /* Text color — ensure contrast against the background */
  "--dx-variant-brand-text": "white",
};
</script>

<template>
  <div class="custom-variant-demo" :style="brandTokens">
    <p class="step-intro">
      Define a custom <code>"brand"</code> variant by setting three CSS tokens. Then use
      <code>variant="brand"</code> on any component:
    </p>

    <div class="component-row">
      <DanxButton variant="brand" icon="gear">Brand Action</DanxButton>
      <DanxChip variant="brand">Brand</DanxChip>
      <DanxBadge variant="brand" :count="7">
        <DanxButton>Notifications</DanxButton>
      </DanxBadge>
    </div>
  </div>
</template>

<style scoped>
.custom-variant-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.step-intro {
  margin: 0;
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;

  code {
    background: var(--color-surface-sunken);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
}

.component-row {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}
</style>
