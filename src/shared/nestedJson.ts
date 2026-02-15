/**
 * Nested JSON Detection Utilities
 *
 * Detects and parses JSON strings embedded inside other JSON/YAML string values.
 * Used by syntax highlighters to offer toggleable parsed views of stringified objects.
 *
 * Only objects and arrays qualify as "nested JSON" — primitive values like
 * numbers, booleans, and plain strings are excluded since they don't benefit
 * from expanded display.
 */

/** Maximum string length to attempt parsing (100KB). Skips oversized strings for performance. */
const MAX_PARSE_LENGTH = 100_000;

/**
 * Check if a string contains valid JSON that is an object or array.
 * Returns false for primitives (numbers, booleans, strings, null) and invalid JSON.
 * Skips strings over 100KB for performance.
 */
export function isNestedJson(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_PARSE_LENGTH) return false;

  // Quick check: must start with { or [ to be an object/array
  const firstChar = trimmed[0];
  if (firstChar !== "{" && firstChar !== "[") return false;

  try {
    const parsed = JSON.parse(trimmed);
    return parsed !== null && typeof parsed === "object";
  } catch {
    return false;
  }
}

/**
 * Parse a string as JSON, returning the result only if it's an object or array.
 * Returns null for primitives, invalid JSON, or oversized strings.
 * Avoids double-parsing when used alongside isNestedJson.
 */
export function parseNestedJson(value: string): object | unknown[] | null {
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > MAX_PARSE_LENGTH) return null;

  const firstChar = trimmed[0];
  if (firstChar !== "{" && firstChar !== "[") return null;

  try {
    // Valid JSON starting with { or [ always produces an object/array
    return JSON.parse(trimmed) as object | unknown[];
  } catch {
    return null;
  }
}
