# DanxTimeline

A vertical activity/event timeline for audit logs, changelogs, and event history. Presentation-only — pass an `items` array or compose `DanxTimelineItem` children directly.

## Features

- Vertical connector line linking entries
- Per-item semantic type (`success`, `error`, `warning`, `info`, `default`) driving marker color, matching the existing chip/alert type system
- Optional per-item icon via `DanxIcon`, falling back to a colored dot
- `items` array shorthand or `DanxTimelineItem` children via the default slot
- Full CSS token system for styling
- Light and dark theme support

## Basic Usage

```vue
<script setup lang="ts">
import { DanxTimeline } from "danx-ui";
import type { DanxTimelineEntry } from "danx-ui";

const entries: DanxTimelineEntry[] = [
  { type: "success", timestamp: "2 minutes ago", content: "Deployment succeeded" },
  { type: "info", timestamp: "10 minutes ago", content: "Build started" },
  { type: "default", timestamp: "1 hour ago", content: "Commit pushed to main" },
];
</script>

<template>
  <DanxTimeline :items="entries" />
</template>
```

## Explicit Children

Use `DanxTimelineItem` directly for full control over content, including rich markup:

```vue
<script setup lang="ts">
import { DanxTimeline, DanxTimelineItem } from "danx-ui";
</script>

<template>
  <DanxTimeline>
    <DanxTimelineItem type="success" timestamp="2 minutes ago">
      Deployment <strong>succeeded</strong>
    </DanxTimelineItem>
    <DanxTimelineItem type="error" timestamp="15 minutes ago">
      Build failed: missing dependency
    </DanxTimelineItem>
  </DanxTimeline>
</template>
```

## Props

### DanxTimeline

| Prop  | Type                  | Required | Default | Description                                             |
|-------|-----------------------|----------|---------|-----------------------------------------------------------|
| items | `DanxTimelineEntry[]` | No       | -       | Entries to render. Alternative to slotting items directly |

### DanxTimelineItem

| Prop      | Type                             | Required | Default   | Description                     |
|-----------|----------------------------------|----------|-----------|----------------------------------|
| timestamp | `string`                         | No       | -         | Timestamp text                  |
| type      | `TimelineItemType`                | No       | `"default"` | Marker color                   |
| icon      | `Component \| IconName \| string` | No       | -         | Marker icon, falls back to dot  |

`TimelineItemType` is one of `"success" | "error" | "warning" | "info" | "default"` (any other string falls back to `"default"`'s styling via the class, matching the chip/alert type system convention).

## DanxTimelineEntry Interface

| Property  | Type              | Required | Description                            |
|-----------|-------------------|----------|------------------------------------------|
| timestamp | `string`          | No       | Timestamp text                          |
| content   | `string`          | No       | Entry content text                      |
| type      | `TimelineItemType` | No       | Marker color                            |
| icon      | `Component \| IconName \| string` | No | Marker icon, falls back to dot |

## Slots

### DanxTimeline

| Slot    | Description                                                |
|---------|--------------------------------------------------------------|
| default | `DanxTimelineItem` children, used instead of the `items` prop |

### DanxTimelineItem

| Slot      | Description                     |
|-----------|-----------------------------------|
| default   | Entry content                    |
| timestamp | Overrides the timestamp text     |

## Icons

Pass an icon per entry; it renders inside the marker dot via `DanxIcon`. When omitted, the marker is a plain colored dot:

```vue
<DanxTimeline
  :items="[{ type: 'success', icon: 'confirm', content: 'Approved' }]"
/>
```

## CSS Tokens

| Token                              | Default                | Description                     |
|--------------------------------------|--------------------------|-----------------------------------|
| --dx-timeline-gap                   | --spacing-6              | Space below each item's content   |
| --dx-timeline-content-gap           | --spacing-4              | Space between rail and content    |
| --dx-timeline-marker-size           | 1.5rem                   | Marker diameter                   |
| --dx-timeline-marker-default-bg     | --color-text-muted       | Default marker background         |
| --dx-timeline-marker-success-bg     | --color-success          | Success marker background         |
| --dx-timeline-marker-error-bg       | --color-danger           | Error marker background           |
| --dx-timeline-marker-warning-bg     | --color-warning          | Warning marker background         |
| --dx-timeline-marker-info-bg        | --color-info             | Info marker background            |
| --dx-timeline-marker-text           | --color-text-inverted    | Marker icon color                 |
| --dx-timeline-connector-color       | --color-border           | Connector line color              |
| --dx-timeline-connector-thickness   | 2px                      | Connector line thickness          |
| --dx-timeline-timestamp-color       | --color-text-muted       | Timestamp text color              |
| --dx-timeline-timestamp-font-size   | --text-xs                | Timestamp font size               |
| --dx-timeline-content-color         | --color-text             | Content text color                |
