# Usage Meter Component

A segmented usage/quota meter: one track split into labelled segments, plus a formatted `used / total (percent)` readout.

## Why Segmented Instead of a Progress Bar

`DanxProgressBar` answers **"how far along is this?"** — one value, optionally one buffer, marching toward a maximum.

`DanxUsageMeter` answers **"what is this capacity made of?"** — the same track, but partitioned into categories that each carry their own label, value, and color. A single number hides the interesting part of the story:

| Scenario | Progress bar shows | Usage meter shows |
|----------|--------------------|-------------------|
| Storage quota | "78% full" | Photos 180 GB, Video 120 GB, System 40 GB, 172 GB free |
| Budget burn-down | "62% spent" | Salaries $310k, Cloud $95k, Travel $12k |
| API rate limit | "6.2k of 10k" | Reads 4.1k, Writes 1.8k, Admin 300 |
| Context window | "72% used" | Instructions 8k, History 46k, Attachments 18k |
| Release capacity | "40 of 60 points" | Platform 22, Growth 12, Bugfix 6 |

Reach for the progress bar when there is one number. Reach for the usage meter when the breakdown is the point, or when you need a readout alongside the bar.

## Basic Usage

```vue
<template>
  <DanxUsageMeter
    label="Storage"
    :total="512"
    :segments="segments"
  />
</template>

<script setup lang="ts">
import { DanxUsageMeter } from 'danx-ui';
import type { UsageMeterSegment } from 'danx-ui';

const segments: UsageMeterSegment[] = [
  { id: 'photos', label: 'Photos', value: 180, variant: 'info' },
  { id: 'video', label: 'Video', value: 120, variant: 'warning' },
  { id: 'system', label: 'System', value: 40, variant: 'muted' },
];
</script>
```

## Features

- **Any number of segments** stacked left-to-right in one track
- **Per-segment coloring** via semantic variants or explicit CSS colors
- **Formatted readout** with a pluggable `formatValue` (default abbreviates 355400 → `355.4k`)
- **Per-segment tooltips** showing label, formatted value, and share of the track
- **Three sizes** — sm, md, lg
- **Safe math** — zero total, negative values, `NaN`, and `Infinity` never render `NaN%`
- **Over-capacity handling** — the track stays full and proportional while the readout reports the true `>100%`
- **ARIA progressbar semantics** with `aria-valuenow/min/max/valuetext`
- **Reduced-motion aware** — width transitions are dropped for users who ask for it
- **Zero dependencies** — native `Intl` only, no luxon, no `@vueuse/core`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `segments` | `UsageMeterSegment[]` | `[]` | Consumption categories, stacked in array order |
| `total` | `number` | `0` | Capacity denominator; the remainder renders as empty track |
| `label` | `string` | - | Heading text above the track |
| `size` | `UsageMeterSize` | `"md"` | Meter size: `sm`, `md`, `lg` |
| `variant` | `VariantType` | `""` | Fallback color for segments that declare none |
| `formatValue` | `(value: number) => string` | `formatUsageValue` | Formats every displayed number |
| `showReadout` | `boolean` | `true` | Show the `used / total (percent)` readout |
| `showTooltips` | `boolean` | `true` | Show per-segment hover tooltips |
| `tooltipPlacement` | `PopoverPlacement` | `"top"` | Tooltip side: `top`, `bottom`, `left`, `right` |
| `ariaLabel` | `string` | - | Accessible name; falls back to `label`, then `"Usage"` |

