<!--
/**
 * DanxRating Component
 *
 * Accessible star rating widget with v-model, hover-preview, half-step
 * increments, keyboard support, read-only display mode, and variant theming.
 * Renders `max` stars via `DanxIcon`, each stacking an empty-color background
 * icon with a filled-color foreground icon clipped via `clip-path` to render
 * partial (half-star) fills without dedicated icon assets.
 *
 * ## Features
 * - `v-model` via `defineModel<number>({ default: 0 })`
 * - Hover-preview: hovering a star previews the value that would be selected
 *   on click without committing the model until click (mouse leave restores
 *   the committed value)
 * - Half-step increments via `allowHalf` — hovering/clicking the left half of
 *   a star selects `n - 0.5`, the right half selects `n`
 * - Keyboard: arrows step by `allowHalf ? 0.5 : 1`, Home/End jump to `0`/`max`
 *   (matches the range-slider's `onKeydown` pattern)
 * - `readonly` mode: renders the current value (including partial fill) with
 *   no pointer/keyboard interaction and no hover-preview
 * - `disabled` mode: same interaction lock as `readonly`, plus dimming token
 * - Variant prop wires through shared `useVariant` (filled-star color)
 * - ARIA: group `role="slider"` with `aria-valuemin`/`aria-valuemax`/`aria-valuenow`
 *
 * @props
 *   icon?: Component | IconName | string — Icon rendered per star (default "star")
 *   max?: number — Number of stars (default 5)
 *   allowHalf?: boolean — Enables 0.5-increment steps (default false)
 *   readonly?: boolean — Renders value with no interaction (default false)
 *   disabled?: boolean — Locks interaction + dims (default false)
 *   variant?: VariantType — Variant for filled-star color (default "")
 *   ariaLabel?: string — Accessible name for the rating group (required)
 *
 * @emits
 *   update:modelValue — Emitted via defineModel when the rating changes
 *
 * @tokens
 *   --dx-rating-gap               Gap between stars
 *   --dx-rating-size              Star icon size
 *   --dx-rating-empty-color       Empty-star color
 *   --dx-rating-filled-color      Filled-star color
 *   --dx-rating-transition        Transition timing
 *   --dx-rating-disabled-opacity  Opacity when disabled
 *   --dx-rating-focus-ring        Focus-visible outline color
 *
 * @example
 *   <DanxRating v-model="score" ariaLabel="Rating" />
 *   <DanxRating v-model="score" :max="10" ariaLabel="Rating out of 10" />
 *   <DanxRating v-model="score" allowHalf ariaLabel="Half-star rating" />
 *   <DanxRating v-model="score" readonly ariaLabel="Rating" />
 *   <DanxRating v-model="score" variant="warning" ariaLabel="Rating" />
 */
-->

<script setup lang="ts">
import { computed, ref, toRef } from "vue";
import { useVariant } from "../../shared/composables/useVariant";
import { DanxIcon } from "../icon";
import { useRating } from "./useRating";
import type { DanxRatingProps } from "./types";

const props = withDefaults(defineProps<DanxRatingProps>(), {
  icon: "star",
  max: 5,
  allowHalf: false,
  readonly: false,
  disabled: false,
  variant: "",
});

const modelValue = defineModel<number>({ default: 0 });

const rating = useRating({
  max: () => props.max,
  allowHalf: () => props.allowHalf,
});

const RATING_VARIANT_TOKENS = {
  "--dx-rating-filled-color": "bg",
};

const variantStyle = useVariant(toRef(props, "variant"), "rating", RATING_VARIANT_TOKENS);

const isLocked = computed(() => props.disabled || props.readonly);

const containerClasses = computed(() => [
  "danx-rating",
  {
    "danx-rating--disabled": props.disabled,
    "danx-rating--readonly": props.readonly,
  },
]);

const stars = computed(() => Array.from({ length: props.max }, (_, i) => i + 1));

const hoverValue = ref<number | null>(null);

/** Displayed value: hover-preview wins over the committed model when present. */
const displayValue = computed(() => hoverValue.value ?? modelValue.value);

function fillStyle(starIndex: number) {
  const pct = rating.fillPercent(displayValue.value, starIndex);
  return { "--dx-rating-fill-pct": `${100 - pct}%` };
}

/** Fraction (0-1) across `el`'s width that `clientX` falls at. */
function fractionFromClientX(el: HTMLElement, clientX: number): number {
  const rect = el.getBoundingClientRect();
  if (rect.width === 0) return 1;
  return (clientX - rect.left) / rect.width;
}

function onStarPointermove(event: PointerEvent, starIndex: number) {
  if (isLocked.value) return;
  const el = event.currentTarget as HTMLElement;
  const fraction = fractionFromClientX(el, event.clientX);
  hoverValue.value = rating.valueAtStarPosition(starIndex, fraction);
}

function onStarPointerleave() {
  hoverValue.value = null;
}

function onStarClick(event: MouseEvent, starIndex: number) {
  if (isLocked.value) return;
  const el = event.currentTarget as HTMLElement;
  const fraction = fractionFromClientX(el, event.clientX);
  modelValue.value = rating.valueAtStarPosition(starIndex, fraction);
  hoverValue.value = null;
}

const KEY_STEP_MULT: Record<string, number> = {
  ArrowLeft: -1,
  ArrowDown: -1,
  ArrowRight: 1,
  ArrowUp: 1,
};

function onKeydown(event: KeyboardEvent) {
  if (isLocked.value) return;
  if (event.key === "Home") {
    event.preventDefault();
    modelValue.value = 0;
    return;
  }
  if (event.key === "End") {
    event.preventDefault();
    modelValue.value = props.max;
    return;
  }
  const mult = KEY_STEP_MULT[event.key];
  if (mult === undefined) return;
  event.preventDefault();
  modelValue.value = rating.roundToStep(modelValue.value + mult * rating.step.value);
}
</script>

<template>
  <div
    :class="containerClasses"
    role="slider"
    :aria-label="ariaLabel"
    :aria-valuemin="0"
    :aria-valuemax="max"
    :aria-valuenow="modelValue"
    :aria-disabled="disabled || undefined"
    :aria-readonly="readonly || undefined"
    :tabindex="isLocked ? -1 : 0"
    @keydown="onKeydown"
    @pointerleave="onStarPointerleave"
  >
    <button
      v-for="starIndex in stars"
      :key="starIndex"
      type="button"
      class="danx-rating__star"
      tabindex="-1"
      :aria-hidden="true"
      :disabled="disabled"
      @pointermove="onStarPointermove($event, starIndex)"
      @click="onStarClick($event, starIndex)"
    >
      <span class="danx-rating__star-layer danx-rating__star-layer--empty">
        <DanxIcon :icon="icon" />
      </span>
      <span
        class="danx-rating__star-layer danx-rating__star-layer--filled"
        :style="[fillStyle(starIndex), variantStyle]"
      >
        <DanxIcon :icon="icon" />
      </span>
    </button>
  </div>
</template>
