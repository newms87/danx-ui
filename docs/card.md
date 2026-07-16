# Card Component

A generic surface/container primitive with `header`, `body` (default), and `footer` slots. Foundational layout building block for other display components (EmptyState, media tiles, forms) that need a bordered/elevated box without duplicating padding, border, radius, and shadow tokens ad hoc.

## Features

- **Three slots** — `header`, default (body), `footer` — any subset may be present; empty slots render nothing
- **Title/subtitle convenience props** — a quick header without writing custom markup
- **Three variants** — `elevated`, `outlined` (default), `flat`
- **Three padding densities** — `compact`, `comfortable` (default), `spacious`
- **Purely declarative** — no styling props, only component tokens

## Basic Usage

```vue
<template>
  <DanxCard title="Team members" subtitle="12 active">
    Body content goes here.
  </DanxCard>
</template>

<script setup lang="ts">
import { DanxCard } from "danx-ui";
</script>
```

## Props

| Prop      | Type          | Default         | Description                                     |
|-----------|---------------|-----------------|--------------------------------------------------|
| `variant` | `CardVariant` | `"outlined"`    | `elevated` / `outlined` / `flat`                  |
| `padding` | `CardPadding` | `"comfortable"` | `compact` / `comfortable` / `spacious`            |
| `title`   | `string`      | —               | Convenience header heading (ignored if `header` slot is used) |
| `subtitle`| `string`      | —               | Convenience header subheading (ignored if `header` slot is used) |

## Slots

| Slot      | Description                                                     |
|-----------|-------------------------------------------------------------------|
| `header`  | Header region; falls back to `title`/`subtitle` props when omitted |
| `default` | Body content                                                     |
| `footer`  | Footer region (e.g. action buttons)                              |

Any subset of the three slots may be present. A slot's wrapper element is only rendered when that slot has content (or, for `header`, when `title`/`subtitle` is set).

## Variants

| Variant    | Description                          |
|------------|---------------------------------------|
| `elevated` | Background + shadow, no border        |
| `outlined` | Background + border, no shadow (default) |
| `flat`     | Background only, no border or shadow  |

## CSS Tokens

| Token                          | Default                | Description                        |
|---------------------------------|-------------------------|-------------------------------------|
| `--dx-card-bg`                 | `--color-surface`       | Background color                    |
| `--dx-card-text`               | `--color-text`          | Text color                          |
| `--dx-card-border`             | `--color-border`        | Border color (outlined variant)     |
| `--dx-card-border-width`       | `1px`                    | Border width (outlined variant)     |
| `--dx-card-radius`             | `0.75rem`                | Corner radius                       |
| `--dx-card-shadow`             | `--shadow-md`            | Box shadow (elevated variant)       |
| `--dx-card-title-weight`       | `--font-semibold`        | Title font weight                   |
| `--dx-card-title-font-size`    | `1rem`                    | Title font size                     |
| `--dx-card-subtitle-color`     | `--color-text-muted`     | Subtitle text color                 |
| `--dx-card-subtitle-font-size` | `0.8125rem`               | Subtitle font size                  |
| `--dx-card-padding-compact`    | `0.75rem`                 | Padding for the `compact` density   |
| `--dx-card-padding-comfortable`| `1.25rem`                 | Padding for the `comfortable` density |
| `--dx-card-padding-spacious`   | `1.75rem`                 | Padding for the `spacious` density  |

Colors and radius come from the shared token system (`--color-surface`, `--color-border`, etc.) so the card stays consistent with DanxAlert, DanxDialog, and other surfaces, and inherits light/dark theming automatically.
