/**
 * Structured Data Format Preference
 *
 * Persists the user's preferred display format (JSON or YAML) for auto-detected
 * structured data blocks. Only applies to unfenced blocks — fenced code blocks
 * always render in their declared language.
 *
 * Uses localStorage key "dx-structured-data-format".
 */

import { getItem, setItem } from "./storage";

const STORAGE_KEY = "dx-structured-data-format";

/** Valid structured data formats */
export type StructuredDataFormat = "json" | "yaml";

/** Type guard: returns true if the format is a structured data format (json or yaml). */
export function isStructuredDataFormat(format: string): format is StructuredDataFormat {
  return format === "json" || format === "yaml";
}

function isStructuredDataFormatValue(value: unknown): value is StructuredDataFormat {
  return typeof value === "string" && isStructuredDataFormat(value);
}

/**
 * Get the user's preferred format for auto-detected structured data blocks.
 * Returns null if no preference has been set.
 */
export function getPreferredStructuredDataFormat(): StructuredDataFormat | null {
  return getItem<StructuredDataFormat | null>(STORAGE_KEY, null, isStructuredDataFormatValue);
}

/**
 * Set the user's preferred format for auto-detected structured data blocks.
 */
export function setPreferredStructuredDataFormat(format: StructuredDataFormat): void {
  setItem(STORAGE_KEY, format);
}
