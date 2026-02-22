<script setup lang="ts">
import { ref } from "vue";
import { DanxButton, DanxChip, DanxBadge } from "danx-ui";

const isDark = ref(false);
</script>

<template>
  <div class="dark-mode-demo">
    <div class="approach">
      <h4>Approach A: Reference Semantic Tokens (Recommended)</h4>
      <p>
        Define variant tokens using <code>var(--color-*)</code> references. When those semantic
        tokens change in dark mode, your variant follows automatically.
      </p>
    </div>

    <div class="approach">
      <h4>Approach B: Direct Light / Dark Definitions</h4>
      <p>
        Define variant tokens explicitly in both <code>:root</code> and <code>.dark</code>. Use this
        when you need completely different colors per theme.
      </p>
    </div>

    <div class="toggle-bar">
      <DanxButton @click="isDark = !isDark">
        {{ isDark ? "Switch to Light" : "Switch to Dark" }}
      </DanxButton>
      <span class="mode-label">{{ isDark ? "Dark Mode" : "Light Mode" }}</span>
    </div>

    <div class="preview-wrapper" :class="{ dark: isDark }">
      <div class="preview-row">
        <span class="preview-label">ocean (Approach A)</span>
        <DanxButton variant="ocean">Ocean</DanxButton>
        <DanxChip variant="ocean">Ocean</DanxChip>
        <DanxBadge variant="ocean" :value="2">
          <DanxButton>Items</DanxButton>
        </DanxBadge>
      </div>

      <div class="preview-row">
        <span class="preview-label">sunset (Approach B)</span>
        <DanxButton variant="sunset">Sunset</DanxButton>
        <DanxChip variant="sunset">Sunset</DanxChip>
        <DanxBadge variant="sunset" :value="4">
          <DanxButton>Items</DanxButton>
        </DanxBadge>
      </div>
    </div>
  </div>
</template>

<style>
/* Approach A: Semantic token references.
   --color-interactive already has light/dark definitions,
   so the variant inherits dark mode for free. */
:root {
  --dx-variant-ocean-bg: var(--color-interactive);
  --dx-variant-ocean-bg-hover: var(--color-interactive-hover);
  --dx-variant-ocean-text: var(--color-text-inverted);
}

/* Approach B: Explicit light and dark definitions.
   Warm coral in light mode, deep amber in dark mode. */
:root {
  --dx-variant-sunset-bg: oklch(0.65 0.2 30);
  --dx-variant-sunset-bg-hover: oklch(0.6 0.22 30);
  --dx-variant-sunset-text: white;
}

.dark {
  --dx-variant-sunset-bg: oklch(0.5 0.15 50);
  --dx-variant-sunset-bg-hover: oklch(0.55 0.17 50);
  --dx-variant-sunset-text: oklch(0.95 0.02 80);
}

.dark-mode-demo {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.approach {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  h4 {
    margin: 0;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-text);
  }

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.5;

    code {
      background: var(--color-surface-sunken);
      padding: 0.125rem 0.375rem;
      border-radius: 0.25rem;
      font-size: 0.875em;
    }
  }
}

.toggle-bar {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.mode-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text-muted);
}

.preview-wrapper {
  padding: 1.5rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition:
    background-color 0.3s,
    color 0.3s;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.preview-label {
  min-width: 9rem;
  font-family: monospace;
  font-size: 0.875rem;
  color: var(--color-text-subtle);
}
</style>
