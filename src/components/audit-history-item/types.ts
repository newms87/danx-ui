import type { DateTime } from "luxon";
import type { VariantType } from "../../shared/types";

/**
 * DanxAuditHistoryItem Type Definitions
 */

/** Built-in action kinds with automatic variant coloring. Any other string falls back to "muted". */
export type AuditHistoryAction = "create" | "update" | "delete" | (string & {});

/** A single change-log/audit-trail entry rendered by DanxAuditHistoryItem. */
export interface AuditHistoryEntry {
  /** Who performed the action (name, email, or display string). */
  actor: string;

  /** When the action occurred. Anything luxon can parse (string, epoch millis) or a DateTime. */
  timestamp: string | number | DateTime;

  /** Action kind. Built-in values ("create", "update", "delete") get automatic variant coloring. */
  action: AuditHistoryAction;

  /** Field name that changed. When present (with oldValue/newValue), a before/after diff is rendered. */
  field?: string;

  /** Value before the change. Rendered struck through next to newValue. */
  oldValue?: string;

  /** Value after the change. */
  newValue?: string;

  /** Fallback description used when `field` is absent, e.g. "created this record". */
  description?: string;
}

export interface DanxAuditHistoryItemProps {
  /** The audit entry to render. */
  entry: AuditHistoryEntry;

  /**
   * Overrides automatic action -> variant color mapping.
   * Built-in: create -> success, update -> info, delete -> danger, anything else -> muted.
   */
  actionVariant?: VariantType;
}

export interface DanxAuditHistoryItemSlots {
  /** Overrides the fallback description shown when `entry.field` is absent. Receives the entry as slot props. */
  default?(props: { entry: AuditHistoryEntry }): unknown;
}
