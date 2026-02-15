<!--
/**
 * DanxTabs - Connected tab buttons with sliding animated indicator
 *
 * A row of connected tab buttons with a smooth sliding indicator that
 * animates between tabs. Each tab can have an icon, label, count badge,
 * and per-tab active color for the indicator.
 *
 * ## Features
 * - Sliding animated indicator that transitions position and color
 * - Per-tab active color with CSS token fallback
 * - Optional icons via DanxIcon (name string, SVG string, or Component)
 * - Optional count badges
 * - v-model for active tab selection
 * - Full CSS token system for styling
 * - Light and dark theme support
 *
 * ## Props
 * | Prop       | Type      | Default | Description              |
 * |------------|-----------|---------|--------------------------|
 * | modelValue | string    | -       | Active tab value (v-model) |
 * | tabs       | DanxTab[] | -       | Array of tab items       |
 *
 * ## Events
 * | Event             | Payload | Description               |
 * |-------------------|---------|---------------------------|
 * | update:modelValue | string  | Emitted on tab click      |
 *
 * ## Slots
 * None (v1)
 *
 * ## CSS Tokens
 * Container:
 * | Token                          | Default                 | Description            |
 * |--------------------------------|-------------------------|------------------------|
 * | --dx-tabs-bg                   | --color-surface-sunken  | Container background   |
 * | --dx-tabs-border               | --color-border          | Container border       |
 * | --dx-tabs-border-radius        | --radius-component      | Container corners      |
 *
 * Typography:
 * | Token                          | Default        | Description      |
 * |--------------------------------|----------------|------------------|
 * | --dx-tabs-font-size            | --text-sm      | Label font size  |
 * | --dx-tabs-font-weight          | --font-medium  | Label weight     |
 *
 * Layout:
 * | Token                          | Default      | Description       |
 * |--------------------------------|--------------|-------------------|
 * | --dx-tabs-padding-x            | --spacing-3  | Horizontal pad    |
 * | --dx-tabs-padding-y            | --spacing-1-5| Vertical pad      |
 * | --dx-tabs-gap                  | --spacing-1-5| Icon-label gap    |
 * | --dx-tabs-icon-size            | 0.875rem     | Icon dimensions   |
 *
 * Colors:
 * | Token                          | Default                | Description            |
 * |--------------------------------|------------------------|------------------------|
 * | --dx-tabs-text                 | --color-text-muted     | Inactive text          |
 * | --dx-tabs-text-active          | --color-text-inverted  | Active text            |
 * | --dx-tabs-text-hover           | --color-text           | Hover text             |
 * | --dx-tabs-active-color         | --color-interactive    | Indicator fallback     |
 * | --dx-tabs-divider              | --color-border         | Divider between tabs   |
 *
 * Animation:
 * | Token                          | Default          | Description            |
 * |--------------------------------|------------------|------------------------|
 * | --dx-tabs-transition           | --transition-fast| Text color transition  |
 * | --dx-tabs-indicator-transition | 300ms ease-out   | Indicator slide        |
 *
 * Count:
 * | Token                          | Default | Description        |
 * |--------------------------------|---------|--------------------|
 * | --dx-tabs-count-opacity        | 0.7     | Count badge opacity|
 *
 * ## Usage Examples
 *
 * Basic tabs:
 *   <DanxTabs v-model="activeTab" :tabs="tabs" />
 *
 * Tabs with per-tab colors:
 *   <DanxTabs v-model="activeTab" :tabs="[
 *     { value: 'success', label: 'Passed', activeColor: '#22c55e' },
 *     { value: 'error', label: 'Failed', activeColor: '#ef4444' },
 *   ]" />
 */
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { DanxIcon } from "../icon";
import type { DanxTabsProps } from "./types";

const props = defineProps<DanxTabsProps>();
const modelValue = defineModel<string>("modelValue", { required: true });
const buttonRefs = ref<Map<string, HTMLElement>>(new Map());

/**
 * Store button ref by tab value for stable lookups when tabs change
 */
function setButtonRef(tabValue: string, el: HTMLElement | null) {
  if (el) {
    buttonRefs.value.set(tabValue, el);
  } else {
    buttonRefs.value.delete(tabValue);
  }
}

const indicatorLeft = ref(0);
const indicatorWidth = ref(0);

/**
 * Get the active tab's color, falling back to the CSS token
 */
const activeColor = computed(() => {
  const tab = props.tabs.find((t) => t.value === modelValue.value);
  return tab?.activeColor || "var(--dx-tabs-active-color)";
});

/**
 * Inline style for the sliding indicator
 */
const indicatorStyle = computed(() => ({
  left: `${indicatorLeft.value}px`,
  width: `${indicatorWidth.value}px`,
  backgroundColor: activeColor.value,
}));

/**
 * Update indicator position based on active button's DOM measurement
 */
function updateIndicatorPosition() {
  const button = buttonRefs.value.get(modelValue.value);
  if (button) {
    indicatorLeft.value = button.offsetLeft;
    indicatorWidth.value = button.offsetWidth;
  }
}

// Update position when model changes
watch(modelValue, () => {
  nextTick(updateIndicatorPosition);
});

// Update position when tabs change (e.g., counts update)
watch(
  () => props.tabs,
  () => {
    nextTick(updateIndicatorPosition);
  },
  { deep: true }
);

// Initial position
onMounted(() => {
  nextTick(updateIndicatorPosition);
});
</script>

<template>
  <div class="danx-tabs">
    <!-- Sliding active indicator -->
    <div class="danx-tabs__indicator" :style="indicatorStyle" />

    <!-- Tab buttons with dividers -->
    <template v-for="(tab, index) in tabs" :key="tab.value">
      <!-- Divider between tabs (skip first) -->
      <span v-if="index > 0" class="danx-tabs__divider" />

      <button
        :ref="(el) => setButtonRef(tab.value, el as HTMLElement)"
        type="button"
        class="danx-tabs__tab"
        :class="{ 'is-active': modelValue === tab.value }"
        @click="modelValue = tab.value"
      >
        <span v-if="tab.icon" class="danx-tabs__icon">
          <DanxIcon :icon="tab.icon" />
        </span>
        <span>{{ tab.label }}</span>
        <span v-if="tab.count !== undefined" class="danx-tabs__count">({{ tab.count }})</span>
      </button>
    </template>
  </div>
</template>
