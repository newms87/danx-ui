<script setup lang="ts">
/**
 * VariantsPage - Design system variant system reference
 *
 * Educational page that teaches how the variant system works:
 * - What variants are and why they exist
 * - All built-in variants across every component
 * - How to create custom variants
 * - Dark mode support strategies
 * - Component-specific token overrides
 * - How the system works under the hood
 */
import DemoSection from "../../components/DemoSection.vue";
import DemoPage from "../../components/DemoPage.vue";

import builtInVariantsCode from "./variant-examples/BuiltInVariants.vue?raw";
import customVariantCode from "./variant-examples/CustomVariant.vue?raw";
import darkModeVariantCode from "./variant-examples/DarkModeVariant.vue?raw";
import componentOverridesCode from "./variant-examples/ComponentOverrides.vue?raw";
</script>

<template>
  <DemoPage
    title="Variants"
    description="Named color identities defined once in CSS and usable across all components. Built-in variants ship with the library; custom variants are defined with a few CSS tokens."
  >
    <!-- Section 1: What Are Variants? -->
    <DemoSection
      title="What Are Variants?"
      description="Variants are named color identities that work consistently across every colorable component."
    >
      <div class="intro-content">
        <p>
          Instead of setting colors on each component individually, you define a variant once (e.g.
          <code>"danger"</code>) and every component that uses it renders with the same visual
          identity. The <code>variant</code> prop works identically on <strong>Button</strong>,
          <strong>Chip</strong>, <strong>Badge</strong>, <strong>ProgressBar</strong>, and
          <strong>Tooltip</strong>.
        </p>
        <div class="variant-list">
          <span class="variant-list__label">Built-in variants:</span>
          <code>danger</code>
          <code>success</code>
          <code>warning</code>
          <code>info</code>
          <code>muted</code>
        </div>
        <p>
          You can also define your own variants by setting
          <code>--dx-variant-{name}-*</code> CSS tokens. No library changes needed.
        </p>
      </div>
    </DemoSection>

    <!-- Section 2: Built-in Variants -->
    <DemoSection
      title="Built-in Variants"
      description="All five built-in variants shown across every colorable component. Each row is a variant; each column is a component type."
      :code="builtInVariantsCode"
    />

    <!-- Section 3: Creating a Custom Variant -->
    <DemoSection
      title="Creating a Custom Variant"
      description="Define a variant with three CSS tokens and it works on every component. Copy this example into your app's CSS."
      :code="customVariantCode"
    >
      <template #hint>
        The minimum tokens are <code>--dx-variant-{name}-bg</code>,
        <code>--dx-variant-{name}-bg-hover</code>, and <code>--dx-variant-{name}-text</code>.
        Additional tokens like <code>border</code> and <code>gradient-to</code> are optional.
      </template>
    </DemoSection>

    <!-- Section 4: Dark Mode Support -->
    <DemoSection
      title="Dark Mode Support"
      description="Two approaches for making custom variants dark-mode aware. Toggle the preview to see the difference."
      :code="darkModeVariantCode"
    >
      <template #hint>
        <strong>Approach A</strong> is recommended because your variant inherits dark mode from the
        semantic token layer with zero extra work. Use <strong>Approach B</strong> only when you
        need completely different colors per theme.
      </template>
    </DemoSection>

    <!-- Section 5: Component-Specific Overrides -->
    <DemoSection
      title="Component-Specific Overrides"
      description="Override a variant's appearance for a single component type using the longer token name."
      :code="componentOverridesCode"
    />

    <!-- Section 6: How It Works Under the Hood -->
    <DemoSection
      title="How It Works Under the Hood"
      description="A brief look at the mechanism that powers variants."
    >
      <div class="under-the-hood">
        <p>
          CSS cannot resolve dynamic variable names — there's no way to write
          <code>var(--dx-variant-${name}-bg)</code> in pure CSS. The
          <code>useVariant</code> composable bridges this gap by generating inline styles with a
          <code>var()</code> fallback chain.
        </p>

        <div class="resolution-diagram">
          <h4>Resolution Order</h4>
          <div class="resolution-chain">
            <div class="resolution-step resolution-step--specific">
              <span class="resolution-step__label">1. Component-specific</span>
              <code>--dx-variant-button-brand-bg</code>
            </div>
            <div class="resolution-arrow">falls back to</div>
            <div class="resolution-step resolution-step--shared">
              <span class="resolution-step__label">2. Shared variant</span>
              <code>--dx-variant-brand-bg</code>
            </div>
            <div class="resolution-arrow">falls back to</div>
            <div class="resolution-step resolution-step--base">
              <span class="resolution-step__label">3. Component default</span>
              <code>--dx-button-bg</code>
            </div>
          </div>
        </div>

        <div class="token-table">
          <h4>Available Variant Tokens</h4>
          <table>
            <thead>
              <tr>
                <th>Token suffix</th>
                <th>Purpose</th>
                <th>Used by</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>bg</code></td>
                <td>Background color</td>
                <td>All components</td>
              </tr>
              <tr>
                <td><code>bg-hover</code></td>
                <td>Hover background</td>
                <td>Button, Chip</td>
              </tr>
              <tr>
                <td><code>text</code></td>
                <td>Text / icon color</td>
                <td>All components</td>
              </tr>
              <tr>
                <td><code>border</code></td>
                <td>Border color</td>
                <td>Tooltip</td>
              </tr>
              <tr>
                <td><code>gradient-to</code></td>
                <td>Gradient endpoint</td>
                <td>ProgressBar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
/* Intro section */
.intro-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  code {
    background: var(--color-surface-sunken);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
}

.variant-list {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex-wrap: wrap;

  code {
    background: var(--color-surface-sunken);
    padding: 0.25rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.875rem;
    color: var(--color-text-accent);
  }
}

.variant-list__label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-text);
}

/* Under the hood section */
.under-the-hood {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;

  p {
    margin: 0;
    font-size: 0.875rem;
    color: var(--color-text-muted);
    line-height: 1.6;
  }

  code {
    background: var(--color-surface-sunken);
    padding: 0.125rem 0.375rem;
    border-radius: 0.25rem;
    font-size: 0.875em;
  }
}

/* Resolution diagram */
.resolution-diagram {
  h4 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text);
  }
}

.resolution-chain {
  display: flex;
  align-items: center;
  gap: 0;
  flex-wrap: wrap;
}

.resolution-step {
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  border: 2px solid;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.resolution-step--specific {
  border-color: var(--color-purple-300);
  background: var(--color-purple-50);
}

.resolution-step--shared {
  border-color: var(--color-blue-300);
  background: var(--color-blue-50);
}

.resolution-step--base {
  border-color: var(--color-slate-300);
  background: var(--color-slate-50);
}

.resolution-step__label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-subtle);
}

.resolution-arrow {
  padding: 0 0.75rem;
  font-size: 0.875rem;
  color: var(--color-text-subtle);
  font-style: italic;
}

/* Token table */
.token-table {
  h4 {
    margin: 0 0 0.75rem;
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-text);
  }

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.875rem;
  }

  th {
    text-align: left;
    padding: 0.5rem 0.75rem;
    border-bottom: 2px solid var(--color-border);
    font-weight: 700;
    color: var(--color-text);
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid var(--color-border);
    color: var(--color-text-muted);

    code {
      color: var(--color-text-accent);
    }
  }
}
</style>
