# DanxScroll

Custom overlay scrollbar container with auto-hide, drag support, and opt-in infinite scroll.

## Features

- Custom overlay scrollbars that don't push content
- Auto-hide with fade transition (configurable duration)
- Draggable thumb with click-to-jump on track
- Vertical, horizontal, or both-axis scrolling
- Five size presets (xs, sm, md, lg, xl)
- Variant coloring via `useVariant()`
- Persistent mode (always visible)
- Opt-in infinite scroll with loading/done indicators
- Full CSS token system for customization
- Zero runtime dependencies (infinite scroll requires `@vueuse/core` peer dep)

## Prerequisites

For infinite scroll functionality, install `@vueuse/core`:

```bash
npm install @vueuse/core
```

## Basic Usage

```vue
<script setup>
import { DanxScroll } from "danx-ui";
</script>

<template>
  <DanxScroll class="h-64">
    <div v-for="i in 100" :key="i">Item {{ i }}</div>
  </DanxScroll>
</template>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `tag` | `string` | `"div"` | HTML tag for container |
| `direction` | `"vertical" \| "horizontal" \| "both"` | `"vertical"` | Scrollable axes |
| `size` | `"xs" \| "sm" \| "md" \| "lg" \| "xl"` | `"md"` | Thumb thickness |
| `variant` | `VariantType` | `""` | Color variant |
| `persistent` | `boolean` | `false` | Always show scrollbar |
| `hoverThreshold` | `number` | `20` | Proximity (px) to reveal scrollbar on hover |
| `infiniteScroll` | `boolean` | `false` | Enable infinite scroll |
| `distance` | `number` | `200` | Trigger threshold (px) |
| `infiniteDirection` | `"top" \| "bottom" \| "left" \| "right"` | `"bottom"` | Loading edge |
| `canLoadMore` | `boolean` | `true` | More items available |
| `loading` | `boolean` | `false` | Load in progress |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `loadMore` | none | Scroll threshold crossed (only when `infiniteScroll=true`) |

## Slots

| Slot | Description |
|------|-------------|
| `default` | Scrollable content |
| `loading` | Loading indicator (default: "Loading...") |
| `done` | Done indicator (default: "No more items") |

## Scrollbar Customization

### Size

Five presets control thumb thickness:

```vue
<DanxScroll size="xs" />  <!-- 4px thumb -->
<DanxScroll size="sm" />  <!-- 6px thumb -->
<DanxScroll size="md" />  <!-- 8px thumb (default) -->
<DanxScroll size="lg" />  <!-- 10px thumb -->
<DanxScroll size="xl" />  <!-- 12px thumb -->
```

### Variant

Apply color variants to the scrollbar:

```vue
<DanxScroll variant="danger" />
<DanxScroll variant="info" />
```

### Persistent

Keep the scrollbar always visible:

```vue
<DanxScroll persistent />
```

## Direction

### Horizontal

```vue
<DanxScroll direction="horizontal" class="w-full h-24">
  <div style="width: 2000px">Wide content...</div>
</DanxScroll>
```

### Both Axes

```vue
<DanxScroll direction="both" class="w-full h-64">
  <div style="width: 1500px">
    <div v-for="i in 50" :key="i">Wide row {{ i }}</div>
  </div>
</DanxScroll>
```

## Infinite Scroll

Enable with the `infiniteScroll` prop. Requires `@vueuse/core`.

```vue
<script setup>
import { ref } from "vue";
import { DanxScroll } from "danx-ui";

const items = ref([...]);
const loading = ref(false);
const canLoadMore = ref(true);

function loadMore() {
  loading.value = true;
  // fetch more items...
  loading.value = false;
}
</script>

<template>
  <DanxScroll
    infiniteScroll
    :loading="loading"
    :canLoadMore="canLoadMore"
    class="h-64"
    @loadMore="loadMore"
  >
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </DanxScroll>
</template>
```

### Custom Slots

```vue
<DanxScroll infiniteScroll :loading="loading" :canLoadMore="canLoadMore" @loadMore="loadMore">
  <div v-for="item in items" :key="item.id">{{ item.name }}</div>

  <template #loading>
    <div class="animate-spin">Loading more...</div>
  </template>

  <template #done>
    <div>You've reached the end!</div>
  </template>
