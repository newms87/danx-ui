<script setup lang="ts">
/**
 * ThemingGuidePage - Design system theming guide
 *
 * Educational page covering:
 * - Three-tier architecture diagram
 * - How dark mode works (visual comparison)
 * - Three live-editable customization examples (tweak, customize, replace)
 * - Links to full documentation
 */
import DemoSection from "../../components/DemoSection.vue";
import DemoPage from "../../components/DemoPage.vue";

import themingDocs from "../../../docs/theming.md?raw";

import tweakCode from "./theming-examples/TweakExample.vue?raw";
import customizeCode from "./theming-examples/CustomizeExample.vue?raw";
import replaceCode from "./theming-examples/ReplaceExample.vue?raw";
</script>

<template>
  <DemoPage
    title="Theming Guide"
    description="How the three-tier token architecture works, how dark mode operates, and how to customize or replace the theme."
    :docs="themingDocs"
  >
    <!-- Three-Tier Architecture Diagram -->
    <DemoSection
      title="Three-Tier Architecture"
      description="Tokens flow from raw values through semantic meaning to component-specific usage."
    >
      <div class="arch-diagram">
        <div class="arch-tier arch-tier--primitives">
          <h4 class="arch-tier__label">Tier 1: Primitives</h4>
          <p class="arch-tier__desc">Raw values — colors, spacing, radii</p>
          <div class="arch-tier__examples">
            <code>--color-blue-600</code>
            <code>--spacing-4</code>
            <code>--radius-lg</code>
          </div>
        </div>
        <div class="arch-arrow">
          <span class="arch-arrow__line" />
          <span class="arch-arrow__text">referenced by</span>
        </div>
        <div class="arch-tier arch-tier--semantic">
          <h4 class="arch-tier__label">Tier 2: Semantic</h4>
          <p class="arch-tier__desc">Purpose-driven — what tokens mean</p>
          <div class="arch-tier__examples">
            <code>--color-interactive</code>
            <code>--space-md</code>
            <code>--radius-card</code>
          </div>
          <div class="arch-tier__callout">Dark mode only changes this layer</div>
        </div>
        <div class="arch-arrow">
          <span class="arch-arrow__line" />
          <span class="arch-arrow__text">referenced by</span>
        </div>
        <div class="arch-tier arch-tier--component">
          <h4 class="arch-tier__label">Tier 3: Component</h4>
          <p class="arch-tier__desc">Per-component — surgical overrides</p>
          <div class="arch-tier__examples">
            <code>--dx-dialog-bg</code>
            <code>--dx-button-radius</code>
          </div>
        </div>
      </div>
    </DemoSection>

    <!-- How Dark Mode Works -->
    <DemoSection
      title="How Dark Mode Works"
      description="Only the semantic tier changes between themes. Primitives and component tokens stay the same."
    >
      <div class="dark-mode-diagrams">
        <div class="dark-mode-diagram">
          <h4 class="dark-mode-diagram__label">Light Theme</h4>
          <div class="dark-mode-tiers">
            <div class="dm-tier dm-tier--prim">
              <span class="dm-tier__name">Primitives</span>
              <code>blue-600: #2563eb</code>
              <code>slate-900: #0f172a</code>
            </div>
            <div class="dm-tier dm-tier--sem">
              <span class="dm-tier__name">Semantic</span>
              <code>interactive: blue-500</code>
              <code>text: slate-900</code>
              <code>surface: white</code>
            </div>
            <div class="dm-tier dm-tier--comp">
              <span class="dm-tier__name">Component</span>
              <code>dx-button-bg: interactive</code>
            </div>
          </div>
        </div>
        <div class="dark-mode-diagram">
          <h4 class="dark-mode-diagram__label">Dark Theme</h4>
          <div class="dark-mode-tiers">
            <div class="dm-tier dm-tier--prim">
              <span class="dm-tier__name">Primitives</span>
              <code>blue-600: #2563eb</code>
              <code>slate-900: #0f172a</code>
            </div>
            <div class="dm-tier dm-tier--sem dm-tier--changed">
              <span class="dm-tier__name">Semantic (changed)</span>
              <code>interactive: blue-600</code>
              <code>text: slate-100</code>
              <code>surface: slate-900</code>
            </div>
            <div class="dm-tier dm-tier--comp">
              <span class="dm-tier__name">Component</span>
              <code>dx-button-bg: interactive</code>
            </div>
          </div>
        </div>
      </div>
    </DemoSection>

    <!-- Customization: Tweak -->
    <DemoSection
      title="Tweak: Component Token Override"
      description="Override a single --dx-* token on a wrapper div to change one component's appearance."
      :code="tweakCode"
    />

    <!-- Customization: Customize -->
    <DemoSection
      title="Customize: Semantic Token Override"
      description="Override --color-interactive to purple and watch all components inside change together."
      :code="customizeCode"
    />

    <!-- Customization: Replace -->
    <DemoSection
      title="Replace: Full Theme"
      description="Define a complete custom color scheme on a wrapper, creating a themed mini 'app' inside the page."
      :code="replaceCode"
    />

    <!-- Step-by-step Guide -->
    <DemoSection
      title="Creating a Custom Theme"
      description="Step-by-step instructions for building your own theme."
    >
      <div class="guide-steps">
        <div class="guide-step">
          <span class="guide-step__number">1</span>
          <div class="guide-step__content">
            <h4 class="guide-step__title">Import the token system</h4>
            <p class="guide-step__text">
              Add <code>import 'danx-ui/styles.css'</code> to your app entry. This loads all three
              tiers.
            </p>
          </div>
        </div>
        <div class="guide-step">
          <span class="guide-step__number">2</span>
          <div class="guide-step__content">
            <h4 class="guide-step__title">Choose your customization level</h4>
            <p class="guide-step__text">
              <strong>Tweak:</strong> Override <code>--dx-*</code> tokens for surgical component
              changes.<br />
              <strong>Customize:</strong> Override semantic tokens like
              <code>--color-interactive</code> for system-wide changes.<br />
              <strong>Replace:</strong> Redefine primitives and re-point semantics for a completely
              new theme.
            </p>
          </div>
        </div>
        <div class="guide-step">
          <span class="guide-step__number">3</span>
          <div class="guide-step__content">
            <h4 class="guide-step__title">Apply via CSS custom properties</h4>
            <p class="guide-step__text">
              Set overrides on <code>:root</code> for global changes, or on a wrapper element for
              scoped theming. CSS cascade handles the rest.
            </p>
          </div>
        </div>
        <div class="guide-step">
          <span class="guide-step__number">4</span>
          <div class="guide-step__content">
            <h4 class="guide-step__title">Dark mode: override <code>.dark</code> selectors</h4>
            <p class="guide-step__text">
              To customize dark mode, redefine semantic tokens inside a <code>.dark</code> selector.
              Primitives and component tokens stay unchanged.
            </p>
          </div>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
