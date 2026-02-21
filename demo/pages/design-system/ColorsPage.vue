<script setup lang="ts">
/**
 * ColorsPage - Design system color token reference
 *
 * Visual-first color reference showing:
 * - Primitive color palettes (all 8 families + white/black)
 * - Semantic color roles organized by category
 * - Light vs dark theme comparison side-by-side
 */
import DemoSection from "../../components/DemoSection.vue";
import DemoPage from "../../components/DemoPage.vue";
import { useIsDark } from "../../composables/useIsDark";

const { isDark } = useIsDark();

interface Swatch {
  shade: string;
  hex: string;
}

interface Palette {
  name: string;
  prefix: string;
  swatches: Swatch[];
}

const palettes: Palette[] = [
  {
    name: "Slate",
    prefix: "slate",
    swatches: [
      { shade: "50", hex: "#f8fafc" },
      { shade: "100", hex: "#f1f5f9" },
      { shade: "200", hex: "#e2e8f0" },
      { shade: "300", hex: "#cbd5e1" },
      { shade: "400", hex: "#94a3b8" },
      { shade: "500", hex: "#64748b" },
      { shade: "600", hex: "#475569" },
      { shade: "700", hex: "#334155" },
      { shade: "800", hex: "#1e293b" },
      { shade: "900", hex: "#0f172a" },
      { shade: "950", hex: "#020617" },
    ],
  },
  {
    name: "Blue",
    prefix: "blue",
    swatches: [
      { shade: "50", hex: "#eff6ff" },
      { shade: "100", hex: "#dbeafe" },
      { shade: "200", hex: "#bfdbfe" },
      { shade: "300", hex: "#93c5fd" },
      { shade: "400", hex: "#60a5fa" },
      { shade: "500", hex: "#3b82f6" },
      { shade: "600", hex: "#2563eb" },
      { shade: "700", hex: "#1d4ed8" },
      { shade: "800", hex: "#1e40af" },
      { shade: "900", hex: "#1e3a8a" },
      { shade: "950", hex: "#172554" },
    ],
  },
  {
    name: "Red",
    prefix: "red",
    swatches: [
      { shade: "50", hex: "#fef2f2" },
      { shade: "100", hex: "#fee2e2" },
      { shade: "200", hex: "#fecaca" },
      { shade: "300", hex: "#fca5a5" },
      { shade: "400", hex: "#f87171" },
      { shade: "500", hex: "#ef4444" },
      { shade: "600", hex: "#dc2626" },
      { shade: "700", hex: "#b91c1c" },
      { shade: "800", hex: "#991b1b" },
      { shade: "900", hex: "#7f1d1d" },
      { shade: "950", hex: "#450a0a" },
    ],
  },
  {
    name: "Green",
    prefix: "green",
    swatches: [
      { shade: "50", hex: "#f0fdf4" },
      { shade: "100", hex: "#dcfce7" },
      { shade: "200", hex: "#bbf7d0" },
      { shade: "300", hex: "#86efac" },
      { shade: "400", hex: "#4ade80" },
      { shade: "500", hex: "#22c55e" },
      { shade: "600", hex: "#16a34a" },
      { shade: "700", hex: "#15803d" },
      { shade: "800", hex: "#166534" },
      { shade: "900", hex: "#14532d" },
      { shade: "950", hex: "#052e16" },
    ],
  },
  {
    name: "Amber",
    prefix: "amber",
    swatches: [
      { shade: "50", hex: "#fffbeb" },
      { shade: "100", hex: "#fef3c7" },
      { shade: "200", hex: "#fde68a" },
      { shade: "300", hex: "#fcd34d" },
      { shade: "400", hex: "#fbbf24" },
      { shade: "500", hex: "#f59e0b" },
      { shade: "600", hex: "#d97706" },
      { shade: "700", hex: "#b45309" },
      { shade: "800", hex: "#92400e" },
      { shade: "900", hex: "#78350f" },
      { shade: "950", hex: "#451a03" },
    ],
  },
  {
    name: "Purple",
    prefix: "purple",
    swatches: [
      { shade: "50", hex: "#faf5ff" },
      { shade: "100", hex: "#f3e8ff" },
      { shade: "200", hex: "#e9d5ff" },
      { shade: "300", hex: "#d8b4fe" },
      { shade: "400", hex: "#c084fc" },
      { shade: "500", hex: "#a855f7" },
      { shade: "600", hex: "#9333ea" },
      { shade: "700", hex: "#7c3aed" },
      { shade: "800", hex: "#6b21a8" },
      { shade: "900", hex: "#581c87" },
      { shade: "950", hex: "#3b0764" },
    ],
  },
  {
    name: "Cyan",
    prefix: "cyan",
    swatches: [
      { shade: "50", hex: "#ecfeff" },
      { shade: "100", hex: "#cffafe" },
      { shade: "200", hex: "#a5f3fc" },
      { shade: "300", hex: "#67e8f9" },
      { shade: "400", hex: "#22d3ee" },
      { shade: "500", hex: "#06b6d4" },
      { shade: "600", hex: "#0891b2" },
      { shade: "700", hex: "#0e7490" },
      { shade: "800", hex: "#155e75" },
      { shade: "900", hex: "#164e63" },
      { shade: "950", hex: "#083344" },
    ],
  },
  {
    name: "Indigo",
    prefix: "indigo",
    swatches: [
      { shade: "50", hex: "#eef2ff" },
      { shade: "100", hex: "#e0e7ff" },
      { shade: "200", hex: "#c7d2fe" },
      { shade: "300", hex: "#a5b4fc" },
      { shade: "400", hex: "#818cf8" },
      { shade: "500", hex: "#6366f1" },
      { shade: "600", hex: "#4f46e5" },
      { shade: "700", hex: "#4338ca" },
      { shade: "800", hex: "#3730a3" },
      { shade: "900", hex: "#312e81" },
      { shade: "950", hex: "#1e1b4b" },
    ],
  },
];

