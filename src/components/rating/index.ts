/**
 * Rating Component Module
 *
 * Exports:
 * - DanxRating: The star rating component
 * - useRating: Pure math composable backing the component
 * - Types: TypeScript interfaces
 */

export { default as DanxRating } from "./DanxRating.vue";
export { useRating } from "./useRating";
export type { UseRatingOptions, UseRatingReturn } from "./useRating";
export type { DanxRatingProps } from "./types";
