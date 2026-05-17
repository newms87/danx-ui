<!--
/**
 * DanxColorPicker Component
 *
 * Themed color input with a paired swatch button that opens a rich color
 * picker panel (HSV saturation/value surface, hue strip, optional alpha
 * strip, HEX / RGB / HSL numeric tabs, preset palette grid, persistent
 * recent-colors strip, optional eyedropper + clear actions).
 *
 * Back-compat:
 *   The original v0.7.x API — `modelValue` (hex), `label`, `disabled`,
 *   `testId`, `placeholder`, the `suffix` slot, and the swatch+input row —
 *   still works exactly as before. Clicking the swatch now opens the new
 *   panel instead of the OS color picker; the text input still commits on
 *   blur / Enter / Escape; SSE-style parent patches landing mid-edit do NOT
 *   clobber an active draft.
 *
 * New features:
 *   - DanxPopover-anchored panel with full HSV + hue + alpha controls
 *   - Preset palette grid + persistent recent-colors strip (localStorage)
 *   - Format tabs: HEX / RGB / HSL with live cross-update
 *   - Configurable output format (`output`) — hex / rgb / rgba / hsl / hsla
 *   - Native EyeDropper API integration with graceful feature detection
 *   - Variant prop wires accent ring + active-tab bar through useVariant
 *
 * ## Props
 *   modelValue: string — Two-way bound color
 *   label?: string — Optional inline left-side label
 *   disabled?: boolean — Disables every interactive control
 *   testId?: string — Adds `<prefix>-{container,swatch,input,error,panel,...}`
 *   placeholder?: string — Text input placeholder (default "#aabbcc")
 *   swatches?: string[] — Preset palette (default: curated 24-color set)
 *   paletteCols?: number — Palette grid columns (default 8)
 *   alpha?: boolean — Render alpha strip + alpha numeric input (default false)
 *   output?: ColorFormat — hex | rgb | rgba | hsl | hsla (default hex)
 *   clearable?: boolean — Render Clear button (default false)
 *   clearValue?: string — Value emitted on Clear (default "")
 *   storageKey?: string — Persist recents under this key (omit to disable)
 *   recentLimit?: number — Max recents tracked (default 8)
 *   variant?: VariantType — Accent variant (default "")
 *   placement?: PopoverPlacement — Panel placement (default "bottom")
 *   panelDisabled?: boolean — Disable the popover panel entirely (default false)
 *
 * ## Emits
 *   update:modelValue — Fired on every committed color
 *   open  — Panel opened
 *   close — Panel closed
 *
 * ## Slots
 *   suffix — Rendered AFTER the swatch + text input in the trigger row
 *
 * ## Tokens
 *   See `color-picker-tokens.css` for the full list. Highlights:
 *     --dx-color-picker-panel-bg / -border / -radius / -shadow
 *     --dx-color-picker-surface-h
 *     --dx-color-picker-thumb-size / -border
 *     --dx-color-picker-cell-size / -radius
 *     --dx-color-picker-tab-active-bar / -active-color
 *     --dx-color-picker-accent — variant-driven highlight
 *     --dx-color-picker-focus-ring
 *
 * @example
 *   <DanxColorPicker v-model="brand" label="Brand" :alpha="true" output="rgba" />
 */
-->

<script setup lang="ts">
import { computed, ref, toRef, watch } from "vue";
import { DanxPopover } from "../popover";
import { useVariant } from "../../shared/composables/useVariant";
import DanxColorPickerPanel from "./DanxColorPickerPanel.vue";
import { useRecentColors } from "./useRecentColors";
import { parseColor, rgbToHex } from "./color-utils";
import type { DanxColorPickerEmits, DanxColorPickerProps, DanxColorPickerSlots } from "./types";

const props = withDefaults(defineProps<DanxColorPickerProps>(), {
  placeholder: "#aabbcc",
  paletteCols: 8,
  alpha: false,
  output: "hex",
  clearable: false,
  clearValue: "",
  recentLimit: 8,
  variant: "",
  placement: "bottom",
  panelDisabled: false,
});

const emit = defineEmits<DanxColorPickerEmits>();

defineSlots<DanxColorPickerSlots>();

const draft = ref<string>(props.modelValue);
const isFocused = ref<boolean>(false);
const isOpen = ref<boolean>(false);

const recents = useRecentColors({
  storageKey: props.storageKey,
  limit: props.recentLimit,
});

const COLOR_VARIANT_TOKENS = {
  "--dx-color-picker-tab-active-bar": "bg",
  "--dx-color-picker-accent": "bg",
};

