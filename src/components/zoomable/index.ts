/**
 * DanxZoomable Component Module
 *
 * Photoshop-style zoom + pan wrapper, plus a bundled DanxZoomControls
 * slider and the underlying useZoomable composable.
 */

export { default as DanxZoomable } from "./DanxZoomable.vue";
export { default as DanxZoomControls } from "./DanxZoomControls.vue";
export { useZoomable } from "./useZoomable";
export type { UseZoomableOptions, UseZoomableReturn } from "./useZoomable";
export type {
  Pan,
  DanxZoomableProps,
  DanxZoomableEmits,
  DanxZoomableSlots,
  DanxZoomControlsProps,
  DanxZoomControlsEmits,
} from "./types";
