<script setup lang="ts">
/**
 * HomePage
 *
 * Landing page with getting started information.
 */
</script>

<template>
  <div class="home-page">
    <h1>danx-ui</h1>
    <p class="home-page__tagline">
      Zero-dependency Vue 3 + Tailwind CSS v4 component library with three-tier theming
    </p>

    <section class="home-page__section">
      <h2>Getting Started</h2>
      <pre class="home-page__code">npm install danx-ui</pre>
    </section>

    <section class="home-page__section">
      <h2>Usage</h2>
      <pre class="home-page__code">
import { DanxDialog, useDialog } from 'danx-ui';
import 'danx-ui/styles';</pre
      >
    </section>

    <section class="home-page__section">
      <h2>Features</h2>
      <ul class="home-page__features">
        <li>🎨 Three-tier theming (base, semantic, component tokens)</li>
        <li>🚀 Zero dependencies (just Vue 3)</li>
        <li>♿ Accessible by default (native dialog, ARIA)</li>
        <li>🌙 Dark mode ready</li>
        <li>📦 Tree-shakeable exports</li>
      </ul>
    </section>

    <section class="home-page__section">
      <h2>Components</h2>
      <ul class="home-page__components">
        <li>
          <RouterLink to="/dialog">Dialog</RouterLink>
          - Fully declarative modal dialog
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.home-page {
  max-width: 800px;
}

.home-page h1 {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  background: var(--gradient-accent);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.home-page__tagline {
  font-size: 1.125rem;
  color: var(--color-text-muted);
  margin: 0 0 2rem;
  line-height: 1.6;
}

.home-page__section {
  margin: 2rem 0;
}

.home-page__section h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
}

.home-page__code {
  background: var(--color-surface-sunken);
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 0.875rem;
  color: var(--color-text);
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease;
}

.home-page__features,
.home-page__components {
  list-style: none;
  padding: 0;
  margin: 0;
}

.home-page__features li,
.home-page__components li {
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-border-subtle);
  color: var(--color-text);
}

.home-page__features li:last-child,
.home-page__components li:last-child {
  border-bottom: none;
}

.home-page__components a {
  color: var(--color-interactive);
  font-weight: 600;
  text-decoration: none;
  transition: color 0.15s ease;
}

.home-page__components a:hover {
  color: var(--color-interactive-hover);
  text-decoration: underline;
}
</style>
