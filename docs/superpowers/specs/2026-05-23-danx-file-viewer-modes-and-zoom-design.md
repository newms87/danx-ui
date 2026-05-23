# DanxFileViewer — vertical mode, continuous mode, zoom

Date: 2026-05-23

## Goal

Add three opt-in features to `DanxFileViewer` so it can stand in for a PDF-style document reader:

1. **Vertical layout** — thumbnail strip moves from bottom to left, thumbs grow larger.
2. **Continuous scroll layout** — all related files render in a single virtualized scroll column; the active file follows scroll position.
3. **Zoom + pan** — Photoshop-style: Ctrl+wheel zoom, Ctrl+drag pan, Ctrl+`+`/`-`/`0` keys, dblclick reset, optional toolbar slider. Built as a reusable `DanxZoomable` wrapper so other consumers can adopt the same gestures.

All three are **opt-in** via props on `DanxFileViewer`. Existing callers see no change.

## Non-goals

- No annotation, no text selection, no PDF page rendering primitives (DanxFile already handles file rendering).
- No per-file zoom in continuous mode — zoom is one value applied to the whole column.
- No drag-and-drop reorder of related files.

## Architecture

### New components

| Path | Responsibility |
|---|---|
| `src/components/zoomable/DanxZoomable.vue` | Wrapper. `v-model:zoom` (number, %), `v-model:pan` (`{x,y}` px). Renders default slot inside a transformed `<div>`. Owns event listeners via `useZoomable`. Named slot `controls` for inline overlay. |
| `src/components/zoomable/DanxZoomControls.vue` | Slider + `%` readout + reset. Binds same `v-model:zoom`. Built on `DanxRangeSlider`. |
| `src/components/zoomable/useZoomable.ts` | Composable. Owns zoom/pan refs + handlers (wheel, keys, mouse drag, dblclick). Returns refs + event binders. Testable without mounting `DanxZoomable`. |
| `src/components/zoomable/zoomable-tokens.css` | `--dx-zoomable-cursor-grab`, `--dx-zoomable-hint-bg`, etc. Reference semantic tokens only. |
| `src/components/zoomable/zoomable.css` | Layout (cursor states, hint pill positioning, control bar). |
| `src/components/zoomable/types.ts` | `DanxZoomableProps`, `DanxZoomableEmits`, `Pan`, `ZoomLimits`. |
| `src/components/zoomable/index.ts` | Named exports. |
| `src/components/danx-file-viewer/DanxFileViewerContinuous.vue` | Continuous-mode body. Wraps `DanxVirtualScroll direction="vertical"`. Each item = `<DanxFile mode="preview" size="auto" fit="contain">`. Owns `scrollPosition` ↔ `currentIndex` sync. |
| `src/components/danx-file-viewer/DanxFileViewerToolbar.vue` | Optional toolbar above main body. Renders layout-mode toggle (button group, only enabled modes) + `DanxZoomControls`. Auto-mounted when any control is opted in. |
| `src/components/danx-file-viewer/useViewerPreferences.ts` | Reactive ref factory: `localStorage[key+suffix] ?? propDefault`. Writes on change. |

### Modified components

- `DanxFileViewer.vue` — accept new props, mount toolbar, switch body layout via outer `DanxSplitPanel` config, wrap slide in `DanxZoomable` when `zoomable` set.
- `DanxFileThumbnailStrip.vue` — add `orientation: "horizontal" | "vertical"` prop. Vertical = `DanxVirtualScroll direction="vertical"` + larger thumbs via token. Horizontal unchanged.
- `useDanxFileViewer.ts` — expose `currentIndex` as writable + add `scrollToIndex(idx)` hook used by continuous mode.

## New `DanxFileViewer` API

| Prop | Type | Default | Note |
|---|---|---|---|
| `defaultLayout` | `"horizontal" \| "vertical" \| "continuous"` | `"horizontal"` | Pref fallback. Actual value: `localStorage ?? defaultLayout`. |
| `defaultZoom` | `number` | `100` | Pref fallback. |
| `availableLayouts` | `Layout[]` | `["horizontal"]` | Opt-in: which toggle buttons render. |
| `zoomable` | `boolean` | `false` | Opt-in: show zoom controls + enable Ctrl+wheel/key gestures. |
| `storageKey` | `string` | `"danx-file-viewer"` | Namespace for preference keys. |
| `showToolbar` | `boolean` | computed: `availableLayouts.length>1 \|\| zoomable` | Override to force-hide. |

Existing props/emits/slots unchanged.

## Layout matrix

```
horizontal:    [header][toolbar?]
               [viewer | metadata?]
               [thumb-strip (horizontal, bottom)]

vertical:      [header][toolbar?]
               [thumb-strip (vertical, left) | viewer | metadata?]

continuous:    [header][toolbar?]
               [thumb-strip (vertical, left) | continuous-scroll | metadata?]
```

Outer container is a single `DanxSplitPanel`. Panels list switches per layout:

| Layout | Panels | Strip orientation |
|---|---|---|
| horizontal | `[viewer, metadata]` | horizontal, bottom (current) |
| vertical | `[strip, viewer, metadata]` | vertical, left |
| continuous | `[strip, continuous, metadata]` | vertical, left |

`storageKey` namespaces each panel-set's widths separately so users get sensible per-layout defaults.

## Zoom integration

| Mode | Wrapping |
|---|---|
| horizontal / vertical | Active slide wrapped in `<DanxZoomable v-model:zoom>`. Pan enabled. |
| continuous | Outer scrolling content wrapped in one `<DanxZoomable v-model:zoom :pan-disabled="true">`. Scroll IS pan. Wheel-zoom (Ctrl+wheel) still works. |