.demo-page {
  max-width: 1100px;
}

/* Architecture diagram */
.arch-diagram {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: 100%;
}

.arch-tier {
  flex: 1;
  padding: 1.25rem;
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.arch-tier--primitives {
  border-color: var(--color-slate-300);
  background: var(--color-slate-50);
}

.arch-tier--semantic {
  border-color: var(--color-blue-300);
  background: var(--color-blue-50);
}

.arch-tier--component {
  border-color: var(--color-purple-300);
  background: var(--color-purple-50);
}

.arch-tier__label {
  margin: 0;
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--color-text);
}

.arch-tier__desc {
  margin: 0;
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.arch-tier__examples {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  code {
    font-size: 0.625rem;
    color: var(--color-text-subtle);
    background: rgb(0 0 0 / 0.05);
    padding: 0.125rem 0.375rem;
    border-radius: var(--radius-sm);
    width: fit-content;
  }
}

.arch-tier__callout {
  margin-top: 0.25rem;
  padding: 0.375rem 0.5rem;
  font-size: 0.6875rem;
  font-weight: 600;
  color: var(--color-blue-700);
  background: var(--color-blue-100);
  border-radius: var(--radius-sm);
}

.arch-arrow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 4rem;
  flex-shrink: 0;
}

.arch-arrow__line {
  display: block;
  width: 2rem;
  height: 2px;
  background: var(--color-border-strong);
}

.arch-arrow__text {
  font-size: 0.5625rem;
  color: var(--color-text-subtle);
  white-space: nowrap;
}

.dark-mode-diagrams {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  width: 100%;
}

.dark-mode-diagram {
  padding: 1rem;
  border-radius: var(--radius-lg);
  border: 1px solid var(--color-border);
  background: var(--color-surface-sunken);
}

.dark-mode-diagram__label {
  margin: 0 0 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-subtle);
}

.dark-mode-tiers {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dm-tier {
  padding: 0.625rem;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  gap: 0.125rem;

  code {
    font-size: 0.5625rem;
    color: inherit;
    opacity: 0.7;
  }
}

.dm-tier__name {
  font-size: 0.6875rem;
  font-weight: 700;
  margin-bottom: 0.125rem;
}

.dm-tier--prim {
  background: var(--color-slate-100);
  color: var(--color-slate-700);
}

.dm-tier--sem {
  background: var(--color-blue-50);
  color: var(--color-blue-700);
}

.dm-tier--changed {
  background: var(--color-amber-50);
  color: var(--color-amber-800);
  border: 2px dashed var(--color-amber-300);
}

.dm-tier--comp {
  background: var(--color-purple-50);
  color: var(--color-purple-700);
}

/* Guide steps */
.guide-steps {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.guide-step {
  display: flex;
  gap: 1rem;
  align-items: flex-start;
}

.guide-step__number {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  background: var(--color-interactive);
  color: var(--color-text-inverted);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.875rem;
}

.guide-step__content {
  flex: 1;
}

.guide-step__title {
  margin: 0 0 0.25rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);

  code {
    font-size: 0.75rem;
    padding: 0.125rem 0.25rem;
    background: var(--color-surface-sunken);
    border-radius: var(--radius-sm);
  }
}

.guide-step__text {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--color-text-muted);
  line-height: 1.5;

  code {
    font-size: 0.6875rem;
    padding: 0.125rem 0.25rem;
    background: var(--color-surface-sunken);
    border-radius: var(--radius-sm);
    color: var(--color-text-accent);
  }
}
</style>
