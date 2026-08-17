/**
 * UsageMeter Component Module
 *
 * Exports:
 * - DanxUsageMeter: The segmented usage/quota meter component
 * - useUsageMeter: Geometry/summary composable powering the meter
 * - formatUsageValue: Default abbreviating number formatter (355400 → "355.4k")
 * - Types: TypeScript interfaces
 */

export { default as DanxUsageMeter } from "./DanxUsageMeter.vue";
export { formatUsageValue, useUsageMeter } from "./useUsageMeter";
export type { UseUsageMeterOptions, UseUsageMeterReturn } from "./useUsageMeter";
export type {
  DanxUsageMeterProps,
  DanxUsageMeterSlots,
  UsageMeterSegment,
  UsageMeterSegmentGeometry,
  UsageMeterSegmentProps,
  UsageMeterSegmentSlots,
  UsageMeterSize,
  UsageMeterSummary,
} from "./types";
