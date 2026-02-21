# Progress Bar Component

A progress bar component with visual effects, icon support, and token-based theming.

## Features

- **Determinate & Indeterminate** - Fixed percentage or animated loading indicator
- **Buffer Bar** - Secondary fill for buffered loading (e.g. video playback)
- **Semantic Variants** - 6 color variants: blank (default), danger, success, warning, info, muted
- **Three Sizes** - sm (0.5rem), md (1rem), lg (2rem)
- **Five Visual Effects** - Striped, animated stripes, glow, shimmer, gradient (combinable)
- **Text Positions** - Inside fill, above track, or beside track
- **Icon Support** - Built-in icon names, SVG strings, or Vue components
- **Custom Labels** - Override default percentage via prop or slot
- **ARIA Accessible** - Full progressbar role with value/min/max attributes
- **CSS Tokens** - Complete customization via component tokens

## Basic Usage

```vue
<template>
  <DanxProgressBar :value="65" />
</template>

<script setup lang="ts">
import { DanxProgressBar } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `number` | `0` | Current progress value |
| `max` | `number` | `100` | Maximum value (100%) |
| `buffer` | `number` | `0` | Buffer bar value |
| `indeterminate` | `boolean` | `false` | Animated sliding bar mode |
| `variant` | `VariantType` | `""` | Semantic color variant |
| `size` | `ProgressBarSize` | `"md"` | Bar size: sm, md, lg |
| `icon` | `Component \| string` | - | Icon in fill area |
| `striped` | `boolean` | `false` | Striped overlay effect |
| `animateStripes` | `boolean` | `false` | Animate stripes |
| `glow` | `boolean` | `false` | Pulsing glow effect |
| `shimmer` | `boolean` | `false` | Shimmer sweep effect |
| `gradient` | `boolean` | `false` | Gradient fill |
| `showText` | `boolean` | `true` | Show text label |
| `textPosition` | `ProgressBarTextPosition` | `"inside"` | Text position |
| `textAlign` | `ProgressBarTextAlign` | `"center"` | Text alignment |
| `label` | `string` | - | Custom label text |
| `ariaLabel` | `string` | - | Accessible label |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ value, max, percent }` | Custom text content |
| `icon` | - | Override icon rendering |

## Variants

```vue
<DanxProgressBar :value="50" variant="danger" />
<DanxProgressBar :value="50" variant="success" />
<DanxProgressBar :value="50" variant="warning" />
<DanxProgressBar :value="50" variant="info" />
<DanxProgressBar :value="50" variant="muted" />
```

## Sizes

```vue
<DanxProgressBar :value="50" size="sm" />  <!-- 0.5rem height, text forced beside -->
<DanxProgressBar :value="50" size="md" />  <!-- 1rem height (default) -->
<DanxProgressBar :value="50" size="lg" />  <!-- 2rem height -->
```

Note: When size is `sm`, text position is automatically forced to `beside` since the bar is too small for inside text.

## Effects

All effects are independent and can be combined:

```vue
<!-- Individual effects -->
<DanxProgressBar :value="60" striped />
<DanxProgressBar :value="60" striped animateStripes />
<DanxProgressBar :value="60" glow />
<DanxProgressBar :value="60" shimmer />
<DanxProgressBar :value="60" gradient />

<!-- Combined -->
<DanxProgressBar :value="70" striped animateStripes glow shimmer />
```

## Indeterminate Mode

For unknown progress duration:

```vue
<DanxProgressBar indeterminate />
<DanxProgressBar indeterminate variant="info" />
```

## Buffer Bar

Show buffered progress behind the main fill:

```vue
<DanxProgressBar :value="30" :buffer="60" />
```

## Custom Text

```vue
<!-- Custom label prop -->
<DanxProgressBar :value="3" :max="10" label="3 of 10 files" />

<!-- Slot with props -->
<DanxProgressBar :value="42">
  <template #default="{ value, max, percent }">
    {{ value }}/{{ max }} ({{ percent }}%)
  </template>
</DanxProgressBar>

<!-- Hide text entirely -->
<DanxProgressBar :value="50" :showText="false" />
```

## Text Position

```vue
<DanxProgressBar :value="65" textPosition="inside" size="lg" />
<DanxProgressBar :value="65" textPosition="above" />
<DanxProgressBar :value="65" textPosition="beside" />
```

## CSS Tokens

Override these tokens to customize appearance:

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-progress-bar-width` | `100%` | Track width |
| `--dx-progress-bar-border-radius` | `9999px` | Corner radius |
| `--dx-progress-bar-transition` | `width 0.4s ease` | Fill transition |
| `--dx-progress-bar-track-bg` | `--color-surface-sunken` | Track background |
| `--dx-progress-bar-fill-bg` | `--color-interactive` | Fill background |
| `--dx-progress-bar-buffer-bg` | `--color-interactive-subtle` | Buffer background |
| `--dx-progress-bar-text-color` | `--color-text-inverted` | Text inside fill |
| `--dx-progress-bar-text-color-outside` | `--color-text` | Text above/beside |
| `--dx-progress-bar-font-family` | `--font-sans` | Font family |
| `--dx-progress-bar-font-weight` | `--font-semibold` | Font weight |
| `--dx-progress-bar-icon-size` | `0.875em` | Icon dimensions |

### Effect Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-progress-bar-glow-color` | `--color-interactive` | Glow color |
| `--dx-progress-bar-glow-spread` | `8px` | Glow spread |
| `--dx-progress-bar-stripe-color` | `rgb(255 255 255 / 0.2)` | Stripe color |
| `--dx-progress-bar-stripe-angle` | `45deg` | Stripe angle |
| `--dx-progress-bar-stripe-width` | `1rem` | Stripe width |
| `--dx-progress-bar-shimmer-color` | `rgb(255 255 255 / 0.35)` | Shimmer color |
| `--dx-progress-bar-shimmer-duration` | `2s` | Shimmer duration |
| `--dx-progress-bar-gradient-from` | `--color-interactive` | Gradient start |
| `--dx-progress-bar-gradient-to` | `--color-success` | Gradient end |

### Size Tokens

| Token | Description |
|-------|-------------|
| `--dx-progress-bar-{size}-height` | Track height |
| `--dx-progress-bar-{size}-font-size` | Text font size |
| `--dx-progress-bar-{size}-text-padding` | Text padding |

### Variant Tokens

| Token | Description |
|-------|-------------|
| `--dx-progress-bar-{variant}-fill` | Fill color |
| `--dx-progress-bar-{variant}-glow` | Glow color |

## Accessibility

The component uses the `progressbar` ARIA role with:
- `aria-valuenow` — current value (omitted in indeterminate mode)
- `aria-valuemin` — always `0`
- `aria-valuemax` — the `max` prop value
- `aria-label` — custom accessible label via `ariaLabel` prop
