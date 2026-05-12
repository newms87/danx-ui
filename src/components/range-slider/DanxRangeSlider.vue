<!--
/**
 * DanxRangeSlider Component
 *
 * Accessible single or dual-handle range slider with v-model, keyboard support,
 * step rounding, cross-prevention (dual mode), pointer drag, click-to-jump on
 * the track, and a formatter slot for the bubble label.
 *
 * Mode is auto-inferred from the v-model shape:
 * - `number` → single-handle
 * - `[number, number]` → dual-handle (tuple is `[min, max]`)
 *
 * ## Features
 * - `v-model` via `defineModel<number | [number, number]>`
 * - Step rounding: every emitted value is `min + n * step` rounded to nearest
 * - Cross-prevention: dual-handle min cannot exceed max (clamps to within one step)
 * - Keyboard: arrows step, PageUp/Down step ×10, Home/End jump to min/max
 * - Pointer drag with pointer-capture for reliable on-document tracking
 * - Click on the track moves the nearest handle to the click position
 * - Slot `value` formats the bubble label per handle (single | min | max)
 * - Variant prop wires through shared `useVariant` (fill + handle color)
 * - ARIA: each handle `role="slider"` with `aria-valuemin`/`aria-valuemax`/`aria-valuenow`
 *
 * @props
 *   min?: number — Minimum bound (default 0)
 *   max?: number — Maximum bound (default 100)
 *   step?: number — Increment (default 1)
 *   disabled?: boolean — Locks all interaction (default false)
 *   variant?: VariantType — Variant for fill + handle color (default "")
 *   ariaLabel?: string — Accessible name for the slider group (required)
 *
 * @emits
 *   update:modelValue — Emitted via defineModel when a handle moves
 *
 * @slots
 *   value({ value, handle }) — Format the bubble label above each handle.
 *     `handle` is `"single"` / `"min"` / `"max"`. Defaults to `String(value)`.
 *
 * @tokens
 *   --dx-range-slider-track-bg           Off-state track background
 *   --dx-range-slider-track-fill-bg      Filled segment background
 *   --dx-range-slider-handle-bg          Handle background
 *   --dx-range-slider-handle-border      Handle border color
 *   --dx-range-slider-handle-shadow      Handle drop shadow
 *   --dx-range-slider-bubble-color       Bubble text color
 *   --dx-range-slider-bubble-font-size   Bubble font size
 *   --dx-range-slider-disabled-opacity   Opacity when disabled
 *   --dx-range-slider-focus-ring         Focus-visible outline color
 *   --dx-range-slider-track-h            Track height
 *   --dx-range-slider-handle-size        Handle diameter
 *
 * @example
 *   Single-handle:
 *     <DanxRangeSlider v-model="value" :min="0" :max="100" :step="1" ariaLabel="Volume" />
 *
 *   Dual-handle (HH:MM window, 09:00-17:00 = 540-1020 minutes), with formatter slot:
 *     <DanxRangeSlider v-model="window" :min="0" :max="1440" :step="15" ariaLabel="Hours" />
 *     (use #value="{ value }" inside to format the bubble as HH:MM)
 */
-->

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { useRangeSlider } from "./useRangeSlider";
import type {
  DanxRangeSliderProps,
  DanxRangeSliderSlots,
  RangeSliderHandle,
  RangeSliderModel,
} from "./types";

const props = withDefaults(defineProps<DanxRangeSliderProps>(), {
  min: 0,
  max: 100,
  step: 1,
  disabled: false,
  variant: "",
});

const modelValue = defineModel<RangeSliderModel>({ default: 0 });

defineSlots<DanxRangeSliderSlots>();

const slider = useRangeSlider(modelValue, {
  min: () => props.min,
  max: () => props.max,
  step: () => props.step,
});

const RANGE_VARIANT_TOKENS = {
  "--dx-range-slider-track-fill-bg": "bg",
  "--dx-range-slider-handle-border": "bg",
};

const variantStyle = useVariant(toRef(props, "variant"), "range-slider", RANGE_VARIANT_TOKENS);

const containerClasses = computed(() => [
  "danx-range-slider",
  {
    "danx-range-slider--disabled": props.disabled,
    "danx-range-slider--single": !slider.isDual.value,
    "danx-range-slider--dual": slider.isDual.value,
  },
]);

/** Fill segment goes from `0%` (single) or `percentMin` (dual) to `percent` / `percentMax`. */
const fillStyle = computed(() => {
  const left = slider.isDual.value ? slider.percentMin.value : 0;
  const right = slider.isDual.value ? slider.percentMax.value : slider.percent.value;
  return { left: `${left}%`, width: `${Math.max(0, right - left)}%` };
});

const trackRef = ref<HTMLDivElement | null>(null);

/**
 * Compute the percent (0-100) of `clientX` along the track. Returns `null`
 * when the track is zero-width — callers must early-return without writing
 * the model, otherwise a hidden / un-laid-out container silently snaps the
 * value to `min`. `trackRef.value` is non-null whenever a pointer event
 * fires because the event target is itself inside the track DOM.
 */
function percentFromClientX(clientX: number): number | null {
  const rect = trackRef.value!.getBoundingClientRect();
  if (rect.width === 0) return null;
  return ((clientX - rect.left) / rect.width) * 100;
}

/**
 * Determine which handle to move when the user clicks the track.
 * Single mode → "single". Dual mode → whichever of min/max is closer to the value.
 */
function nearestHandle(value: number): RangeSliderHandle {
  if (!slider.isDual.value) return "single";
  const dMin = Math.abs(value - slider.minValue.value);
  const dMax = Math.abs(value - slider.maxValue.value);
  return dMax < dMin ? "max" : "min";
}

