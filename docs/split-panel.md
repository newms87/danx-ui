# Split Panel

Resizable multi-panel layout component that displays 2+ named panels side-by-side or stacked, with drag handles for resizing and optional localStorage persistence.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `panels` | `SplitPanelConfig[]` | required | Panel configurations |
| `horizontal` | `boolean` | `false` | Stack panels vertically instead of side-by-side |
| `storageKey` | `string` | — | localStorage key for persisting state |
| `requireActive` | `boolean` | `false` | Prevent deactivating the last panel |

### SplitPanelConfig

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | Unique identifier (also the slot name) |
| `label` | `string` | Label for toggle UI / accessibility |
| `defaultWidth` | `number` | Proportional weight (not percentage) |

## v-model

`v-model` binds an array of active panel IDs (`string[]`). Defaults to all panel IDs when not provided. Updating this array shows/hides panels accordingly.

## Slots

Each panel ID becomes a named slot. Content placed in `#sidebar` renders inside the panel with `id: "sidebar"`.

The `toggles` slot receives:

- `panels` — the full `SplitPanelConfig[]` array
- `isActive(id)` — returns whether a panel is currently visible
- `toggle(id)` — toggles a panel on or off

## CSS Tokens

| Token | Default | Purpose |
|-------|---------|---------|
| `--dx-split-panel-handle-size` | `8px` | Handle hit area |
| `--dx-split-panel-handle-color` | `var(--color-border)` | Grip color |
| `--dx-split-panel-handle-hover` | `var(--color-interactive)` | Hover color |
| `--dx-split-panel-handle-active` | `var(--color-interactive)` | Active/drag color |
| `--dx-split-panel-transition` | `200ms ease` | Panel width transition |

## Width Redistribution

Panel widths are proportional weights, not percentages. Weights `[1, 2, 1]` produce 25%, 50%, 25%. When a panel is toggled off, remaining panels redistribute to fill 100%.

## localStorage Persistence

When `storageKey` is provided, active panel IDs and custom widths (from drag resizing) are saved to localStorage. On init, stored state is validated against the current panel config — stale IDs are discarded.

## Resize Behavior

Drag handles between adjacent panels allow resizing. During drag, the two neighboring panels' widths adjust proportionally while all other panels remain fixed. Panels have a minimum width of 5%.
