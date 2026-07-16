# DanxStepper

An ordered multi-step workflow progress indicator with complete/active/upcoming/error states, in horizontal or vertical orientation.

## Features

- Ordered steps with label, optional description and icon
- Automatic complete/active/upcoming status derived from the active index
- Explicit per-step status override (e.g. "error")
- Horizontal and vertical orientation
- Optional clickable (non-linear) navigation mode
- v-model for the active step index
- Scoped slots for custom step label and connector content
- Full CSS token system for styling
- Light and dark theme support

## Basic Usage

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxStepper } from "danx-ui";
import type { DanxStep } from "danx-ui";

const activeStep = ref(0);

const steps: DanxStep[] = [
  { label: "Account", description: "Create your account" },
  { label: "Profile", description: "Add profile details" },
  { label: "Confirm", description: "Review and submit" },
];
</script>

<template>
  <DanxStepper v-model="activeStep" :steps="steps" />
</template>
```

## Props

| Prop        | Type                        | Required | Default        | Description                 |
|-------------|-----------------------------|----------|----------------|------------------------------|
| modelValue  | `number`                    | Yes      | -              | Active step index (v-model) |
| steps       | `DanxStep[]`                | Yes      | -              | Array of step items          |
| orientation | `"horizontal" \| "vertical"`| No       | `"horizontal"` | Layout direction              |
| clickable   | `boolean`                   | No       | `false`        | Enables non-linear navigation |

## DanxStep Interface

| Property    | Type                              | Required | Description                                |
|-------------|-----------------------------------|----------|---------------------------------------------|
| label       | `string`                          | Yes      | Display label text                          |
| description | `string`                          | No       | Supporting text under the label             |
| icon        | `Component \| IconName \| string` | No       | Icon (name, SVG, or component)              |
| status      | `DanxStepStatus`                  | No       | Explicit override; otherwise derived        |

`DanxStepStatus` is one of `"complete" | "active" | "upcoming" | "error"`.

## Events

| Event             | Payload  | Description                                       |
|-------------------|----------|----------------------------------------------------|
| update:modelValue | `number` | Emitted when a step is clicked (clickable mode)    |
| stepChange       | `number` | Emitted when a step is clicked (clickable mode)    |

## Slots

| Slot      | Scoped Props                              | Description                    |
|-----------|--------------------------------------------|---------------------------------|
| label     | `{ step: DanxStep, index: number, status }`| Replaces label + description    |
| connector | `{ index: number, status }`                | Replaces the connector line     |

### Slot Examples

Custom label with active styling:

```vue
<DanxStepper v-model="activeStep" :steps="steps">
  <template #label="{ step, status }">
    <span :class="status === 'active' ? 'font-bold' : ''">{{ step.label }}</span>
  </template>
</DanxStepper>
```

## Clickable (Non-Linear) Navigation

```vue
<DanxStepper v-model="activeStep" :steps="steps" clickable />
```

When `clickable` is `true`, clicking any step's indicator emits `update:modelValue` and `stepChange` with that step's index, allowing non-linear navigation between steps.

## Vertical Orientation

```vue
<DanxStepper v-model="activeStep" :steps="steps" orientation="vertical" />
```

## Error Status

Set a step's `status` to `"error"` to flag it regardless of its position relative to the active step:

```vue
<DanxStepper
  v-model="activeStep"
  :steps="[{ label: 'Upload' }, { label: 'Validate', status: 'error' }, { label: 'Publish' }]"
/>
```

## CSS Tokens

### Container

| Token             | Default     | Description               |
|--------------------|-------------|----------------------------|
| --dx-stepper-gap   | --spacing-2 | Gap between steps/rows     |

### Indicator

| Token                              | Default             | Description         |
|-------------------------------------|----------------------|----------------------|
| --dx-stepper-indicator-size         | 2rem                 | Indicator diameter   |
| --dx-stepper-indicator-font-size    | --text-sm            | Index number size    |
| --dx-stepper-indicator-font-weight  | --font-medium        | Index number weight  |
| --dx-stepper-indicator-border       | --color-border       | Upcoming border      |
| --dx-stepper-indicator-bg           | --color-surface      | Upcoming background  |
| --dx-stepper-indicator-text         | --color-text-muted   | Upcoming text        |
| --dx-stepper-active-bg              | --color-interactive  | Active background    |
| --dx-stepper-active-text            | --color-text-inverted| Active text          |
| --dx-stepper-complete-bg            | --color-success      | Complete background  |
| --dx-stepper-complete-text          | --color-text-inverted| Complete text        |
| --dx-stepper-error-bg               | --color-danger       | Error background     |
| --dx-stepper-error-text             | --color-text-inverted| Error text           |

### Typography

| Token                           | Default            | Description        |
|-----------------------------------|---------------------|----------------------|
| --dx-stepper-label-font-size      | --text-sm           | Label font size      |
| --dx-stepper-label-font-weight    | --font-medium       | Label font weight    |
| --dx-stepper-label-color          | --color-text        | Label text color     |
| --dx-stepper-description-color    | --color-text-muted  | Description text     |

### Connector

| Token                             | Default          | Description          |
|-------------------------------------|------------------|------------------------|
| --dx-stepper-connector-color       | --color-border   | Upcoming connector line |
| --dx-stepper-connector-complete    | --color-success  | Complete connector line |
| --dx-stepper-connector-thickness   | 2px              | Connector thickness     |

### Animation

| Token                    | Default          | Description               |
|---------------------------|------------------|-----------------------------|
| --dx-stepper-transition   | --transition-fast| Indicator/connector color transition |

## Styling Examples

### Compact stepper

```css
.compact-stepper {
  --dx-stepper-indicator-size: 1.5rem;
  --dx-stepper-label-font-size: 0.75rem;
}
```

### Custom active color

```css
.brand-stepper {
  --dx-stepper-active-bg: #8b5cf6;
  --dx-stepper-active-text: white;
}
```
