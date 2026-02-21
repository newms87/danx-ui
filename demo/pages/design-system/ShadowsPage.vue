<script setup lang="ts">
/**
 * ShadowsPage - Design system shadows & effects token reference
 *
 * Visual specimens for:
 * - Elevation shadows (sm through 2xl)
 * - Special shadows (layered, inset)
 * - Glow shadows on dark backgrounds
 * - Semantic shadows with light/dark comparison
 * - Gradients with light/dark comparison
 * - Transitions (interactive speed demos)
 */
import DemoSection from "../../components/DemoSection.vue";
import DemoPage from "../../components/DemoPage.vue";

interface Shadow {
  token: string;
  name: string;
}

const elevationShadows: Shadow[] = [
  { token: "--shadow-sm", name: "sm" },
  { token: "--shadow-default", name: "default" },
  { token: "--shadow-md", name: "md" },
  { token: "--shadow-lg", name: "lg" },
  { token: "--shadow-xl", name: "xl" },
  { token: "--shadow-2xl", name: "2xl" },
];

const specialShadows: Shadow[] = [
  { token: "--shadow-layered", name: "layered" },
  { token: "--shadow-inner", name: "inner" },
  { token: "--shadow-inner-lg", name: "inner-lg" },
];

const glowShadows: Shadow[] = [
  { token: "--shadow-glow-blue", name: "glow-blue" },
  { token: "--shadow-glow-purple", name: "glow-purple" },
  { token: "--shadow-glow-cyan", name: "glow-cyan" },
  { token: "--shadow-glow-white", name: "glow-white" },
];

interface SemanticShadow {
  token: string;
  name: string;
  description: string;
}

const semanticShadows: SemanticShadow[] = [
  { token: "--shadow-component", name: "component", description: "Default component shadow" },
  { token: "--shadow-elevated", name: "elevated", description: "Elevated panels, dropdowns" },
  { token: "--shadow-dialog", name: "dialog", description: "Modal dialogs" },
  { token: "--shadow-glow", name: "glow", description: "Glow effect (dark mode only)" },
];

interface Gradient {
  token: string;
  name: string;
}

const gradients: Gradient[] = [
  { token: "--gradient-surface", name: "surface" },
  { token: "--gradient-accent", name: "accent" },
  { token: "--gradient-subtle", name: "subtle" },
];

interface Transition {
  token: string;
  name: string;
  value: string;
}

const transitions: Transition[] = [
  { token: "--transition-fast", name: "fast", value: "150ms ease-out" },
  { token: "--transition-normal", name: "normal", value: "200ms ease-out" },
  { token: "--transition-slow", name: "slow", value: "300ms ease-out" },
];
</script>

