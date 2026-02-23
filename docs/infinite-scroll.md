# Infinite Scroll Component

A scrollable container that emits a `loadMore` event when the user scrolls near the edge. Uses VueUse's `useInfiniteScroll` internally for efficient scroll detection.

## Features

- **Configurable distance** - Set pixel threshold from the scroll edge
- **Bidirectional** - Load at the bottom (default) or top (chat history)
- **Loading guard** - Prevents concurrent load triggers
- **Done state** - Shows a "no more items" indicator when `canLoadMore` is false
- **Custom slots** - Override loading and done indicators
- **Customizable tag** - Render as any HTML element
- **CSS tokens** - Style via component tokens

## Prerequisites

`@vueuse/core` is an optional peer dependency. Install it alongside `danx-ui`:

```bash
npm install @vueuse/core
```

## Basic Usage

```vue
<template>
  <DanxInfiniteScroll
    style="height: 400px"
    :loading="loading"
    :canLoadMore="hasMore"
    @loadMore="fetchMore"
  >
    <div v-for="item in items" :key="item.id">{{ item.name }}</div>
  </DanxInfiniteScroll>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { DanxInfiniteScroll } from 'danx-ui';

const items = ref([]);
const loading = ref(false);
const hasMore = ref(true);

async function fetchMore() {
  loading.value = true;
  const newItems = await api.getItems({ offset: items.value.length });
  items.value.push(...newItems);
  hasMore.value = newItems.length > 0;
  loading.value = false;
}
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `distance` | `number` | `200` | Pixels from edge to trigger load |
| `direction` | `"top" \| "bottom"` | `"bottom"` | Scroll direction to watch |
| `canLoadMore` | `boolean` | `true` | Whether more items exist |
| `loading` | `boolean` | `false` | Whether a load is in progress |
| `tag` | `string` | `"div"` | HTML tag for the container |

## Emits

| Event | Payload | Description |
|-------|---------|-------------|
| `loadMore` | - | Fired when scroll threshold crossed |

The event is guarded by `loading` and `canLoadMore` — it will not fire when `loading` is `true` or `canLoadMore` is `false`.

## Slots

| Slot | Description |
|------|-------------|
| `default` | Main content (list items) |
| `loading` | Loading indicator (default: "Loading..." span) |
| `done` | Done indicator (default: "No more items" span) |

## Direction: Top

For chat-style UIs where older content loads at the top:

```vue
<DanxInfiniteScroll
  direction="top"
  :loading="loading"
  :canLoadMore="hasMore"
  @loadMore="loadOlderMessages"
>
  <ChatMessage v-for="msg in messages" :key="msg.id" :message="msg" />
</DanxInfiniteScroll>
```

## Custom Slots

```vue
<DanxInfiniteScroll :loading="loading" :canLoadMore="hasMore" @loadMore="fetch">
  <div v-for="item in items" :key="item.id">{{ item.name }}</div>

  <template #loading>
    <MySpinner />
  </template>

  <template #done>
    <p>You've seen everything!</p>
  </template>
</DanxInfiniteScroll>
```

## Composable: useDanxInfiniteScroll

For advanced use cases, the composable can be used directly without the component wrapper:

```typescript
import { ref } from 'vue';
import { useDanxInfiniteScroll } from 'danx-ui';

const scrollEl = ref<HTMLElement | null>(null);
const loading = ref(false);
const canLoadMore = ref(true);

useDanxInfiniteScroll(scrollEl, {
  distance: 300,
  direction: 'bottom',
  canLoadMore,
  loading,
  onLoadMore: () => { /* fetch data */ },
});
```

## CSS Tokens

| Token | Default | Description |
|-------|---------|-------------|
| `--dx-infinite-scroll-loading-color` | `--color-text-muted` | Loading text color |
| `--dx-infinite-scroll-done-color` | `--color-text-subtle` | Done text color |
| `--dx-infinite-scroll-gap` | `1rem` | Gap between content and indicators |

## Accessibility

The component is a plain scrollable container. For accessible infinite lists, consider adding `aria-live="polite"` on the content area so screen readers announce new items as they load.