Zoom value is a single ref at `DanxFileViewer` level, persisted via `useViewerPreferences`. Toolbar's `DanxZoomControls` and inline wrapper both bind it.

`DanxZoomable` props:

| Prop | Type | Default |
|---|---|---|
| `zoom` (v-model) | `number` | `100` |
| `pan` (v-model) | `{ x: number; y: number }` | `{x:0,y:0}` |
| `min` | `number` | `25` |
| `max` | `number` | `400` |
| `step` | `number` | `10` |
| `panDisabled` | `boolean` | `false` |
| `wheelDisabled` | `boolean` | `false` |
| `keyboardDisabled` | `boolean` | `false` |
| `showHint` | `boolean` | `true` |

Events: `update:zoom`, `update:pan`, `reset`.

Slots: `default` (content), `controls` (overlay, e.g. inline slider).

CSS tokens: `--dx-zoomable-hint-bg`, `--dx-zoomable-hint-color`, `--dx-zoomable-cursor-pan`, etc. Token file references semantic tokens only.

## Continuous mode — scroll/index sync

```
user scrolls   ─▶ DanxVirtualScroll @update:scrollPosition
               ─▶ currentIndex = idx
               ─▶ header / metadata / strip highlight update

user clicks    ─▶ goTo(idx) → scrollPosition = idx
thumbnail         ─▶ virtual scroll lands on that file

next/prev      ─▶ currentIndex++ → scrollPosition follows
```

`useDanxFileViewer` already owns `currentIndex` + `goTo/next/prev`. Continuous body adds:
- `scrollPosition` ref bound to `DanxVirtualScroll`.
- Bidirectional watch: `currentIndex ↔ scrollPosition` (guarded against re-entry).

## Preference persistence

`useViewerPreferences(storageKey)` returns:

```
{
  layout: WritableComputedRef<Layout>,     // key: `${storageKey}-layout`
  zoom: WritableComputedRef<number>,       // key: `${storageKey}-zoom`
}
```

Read on mount: `JSON.parse(localStorage[k]) ?? propDefault`. Write on change. Wrapped in try/catch (SSR / disabled storage → fall back to prop default).

Split-panel widths already persist via `DanxSplitPanel`'s own `storage-key`; we pass `${storageKey}-panels-${layout}` so each layout gets its own width memory.

## Testing

| Component / composable | Cases |
|---|---|
| `useZoomable` | initial state; clampZoom; wheel zoom (Ctrl+wheel changes, plain wheel ignored); key handlers (`+`,`-`,`=`,`0`, with/without Ctrl); pan drag (start/move/end, only with Ctrl); dblclick reset; panDisabled / wheelDisabled / keyboardDisabled flags; window blur clears modifier state; cleanup on unmount; v-model emit. |
| `DanxZoomable` | renders default slot inside transformed container; `controls` slot renders; transform style reflects zoom+pan; hint visible per `showHint`; emits `reset`. |
| `DanxZoomControls` | slider + readout reflect zoom; reset btn fires; respects min/max/step. |
| `useViewerPreferences` | reads localStorage; falls back to prop default when missing/invalid; writes on change; tolerates storage failure. |
| `DanxFileThumbnailStrip` | renders horizontal (existing); renders vertical (new); active highlight in both orientations. |
| `DanxFileViewerContinuous` | renders all files virtualized; scroll updates currentIndex; goTo scrolls to file; loadChildren fires when undefined. |
| `DanxFileViewerToolbar` | renders only enabled layouts; layout toggle emits update; zoom controls bound; hidden when no opt-in. |
| `DanxFileViewer` | new props default to current behavior (regression); layout switch reflows correctly; zoom flag wraps slide in DanxZoomable; continuous mode wires scrollPosition; preferences round-trip via localStorage. |

Coverage target: 100% (project rule).

## Demo

New demo page `demo/pages/FileViewerAdvanced.vue` showing:
- All three layouts via toggle.
- Zoom enabled with slider + keyboard hint.
- Standalone `DanxZoomable` demo on an image — proves reusability.

Registration:
- `demo/main.ts` — route entry.
- `demo/App.vue` — sidebar link.
- `demo/composables/useLivePreview.ts` — add `DanxZoomable`, `DanxZoomControls`, `useZoomable` to `REGISTERED_COMPONENTS` + `AVAILABLE_VALUES`.

## Documentation

- `docs/file-viewer.md` — extend with layout modes + zoom sections (or create if absent).
- `docs/zoomable.md` — new reusable component reference.
- Component-level comment blocks updated on every touched `.vue`.

## Edge cases

| Case | Behavior |
|---|---|
| `availableLayouts=["horizontal"]` + `zoomable=false` | No toolbar. Identical to today. |
| Continuous + only one file | Renders that file, no scroll, currentIndex always 0. |
| Zoom while changing layout | Zoom value preserved across mode switches. |
| Pan + layout switch | Pan reset on mode switch (different content geometry). |
| Touch swipe + zoom | Swipe disabled at zoom != 100 (pan takes over). |
| Keyboard focus | Zoom keys only fire when viewer has focus (existing `tabindex="0"` root, capture-phase listener scoped via document.activeElement check). |
| SSR / no localStorage | `useViewerPreferences` swallows errors, returns prop default. |
| Modifier key released mid-drag | Drag completes (already in progress), no new drag starts. |

## Out of scope (deferred)

- Per-file zoom in continuous mode.
- Annotation overlays.
- Touch pinch-to-zoom (Ctrl+wheel only this pass).
- Print/PDF export from viewer.
