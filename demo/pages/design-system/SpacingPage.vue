<script setup lang="ts">
/**
 * SpacingPage - Design system spacing & layout token reference
 *
 * Visual specimens for:
 * - Primitive spacing scale (horizontal bars)
 * - Semantic spacing tokens
 * - Border radii (primitive + semantic)
 * - Z-index scale (overlapping rectangles)
 */
import DemoSection from "../../components/DemoSection.vue";
import DemoPage from "../../components/DemoPage.vue";

interface SpacingToken {
  token: string;
  name: string;
  rem: string;
}

const spacingScale: SpacingToken[] = [
  { token: "--spacing-0", name: "0", rem: "0" },
  { token: "--spacing-px", name: "px", rem: "1px" },
  { token: "--spacing-0-5", name: "0.5", rem: "0.125rem" },
  { token: "--spacing-1", name: "1", rem: "0.25rem" },
  { token: "--spacing-1-5", name: "1.5", rem: "0.375rem" },
  { token: "--spacing-2", name: "2", rem: "0.5rem" },
  { token: "--spacing-2-5", name: "2.5", rem: "0.625rem" },
  { token: "--spacing-3", name: "3", rem: "0.75rem" },
  { token: "--spacing-3-5", name: "3.5", rem: "0.875rem" },
  { token: "--spacing-4", name: "4", rem: "1rem" },
  { token: "--spacing-5", name: "5", rem: "1.25rem" },
  { token: "--spacing-6", name: "6", rem: "1.5rem" },
  { token: "--spacing-7", name: "7", rem: "1.75rem" },
  { token: "--spacing-8", name: "8", rem: "2rem" },
  { token: "--spacing-9", name: "9", rem: "2.25rem" },
  { token: "--spacing-10", name: "10", rem: "2.5rem" },
  { token: "--spacing-11", name: "11", rem: "2.75rem" },
  { token: "--spacing-12", name: "12", rem: "3rem" },
  { token: "--spacing-14", name: "14", rem: "3.5rem" },
  { token: "--spacing-16", name: "16", rem: "4rem" },
  { token: "--spacing-20", name: "20", rem: "5rem" },
  { token: "--spacing-24", name: "24", rem: "6rem" },
];

interface SemanticSpacing {
  token: string;
  name: string;
  references: string;
}

const semanticSpacing: SemanticSpacing[] = [
  { token: "--space-xs", name: "xs", references: "--spacing-1 (0.25rem)" },
  { token: "--space-sm", name: "sm", references: "--spacing-2 (0.5rem)" },
  { token: "--space-md", name: "md", references: "--spacing-4 (1rem)" },
  { token: "--space-lg", name: "lg", references: "--spacing-6 (1.5rem)" },
  { token: "--space-xl", name: "xl", references: "--spacing-8 (2rem)" },
];

interface RadiusToken {
  token: string;
  name: string;
  value: string;
}

const primitiveRadii: RadiusToken[] = [
  { token: "--radius-none", name: "none", value: "0" },
  { token: "--radius-sm", name: "sm", value: "0.125rem" },
  { token: "--radius-default", name: "default", value: "0.25rem" },
  { token: "--radius-md", name: "md", value: "0.375rem" },
  { token: "--radius-lg", name: "lg", value: "0.5rem" },
  { token: "--radius-xl", name: "xl", value: "0.75rem" },
  { token: "--radius-2xl", name: "2xl", value: "1rem" },
  { token: "--radius-3xl", name: "3xl", value: "1.5rem" },
  { token: "--radius-full", name: "full", value: "9999px" },
];

const semanticRadii: RadiusToken[] = [
  { token: "--radius-component", name: "component", value: "var(--radius-lg)" },
  { token: "--radius-button", name: "button", value: "var(--radius-md)" },
  { token: "--radius-input", name: "input", value: "var(--radius-md)" },
  { token: "--radius-card", name: "card", value: "var(--radius-xl)" },
  { token: "--radius-dialog", name: "dialog", value: "var(--radius-2xl)" },
];

interface ZIndex {
  token: string;
  name: string;
  value: string;
}

const zIndexScale: ZIndex[] = [
  { token: "--z-0", name: "0", value: "0" },
  { token: "--z-10", name: "10", value: "10" },
  { token: "--z-20", name: "20", value: "20" },
  { token: "--z-30", name: "30", value: "30" },
  { token: "--z-40", name: "40", value: "40" },
  { token: "--z-50", name: "50", value: "50" },
];
</script>