function setByHandle(handle: RangeSliderHandle, value: number) {
  if (handle === "single") slider.setSingle(value);
  else if (handle === "min") slider.setMin(value);
  else slider.setMax(value);
}

const KEY_STEP_MULT: Record<string, number> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
  PageDown: -10,
  PageUp: 10,
};

function currentValue(handle: RangeSliderHandle): number {
  if (handle === "single") return slider.singleValue.value;
  if (handle === "min") return slider.minValue.value;
  return slider.maxValue.value;
}

function handleFromEvent(event: Event): RangeSliderHandle {
  // Template always sets data-handle to one of "single" | "min" | "max" on the
  // bound button — non-null because the listener can only fire from those.
  const el = event.currentTarget as HTMLElement;
  return el.dataset.handle as RangeSliderHandle;
}

function onKeydown(event: KeyboardEvent) {
  if (props.disabled) return;
  const handle = handleFromEvent(event);
  if (event.key === "Home") {
    event.preventDefault();
    setByHandle(handle, props.min);
    return;
  }
  if (event.key === "End") {
    event.preventDefault();
    setByHandle(handle, props.max);
    return;
  }
  const mult = KEY_STEP_MULT[event.key];
  if (mult === undefined) return;
  event.preventDefault();
  setByHandle(handle, currentValue(handle) + mult * props.step);
}

const activeHandle = ref<RangeSliderHandle | null>(null);
const activePointerId = ref<number | null>(null);

function onHandlePointerdown(event: PointerEvent) {
  if (props.disabled) return;
  const handle = handleFromEvent(event);
  const target = event.currentTarget as HTMLElement | null;
  target?.setPointerCapture?.(event.pointerId);
  activeHandle.value = handle;
  activePointerId.value = event.pointerId;
}

function onHandlePointermove(event: PointerEvent) {
  if (activeHandle.value === null) return;
  if (activePointerId.value !== null && event.pointerId !== activePointerId.value) return;
  const pct = percentFromClientX(event.clientX);
  if (pct === null) return;
  setByHandle(activeHandle.value, slider.valueAtPercent(pct));
}

function onHandlePointerup(event: PointerEvent) {
  const target = event.currentTarget as HTMLElement | null;
  if (activePointerId.value !== null) {
    target?.releasePointerCapture?.(activePointerId.value);
  }
  activeHandle.value = null;
  activePointerId.value = null;
}

function onTrackPointerdown(event: PointerEvent) {
  if (props.disabled) return;
  // Don't double-react when the pointerdown bubbled up from a handle button.
  if ((event.target as HTMLElement | null)?.closest(".danx-range-slider__handle")) return;
  const pct = percentFromClientX(event.clientX);
  if (pct === null) return;
  const value = slider.valueAtPercent(pct);
  setByHandle(nearestHandle(value), value);
}
</script>

<template>
  <div
    :class="containerClasses"
    role="group"
    :aria-label="ariaLabel"
    :aria-disabled="disabled || undefined"
  >
    <div ref="trackRef" class="danx-range-slider__track" @pointerdown="onTrackPointerdown">
      <div class="danx-range-slider__fill" :style="[fillStyle, variantStyle]"></div>

      <button
        v-if="!slider.isDual.value"
        type="button"
        class="danx-range-slider__handle danx-range-slider__handle--single"
        role="slider"
        aria-orientation="horizontal"
        :aria-valuemin="min"
        :aria-valuemax="max"
        :aria-valuenow="slider.singleValue.value"
        :aria-disabled="disabled || undefined"
        :disabled="disabled"
        :tabindex="disabled ? -1 : 0"
        :style="[{ left: `${slider.percent.value}%` }, variantStyle]"
        data-handle="single"
        @keydown="onKeydown"
        @pointerdown="onHandlePointerdown"
        @pointermove="onHandlePointermove"
        @pointerup="onHandlePointerup"
        @pointercancel="onHandlePointerup"
      >
        <span class="danx-range-slider__bubble">
          <slot name="value" :value="slider.singleValue.value" handle="single">{{
            slider.singleValue.value
          }}</slot>
        </span>
      </button>

      <template v-else>
        <button
          type="button"
          class="danx-range-slider__handle danx-range-slider__handle--min"
          role="slider"
          aria-orientation="horizontal"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="slider.minValue.value"
          :aria-disabled="disabled || undefined"
          :disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          :style="[{ left: `${slider.percentMin.value}%` }, variantStyle]"
          data-handle="min"
          @keydown="onKeydown"
          @pointerdown="onHandlePointerdown"
          @pointermove="onHandlePointermove"
          @pointerup="onHandlePointerup"
          @pointercancel="onHandlePointerup"
        >
          <span class="danx-range-slider__bubble">
            <slot name="value" :value="slider.minValue.value" handle="min">{{
              slider.minValue.value
            }}</slot>
          </span>
        </button>
        <button
          type="button"
          class="danx-range-slider__handle danx-range-slider__handle--max"
          role="slider"
          aria-orientation="horizontal"
          :aria-valuemin="min"
          :aria-valuemax="max"
          :aria-valuenow="slider.maxValue.value"
          :aria-disabled="disabled || undefined"
          :disabled="disabled"
          :tabindex="disabled ? -1 : 0"
          :style="[{ left: `${slider.percentMax.value}%` }, variantStyle]"
          data-handle="max"
          @keydown="onKeydown"
          @pointerdown="onHandlePointerdown"
          @pointermove="onHandlePointermove"
          @pointerup="onHandlePointerup"
          @pointercancel="onHandlePointerup"
        >
          <span class="danx-range-slider__bubble">
            <slot name="value" :value="slider.maxValue.value" handle="max">{{
              slider.maxValue.value
            }}</slot>
          </span>
        </button>
      </template>
    </div>
  </div>
</template>
