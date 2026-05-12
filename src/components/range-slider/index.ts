/**
 * RangeSlider Component Module
 *
 * Exports:
 * - DanxRangeSlider: The range slider component (single + dual-handle)
 * - useRangeSlider: Pure math composable backing the component
 * - Types: TypeScript interfaces
 */

export { default as DanxRangeSlider } from "./DanxRangeSlider.vue";
export { useRangeSlider } from "./useRangeSlider";
export type { UseRangeSliderOptions, UseRangeSliderReturn } from "./useRangeSlider";
export type {
  DanxRangeSliderProps,
  DanxRangeSliderSlots,
  RangeSliderHandle,
  RangeSliderModel,
  RangeSliderValueSlotScope,
} from "./types";
