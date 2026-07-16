import type { Component } from "vue";
import type { IconName } from "../icon/icons";

/**
 * DanxTimeline Type Definitions
 */

/** Semantic type driving marker color. Any other string falls back to "default". */
export type TimelineItemType = "success" | "error" | "warning" | "info" | "default" | (string & {});

/** A single timeline entry, used with the `items` prop shorthand. */
export interface DanxTimelineEntry {
  /** Timestamp text shown above the content (already formatted by the consumer). */
  timestamp?: string;

  /** Content text for this entry. Ignored if consumers use DanxTimelineItem children directly. */
  content?: string;

  /** Semantic type driving marker color. @default "default" */
  type?: TimelineItemType;

  /** Icon to display in the marker. Falls back to a colored dot when omitted. */
  icon?: Component | IconName | string;
}

export interface DanxTimelineProps {
  /**
   * Timeline entries to render. Alternative to passing DanxTimelineItem
   * children via the default slot. When both are omitted, nothing renders.
   */
  items?: DanxTimelineEntry[];
}

export interface DanxTimelineSlots {
  /** DanxTimelineItem children, used instead of the `items` prop. */
  default?(): unknown;
}

export interface DanxTimelineItemProps {
  /** Timestamp text shown above the content. */
  timestamp?: string;

  /** Semantic type driving marker color. @default "default" */
  type?: TimelineItemType;

  /** Icon to display in the marker. Falls back to a colored dot when omitted. */
  icon?: Component | IconName | string;
}

export interface DanxTimelineItemSlots {
  /** Entry content. */
  default?(): unknown;

  /** Overrides the timestamp text rendering. */
  timestamp?(): unknown;
}