interface SemanticColor {
  token: string;
  label: string;
  light: string;
  dark: string;
}

interface SemanticGroup {
  name: string;
  colors: SemanticColor[];
}

const semanticGroups: SemanticGroup[] = [
  {
    name: "Surfaces",
    colors: [
      { token: "--color-surface", label: "surface", light: "white", dark: "slate-900" },
      {
        token: "--color-surface-elevated",
        label: "surface-elevated",
        light: "white",
        dark: "slate-800",
      },
      {
        token: "--color-surface-sunken",
        label: "surface-sunken",
        light: "slate-50",
        dark: "slate-950",
      },
      {
        token: "--color-surface-overlay",
        label: "surface-overlay",
        light: "slate-900",
        dark: "slate-950",
      },
      {
        token: "--color-surface-accent",
        label: "surface-accent",
        light: "blue-50",
        dark: "blue-950",
      },
    ],
  },
  {
    name: "Text",
    colors: [
      { token: "--color-text", label: "text", light: "slate-900", dark: "slate-100" },
      { token: "--color-text-muted", label: "text-muted", light: "slate-600", dark: "slate-400" },
      { token: "--color-text-subtle", label: "text-subtle", light: "slate-400", dark: "slate-500" },
      { token: "--color-text-inverted", label: "text-inverted", light: "white", dark: "slate-900" },
      { token: "--color-text-accent", label: "text-accent", light: "blue-600", dark: "blue-400" },
    ],
  },
  {
    name: "Borders",
    colors: [
      { token: "--color-border", label: "border", light: "slate-200", dark: "slate-700" },
      {
        token: "--color-border-strong",
        label: "border-strong",
        light: "slate-300",
        dark: "slate-600",
      },
      {
        token: "--color-border-subtle",
        label: "border-subtle",
        light: "slate-100",
        dark: "slate-800",
      },
      {
        token: "--color-border-accent",
        label: "border-accent",
        light: "blue-200",
        dark: "blue-800",
      },
    ],
  },
  {
    name: "Interactive",
    colors: [
      { token: "--color-interactive", label: "interactive", light: "blue-500", dark: "blue-600" },
      {
        token: "--color-interactive-hover",
        label: "interactive-hover",
        light: "blue-600",
        dark: "blue-500",
      },
      {
        token: "--color-interactive-active",
        label: "interactive-active",
        light: "blue-700",
        dark: "blue-700",
      },
      {
        token: "--color-interactive-subtle",
        label: "interactive-subtle",
        light: "blue-50",
        dark: "blue-950",
      },
    ],
  },
  {
    name: "Status",
    colors: [
      { token: "--color-danger", label: "danger", light: "red-500", dark: "red-600" },
      { token: "--color-danger-hover", label: "danger-hover", light: "red-600", dark: "red-500" },
      { token: "--color-danger-subtle", label: "danger-subtle", light: "red-50", dark: "red-950" },
      { token: "--color-success", label: "success", light: "green-500", dark: "green-600" },
      {
        token: "--color-success-hover",
        label: "success-hover",
        light: "green-600",
        dark: "green-500",
      },
      {
        token: "--color-success-subtle",
        label: "success-subtle",
        light: "green-50",
        dark: "green-950",
      },
      { token: "--color-warning", label: "warning", light: "amber-400", dark: "amber-500" },
      {
        token: "--color-warning-hover",
        label: "warning-hover",
        light: "amber-500",
        dark: "amber-400",
      },
      {
        token: "--color-warning-subtle",
        label: "warning-subtle",
        light: "amber-50",
        dark: "amber-950",
      },
    ],
  },
  {
    name: "Focus & Selection",
    colors: [
      { token: "--color-focus-ring", label: "focus-ring", light: "blue-500", dark: "blue-400" },
      { token: "--color-selection", label: "selection", light: "blue-100", dark: "blue-900" },
    ],
  },
];

