/**
 * Shared Type Definitions
 *
 * Common types used across multiple components.
 */

/** Generic size value - number becomes viewport units, string passes through */
export type SizeValue = number | string;

/** Generic dictionary type for objects with string keys */
export interface AnyObject {
  [key: string]: unknown;
}

/**
 * Base interface for objects managed by the reactive object store.
 *
 * Required fields for store identity: `id` (or `name`) + `__type`.
 * The `__timestamp` field drives staleness checks; `__fieldTimestamps`
 * enables per-field causality so rapid local edits are never silently overwritten.
 */
export interface TypedObject extends AnyObject {
  /** Unique identifier within the __type namespace */
  id?: string | number;
  /** Human-readable name (used as identity fallback when id is absent) */
  name?: string;
  /** Object class discriminator — required for store keying */
  __type?: string;
  /** Internal store UUID (stable across rehydration) */
  __id?: string;
  /** Object-level update timestamp (ISO string or Unix ms) */
  __timestamp?: string | number;
  /**
   * Per-field update timestamps (Unix ms).
   * When present, a field is only overwritten when the incoming field
   * timestamp is ≥ the stored field timestamp — prevents stale server
   * responses from clobbering recent local edits.
   */
  __fieldTimestamps?: Record<string, number>;
  /** ISO datetime at which this object was soft-deleted */
  __deleted_at?: string | null;
}

/**
 * A single item that can be the target of an action.
 *
 * Action targets are stored objects (managed by the object store), so this
 * extends {@link TypedObject} and adds the reactive `isSaving` flag the action
 * system toggles while a request is in flight.
 */
export interface ActionTargetItem extends TypedObject {
  /** Whether this item currently has an action request in flight */
  isSaving?: boolean;
}

/** Target of an action: a single item, an array of items, or null. */
export type ActionTarget<T extends ActionTargetItem = ActionTargetItem> = T | T[] | null;

/**
 * Named visual identity for colorable components (Button, Chip, Badge, ProgressBar, Tooltip).
 *
 * Built-in variants map to semantic status colors:
 * - "" (blank): Component's default appearance (no variant styling)
 * - danger: Destructive/error (red)
 * - success: Positive/complete (green)
 * - warning: Cautionary (amber)
 * - info: Informational (blue)
 * - muted: Neutral/secondary (gray)
 *
 * The `& (string & {})` escape hatch allows any custom string while preserving
 * IDE autocomplete for the built-in values. Custom variants are defined by
 * setting `--dx-variant-{name}-*` CSS tokens.
 */
export type VariantType = "" | "danger" | "success" | "warning" | "info" | "muted" | (string & {});