### `UsageMeterSegment`

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string \| number` | yes | Stable identity used as the render key |
| `label` | `string` | yes | Category name shown in the tooltip |
| `value` | `number` | yes | Amount consumed, in the same unit as `total` |
| `variant` | `VariantType` | no | Semantic color; falls back to the meter's `variant` |
| `color` | `string` | no | Explicit CSS color; wins over `variant` |

## Emits

None. The meter is a read-only display component — there is no imperative API and no `defineExpose`.

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `label` | `UsageMeterSummary` | Replace the heading text |
| `readout` | `UsageMeterSummary` | Replace the `used / total (percent)` readout |
| `tooltip` | `{ segment }` | Replace the body of every segment tooltip |

### `UsageMeterSummary`

Both header slots receive the full summary:

| Field | Type | Description |
|-------|------|-------------|
| `used` | `number` | Sum of all segment values |
| `total` | `number` | Capacity (clamped to `>= 0`) |
| `remaining` | `number` | Capacity left, never negative |
| `percent` | `number` | `used / total * 100`, `0` when `total` is `0` |
| `percentLabel` | `string` | `percent` rounded, e.g. `"38%"` |
| `formattedUsed` | `string` | `used` through `formatValue` |
| `formattedTotal` | `string` | `total` through `formatValue` |
| `formattedRemaining` | `string` | `remaining` through `formatValue` |
| `readout` | `string` | The default readout string |
| `isOverCapacity` | `boolean` | `used > total` |

```vue
<DanxUsageMeter :total="512" :segments="segments">
  <template #readout="{ formattedRemaining }">{{ formattedRemaining }} GB free</template>
</DanxUsageMeter>
```

## Number Formatting

The default formatter, `formatUsageValue`, abbreviates with `k`/`M`/`B`/`T`, keeps at most one fraction digit, and drops trailing zeros:

| Input | Output |
|-------|--------|
| `999` | `999` |
| `1000` | `1k` |
| `355400` | `355.4k` |
| `1234567` | `1.2M` |
| `2500000000` | `2.5B` |
| `NaN` / `Infinity` | `0` |

It uses native `Intl.NumberFormat` pinned to `en-US` so output is stable regardless of host locale, and it is exported for use in your own readouts:

```ts
import { formatUsageValue } from 'danx-ui';
```

Pass `formatValue` to localize or to switch units entirely:

```vue
<!-- Bytes -->
<DanxUsageMeter :total="512e9" :segments="segments" :format-value="formatBytes" />

<!-- Currency -->
<DanxUsageMeter :total="500000" :segments="segments"
  :format-value="(n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })" />
```

This intentionally differs from the shared `fShortNumber` helper, which uppercases the thousands suffix (`355K`) and drops the decimal above 100. Meters read better with the finer-grained lowercase-`k` form; use `formatValue: fShortNumber` if you prefer the shared style.

## Sizes

```vue
<DanxUsageMeter size="sm" :total="100" :segments="segments" />  <!-- 0.375rem track -->
<DanxUsageMeter size="md" :total="100" :segments="segments" />  <!-- 0.75rem track (default) -->
<DanxUsageMeter size="lg" :total="100" :segments="segments" />  <!-- 1.25rem track -->
```

## Coloring

Segments resolve their color in this order:

1. `segment.color` — any CSS color or `var()` reference (best for data-driven palettes)
2. `segment.variant` — semantic variant through the shared variant token system
3. the meter-level `variant` prop
4. `--dx-usage-meter-segment-bg` (defaults to the interactive color)

```vue
<!-- Semantic variants -->
<DanxUsageMeter :total="100" :segments="[
  { id: 'ok', label: 'Healthy', value: 40, variant: 'success' },
  { id: 'warn', label: 'Degraded', value: 25, variant: 'warning' },
  { id: 'down', label: 'Failing', value: 10, variant: 'danger' },
]" />

<!-- One variant for the whole meter -->
<DanxUsageMeter variant="info" :total="100" :segments="[{ id: 'a', label: 'Used', value: 62 }]" />

