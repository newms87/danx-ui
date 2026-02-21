<script setup lang="ts">
/**
 * TypographyPage - Design system typography token reference
 *
 * Visual specimens for:
 * - Font families (sans and mono)
 * - Type scale (xs through 3xl)
 * - Font weights (normal through bold)
 * - Line heights (none through relaxed)
 */
import DemoSection from "../../components/DemoSection.vue";
import DemoPage from "../../components/DemoPage.vue";

interface TypeSize {
  token: string;
  name: string;
  rem: string;
}

const typeSizes: TypeSize[] = [
  { token: "--text-xs", name: "xs", rem: "0.75rem" },
  { token: "--text-sm", name: "sm", rem: "0.875rem" },
  { token: "--text-base", name: "base", rem: "1rem" },
  { token: "--text-lg", name: "lg", rem: "1.125rem" },
  { token: "--text-xl", name: "xl", rem: "1.25rem" },
  { token: "--text-2xl", name: "2xl", rem: "1.5rem" },
  { token: "--text-3xl", name: "3xl", rem: "1.875rem" },
];

interface FontWeight {
  token: string;
  name: string;
  value: string;
}

const fontWeights: FontWeight[] = [
  { token: "--font-normal", name: "normal", value: "400" },
  { token: "--font-medium", name: "medium", value: "500" },
  { token: "--font-semibold", name: "semibold", value: "600" },
  { token: "--font-bold", name: "bold", value: "700" },
];

interface LineHeight {
  token: string;
  name: string;
  value: string;
}

const lineHeights: LineHeight[] = [
  { token: "--leading-none", name: "none", value: "1" },
  { token: "--leading-tight", name: "tight", value: "1.25" },
  { token: "--leading-snug", name: "snug", value: "1.375" },
  { token: "--leading-normal", name: "normal", value: "1.5" },
  { token: "--leading-relaxed", name: "relaxed", value: "1.625" },
];

const sampleText = "The quick brown fox jumps over the lazy dog";
const multilineText =
  "Typography is the art and technique of arranging type to make written language legible, readable, and appealing when displayed. The arrangement of type involves selecting typefaces, point sizes, line lengths, line spacing, and letter spacing.";
</script>

<template>
  <DemoPage
    title="Typography"
    description="Font families, type scale, weights, and line heights — all defined as primitive tokens."
  >
    <!-- Font Families -->
    <DemoSection
      title="Font Families"
      description="Two font stacks: sans-serif for UI text and monospace for code."
    >
      <div class="font-families">
        <div class="font-specimen">
          <h4 class="font-specimen__label">Sans <code>--font-sans</code></h4>
          <p class="font-specimen__sample font-specimen__sample--sans">{{ sampleText }}</p>
          <p class="font-specimen__stack">
            ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"
          </p>
        </div>
        <div class="font-specimen">
          <h4 class="font-specimen__label">Mono <code>--font-mono</code></h4>
          <p class="font-specimen__sample font-specimen__sample--mono">{{ sampleText }}</p>
          <p class="font-specimen__stack">
            ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono"
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- Type Scale -->
    <DemoSection
      title="Type Scale"
      description="Seven sizes from xs to 3xl, defined in rem for accessibility."
    >
      <div class="type-scale">
        <div v-for="size in typeSizes" :key="size.token" class="type-row">
          <div class="type-row__meta">
            <span class="type-row__name">{{ size.name }}</span>
            <code class="type-row__token">{{ size.token }}</code>
            <span class="type-row__value">{{ size.rem }}</span>
          </div>
          <p class="type-row__sample" :style="{ fontSize: `var(${size.token})` }">
            {{ sampleText }}
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- Font Weights -->
    <DemoSection
      title="Font Weights"
      description="Four weight levels from normal (400) to bold (700)."
    >
      <div class="weight-specimens">
        <div v-for="weight in fontWeights" :key="weight.token" class="weight-row">
          <div class="weight-row__meta">
            <span class="weight-row__name">{{ weight.name }}</span>
            <code class="weight-row__token">{{ weight.token }}</code>
            <span class="weight-row__value">{{ weight.value }}</span>
          </div>
          <p class="weight-row__sample" :style="{ fontWeight: `var(${weight.token})` }">
            {{ sampleText }}
          </p>
        </div>
      </div>
    </DemoSection>

    <!-- Line Heights -->
    <DemoSection
      title="Line Heights"
      description="Five line-height values. Multi-line text shows the density differences."
    >
      <div class="leading-specimens">
        <div v-for="lh in lineHeights" :key="lh.token" class="leading-block">
          <div class="leading-block__meta">
            <span class="leading-block__name">{{ lh.name }}</span>
            <code class="leading-block__token">{{ lh.token }}</code>
            <span class="leading-block__value">{{ lh.value }}</span>
          </div>
          <p class="leading-block__sample" :style="{ lineHeight: `var(${lh.token})` }">
            {{ multilineText }}
          </p>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
.demo-page {
  --demo-page-max-width: 1100px;
}

/* Font families */
.font-families {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.font-specimen__label {
  margin: 0 0 0.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--color-text-muted);

  code {
    font-weight: 400;
    color: var(--color-text-subtle);
    font-size: 0.6875rem;
  }
}

.font-specimen__sample {
  margin: 0 0 0.375rem;
  font-size: 1.5rem;
  color: var(--color-text);
}

.font-specimen__sample--sans {
  font-family: var(--font-sans);
}

.font-specimen__sample--mono {
  font-family: var(--font-mono);
}

.font-specimen__stack {
  margin: 0;
  font-size: 0.6875rem;
  color: var(--color-text-subtle);
  font-family: var(--font-mono);
}

/* Type scale */
.type-scale {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.type-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border-subtle);

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
}

.type-row__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.type-row__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  min-width: 2.5rem;
}

.type-row__token {
  font-size: 0.625rem;
  color: var(--color-text-subtle);
}

.type-row__value {
  font-size: 0.625rem;
  color: var(--color-text-subtle);
  font-family: var(--font-mono);
}

.type-row__sample {
  margin: 0;
  color: var(--color-text);
}

/* Font weights */
.weight-specimens {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.weight-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.weight-row__meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.weight-row__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
  min-width: 5rem;
}

.weight-row__token {
  font-size: 0.625rem;
  color: var(--color-text-subtle);
}

.weight-row__value {
  font-size: 0.625rem;
  color: var(--color-text-subtle);
  font-family: var(--font-mono);
}

.weight-row__sample {
  margin: 0;
  font-size: 1.25rem;
  color: var(--color-text);
}

/* Line heights */
.leading-specimens {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.25rem;
  width: 100%;
}

.leading-block__meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.leading-block__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text-muted);
}

.leading-block__token {
  font-size: 0.5625rem;
  color: var(--color-text-subtle);
}

.leading-block__value {
  font-size: 0.5625rem;
  color: var(--color-text-subtle);
  font-family: var(--font-mono);
}

.leading-block__sample {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text);
  padding: 0.75rem;
  background: var(--color-surface-sunken);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border-subtle);
}
</style>
