# AuditHistoryItem Component

A single change-log/audit-trail row: who did what, to which field, and when.

## Features

- **Actor + Relative Timestamp** - Uses the shared `fTimeAgo` formatter
- **Color-Coded Action Label** - `create`/`update`/`delete` map to `success`/`info`/`danger`, consistent with DanxChip/DanxAlert
- **Before/After Diff** - Struck-through old value, arrow, new value, when `field` is set
- **Generic Fallback** - Description prop or default slot when no field changed (e.g. "created this record")
- **CSS Tokens** - Full customization via component tokens
- **Zero Dependencies** - Composes DanxChip for the action label

## Basic Usage

```vue
<template>
  <DanxAuditHistoryItem
    :entry="{
      actor: 'Jane Doe',
      timestamp: '2024-01-15T10:30:00Z',
      action: 'update',
      field: 'status',
      oldValue: 'Draft',
      newValue: 'Published',
    }"
  />
</template>

<script setup lang="ts">
import { DanxAuditHistoryItem } from 'danx-ui';
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `entry` | `AuditHistoryEntry` | - | The audit entry to render (required) |
| `actionVariant` | `VariantType` | - | Overrides the automatic action -> variant mapping |

### AuditHistoryEntry shape

| Field | Type | Description |
|-------|------|--------------|
| `actor` | `string` | Who performed the action |
| `timestamp` | `string \| number \| DateTime` | When it happened (anything Luxon can parse) |
| `action` | `string` | `"create"`, `"update"`, `"delete"`, or any custom string |
| `field` | `string` | Field name that changed (enables the diff branch) |
| `oldValue` | `string` | Value before the change |
| `newValue` | `string` | Value after the change |
| `description` | `string` | Fallback text when `field` is absent |

## Slots

| Slot | Props | Description |
|------|-------|-------------|
| `default` | `{ entry }` | Overrides the fallback description shown when `field` is absent |

## Field Diffs

When `field` (plus `oldValue`/`newValue`) is present, the row renders a struck-through old value, an arrow, and the new value:

```vue
<DanxAuditHistoryItem
  :entry="{
    actor: 'Jane Doe', timestamp: Date.now(), action: 'update',
    field: 'status', oldValue: 'Draft', newValue: 'Published',
  }"
/>
```

## Fallback / No Field

When `field` is absent, the row falls back to `entry.description`, or a custom default slot:

```vue
<DanxAuditHistoryItem
  :entry="{ actor: 'Jane Doe', timestamp: Date.now(), action: 'create', description: 'created this record' }"
/>

<DanxAuditHistoryItem :entry="entry">
  <template #default="{ entry }">Custom summary for {{ entry.actor }}</template>
</DanxAuditHistoryItem>
```

## Action Colors

`create`, `update`, and `delete` are colored automatically via the shared `--dx-variant-*` token system (matching DanxChip/DanxAlert). Any other action string falls back to `muted`. Override per-instance with `actionVariant`.

## Composing a List

`DanxAuditHistoryItem` renders a single row — compose your own list/feed wrapper around it (or drop rows into `DanxTimeline` once available):

```vue
<ul class="my-audit-log">
  <li v-for="entry in entries" :key="entry.id">
    <DanxAuditHistoryItem :entry="entry" />
  </li>
</ul>
```

## Styling with CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-audit-history-item-gap` | `0.5rem` | Gap between actor, action, body, timestamp |
| `--dx-audit-history-item-padding-y` | `0.5rem` | Vertical padding |
| `--dx-audit-history-item-font-size` | `0.875rem` | Body font size |
| `--dx-audit-history-item-actor-weight` | `--font-semibold` | Actor + field font weight |
| `--dx-audit-history-item-timestamp-color` | `--color-text-muted` | Timestamp + arrow color |
| `--dx-audit-history-item-old-color` | `--color-text-muted` | Old value color |