function isLightText(hex: string): boolean {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
}
</script>

<template>
  <DemoPage
    title="Colors"
    description="Visual reference for all color tokens — primitives, semantic roles, and theme comparison."
  >
    <!-- Primitive Palettes -->
    <DemoSection
      title="Primitive Palettes"
      description="Raw color values referenced as --color-{family}-{shade} (e.g. --color-slate-400, --color-red-800). Never use these directly in components — reference semantic tokens instead."
    >
      <div class="color-palettes">
        <!-- White / Black -->
        <div class="color-palette">
          <h4 class="color-palette__name">White / Black</h4>
          <div class="color-palette__strip">
            <div class="color-swatch" style="background: #ffffff">
              <span class="color-swatch__shade" style="color: #000">white</span>
              <span class="color-swatch__hex" style="color: #666">#ffffff</span>
            </div>
            <div class="color-swatch" style="background: #000000">
              <span class="color-swatch__shade" style="color: #fff">black</span>
              <span class="color-swatch__hex" style="color: #999">#000000</span>
            </div>
          </div>
        </div>

        <!-- Color families -->
        <div v-for="palette in palettes" :key="palette.prefix" class="color-palette">
          <h4 class="color-palette__name">{{ palette.name }}</h4>
          <div class="color-palette__strip">
            <div
              v-for="swatch in palette.swatches"
              :key="swatch.shade"
              class="color-swatch"
              :style="{ background: swatch.hex }"
            >
              <span
                class="color-swatch__shade"
                :style="{ color: isLightText(swatch.hex) ? '#fff' : '#000' }"
                >{{ swatch.shade }}</span
              >
              <span
                class="color-swatch__hex"
                :style="{
                  color: isLightText(swatch.hex) ? 'rgb(255 255 255 / 0.7)' : 'rgb(0 0 0 / 0.5)',
                }"
                >{{ swatch.hex }}</span
              >
            </div>
          </div>
        </div>
      </div>
    </DemoSection>

    <!-- Semantic Color Roles -->
    <DemoSection
      title="Semantic Color Roles"
      description="Purpose-driven tokens that reference primitives. Toggle the theme to see how each token shifts."
    >
      <div class="semantic-groups">
        <div v-for="group in semanticGroups" :key="group.name" class="semantic-group">
          <h4 class="semantic-group__name">{{ group.name }}</h4>
          <div class="semantic-group__grid">
            <div v-for="color in group.colors" :key="color.token" class="semantic-block">
              <div class="semantic-block__swatch" :style="{ background: `var(${color.token})` }" />
              <span class="semantic-block__label">{{ color.label }}</span>
              <code class="semantic-block__token">{{ color.token }}</code>
              <code class="semantic-block__ref">{{ isDark ? color.dark : color.light }}</code>
            </div>
          </div>
        </div>
      </div>
    </DemoSection>
  </DemoPage>
</template>

<style scoped>
.demo-page {
  --demo-page-max-width: 1100px;
}

/* Palette layout */
.color-palettes {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.color-palette {
  .color-palette__name {
    margin: 0 0 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-muted);
  }

  .color-palette__strip {
    display: flex;
    border-radius: var(--radius-lg);
    overflow: hidden;
  }
}

.color-swatch {
  flex: 1;
  padding: 1.5rem 0.5rem 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.125rem;
  min-width: 0;

  .color-swatch__shade {
    font-size: 0.6875rem;
    font-weight: 600;
  }

  .color-swatch__hex {
    font-size: 0.5625rem;
    font-family: var(--font-mono);
  }
}

/* Semantic groups */
.semantic-groups {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

.semantic-group {
  .semantic-group__name {
    margin: 0 0 0.75rem;
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--color-text-muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .semantic-group__grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
  }
}

.semantic-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;

  .semantic-block__swatch {
    width: 4rem;
    height: 3rem;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .semantic-block__label {
    font-size: 0.6875rem;
    font-weight: 600;
    color: var(--color-text);
  }

  .semantic-block__token {
    font-size: 0.5rem;
    color: var(--color-text-subtle);
    font-family: var(--font-mono);
  }

  .semantic-block__ref {
    font-size: 0.5625rem;
    color: var(--color-text-subtle);
    font-family: var(--font-mono);
  }
}
</style>
