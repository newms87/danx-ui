# Alert Component

An inline status/error banner that renders in normal document flow. Use it for persistent, contextual messaging — form errors, status notices, warnings. For transient pop-up notifications, use [DanxToast](./toast.md) instead (DanxAlert has no portal, auto-dismiss, or stacking).

## Features

- **Four semantic variants** — danger, warning, success, info — colored via the shared `--dx-variant-*` token system (consistent with DanxButton, DanxChip, DanxBadge, DanxDialog)
- **Optional title** — a bold heading line above the body
- **Default slot** — arbitrary body content (text or markup)
- **Dismissible** — optional close button that emits `dismiss`
- **Accessible** — `role="alert"` for danger/warning, `role="status"` for success/info
- **Light + dark theming** — inherited from the semantic token layer
- **Zero dependencies** — composes DanxIcon for glyphs

## Basic Usage

```vue
<template>
  <DanxAlert variant="danger" title="Save failed">
    The server rejected the request. Try again.
  </DanxAlert>
</template>

<script setup lang="ts">
import { DanxAlert } from "danx-ui";
</script>
```

## Props

| Prop          | Type          | Default  | Description                                            |
|---------------|---------------|----------|--------------------------------------------------------|
| `variant`     | `VariantType` | `"info"` | Color scheme: `danger`, `warning`, `success`, `info`   |
| `title`       | `string`      | —        | Optional bold heading line                             |
| `dismissible` | `boolean`     | `false`  | Show a close affordance that emits `dismiss`           |

> Use `danger` (not `error`) — it reuses the library's established `VariantType` and `--dx-variant-danger-*` tokens.

## Events

| Event     | Payload | Description                            |
|-----------|---------|----------------------------------------|
| `dismiss` | —       | Fired when the close button is clicked |

## Slots

| Slot      | Description                       |
|-----------|-----------------------------------|
| `default` | Body content (text or markup)     |
| `icon`    | Override the leading status icon  |

## Accessibility

The root element's ARIA role is derived from the variant:

| Variant            | Role       | Behavior                          |
|--------------------|------------|-----------------------------------|
| `danger`, `warning`| `alert`    | Assertive — announced immediately |
| `success`, `info`  | `status`   | Polite — announced when idle      |

## Dismissible Example

```vue
<template>
  <DanxAlert v-if="show" variant="success" dismissible @dismiss="show = false">
    Your profile was updated.
  </DanxAlert>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { DanxAlert } from "danx-ui";

const show = ref(true);
</script>
```

## CSS Tokens

| Token                      | Default           | Description                  |
|----------------------------|-------------------|------------------------------|
| `--dx-alert-bg`            | `--color-surface` | Background (variant-driven)  |
| `--dx-alert-text`          | `--color-text`    | Text color (variant-driven)  |
| `--dx-alert-border`        | `--color-border`  | Border color (variant-driven)|
| `--dx-alert-padding-y`     | `0.75rem`         | Vertical padding             |
| `--dx-alert-padding-x`     | `1rem`            | Horizontal padding           |
| `--dx-alert-gap`           | `0.625rem`        | Gap between icon/body/dismiss|
| `--dx-alert-border-width`  | `1px`             | Border width                 |
| `--dx-alert-border-radius` | `0.5rem`          | Corner radius                |
| `--dx-alert-font-size`     | `0.875rem`        | Body font size               |
| `--dx-alert-title-weight`  | `--font-semibold` | Title font weight            |
| `--dx-alert-icon-size`     | `1.125rem`        | Leading + dismiss icon size  |

Per-variant colors come from the shared `--dx-variant-alert-*` tokens (with fallback to `--dx-variant-*`), tuned so the danger variant renders as a tinted red error banner.
