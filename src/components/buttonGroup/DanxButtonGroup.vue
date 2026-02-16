<!--
/**
 * DanxButtonGroup - Toggle button group with single or multi-select
 *
 * A row of connected toggle buttons that can operate in single-select or
 * multi-select mode. Visually similar to DanxTabs but designed for toggling
 * values on/off rather than navigating between views.
 *
 * ## Features
 * - Single-select and multi-select modes via `multiple` prop
 * - Required mode prevents deselecting the last button (single-select only)
 * - Per-button click callbacks
 * - Auto-color support with active and inactive color states
 * - Optional icons via DanxIcon (name string, SVG string, or Component)
 * - Optional count badges
 * - v-model for selection state
 * - Full CSS token system for styling
 * - Light and dark theme support
 *
 * ## Props
 * | Prop          | Type                    | Default        | Description                     |
 * |---------------|-------------------------|----------------|---------------------------------|
 * | modelValue    | string|string[]|null    | -              | Selected value(s) (v-model)     |
 * | buttons       | DanxButtonGroupItem[]   | -              | Array of button items           |
 * | multiple      | boolean                 | false          | Allow multi-select              |
 * | required      | boolean                 | false          | Prevent empty selection          |
 * | autoColor     | boolean|string          | false          | Hash label/key for color        |
 * | autoColorMode | AutoColorMode           | "active-only"  | When to apply auto-color        |
 *
 * ## Events
 * | Event             | Payload | Description                      |
 * |-------------------|---------|----------------------------------|
 * | update:modelValue | varies  | Emitted when selection changes   |
 * | select            | string  | Emitted when a button is selected|
 * | deselect          | string  | Emitted when a button is deselected|
 *
 * ## Slots
 * None (v1)
 *
 * ## CSS Tokens
 * Container:
 * | Token                              | Default                | Description           |
 * |------------------------------------|------------------------|-----------------------|
 * | --dx-button-group-bg               | --color-surface-sunken | Container background  |
 * | --dx-button-group-border           | --color-border         | Container border      |
 * | --dx-button-group-border-radius    | --radius-component     | Container corners     |
 *
 * Typography:
 * | Token                              | Default       | Description     |
 * |------------------------------------|---------------|-----------------|
 * | --dx-button-group-font-size        | --text-sm     | Label font size |
 * | --dx-button-group-font-weight      | --font-medium | Label weight    |
 *
 * Layout:
 * | Token                              | Default      | Description      |
 * |------------------------------------|--------------|------------------|
 * | --dx-button-group-padding-x        | --spacing-3  | Horizontal pad   |
 * | --dx-button-group-padding-y        | --spacing-1-5| Vertical pad     |
 * | --dx-button-group-gap              | --spacing-1-5| Icon-label gap   |
 * | --dx-button-group-icon-size        | 0.875rem     | Icon dimensions  |
 *
 * Colors:
 * | Token                              | Default                | Description           |
 * |------------------------------------|------------------------|-----------------------|
 * | --dx-button-group-text             | --color-text-muted     | Inactive text         |
 * | --dx-button-group-text-active      | --color-text-inverted  | Active text           |
 * | --dx-button-group-text-hover       | --color-text           | Hover text            |
 * | --dx-button-group-active-bg        | --color-interactive    | Active background     |
 * | --dx-button-group-inactive-bg      | none                   | Inactive background   |
 * | --dx-button-group-divider          | --color-border         | Divider between btns  |
 *
 * Animation:
 * | Token                              | Default          | Description           |
 * |------------------------------------|------------------|-----------------------|
 * | --dx-button-group-transition       | --transition-fast| Color transition      |
 *
 * Count:
 * | Token                              | Default | Description        |
 * |------------------------------------|---------|--------------------|
 * | --dx-button-group-count-opacity    | 0.7     | Count badge opacity|
 *
 * ## Usage Examples
 *
 * Single-select:
 *   <DanxButtonGroup v-model="selected" :buttons="buttons" />
 *
 * Multi-select:
 *   <DanxButtonGroup v-model="selected" :buttons="buttons" multiple />
 *
 * With auto-color:
 *   <DanxButtonGroup v-model="selected" :buttons="buttons" auto-color autoColorMode="always" />
 */
-->