</DanxScroll>
```

## Composable: useDanxScroll

For building custom scroll containers:

```typescript
import { ref } from "vue";
import { useDanxScroll } from "danx-ui";

const containerEl = ref<HTMLElement | null>(null);

const {
  verticalThumbStyle,
  horizontalThumbStyle,
  isVerticalVisible,
  isHorizontalVisible,
  hasVerticalOverflow,
  hasHorizontalOverflow,
  onVerticalThumbMouseDown,
  onHorizontalThumbMouseDown,
  onVerticalTrackClick,
  onHorizontalTrackClick,
  onTrackMouseEnter,
  onTrackMouseLeave,
} = useDanxScroll(containerEl, { persistent: false });
```

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-scroll-thumb-bg` | `rgb(0 0 0 / 0.3)` | Thumb background |
| `--dx-scroll-thumb-hover-bg` | `rgb(0 0 0 / 0.5)` | Thumb hover background |
| `--dx-scroll-track-bg` | `transparent` | Track background |
| `--dx-scroll-border-radius` | `9999px` | Thumb border radius |
| `--dx-scroll-fade-duration` | `0.3s` | Fade transition duration |
| `--dx-scroll-loading-color` | `var(--color-text-muted)` | Loading text color |
| `--dx-scroll-done-color` | `var(--color-text-subtle)` | Done text color |
| `--dx-scroll-gap` | `1rem` | Gap between content and indicators |
| `--dx-scroll-{size}-thumb-thickness` | varies | Thumb thickness per size |
| `--dx-scroll-{size}-track-padding` | varies | Track padding per size |

## Virtual Scroll

`DanxVirtualScroll` renders only the items visible in the viewport (plus an overscan buffer), using absolute positioning within a fixed-height container. Built on top of `DanxScroll` for custom overlay scrollbars. The scrollbar thumb has a minimum size of 24px so it remains visible and grabbable even with very large lists.

### DanxVirtualScroll Props

All `DanxScroll` props are supported, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `T[]` | required | Array of items to render |
| `defaultItemHeight` | `number` | `40` | Estimated height for unmeasured items |
| `overscan` | `number` | `3` | Extra items above/below viewport |
| `keyFn` | `(item, index) => string \| number` | index | Unique key for height caching |
| `totalItems` | `number` | — | Total items in full dataset (stabilizes scrollbar) |
| `scrollPosition` | `number` | `0` | v-model: current top item index. Updates on scroll; set from parent to jump. |
| `debug` | `boolean` | `false` | Enable debug console logging for this instance |

### DanxVirtualScroll Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `update:scrollPosition` | `number` | First visible item index changed |
| `loadMore` | — | Scroll threshold crossed (infiniteScroll mode) |

### DanxVirtualScroll Slots

| Slot | Props | Description |
|------|-------|-------------|
| `item` | `{ item: T, index: number }` | Scoped slot for each visible item |
| `placeholder` | `{ index: number }` | Skeleton row for unloaded items (totalItems mode) |
| `loading` | — | Loading indicator (at end of visible items) |
| `done` | — | Done indicator (at end of visible items) |

### Local Mode

Pass all items upfront. Only the visible window renders:

```vue
<script setup>
import { ref } from "vue";
import { DanxVirtualScroll } from "danx-ui";

const items = ref(Array.from({ length: 10000 }, (_, i) => `Item ${i}`));
</script>

<template>
  <DanxVirtualScroll :items="items" class="h-96">
    <template #item="{ item, index }">
      <div>{{ index }}: {{ item }}</div>
    </template>
  </DanxVirtualScroll>
</template>
```

### Remote Mode

Combine with infinite scroll to load items on demand:

```vue
<DanxVirtualScroll
  :items="items"
  :totalItems="totalCount"
  infiniteScroll
  :loading="loading"
  :canLoadMore="hasMore"
  class="h-96"
  @loadMore="fetchMore"
>
  <template #item="{ item }">
    <div>{{ item.name }}</div>
  </template>
</DanxVirtualScroll>
```

