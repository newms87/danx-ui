/**
 * Color Picker Component Module
 */

export { default as DanxColorPicker } from "./DanxColorPicker.vue";
export { useRecentColors } from "./useRecentColors";
export {
  DEFAULT_SWATCHES,
  parseColor,
  formatColor,
  hexToRgb,
  rgbToHex,
  rgbToHsv,
  hsvToRgb,
  rgbToHsl,
  hslToRgb,
  isHex,
} from "./color-utils";
export type {
  DanxColorPickerProps,
  DanxColorPickerEmits,
  DanxColorPickerSlots,
  DanxColorPickerOutputFormat,
} from "./types";
export type { ColorFormat, RGB, HSV, HSL } from "./color-utils";
export type { UseRecentColorsOptions, UseRecentColorsReturn } from "./useRecentColors";
