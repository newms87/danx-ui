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
 * - Variant support via shared variant system
 * - Scoped slots for custom tab content
 * - Full CSS token system for styling
 * - Light and dark theme support
 *
 * ## Props
 * | Prop       | Type        | Default | Description              |
 * |------------|-------------|---------|--------------------------|
 * | modelValue | string      | -       | Active tab value (v-model) |
 * | tabs       | DanxTab[]   | -       | Array of tab items       |
 * | variant    | VariantType | ""      | Color variant            |
 *
 * ## Events
 * | Event             | Payload | Description               |
 * |-------------------|---------|---------------------------|
 * | update:modelValue | string  | Emitted on tab click      |
 *
 * ## Slots
 * | Slot    | Scoped Props           | Description                    |
 * |---------|------------------------|--------------------------------|
 * | default | { tab, isActive }      | Replaces icon + label entirely |
 * | icon    | { tab, isActive }      | Replaces icon area only        |
 * | label   | { tab, isActive }      | Replaces label text only       |
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
 * Tabs with variant:
 *   <DanxTabs v-model="activeTab" :tabs="tabs" variant="danger" />
 *
 * Custom tab content via default slot:
 *   <DanxTabs v-model="activeTab" :tabs="tabs">
 *     <template #default="{ tab, isActive }">
 *       <span :class="{ 'font-bold': isActive }">{{ tab.label }}</span>
 *     </template>
 *   </DanxTabs>
 *
 * Custom icon slot:
 *   <DanxTabs v-model="activeTab" :tabs="tabs">
 *     <template #icon="{ tab }">
 *       <img :src="tab.icon" class="w-4 h-4" />
 *     </template>
 *   </DanxTabs>
 *
 * Tabs with per-tab colors:
 *   <DanxTabs v-model="activeTab" :tabs="[
 *     { value: 'success', label: 'Passed', activeColor: '#22c55e' },
 *     { value: 'error', label: 'Failed', activeColor: '#ef4444' },
 *   ]" />
 */
-->

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, toRef, watch } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxIcon } from "../icon";
import type { DanxTabsProps } from "./types";

const props = withDefaults(defineProps<DanxTabsProps>(), {
  variant: "",
});

const modelValue = defineModel<string>("modelValue", { required: true });

const TABS_VARIANT_TOKENS = {
  "--dx-tabs-bg": "bg",
  "--dx-tabs-text": "text",
  "--dx-tabs-active-color": "bg",
};

const variantStyle = useVariant(toRef(props, "variant"), "tabs", TABS_VARIANT_TOKENS);
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
  <div class="danx-tabs" :style="variantStyle">
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
        <slot :tab="tab" :is-active="modelValue === tab.value">
          <slot name="icon" :tab="tab" :is-active="modelValue === tab.value">
            <span v-if="tab.icon" class="danx-tabs__icon">
              <DanxIcon :icon="tab.icon" />
            </span>
          </slot>
          <slot name="label" :tab="tab" :is-active="modelValue === tab.value">
            <span>{{ tab.label }}</span>
          </slot>
        </slot>
        <span v-if="tab.count !== undefined" class="danx-tabs__count">({{ tab.count }})</span>
      </button>
    </template>
  </div>
</template>