<script setup lang="ts">
import { computed, type CSSProperties } from "vue";
import { hashStringToIndex, AUTO_COLOR_PALETTE } from "../../shared/autoColor";
import { DanxIcon } from "../icon";
import type { DanxButtonGroupEmits, DanxButtonGroupItem, DanxButtonGroupProps } from "./types";

const props = withDefaults(defineProps<DanxButtonGroupProps>(), {
  multiple: false,
  required: false,
  autoColor: false,
  autoColorMode: "active-only",
});

const emit = defineEmits<DanxButtonGroupEmits>();
const modelValue = defineModel<string | string[] | null>();

/**
 * Check whether a button value is currently selected
 */
function isActive(value: string): boolean {
  if (modelValue.value == null) return false;
  if (Array.isArray(modelValue.value)) return modelValue.value.includes(value);
  return modelValue.value === value;
}

/**
 * Handle button click: toggle selection, call per-button onClick, emit events
 */
function handleClick(button: DanxButtonGroupItem) {
  const value = button.value;
  const active = isActive(value);

  if (props.multiple) {
    const current = Array.isArray(modelValue.value) ? [...modelValue.value] : [];
    if (active) {
      if (props.required && current.length <= 1) {
        button.onClick?.();
        return;
      }
      modelValue.value = current.filter((v) => v !== value);
      emit("deselect", value);
    } else {
      current.push(value);
      modelValue.value = current;
      emit("select", value);
    }
  } else {
    if (active) {
      if (props.required) {
        button.onClick?.();
        return;
      }
      modelValue.value = null;
      emit("deselect", value);
    } else {
      modelValue.value = value;
      emit("select", value);
    }
  }

  button.onClick?.();
}

/**
 * Compute auto-color styles for each button based on its label hash.
 * Avoids calling useAutoColor in a loop by computing directly from palette data.
 */
const buttonStyles = computed(() => {
  const styles = new Map<string, CSSProperties>();

  if (props.autoColor) {
    const isDark =
      typeof document !== "undefined" && document.documentElement.classList.contains("dark");

    for (const button of props.buttons) {
      const key = typeof props.autoColor === "string" ? props.autoColor : button.label;
      const index = hashStringToIndex(key, AUTO_COLOR_PALETTE.length);
      const entry = AUTO_COLOR_PALETTE[index]!;
      const active = isActive(button.value);

      if (active) {
        if (button.activeColor) {
          styles.set(button.value, {
            "--dx-button-group-active-bg": button.activeColor,
          } as CSSProperties);
        } else {
          styles.set(button.value, {
            "--dx-button-group-active-bg": isDark ? entry.darkBg : entry.text,
            "--dx-button-group-text-active": isDark ? entry.darkText : entry.bg,
          } as CSSProperties);
        }
      } else if (props.autoColorMode === "always") {
        styles.set(button.value, {
          "--dx-button-group-inactive-bg": isDark ? entry.darkInactiveBg : entry.inactiveBg,
          "--dx-button-group-text": isDark ? entry.darkInactiveText : entry.inactiveText,
        } as CSSProperties);
      }
    }
  }

  return styles;
});

/**
 * Get the inline style for a button (auto-color or per-button activeColor)
 */
function getButtonStyle(button: DanxButtonGroupItem): CSSProperties | undefined {
  if (props.autoColor) {
    return buttonStyles.value.get(button.value);
  }
  if (button.activeColor && isActive(button.value)) {
    return {
      "--dx-button-group-active-bg": button.activeColor,
    } as CSSProperties;
  }
  return undefined;
}
</script>

<template>
  <div class="danx-button-group">
    <template v-for="(button, index) in buttons" :key="button.value">
      <!-- Divider between buttons (skip first) -->
      <span v-if="index > 0" class="danx-button-group__divider" />

      <button
        type="button"
        class="danx-button-group__button"
        :class="{ 'is-active': isActive(button.value) }"
        :style="getButtonStyle(button)"
        @click="handleClick(button)"
      >
        <span v-if="button.icon" class="danx-button-group__icon">
          <DanxIcon :icon="button.icon" />
        </span>
        <span>{{ button.label }}</span>
        <span v-if="button.count !== undefined" class="danx-button-group__count"
          >({{ button.count }})</span
        >
      </button>
    </template>
  </div>
</template>
