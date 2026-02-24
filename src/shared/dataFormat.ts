/**
 * Data Format Detection Utilities
 *
 * Functions for detecting structured data formats (JSON, YAML) in strings.
 */

import { parse as parseYAML } from "yaml";

/**
 * Checks if a value is valid JSON (object or parseable string).
 */
export function isJSON(value: string | object): boolean {
  if (typeof value === "object") return true;
  if (!value) return false;
  try {
    JSON.parse(value);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks if a string is valid JSON or valid YAML that parses to a structured type (object/array).
 * Plain YAML scalars (strings, numbers, booleans) are not considered structured data.
 */
export function isStructuredData(text: string | object): boolean {
  if (typeof text !== "string") return isJSON(text);
  if (isJSON(text)) return true;
  try {
    const parsed = parseYAML(text);
    return parsed !== null && typeof parsed === "object";
  } catch {
    return false;
  }
}
