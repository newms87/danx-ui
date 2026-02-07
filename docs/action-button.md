# Action Button Component

A wrapper around DanxButton that integrates with the action system. Handles triggering, loading states, confirmation dialogs, and event callbacks.

## Features

- **Action Integration** - Triggers a `ResourceAction` on click with optional target and input data
- **Automatic Loading** - Three loading sources: `saving` prop, `action.isApplying`, `target.isSaving`
- **Confirmation Dialog** - Optional confirmation step before triggering destructive actions
- **Event Callbacks** - `success`, `error`, and `always` events for post-action handling
- **Full DanxButton Passthrough** - Type, size, icon, disabled, and tooltip all pass through

## Basic Usage

```vue
<template>
  <DanxActionButton :action="deleteAction" :target="item" type="danger" icon="trash">
    Delete
  </DanxActionButton>
</template>

<script setup lang="ts">
import { DanxActionButton } from 'danx-ui';
import type { ResourceAction } from 'danx-ui';

const deleteAction: ResourceAction = {
  isApplying: false,
  name: 'delete',
  async trigger(target, input) {
    await api.delete(target.id);
  }
};
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `type` | `ButtonType` | `""` | Semantic color type (blank, danger, success, warning, info, muted) |
| `size` | `ButtonSize` | `"md"` | Button size (xxs, xs, sm, md, lg) |
| `icon` | `Component \| string` | - | Icon name, raw SVG string, or component |
| `disabled` | `boolean` | `false` | Disables the button |
| `tooltip` | `string` | - | Native title attribute |
| `action` | `ResourceAction` | - | Action object to trigger on click |
| `target` | `ActionTarget` | - | Target passed to `action.trigger()` |
| `input` | `Record<string, unknown>` | - | Data passed as second argument to `action.trigger()` |
| `confirm` | `boolean` | `false` | Show confirmation dialog before triggering |
| `confirmText` | `string` | `"Are you sure?"` | Message displayed in the confirmation dialog |
| `saving` | `boolean` | - | Manual loading state override |

## Events

| Event | Payload | Description |
|-------|---------|-------------|
| `success` | `unknown` | Emitted with the response after `action.trigger()` resolves |
| `error` | `unknown` | Emitted with the error after `action.trigger()` rejects |
| `always` | none | Emitted after action completes, regardless of success or failure |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Button text content |

## Action System Interface

### ResourceAction

The action object passed to the `action` prop must satisfy this interface:

```typescript
interface ResourceAction {
  /** Whether this action is currently being applied */
  isApplying: boolean;

  /** Machine-readable action name */
  name: string;

  /** Trigger the action */
  trigger(target?: ActionTarget, input?: Record<string, unknown>): Promise<unknown>;

  /** Optional human-readable label */
  label?: string;

  /** Optional icon name or SVG string */
  icon?: string;
}
```

### ActionTarget

The target can be a single item, an array of items, or null:

```typescript
type ActionTarget = ActionTargetItem | ActionTargetItem[] | null;

interface ActionTargetItem {
  isSaving?: boolean;
}
```

## Confirmation Flow

When `confirm` is set, clicking the button opens a confirmation dialog instead of immediately triggering the action. The user must click "Confirm" to proceed or "Close" to cancel.

```vue
<DanxActionButton
  :action="deleteAction"
  :target="item"
  confirm
  confirm-text="Permanently delete this record?"
  type="danger"
  icon="trash"
>
  Delete
</DanxActionButton>
```

The confirmation dialog uses the DanxDialog component internally. The `confirmText` prop controls the dialog body text, defaulting to "Are you sure?".

## Loading State Precedence

The button shows a loading spinner when any of these conditions are true (checked in order):

1. **`saving` prop** is `true` - Manual override, useful when loading state is managed externally
2. **`action.isApplying`** is `true` - The action itself reports it is in progress
3. **`target.isSaving`** is `true` - The target item reports it is being saved (single items only, not arrays)

When loading, the button is disabled and click events are prevented.

```vue
<!-- Manual loading override -->
<DanxActionButton :action="saveAction" :saving="isSaving">Save</DanxActionButton>

<!-- Automatic via action.isApplying -->
<DanxActionButton :action="applyAction">Apply</DanxActionButton>

<!-- Automatic via target.isSaving -->
<DanxActionButton :action="updateAction" :target="item">Update</DanxActionButton>
```

## Event Callbacks

Use events to respond to action outcomes:

```vue
<DanxActionButton
  :action="saveAction"
  :target="item"
  @success="onSaved"
  @error="onError"
  @always="onComplete"
>
  Save
</DanxActionButton>
```

- `success` fires with the resolved value from `action.trigger()`
- `error` fires with the rejection reason from `action.trigger()`
- `always` fires after either outcome (like `finally`)

## Styling

DanxActionButton inherits all DanxButton CSS tokens. See the [Button documentation](./button.md) for the full token reference.

## TypeScript Types

```typescript
import type {
  DanxActionButtonProps,
  DanxActionButtonEmits,
  ResourceAction,
  ActionTarget,
  ActionTargetItem,
} from 'danx-ui';
```

## Accessibility

- Inherits DanxButton's native `<button>` element and accessibility features
- Confirmation dialog uses the native `<dialog>` element with modal behavior
- Disabled/loading states properly prevent interaction
