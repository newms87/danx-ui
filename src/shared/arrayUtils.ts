/**
 * Array Utility Functions
 *
 * Aggregate and accessor functions for arrays, used by the YAML template
 * rendering system's pipe formatters. Each function takes an array and an
 * optional dot-notation field path for accessing nested values on array items.
 */

/**
 * Walk a dot-notation path on an object to get a nested value.
 * Returns the value at the path, or undefined if any segment is missing.
 */
function getNestedValue(obj: unknown, path: string): unknown {
  if (!path || obj === null || obj === undefined) return obj;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

/** Return the length of an array. */
export function arrayCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/** Sum a numeric field across an array of objects. */
export function arraySum(value: unknown, fieldPath?: string): number {
  if (!Array.isArray(value)) return 0;
  return value.reduce((acc, item) => {
    const val = Number(fieldPath ? getNestedValue(item, fieldPath) : item);
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}

/** Average a numeric field across an array of objects. Returns 0 for empty arrays. */
export function arrayAvg(value: unknown, fieldPath?: string): number {
  if (!Array.isArray(value) || value.length === 0) return 0;
  return arraySum(value, fieldPath) / value.length;
}

/** Minimum value of a numeric field across an array. Returns Infinity for empty arrays. */
export function arrayMin(value: unknown, fieldPath?: string): number {
  if (!Array.isArray(value) || value.length === 0) return Infinity;
  const values = value
    .map((item) => Number(fieldPath ? getNestedValue(item, fieldPath) : item))
    .filter((v) => !isNaN(v));
  return values.length > 0 ? Math.min(...values) : Infinity;
}

/** Maximum value of a numeric field across an array. Returns -Infinity for empty arrays. */
export function arrayMax(value: unknown, fieldPath?: string): number {
  if (!Array.isArray(value) || value.length === 0) return -Infinity;
  const values = value
    .map((item) => Number(fieldPath ? getNestedValue(item, fieldPath) : item))
    .filter((v) => !isNaN(v));
  return values.length > 0 ? Math.max(...values) : -Infinity;
}

/** Return the first element, optionally accessing a field on it. */
export function arrayFirst(value: unknown, fieldPath?: string): unknown {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const item = value[0];
  return fieldPath ? getNestedValue(item, fieldPath) : item;
}

/** Return the last element, optionally accessing a field on it. */
export function arrayLast(value: unknown, fieldPath?: string): unknown {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const item = value[value.length - 1];
  return fieldPath ? getNestedValue(item, fieldPath) : item;
}

/** Join array values with a separator string. */
export function arrayJoin(value: unknown, separator = ", "): string {
  if (!Array.isArray(value)) return "";
  return value.map(String).join(separator);
}
