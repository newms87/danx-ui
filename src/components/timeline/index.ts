/**
 * Timeline Component Module
 *
 * Exports:
 * - DanxTimeline: Vertical activity/event timeline container
 * - DanxTimelineItem: A single timeline entry
 * - Types: DanxTimelineEntry, TimelineItemType, DanxTimelineProps, DanxTimelineItemProps
 */
export { default as DanxTimeline } from "./DanxTimeline.vue";
export { default as DanxTimelineItem } from "./DanxTimelineItem.vue";
export type {
  DanxTimelineEntry,
  TimelineItemType,
  DanxTimelineProps,
  DanxTimelineItemProps,
} from "./types";
