/**
 * Array Utility Functions
 *
 * Aggregate and accessor functions for arrays, used by the YAML template
 * rendering system's pipe formatters. Each function takes an array and an
 * optional dot-notation field path for accessing nested values on array items.
 *
 * Aggregate functions (sum/avg/min/max/first/last) traverse nested arrays at
 * every dot-path boundary via collectFieldValues, so paths like
 * "bill.amount" correctly flatMap across `[{bill: [{amount}, ...]}, ...]`.
 */

/**
 * Walk a dot-notation path on an object to get a nested value.
 * Returns the value at the path, or undefined if any segment is missing.
 *
 * Note: this does NOT traverse arrays — for that, use collectFieldValues.
 */
export function getNestedValue(obj: unknown, path: string): unknown {
  if (!path || obj === null || obj === undefined) return obj;
  return path.split(".").reduce<unknown>((current, key) => {
    if (current === null || current === undefined) return undefined;
    return (current as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Collect all leaf values reachable from `value` by walking the dot-notation
 * `fieldPath`, flatMapping at every array boundary so that nested arrays
 * (`[{bill: [{amount}, ...]}, ...]`) are traversed correctly.
 *
 * No fieldPath: arrays returned as-is, scalars wrapped in a single-element array.
 * Null/undefined entries encountered during traversal are skipped (no further
 * descent + not emitted as leaves).
 */
export function collectFieldValues(value: unknown, fieldPath?: string): unknown[] {
  if (!fieldPath) {
    return Array.isArray(value) ? value : [value];
  }
  const segments = fieldPath.split(".");
  let worklist: unknown[] = [value];
  for (const segment of segments) {
    const next: unknown[] = [];
    for (const entry of worklist) {
      if (entry === null || entry === undefined) continue;
      if (Array.isArray(entry)) {
        for (const child of entry) {
          if (child === null || child === undefined) continue;
          next.push((child as Record<string, unknown>)[segment]);
        }
      } else {
        next.push((entry as Record<string, unknown>)[segment]);
      }
    }
    worklist = next;
  }
  const leaves: unknown[] = [];
  for (const entry of worklist) {
    if (Array.isArray(entry)) {
      leaves.push(...entry);
    } else {
      leaves.push(entry);
    }
  }
  return leaves;
}

/** Return the length of an array. */
export function arrayCount(value: unknown): number {
  return Array.isArray(value) ? value.length : 0;
}

/**
 * Collect numeric leaves for an aggregate computation, excluding null,
 * undefined, and blank-or-whitespace-only string leaves before Number()
 * coercion (so a blank string isn't miscounted as 0), then filtering out
 * any remaining non-numeric leaves.
 */
function collectNumericLeaves(value: unknown, fieldPath?: string): number[] {
  const leaves = collectFieldValues(value, fieldPath);
  const numbers: number[] = [];
  for (const leaf of leaves) {
    if (leaf === null || leaf === undefined) continue;
    if (typeof leaf === "string" && leaf.trim() === "") continue;
    const n = Number(leaf);
    if (!isNaN(n)) numbers.push(n);
  }
  return numbers;
}

/** Sum a numeric field across an array of objects. */
export function arraySum(value: unknown, fieldPath?: string): number {
  if (!Array.isArray(value)) return 0;
  return collectNumericLeaves(value, fieldPath).reduce((acc, n) => acc + n, 0);
}

/** Average a numeric field across an array of objects. Returns 0 for empty arrays. */
export function arrayAvg(value: unknown, fieldPath?: string): number {
  if (!Array.isArray(value) || value.length === 0) return 0;
  const numbers = collectNumericLeaves(value, fieldPath);
  return numbers.length === 0 ? 0 : numbers.reduce((acc, n) => acc + n, 0) / numbers.length;
}

/** Minimum value of a numeric field across an array. Returns null for an empty array or when no numeric leaves are found. */
export function arrayMin(value: unknown, fieldPath?: string): number | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const numbers = collectNumericLeaves(value, fieldPath);
  return numbers.length > 0 ? Math.min(...numbers) : null;
}

/** Maximum value of a numeric field across an array. Returns null for an empty array or when no numeric leaves are found. */
export function arrayMax(value: unknown, fieldPath?: string): number | null {
  if (!Array.isArray(value) || value.length === 0) return null;
  const numbers = collectNumericLeaves(value, fieldPath);
  return numbers.length > 0 ? Math.max(...numbers) : null;
}

/** Return the first leaf reachable from the array, optionally via fieldPath. */
export function arrayFirst(value: unknown, fieldPath?: string): unknown {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const leaves = collectFieldValues(value, fieldPath);
  for (const leaf of leaves) {
    if (leaf !== null && leaf !== undefined) return leaf;
  }
  return undefined;
}

/** Return the last leaf reachable from the array, optionally via fieldPath. */
export function arrayLast(value: unknown, fieldPath?: string): unknown {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const leaves = collectFieldValues(value, fieldPath);
  for (let i = leaves.length - 1; i >= 0; i--) {
    const leaf = leaves[i];
    if (leaf !== null && leaf !== undefined) return leaf;
  }
  return undefined;
}

/** Join array values with a separator string. Skips null/undefined entries. */
export function arrayJoin(value: unknown, separator = ", "): string {
  if (!Array.isArray(value)) return "";
  return value
    .filter((entry) => entry !== null && entry !== undefined)
    .map(String)
    .join(separator);
}
