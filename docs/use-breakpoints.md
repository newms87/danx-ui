# useBreakpoints

Reactive responsive breakpoint helpers, pre-configured with danx-ui's Tailwind v4 breakpoint tokens (`sm`/`md`/`lg`/`xl`). A thin wrapper around VueUse's `useBreakpoints`/`useMediaQuery` — no need to duplicate breakpoint pixel values by hand.

## Features

- Reactive booleans for common breakpoint ranges: `smAndDown`, `smAndUp`, `mdAndDown`, `mdAndUp`, `lgAndDown`, `lgAndUp`, `xlAndUp`
- `current()` / `active()` for the full set / topmost matched breakpoint
- Raw `useMediaQuery` re-export for arbitrary custom queries
- Safe defaults under SSR / environments without `matchMedia` (returns `false` instead of throwing)
- Zero runtime dependencies of its own — requires `@vueuse/core` as a peer dependency

## Prerequisites

`useBreakpoints` pulls in `@vueuse/core`, so it's exported from its own subpath rather than the main `danx-ui` barrel (keeping the main entry peer-free):

```bash
npm install @vueuse/core
```

## Basic Usage

```vue
<script setup lang="ts">
import { useBreakpoints } from "danx-ui/breakpoints";

const { mdAndUp } = useBreakpoints();
</script>

<template>
  <div v-if="mdAndUp">Desktop layout</div>
  <div v-else>Mobile layout</div>
</template>
```

## Breakpoint Tokens

| Token | Min width |
| ----- | --------- |
| `sm`  | 640px     |
| `md`  | 768px     |
| `lg`  | 1024px    |
| `xl`  | 1280px    |

## Wiring DanxTabs to Switch Layout at a Breakpoint

```vue
<script setup lang="ts">
import { ref } from "vue";
import { DanxTabs } from "danx-ui";
import { useBreakpoints } from "danx-ui/breakpoints";
import type { DanxTab } from "danx-ui";

const { smAndDown } = useBreakpoints();
const activeTab = ref("overview");

const tabs: DanxTab[] = [
  { value: "overview", label: "Overview", icon: "list" },
  { value: "details", label: "Details", icon: "edit" },
  { value: "settings", label: "Settings" },
];
</script>

<template>
  <!-- Icon-only, compact tabs on mobile; full labels on larger viewports -->
  <DanxTabs v-model="activeTab" :tabs="tabs" :class="smAndDown ? 'text-xs' : ''" />
</template>
```

## Custom Queries

Use the re-exported `useMediaQuery` directly for anything outside the standard breakpoint set (e.g. orientation, `prefers-color-scheme`):

```ts
import { useMediaQuery } from "danx-ui/breakpoints";

const isLandscape = useMediaQuery("(orientation: landscape)");
```

## API

### `useBreakpoints()`

Returns:

| Property     | Type                       | Description                                        |
| ------------ | -------------------------- | --------------------------------------------------- |
| `smAndDown`  | `ComputedRef<boolean>`     | Viewport width < `md`                               |
| `smAndUp`    | `ComputedRef<boolean>`     | Viewport width >= `sm`                              |
| `mdAndDown`  | `ComputedRef<boolean>`     | Viewport width < `lg`                               |
| `mdAndUp`    | `ComputedRef<boolean>`     | Viewport width >= `md`                              |
| `lgAndDown`  | `ComputedRef<boolean>`     | Viewport width < `xl`                               |
| `lgAndUp`    | `ComputedRef<boolean>`     | Viewport width >= `lg`                               |
| `xlAndUp`    | `ComputedRef<boolean>`     | Viewport width >= `xl`                               |
| `current()`  | `ComputedRef<string[]>`    | All breakpoint keys the current width satisfies     |
| `active()`   | `ComputedRef<string>`      | Largest matched breakpoint key, or `""` if none     |

### `useMediaQuery(query)`

Re-exported from `@vueuse/core`. Returns a `ComputedRef<boolean>` for an arbitrary media query string.

### `DANX_BREAKPOINTS`

The raw `{ sm, md, lg, xl }` pixel-value map used internally, exported for consumers who need the numbers directly.