const variantStyle = useVariant(toRef(props, "variant"), "color-picker", COLOR_VARIANT_TOKENS);

watch(
  () => props.modelValue,
  (next) => {
    // Focus-gated re-seed — parent v-model patches landing while the operator
    // is typing in the hex input must NOT clobber the in-progress draft.
    if (!isFocused.value) draft.value = next;
  }
);

const isValid = computed<boolean>(() => parseColor(draft.value) !== null);

const isInvalid = computed<boolean>(() => draft.value.length > 0 && !isValid.value);

const swatchColor = computed<string>(() => {
  const rgb = parseColor(draft.value);
  if (!rgb) return "transparent";
  return rgbToHex(rgb, props.alpha && rgb.a < 1);
});

const containerClasses = computed<string[]>(() => {
  const classes = ["danx-color-picker"];
  if (props.disabled) classes.push("danx-color-picker--disabled");
  if (isInvalid.value) classes.push("danx-color-picker--error");
  return classes;
});

function onTextInput(e: Event): void {
  draft.value = (e.target as HTMLInputElement).value;
}

function onTextFocus(): void {
  isFocused.value = true;
}

function onTextBlur(): void {
  isFocused.value = false;
  onTextCommit();
}

function commitValue(value: string): void {
  draft.value = value;
  if (value !== props.modelValue) emit("update:modelValue", value);
  if (parseColor(value)) recents.push(value);
}

function onTextCommit(): void {
  if (isValid.value && draft.value !== props.modelValue) {
    commitValue(draft.value);
  }
}

function onTextKeydown(e: KeyboardEvent): void {
  if (e.key === "Enter") {
    e.preventDefault();
    onTextCommit();
    (e.target as HTMLInputElement).blur();
  } else if (e.key === "Escape") {
    draft.value = props.modelValue;
    (e.target as HTMLInputElement).blur();
  }
}

function onSwatchClick(): void {
  // The button's `disabled` attribute already blocks click delivery — we
  // only need to guard the panel-disabled branch here.
  if (props.panelDisabled) return;
  isOpen.value = !isOpen.value;
}

function onPanelCommit(value: string): void {
  commitValue(value);
}

function onPanelClear(): void {
  draft.value = props.clearValue;
  if (props.clearValue !== props.modelValue) emit("update:modelValue", props.clearValue);
  isOpen.value = false;
}

watch(isOpen, (open) => {
  if (open) emit("open");
  else emit("close");
});

function testIdFor(suffix: string): string | undefined {
  return props.testId ? `${props.testId}-${suffix}` : undefined;
}
</script>

<template>
  <div :class="containerClasses" :style="variantStyle" :data-test="testIdFor('container')">
    <div class="danx-color-picker__row">
      <span v-if="label" class="danx-color-picker__label">{{ label }}</span>
      <DanxPopover v-model="isOpen" :placement="placement" :variant="variant" trigger="manual">
        <template #trigger>
          <button
            type="button"
            class="danx-color-picker__swatch"
            :style="{ '--dx-color-picker-swatch-color': swatchColor }"
            :disabled="disabled"
            :aria-label="label ? `${label} — open color picker` : 'Open color picker'"
            :aria-expanded="isOpen"
            :data-test="testIdFor('swatch')"
            @click="onSwatchClick"
          >
            <span class="danx-color-picker__swatch-fill" aria-hidden="true"></span>
          </button>
        </template>
        <DanxColorPickerPanel
          :model-value="draft"
          :swatches="swatches"
          :palette-cols="paletteCols"
          :alpha="alpha"
          :output="output"
          :clearable="clearable"
          :clear-value="clearValue"
          :recent="recents.colors.value"
          :test-id="testId"
          @commit="onPanelCommit"
          @clear="onPanelClear"
        />
      </DanxPopover>
      <input
        type="text"
        class="danx-color-picker__input"
        :value="draft"
        :disabled="disabled"
        :aria-invalid="isInvalid || undefined"
        :data-test="testIdFor('input')"
        :placeholder="placeholder"
        @input="onTextInput"
        @focus="onTextFocus"
        @blur="onTextBlur"
        @keydown="onTextKeydown"
      />
      <span v-if="$slots.suffix" class="danx-color-picker__suffix">
        <slot name="suffix" />
      </span>
    </div>
    <p v-if="isInvalid" class="danx-color-picker__error" :data-test="testIdFor('error')">
      Must be a valid color (hex / rgb / hsl).
    </p>
  </div>
</template>
