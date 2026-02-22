<script setup lang="ts">
import { DanxButton, DanxChip, DanxTooltip } from "danx-ui";
</script>

<template>
  <div class="overrides-demo">
    <p class="intro">
      The <code>"royal"</code> variant is purple everywhere. But tooltips need a darker background
      for readability, so we override just the tooltip using the component-specific token
      <code>--dx-variant-tooltip-royal-bg</code>.
    </p>

    <div class="component-row">
      <DanxButton variant="royal" icon="gear">Royal Button</DanxButton>
      <DanxChip variant="royal">Royal Chip</DanxChip>
      <DanxTooltip
        variant="royal"
        tooltip="This tooltip has a darker purple background"
        position="right"
      >
        <span class="hover-target">Royal Tooltip (hover me)</span>
      </DanxTooltip>
    </div>

    <div class="callout">
      <strong>Fallback chain:</strong>
      <code>--dx-variant-tooltip-royal-bg</code> (component-specific) takes precedence over
      <code>--dx-variant-royal-bg</code> (shared). If the component-specific token is not defined,
      it falls back to the shared token automatically.
    </div>
  </div>
</template>

<style>
/* Shared "royal" variant — purple everywhere */
:root {
  --dx-variant-royal-bg: oklch(0.55 0.25 300);
  --dx-variant-royal-bg-hover: oklch(0.5 0.27 300);
  --dx-variant-royal-text: white;
}

/* Component-specific override: tooltips get a darker purple
   so the white text is more readable against the tooltip background */
:root {
  --dx-variant-tooltip-royal-bg: oklch(0.35 0.2 300);
  --dx-variant-tooltip-royal-text: oklch(0.92 0.05 300);
  --dx-variant-tooltip-royal-border: oklch(0.45 0.2 300);
}

.overrides-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.intro {
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

.hover-target {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  cursor: help;
  text-decoration: underline dotted;
}

.callout {
  padding: 1rem;
  border-radius: var(--radius-md);
  background: var(--color-surface-sunken);
  border-left: 3px solid var(--color-interactive);
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.6;

  strong {
    color: var(--color-text);
  }

  code {
    background: rgb(0 0 0 / 0.06);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
}
</style>
