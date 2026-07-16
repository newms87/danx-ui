<!--
/**
 * DanxBreadcrumbs - General-purpose navigation breadcrumb trail
 *
 * Renders an `items` array as an accessible breadcrumb trail inside a
 * semantic `<nav>`. Each item may render as a link (`href`), a button
 * (`onClick`), or inert text (`disabled` or the current/last item). The
 * separator between items is customizable via prop or slot. When `maxItems`
 * is set and the trail exceeds it, the middle of the trail collapses behind
 * an ellipsis, always keeping the first and the last `maxItems - 1` items
 * visible.
 *
 * ## Features
 * - Renders items as link, button, or inert text based on `href`/`onClick`/`disabled`
 * - Last item (or any item marked `current`) is rendered inert with `aria-current="page"`
 * - Customizable separator via `separator` prop or `separator` slot
 * - Optional overflow collapsing via `maxItems`
 * - Optional icons via DanxIcon (name string, SVG string, or Component)
 *
 * @slots
 *   separator - Replaces the default separator text between items
 *
 * @tokens
 *   --dx-breadcrumbs-gap              Gap between items and separators
 *   --dx-breadcrumbs-font-size        Item font size
 *   --dx-breadcrumbs-color            Inactive item text color
 *   --dx-breadcrumbs-hover-color      Hover state for interactive items
 *   --dx-breadcrumbs-current-color    Current item text color
 *   --dx-breadcrumbs-separator-color  Separator color
 *   --dx-breadcrumbs-disabled-color   Disabled item text color
 *
 * @example
 *   <DanxBreadcrumbs :items="[
 *     { label: 'Home', href: '/' },
 *     { label: 'Settings', href: '/settings' },
 *     { label: 'Profile' },
 *   ]" />
 */
-->

<script setup lang="ts">
import { computed } from "vue";
import { DanxIcon } from "../icon";
import type { DanxBreadcrumbItem, DanxBreadcrumbsProps } from "./types";

const props = withDefaults(defineProps<DanxBreadcrumbsProps>(), {
  separator: "/",
  maxItems: undefined,
});

type DisplayEntry =
  | { type: "item"; item: DanxBreadcrumbItem; index: number }
  | { type: "ellipsis" };

/**
 * Index of the current/last item — the one item.current explicitly marks,
 * or the last item in the trail when none is marked.
 */
const currentIndex = computed(() => {
  const explicit = props.items.findIndex((item) => item.current);
  return explicit >= 0 ? explicit : props.items.length - 1;
});

/**
 * Items to render, with the middle of the trail collapsed behind a single
 * ellipsis entry when maxItems is set and exceeded.
 */
const displayEntries = computed<DisplayEntry[]>(() => {
  const items = props.items;
  const max = props.maxItems;

  if (!max || items.length <= max) {
    return items.map((item, index) => ({ type: "item", item, index }) as const);
  }

  const tailCount = Math.max(max - 1, 0);
  const tailStart = items.length - tailCount;

  const entries: DisplayEntry[] = [{ type: "item", item: items[0]!, index: 0 }];
  entries.push({ type: "ellipsis" });
  for (let index = Math.max(tailStart, 1); index < items.length; index++) {
    entries.push({ type: "item", item: items[index]!, index });
  }
  return entries;
});

function isCurrent(index: number) {
  return index === currentIndex.value;
}

function isInteractive(item: DanxBreadcrumbItem, index: number) {
  return !item.disabled && !isCurrent(index) && (!!item.href || !!item.onClick);
}

function handleClick(item: DanxBreadcrumbItem) {
  item.onClick?.();
}
</script>

<template>
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <template v-for="(entry, position) in displayEntries" :key="position">
      <span v-if="position > 0" class="breadcrumbs__separator" aria-hidden="true">
        <slot name="separator">{{ separator }}</slot>
      </span>

      <span v-if="entry.type === 'ellipsis'" class="breadcrumbs__ellipsis" aria-hidden="true">
        &hellip;
      </span>

      <template v-else>
        <a
          v-if="isInteractive(entry.item, entry.index) && entry.item.href"
          class="breadcrumbs__item"
          :href="entry.item.href"
          @click="handleClick(entry.item)"
        >
          <DanxIcon v-if="entry.item.icon" class="breadcrumbs__icon" :icon="entry.item.icon" />
          {{ entry.item.label }}
        </a>
        <button
          v-else-if="isInteractive(entry.item, entry.index)"
          type="button"
          class="breadcrumbs__item"
          @click="handleClick(entry.item)"
        >
          <DanxIcon v-if="entry.item.icon" class="breadcrumbs__icon" :icon="entry.item.icon" />
          {{ entry.item.label }}
        </button>
        <span
          v-else
          class="breadcrumbs__item"
          :class="{
            'breadcrumbs__item--current': isCurrent(entry.index),
            'breadcrumbs__item--disabled': entry.item.disabled,
          }"
          :aria-current="isCurrent(entry.index) ? 'page' : undefined"
          :aria-disabled="entry.item.disabled ? 'true' : undefined"
        >
          <DanxIcon v-if="entry.item.icon" class="breadcrumbs__icon" :icon="entry.item.icon" />
          {{ entry.item.label }}
        </span>
      </template>
    </template>
  </nav>
</template>