<!-- Explicit colors -->
<DanxUsageMeter :total="100" :segments="[
  { id: 'a', label: 'Team A', value: 30, color: 'var(--color-teal-500)' },
  { id: 'b', label: 'Team B', value: 25, color: 'var(--color-fuchsia-500)' },
]" />
```

## Edge Cases

| Situation | Behavior |
|-----------|----------|
| `total` is `0` | Track renders empty, readout shows `0 / 0 (0%)` — never `NaN%` |
| `total` is negative | Clamped to `0` |
| Segment `value` is negative, `NaN`, or `Infinity` | Clamped to `0` |
| Segments sum above `total` | Widths are computed against the consumed amount so the track stays full and proportional; the readout shows the true percentage (e.g. `150%`) and the meter gains `danx-usage-meter--over-capacity`, which recolors the readout |
| `segments` is empty | Only the empty track renders |

Widths always use `max(total, sum(values))` as the denominator. Within capacity, that is exactly `total`; above capacity, it keeps segments inside the container instead of overflowing it.

## Accessibility

- The track carries `role="progressbar"` with `aria-valuenow` (used), `aria-valuemin="0"`, `aria-valuemax` (total), and `aria-valuetext` (the formatted readout) — so assistive tech hears the same numbers a sighted user reads.
- The accessible name resolves `ariaLabel` → `label` → `"Usage"`, so the meter is never anonymous.
- Segment tooltips are hover affordances layered on top of information that is already available in the readout and `aria-valuetext`; no information is tooltip-only.
- Width transitions are disabled under `prefers-reduced-motion: reduce`.

## CSS Tokens

All tokens are defined in `usage-meter-tokens.css` and reference semantic tokens, so they follow the theme in both light and dark mode.

### Layout

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-usage-meter-width` | `100%` | Meter width |
| `--dx-usage-meter-gap` | `0.375rem` | Gap between header and track |
| `--dx-usage-meter-header-gap` | `1rem` | Gap between label and readout |
| `--dx-usage-meter-font-family` | `var(--font-sans)` | Header font family |

### Track

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-usage-meter-track-bg` | `var(--color-surface-sunken)` | Track (unused capacity) background |
| `--dx-usage-meter-track-radius` | `9999px` | Track corner radius |
| `--dx-usage-meter-remaining-bg` | `transparent` | Free-space background inside the track |

### Segments

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-usage-meter-segment-bg` | `var(--color-interactive)` | Default segment color |
| `--dx-usage-meter-segment-radius` | `0` | Segment corner radius |
| `--dx-usage-meter-segment-divider` | `2px` | Divider drawn between adjacent segments |
| `--dx-usage-meter-transition` | `width 0.4s ease` | Segment width transition |

### Text

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-usage-meter-label-color` | `var(--color-text)` | Heading color |
| `--dx-usage-meter-label-weight` | `var(--font-semibold)` | Heading weight |
| `--dx-usage-meter-readout-color` | `var(--color-text-muted)` | Readout color |
| `--dx-usage-meter-readout-weight` | `var(--font-medium)` | Readout weight |
| `--dx-usage-meter-over-color` | `var(--color-danger)` | Readout color when over capacity |

### Sizes

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-usage-meter-sm-height` | `0.375rem` | Small track height |
| `--dx-usage-meter-sm-font-size` | `0.6875rem` | Small header font size |
| `--dx-usage-meter-md-height` | `0.75rem` | Medium track height |
| `--dx-usage-meter-md-font-size` | `0.8125rem` | Medium header font size |
| `--dx-usage-meter-lg-height` | `1.25rem` | Large track height |
| `--dx-usage-meter-lg-font-size` | `0.9375rem` | Large header font size |

### Tooltip

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-usage-meter-tooltip-gap` | `0.125rem` | Gap between tooltip label and value |
| `--dx-usage-meter-tooltip-value-color` | `inherit` | Tooltip value text color |

Segment colors are applied as inline styles (an explicit `color`, or the variant mapping from `useVariant`), so they override `--dx-usage-meter-segment-bg` per segment.

### Theming Example

```vue
<template>
  <DanxUsageMeter class="dense-meter" :total="100" :segments="segments" />
</template>

<style>
.dense-meter {
  --dx-usage-meter-track-radius: 0.25rem;
  --dx-usage-meter-segment-divider: 4px;
  --dx-usage-meter-md-height: 1.5rem;
}
</style>
```

## `useUsageMeter`

The geometry and formatting logic is exported separately for custom layouts — build your own legend, stat table, or sparkline off the same numbers:

```ts
import { useUsageMeter } from 'danx-ui';

const { segments, summary, remainingWidth } = useUsageMeter({
  segments: () => props.segments,
  total: () => props.total,
  formatValue: () => props.formatValue,
  variant: () => props.variant,
});
```

| Returned | Type | Description |
|----------|------|-------------|
| `segments` | `ComputedRef<UsageMeterSegmentGeometry[]>` | Input segments plus `percent`, `width`, `formattedValue`, `percentLabel` |
| `summary` | `ComputedRef<UsageMeterSummary>` | Aggregate figures and the readout string |
| `remainingWidth` | `ComputedRef<string>` | CSS width of the unused track |

Every option accepts a value, ref, or getter.
