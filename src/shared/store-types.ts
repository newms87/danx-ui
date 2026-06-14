/**
 * Reactive Object Store — Shared Type Definitions
 *
 * Core types for the reactive data layer ported from quasar-ui-danx
 * (now self-contained, zero quasar-ui-danx dependency).
 */

/** A loosely-typed object map. Values are `unknown` and must be narrowed at use sites. */
export type AnyObject = { [key: string]: unknown };

/**
 * A label/value pair used by filter and select option lists.
 */
export interface LabelValueItem {
  label: string;
  value: string | number | boolean;
}

/**
 * An object that participates in the reactive object store.
 *
 * Identity is `${__type}:${id ?? name}`. The store keeps a single shared
 * reactive instance per identity so the whole app references the same object.
 *
 * Causality metadata:
 * - `__timestamp` — object-level "as-of" time, used as the per-field fallback
 *   and by `hasRecentUpdates` to short-circuit stale whole-object payloads.
 * - `__fieldTimestamps` — per-field "as-of" times. During a merge each incoming
 *   field is applied only when it is at least as new as the stored field, so a
 *   field the user edited after a request was sent is never clobbered by that
 *   request's late, stale response (per-field causality).
 */
export interface TypedObject {
  /** Stable server identity (preferred over `name`). */
  id?: string | number;
  /** Fallback identity when no `id` is present. */
  name?: string;
  /** Object kind, e.g. "User". Identity key prefix. Optional so plain action targets remain valid. */
  __type?: string;
  /** Object-level as-of timestamp (ms). */
  __timestamp?: number;
  /** Client-generated unique id, stable across merges. */
  __id?: string;
  /** Per-field as-of timestamps (ms), keyed by field name. */
  __fieldTimestamps?: Record<string, number>;
  /** Soft-delete marker; presence removes the object from all lists. */
  __deleted_at?: string;

  [key: string]: unknown;
}