<template>
  <DemoPage
    title="Spacing & Layout"
    description="Spacing scale, semantic spacing, border radii, and z-index — the spatial foundation of the design system."
  >
    <!-- Primitive Spacing Scale -->
    <DemoSection
      title="Primitive Spacing Scale"
      description="Horizontal bars showing the progression from 0 to 6rem."
    >
      <template #hint>
        <span class="pattern">--spacing-{N}</span>
        e.g. <code>--spacing-4</code>, <code>--spacing-12</code>.
      </template>
      <div class="spacing-scale">
        <div v-for="s in spacingScale" :key="s.token" class="spacing-row">
          <span class="spacing-row__name">{{ s.name }}</span>
          <div class="spacing-row__bar-track">
            <div class="spacing-row__bar" :style="{ width: `var(${s.token})` }" />
          </div>
          <code class="spacing-row__value">{{ s.rem }}</code>
        </div>
      </div>
    </DemoSection>

    <!-- Semantic Spacing -->
    <DemoSection title="Semantic Spacing" description="Named spacing tokens for common use cases.">
      <template #hint>
        <span class="pattern">--space-{size}</span>
        e.g. <code>--space-sm</code>, <code>--space-xl</code>. Each references a primitive
        <code>--spacing-{N}</code> value.
      </template>
      <div class="spacing-scale">
        <div v-for="s in semanticSpacing" :key="s.token" class="spacing-row">
          <span class="spacing-row__name spacing-row__name--semantic">{{ s.name }}</span>
          <div class="spacing-row__bar-track">
            <div
              class="spacing-row__bar spacing-row__bar--semantic"
              :style="{ width: `var(${s.token})` }"
            />
          </div>
          <code class="spacing-row__token">{{ s.token }}</code>
          <code class="spacing-row__value">{{ s.references }}</code>
        </div>
      </div>
    </DemoSection>

    <!-- Border Radii -->
    <DemoSection
      title="Border Radii"
      description="Primitive values (top row) and semantic aliases (bottom row)."
    >
      <template #hint>
        <span class="pattern">--radius-{name}</span>
        e.g. <code>--radius-lg</code>, <code>--radius-full</code>. Semantic tokens like
        <code>--radius-button</code> and <code>--radius-dialog</code> reference primitives.
      </template>
      <div class="radii-sections">
        <div class="radii-section">
          <h4 class="radii-section__label">Primitives</h4>
          <div class="radii-grid">
            <div v-for="r in primitiveRadii" :key="r.token" class="radius-block">
              <div class="radius-block__square" :style="{ borderRadius: `var(${r.token})` }" />
              <span class="radius-block__name">{{ r.name }}</span>
              <code class="radius-block__value">{{ r.value }}</code>
            </div>
          </div>
        </div>
        <div class="radii-section">
          <h4 class="radii-section__label">Semantic</h4>
          <div class="radii-grid">
            <div v-for="r in semanticRadii" :key="r.token" class="radius-block">
              <div class="radius-block__square" :style="{ borderRadius: `var(${r.token})` }" />
              <span class="radius-block__name">{{ r.name }}</span>
              <code class="radius-block__token">{{ r.token }}</code>
              <code class="radius-block__value">{{ r.value }}</code>
            </div>
          </div>
        </div>
      </div>
    </DemoSection>

    <!-- Z-Index Scale -->
    <DemoSection
      title="Z-Index Scale"
      description="Stacking layers from 0 to 50. Each rectangle overlaps the previous to visualize layering."
    >
      <template #hint>
        <span class="pattern">--z-{N}</span>
        e.g. <code>--z-10</code>, <code>--z-50</code>.
      </template>
      <div class="z-index-demo">
        <div
          v-for="(z, i) in zIndexScale"
          :key="z.token"
          class="z-layer"
          :style="{
            zIndex: z.value,
            left: `${i * 3}rem`,
            top: `${i * 0.75}rem`,
          }"
        >
          <span class="z-layer__label">{{ z.name }}</span>
          <code class="z-layer__token">{{ z.token }}</code>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
.demo-page {
  --demo-page-max-width: 1100px;
}

/* Spacing scale */
.spacing-scale {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;
  width: 100%;
}

.spacing-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .spacing-row__name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-muted);
    min-width: 2rem;
    text-align: right;
    font-family: var(--font-mono);
  }

  .spacing-row__bar-track {
    flex: 1;
    height: 1.25rem;
    background: var(--color-surface-sunken);
    border-radius: var(--radius-sm);
    overflow: hidden;
  }

  .spacing-row__bar {
    height: 100%;
    min-width: 1px;
    background: var(--color-interactive);
    border-radius: var(--radius-sm);
    transition: width 0.2s ease;
  }

  .spacing-row__token {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
    min-width: 8rem;
  }

  .spacing-row__value {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
    min-width: 4rem;
  }
}

/* BEM modifiers — top-level per project rules */
.spacing-row__name--semantic {
  min-width: 2rem;
  font-family: var(--font-sans);
  font-weight: 700;
  color: var(--color-interactive);
}

.spacing-row__bar--semantic {
  background: var(--color-interactive-hover);
}

/* Border radii */
.radii-sections {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  .radii-section__label {
    margin: 0 0 0.75rem;
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .radii-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
}

.radius-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  .radius-block__square {
    width: 3.5rem;
    height: 3.5rem;
    background: var(--color-interactive);
    opacity: 0.8;
  }

  .radius-block__name {
    font-size: 0.875rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .radius-block__token {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
    font-family: var(--font-mono);
  }

  .radius-block__value {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }
}

/* Z-index */
.z-index-demo {
  position: relative;
  height: 10rem;
  width: 100%;
}

.z-layer {
  position: absolute;
  width: 8rem;
  height: 5rem;
  background: var(--color-surface-elevated);
  border: 2px solid var(--color-interactive);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.125rem;
  box-shadow: var(--shadow-md);

  .z-layer__label {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--color-interactive);
  }

  .z-layer__token {
    font-size: 0.875rem;
    color: var(--color-text-subtle);
  }
}
</style>
