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

## Accessibility

- The scrollbar is decorative overlay; native scroll behavior is preserved
- Keyboard scrolling works normally (arrow keys, Page Up/Down, Home/End)
- Mouse wheel and touch scrolling work via the native scroll container
- The custom thumb supports drag interaction for pointer users