The `totalItems` prop makes the scrollbar proportional to the full dataset. Without it, the scrollbar only represents loaded items. With it, dragging the scrollbar to 50% scrolls to approximately the middle of the full dataset.

When `totalItems` is set and the user scrolls past loaded items, placeholder skeleton rows are rendered automatically. Customize them with the `#placeholder` slot:

```vue
<DanxVirtualScroll :items="items" :totalItems="500" ...>
  <template #item="{ item }">
    <div>{{ item.name }}</div>
  </template>
  <template #placeholder="{ index }">
    <div class="animate-pulse bg-gray-200 h-8 rounded" />
  </template>
</DanxVirtualScroll>
```

### Log Viewer Pattern

For variable-height items (like log entries with multi-line messages), provide a `keyFn` so cached heights survive reordering:

```vue
<DanxVirtualScroll
  :items="logs"
  :key-fn="(log) => log.id"
  :default-item-height="28"
  :overscan="5"
  size="sm"
  class="h-[400px] font-mono text-xs"
>
  <template #item="{ item }">
    <div class="whitespace-pre-wrap">
      {{ item.timestamp }} {{ item.level }} {{ item.message }}
    </div>
  </template>
</DanxVirtualScroll>
```

### Scroll Position (v-model)

Track or control the scroll position via `v-model:scrollPosition`. The value is the index of the first visible item. Setting it from the parent scrolls to that index.

```vue
<script setup>
import { ref } from "vue";
import { DanxVirtualScroll } from "danx-ui";

const items = ref(Array.from({ length: 10000 }, (_, i) => `Item ${i}`));
const position = ref(0);

function jumpToMiddle() {
  position.value = 5000;
}
</script>

<template>
  <p>Currently viewing item #{{ position }}</p>
  <button @click="jumpToMiddle">Jump to middle</button>

  <DanxVirtualScroll
    v-model:scrollPosition="position"
    :items="items"
    :totalItems="10000"
    class="h-96"
  >
    <template #item="{ item, index }">
      <div>{{ index }}: {{ item }}</div>
    </template>
  </DanxVirtualScroll>
</template>
```

### Composable: useScrollWindow

For building custom virtual scroll layouts:

```typescript
import { ref } from "vue";
import { useScrollWindow } from "danx-ui";

const viewportEl = ref<HTMLElement | null>(null);
const items = ref([...]);

const {
  visibleItems,   // Computed: slice of items in viewport
  startIndex,     // Ref: first rendered index
  endIndex,       // Ref: last rendered index
  startOffset,    // Ref: absolute top offset for first visible item
  totalHeight,    // Ref: container height (fixed when totalItems set)
  measureItem,    // (key, el) => void — cache item height
  scrollToIndex,  // (index) => void — scroll to item
  keyFn,          // Resolved key extractor function
} = useScrollWindow(viewportEl, {
  items,
  defaultItemHeight: 40,
  overscan: 3,
  keyFn: (item) => item.id,
  totalItems: 10000, // Optional: stabilizes scrollbar for remote datasets
});
```

## Auto-Scroll on Drag Beyond Bounds

When dragging the scrollbar thumb, if the cursor moves beyond the container edge, scrolling continues automatically at a speed proportional to the distance past the edge. The farther the cursor is from the container, the faster it scrolls. Releasing the mouse stops auto-scroll immediately.

When the cursor returns to within the container bounds, scrolling transitions smoothly back to normal drag behavior — the drag origin is continuously rebased during auto-scroll to prevent jarring jumps.

This works for both vertical and horizontal scrollbars. The speed constant is `0.15` pixels per frame per pixel of overshoot (at 60fps, 50px overshoot scrolls ~450px/s).

## Accessibility

- The scrollbar is decorative overlay; native scroll behavior is preserved
- Keyboard scrolling works normally (arrow keys, Page Up/Down, Home/End)
- Mouse wheel and touch scrolling work via the native scroll container
- The custom thumb supports drag interaction for pointer users
