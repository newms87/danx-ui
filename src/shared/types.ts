/**
 * Shared Type Definitions
 *
 * Common types used across multiple components.
 */

/** Generic size value - number becomes viewport units, string passes through */
export type SizeValue = number | string;

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