<template>
  <DemoPage
    title="Shadows & Effects"
    description="Elevation shadows, glows, gradients, and transition speeds — visual depth and motion tokens."
  >
    <!-- Elevation Shadows -->
    <DemoSection
      title="Elevation Shadows"
      description="Progressive elevation from subtle to dramatic. Used for cards, dropdowns, and modals."
    >
      <div class="shadow-row">
        <div
          v-for="s in elevationShadows"
          :key="s.token"
          class="shadow-card"
          :style="{ boxShadow: `var(${s.token})` }"
        >
          <span class="shadow-card__name">{{ s.name }}</span>
          <code class="shadow-card__token">{{ s.token }}</code>
        </div>
      </div>
    </DemoSection>

    <!-- Special Shadows -->
    <DemoSection
      title="Special Shadows"
      description="Layered depth and inset shadows for recessed elements."
    >
      <div class="shadow-row">
        <div
          v-for="s in specialShadows"
          :key="s.token"
          class="shadow-card"
          :style="{ boxShadow: `var(${s.token})` }"
        >
          <span class="shadow-card__name">{{ s.name }}</span>
          <code class="shadow-card__token">{{ s.token }}</code>
        </div>
      </div>
    </DemoSection>

    <!-- Glow Shadows -->
    <DemoSection
      title="Glow Shadows"
      description="Color glow effects, typically used in dark mode for accent highlights."
    >
      <div class="glow-bg">
        <div
          v-for="s in glowShadows"
          :key="s.token"
          class="glow-card"
          :style="{ boxShadow: `var(${s.token})` }"
        >
          <span class="glow-card__name">{{ s.name }}</span>
          <code class="glow-card__token">{{ s.token }}</code>
        </div>
      </div>
    </DemoSection>

    <!-- Semantic Shadows -->
    <DemoSection
      title="Semantic Shadows"
      description="Purpose-driven shadow tokens. Toggle the theme to see how they shift (e.g., glow only activates in dark mode)."
    >
      <div class="semantic-shadow-grid">
        <div
          v-for="s in semanticShadows"
          :key="s.token"
          class="semantic-shadow-card"
          :style="{ boxShadow: `var(${s.token})` }"
        >
          <span class="semantic-shadow-card__name">{{ s.name }}</span>
          <span class="semantic-shadow-card__desc">{{ s.description }}</span>
        </div>
      </div>
    </DemoSection>

    <!-- Gradients -->
    <DemoSection
      title="Gradients"
      description="Three gradient tokens. Toggle the theme to see how they shift."
    >
      <div class="gradient-strips">
        <div v-for="g in gradients" :key="g.token" class="gradient-strip">
          <div class="gradient-strip__bar" :style="{ background: `var(${g.token})` }" />
          <span class="gradient-strip__name">{{ g.name }}</span>
          <code class="gradient-strip__token">{{ g.token }}</code>
        </div>
      </div>
    </DemoSection>

    <!-- Transitions -->
    <DemoSection
      title="Transitions"
      description="Hover over each card to feel the speed difference between fast, normal, and slow transitions."
    >
      <div class="transition-row">
        <div
          v-for="t in transitions"
          :key="t.token"
          class="transition-card"
          :style="{ transition: `all var(${t.token})` }"
        >
          <span class="transition-card__name">{{ t.name }}</span>
          <code class="transition-card__value">{{ t.value }}</code>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
.demo-page {
  max-width: 1100px;
}

/* Shadow cards */
.shadow-row {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
}

.shadow-card {
  width: 8rem;
  height: 6rem;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.shadow-card__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.shadow-card__token {
  font-size: 0.5rem;
  color: var(--color-text-subtle);
}

/* Glow section */
.glow-bg {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  width: 100%;
  padding: 2rem;
  background: var(--color-slate-900);
  border-radius: var(--radius-xl);
}

.glow-card {
  width: 8rem;
  height: 6rem;
  background: var(--color-slate-800);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.glow-card__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-slate-100);
}

.glow-card__token {
  font-size: 0.5rem;
  color: var(--color-slate-400);
}

/* Semantic shadow comparison */
.semantic-shadow-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.semantic-shadow-card {
  padding: 1rem;
  background: var(--color-surface-elevated);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.semantic-shadow-card__name {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-text);
}

.semantic-shadow-card__desc {
  font-size: 0.625rem;
  color: var(--color-text-muted);
}

/* Gradients */
.gradient-strips {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gradient-strip {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.gradient-strip__bar {
  height: 2.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
}

.gradient-strip__name {
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-text);
}

.gradient-strip__token {
  font-size: 0.5rem;
  color: var(--color-text-subtle);
}

/* Transitions */
.transition-row {
  display: flex;
  gap: 1.5rem;
  width: 100%;
}

.transition-card {
  flex: 1;
  padding: 1.5rem;
  background: var(--color-surface-elevated);
  border: 2px solid var(--color-border);
  border-radius: var(--radius-lg);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  cursor: pointer;
  user-select: none;

  &:hover {
    background: var(--color-interactive);
    border-color: var(--color-interactive);
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
  }
}

.transition-card__name {
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-text);

  .transition-card:hover & {
    color: var(--color-text-inverted);
  }
}

.transition-card__value {
  font-size: 0.6875rem;
  color: var(--color-text-subtle);

  .transition-card:hover & {
    color: rgb(255 255 255 / 0.7);
  }
}
</style>
